import { useEffect, useRef, useState } from "react";
import { Roster } from "../../../../../packages/domain/src/roster.js";
import { Playbooks } from "../../../../../packages/domain/src/playbooks.js";
import { ResourceRules } from "../../../../../packages/domain/src/resources.js";
import {
  safeSheetPortrait,
  sheetPatchFromFields,
} from "../../../../../packages/domain/src/character-fields.js";
import { NPC_PROFILE_PRESETS } from "../../../../../packages/domain/src/npc-presets.js";
import { fieldsFrom, project, type Character, importanceOrder } from "./models";
import { ResourceChoices } from "./CharacterDetail";
import { Portrait } from "./v0-ui";
export function CharacterEditor({
  character: c,
  isNew,
  onSave,
  onCancel,
}: {
  character: Character;
  isNew: boolean;
  onSave: (
    initial: Record<string, string>,
    fields: Record<string, string>,
    conditions: string[],
    statuses: string[],
  ) => Promise<void>;
  onCancel: () => void;
}) {
  const [initial] = useState(() => fieldsFrom(c)),
    [fields, setFields] = useState(initial),
    [conditions, setConditions] = useState<string[]>([...c.conditions]),
    [statuses, setStatuses] = useState<string[]>([...c.statuses]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [imagePending, setImagePending] = useState(false);
  const imageRevision = useRef(0);
  useEffect(
    () => () => {
      imageRevision.current++;
    },
    [],
  );
  const set = (key: string, value: string) =>
    setFields((f) => ({ ...f, [key]: value }));
  const dirty =
    JSON.stringify(initial) !== JSON.stringify(fields) ||
    JSON.stringify(conditions) !== JSON.stringify(c.conditions) ||
    JSON.stringify(statuses) !== JSON.stringify(c.statuses);
  useEffect(() => {
    const before = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", before);
    return () => window.removeEventListener("beforeunload", before);
  }, [dirty]);
  function cancel() {
    if (busy) return;
    if (
      dirty &&
      !confirm("Abandonner les modifications non enregistrées de cette fiche ?")
    )
      return;
    imageRevision.current++;
    onCancel();
  }
  // L'appelant passe aussi par cette garde pour Échap et le fond de fenêtre.
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      cancel();
    };
    window.addEventListener("avatar-cancel-character", handler);
    return () => window.removeEventListener("avatar-cancel-character", handler);
  }, [dirty, busy]);
  useEffect(() => {
    const handler = (e: Event) => {
      if (
        busy ||
        (dirty &&
          !confirm(
            "Abandonner les modifications non enregistrées de cette fiche ?",
          ))
      )
        e.preventDefault();
      else onCancel();
    };
    window.addEventListener("avatar-before-navigate", handler);
    return () => window.removeEventListener("avatar-before-navigate", handler);
  }, [dirty, busy]);
  const input = (
    label: string,
    key: string,
    type = "text",
    min?: number,
    max?: number,
  ) => (
    <div className="editor-field">
      <label htmlFor={key}>{label}</label>
      <input
        id={key}
        type={type}
        value={fields[key] ?? ""}
        min={min}
        max={max}
        onChange={(e) => set(key, e.target.value)}
      />
    </div>
  );
  const text = (label: string, key: string, rows = 3) => (
    <div className="editor-field">
      <label htmlFor={key}>{label}</label>
      <textarea
        id={key}
        rows={rows}
        value={fields[key] ?? ""}
        onChange={(e) => set(key, e.target.value)}
      />
    </div>
  );
  function preset(importance = fields.sheetImportance) {
    const p =
      NPC_PROFILE_PRESETS[importance as keyof typeof NPC_PROFILE_PRESETS];
    if (!p) {
      setError(
        "Choisis une importance connue ou renseigne le profil manuellement.",
      );
      return;
    }
    const labels = [
      ...new Set([
        ...conditions,
        ...fields.npcConditionNames
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        ...Roster.CONDITIONS,
      ]),
    ];
    setFields((f) => ({
      ...f,
      npcProfileMode: "explicit",
      npcCombatant: "yes",
      npcFatigueMax: String(p[0]),
      npcConditionCount: String(p[1]),
      npcBalanceMax: String(p[2]),
      npcConditionNames: labels
        .slice(0, Math.max(p[1], conditions.length))
        .join("\n"),
    }));
  }
  async function portrait(file?: File) {
    if (!file) return;
    const revision = ++imageRevision.current;
    setError("");
    if (file.size > 262144) {
      setError("Portrait trop volumineux : 256 Ko maximum.");
      return;
    }
    setImagePending(true);
    try {
      const value = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = () => reject(Error("Lecture du portrait impossible."));
        r.readAsDataURL(file);
      });
      if (!safeSheetPortrait(value))
        throw Error("Image non reconnue : PNG, JPEG ou WebP local attendu.");
      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(Error("Image illisible."));
        img.src = value;
      });
      if (imageRevision.current === revision) set("sheetPortrait", value);
    } catch (e) {
      if (imageRevision.current === revision) setError((e as Error).message);
    } finally {
      if (imageRevision.current === revision) setImagePending(false);
    }
  }
  async function save() {
    if (busy || imagePending) return;
    setError("");
    setBusy(true);
    try {
      const patch: Record<string, unknown> = sheetPatchFromFields(
        c,
        isNew ? {} : initial,
        fields,
        conditions,
        statuses,
        c.techniques,
      );
      ResourceRules.validate({ ...c, ...patch });
      if (
        patch.npcResources !== undefined &&
        JSON.stringify(patch.npcResources) !== JSON.stringify(c.npcResources) &&
        !confirm(
          "Appliquer ce profil PNJ ? Les ressources cochées ne seront pas effacées automatiquement. Les anciennes données restent conservées.",
        )
      )
        return;
      if (
        patch.center !== undefined &&
        patch.center !== c.center &&
        !confirm("Modifier le centre d’équilibre de la fiche ?")
      )
        return;
      await onSave(initial, fields, conditions, statuses);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  let allowed = ResourceRules.conditions(c) as string[];
  if (c.kind === "PNJ" && fields.npcProfileMode === "explicit")
    allowed = [
      ...new Set([
        ...fields.npcConditionNames
          .split("\n")
          .map((x) => x.trim())
          .filter(Boolean),
        ...conditions,
      ]),
    ];
  return (
    <form
      className="modal-form character-editor"
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
    >
      <fieldset disabled={busy}>
        <legend>Identité</legend>
        {input("Nom", "sheetName")}
        {c.kind === "PJ" ? (
          <>
            <label>
              Livret
              <input
                list="canonical-playbooks"
                value={fields.sheetLivret}
                onChange={(e) => set("sheetLivret", e.target.value)}
              />
              <datalist id="canonical-playbooks">
                {Playbooks.PLAYBOOKS.map((p: { id: string; name: string }) => (
                  <option key={p.name} value={p.name} />
                ))}
              </datalist>
            </label>
            <p className="prototype-note">
              Création manuelle : aucun préréglage de Livret n’est appliqué
              automatiquement.
            </p>
          </>
        ) : (
          <>
            {input("Rôle", "sheetLivret")}
            <div className="editor-field">
              <label htmlFor="sheetImportance">Importance</label>
              <select
                id="sheetImportance"
                value={fields.sheetImportance}
                onChange={(e) => {
                  const importance = e.target.value;
                  set("sheetImportance", importance);
                  const p =
                    NPC_PROFILE_PRESETS[
                      importance as keyof typeof NPC_PROFILE_PRESETS
                    ];
                  if (
                    p &&
                    confirm(
                      `Préparer les ressources de ${importance} : ${p[0]} fatigues, ${p[1]} états, équilibre +${p[2]} ? Annuler conserve seulement la classification.`,
                    )
                  )
                    preset(importance);
                }}
              >
                <option value="">Non précisée</option>
                {!importanceOrder.includes(fields.sheetImportance as never) &&
                  fields.sheetImportance && (
                    <option value={fields.sheetImportance}>
                      {fields.sheetImportance} (historique)
                    </option>
                  )}
                {importanceOrder.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </div>
            {text("Désir", "sheetDesire", 2)}
            {text("Description", "sheetDescription")}
          </>
        )}
        <div className="editor-field">
          <label htmlFor="sheetTraining">Entraînement</label>
          <select
            id="sheetTraining"
            value={fields.sheetTraining}
            onChange={(e) => set("sheetTraining", e.target.value)}
          >
            {Roster.TRAININGS.map((t: string) => (
              <option key={t} value={t}>
                {t || "Non renseigné"}
              </option>
            ))}
          </select>
        </div>
        <label>
          Portrait local (PNG, JPEG ou WebP, 256 Ko maximum)
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => {
              void portrait(e.currentTarget.files?.[0]);
              e.currentTarget.value = "";
            }}
          />
        </label>
        <Portrait
          name={fields.sheetName}
          training={project(c).training}
          src={fields.sheetPortrait}
        />
        {fields.sheetPortrait && (
          <button
            className="button-secondary"
            type="button"
            onClick={() => {
              if (confirm("Retirer le portrait de cette fiche ?")) {
                imageRevision.current++;
                setImagePending(false);
                set("sheetPortrait", "");
              }
            }}
          >
            Retirer le portrait
          </button>
        )}
        {imagePending && <p role="status">Lecture du portrait en cours…</p>}
      </fieldset>
      <fieldset disabled={busy}>
        <legend>Ressources</legend>
        <div className="editor-grid">
          {input("Fatigue cochée", "sheetFatigue", "number", 0, 15)}
          {input("Position d’équilibre", "sheetBalance", "number", -3, 4)}
          {c.kind === "PJ" &&
            input("Centre d’équilibre", "sheetCenter", "number", -3, 3)}
        </div>
        {input(
          c.kind === "PJ" ? "Principe gauche" : "Principe du PNJ",
          "principleLeft",
        )}
        {input(
          c.kind === "PJ"
            ? "Principe droit"
            : "Ancien second principe (conservé)",
          "principleRight",
        )}
        {c.kind === "PNJ" && (
          <details className="profile-editor" open>
            <summary>Ressources du PNJ</summary>
            <p className="prototype-note">
              L’importance seule ne modifie pas les ressources. Les valeurs
              incompatibles doivent être ajustées explicitement.
            </p>
            <div className="editor-field">
              <label htmlFor="npcProfileMode">Profil</label>
              <select
                id="npcProfileMode"
                value={fields.npcProfileMode}
                onChange={(e) => set("npcProfileMode", e.target.value)}
              >
                <option value="legacy">
                  Historique : 5 fatigues, équilibre −3 à +3
                </option>
                <option value="explicit">Profil explicite</option>
              </select>
            </div>
            <button
              className="button-secondary"
              type="button"
              onClick={() => preset()}
            >
              Proposer les valeurs de l’importance
            </button>
            <button
              className="button-secondary"
              type="button"
              onClick={() =>
                setFields((f) => ({
                  ...f,
                  npcProfileMode: "explicit",
                  npcCombatant: "no",
                  npcFatigueMax: "0",
                  npcConditionCount: "0",
                  npcConditionNames: "",
                  npcBalanceMax: "0",
                }))
              }
            >
              Préparer un non-combattant
            </button>
            {fields.npcProfileMode === "explicit" && (
              <>
                <div className="editor-field">
                  <label htmlFor="npcCombatant">Combattant</label>
                  <select
                    id="npcCombatant"
                    value={fields.npcCombatant}
                    onChange={(e) => set("npcCombatant", e.target.value)}
                  >
                    <option value="yes">Oui</option>
                    <option value="no">Non</option>
                  </select>
                </div>
                <div className="editor-grid">
                  {input(
                    "Capacité de fatigue",
                    "npcFatigueMax",
                    "number",
                    0,
                    15,
                  )}
                  {input("Limite d’équilibre", "npcBalanceMax", "number", 0, 4)}
                  {input(
                    "Nombre d’états du profil",
                    "npcConditionCount",
                    "number",
                    0,
                    8,
                  )}
                </div>
                {text(
                  "Noms des états du profil (un par ligne)",
                  "npcConditionNames",
                )}
              </>
            )}
          </details>
        )}
        <ResourceChoices
          title="États / conditions cochés"
          available={allowed}
          values={conditions}
          busy={busy}
          onChange={setConditions}
        />
        <ResourceChoices
          title="Statuts cochés"
          available={Roster.STATUSES}
          values={statuses}
          busy={busy}
          onChange={setStatuses}
        />
      </fieldset>
      {c.kind === "PJ" && (
        <fieldset disabled={busy}>
          <legend>Caractéristiques</legend>
          <div className="editor-grid">
            {Roster.STATS.map((k: string, i: number) => (
              <span key={k}>
                {input(
                  ["Créativité", "Concentration", "Harmonie", "Enthousiasme"][
                    i
                  ],
                  "stat-" + k,
                  "number",
                  -3,
                  3,
                )}
              </span>
            ))}
          </div>
        </fieldset>
      )}
      <fieldset disabled={busy}>
        <legend>Histoire et notes</legend>
        {text("Histoire", "sheetHistory")}
        {text("Relations (une par ligne)", "sheetRelations")}
        {text("Notes", "sheetNotes")}
      </fieldset>
      {error && <p role="alert">{error}</p>}
      <div className="modal-actions">
        <button
          className="button-secondary"
          type="button"
          disabled={busy}
          onClick={cancel}
        >
          Annuler
        </button>
        <button
          className="button-primary"
          type="submit"
          disabled={busy || imagePending || !fields.sheetName.trim()}
        >
          Enregistrer la fiche
        </button>
      </div>
    </form>
  );
}
