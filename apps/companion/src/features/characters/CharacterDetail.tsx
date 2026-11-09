import { useId, useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  MapPin,
  RotateCcw,
  Plus,
  X,
} from "lucide-react";
import { ResourceRules } from "../../../../../packages/domain/src/resources.js";
import { PlaceRules } from "../../../../../packages/domain/src/places.js";
import type { CanonicalSession } from "../../../../../packages/application/src/contracts";
import {
  BalanceMeterPJ,
  BalanceMeterPNJ,
  FatigueMeter,
  Portrait,
  TrainingIcon,
  ImportanceDot,
} from "./v0-ui";
import { project, type Character } from "./models";
export const pjTabs = [
  "Aperçu",
  "Livret",
  "Techniques",
  "Histoire et relations",
] as const;
export const npcTabs = ["Aperçu", "Techniques", "Lieux"] as const;
export type DetailTab = (typeof pjTabs)[number] | (typeof npcTabs)[number];
export function CharacterDetail({
  character: c,
  session,
  tab,
  onTab,
  onBack,
  onEdit,
  onResource,
  onUndo,
  canUndo,
  busy,
}: {
  character: Character;
  session: CanonicalSession;
  tab: DetailTab;
  onTab: (tab: DetailTab) => void;
  onBack: () => void;
  onEdit: (button: HTMLButtonElement) => void;
  onResource: (kind: string, value: unknown) => void;
  onUndo: () => void;
  canUndo: boolean;
  busy: boolean;
}) {
  const v = project(c),
    isPj = c.kind === "PJ",
    r = ResourceRules.limits(c),
    tabs = isPj ? pjTabs : npcTabs;
  const showText = (value: unknown) =>
    typeof value === "string" && value ? value : "Non renseigné";
  const placeName = (id?: string | null) =>
    id
      ? (PlaceRules.find(session.library, id)?.name ?? "Lieu absent : " + id)
      : "Non défini";
  return (
    <div className="detail-page">
      <div className="detail-toolbar">
        <button className="back-link" type="button" onClick={onBack}>
          <ArrowLeft />
          Retour aux personnages
        </button>
        <span className="detail-breadcrumb">
          Personnages <ChevronRight />
          {c.name}
        </span>
      </div>
      <div className="detail-layout">
        <aside className="detail-identity">
          <div className="detail-portrait-wrap">
            <Portrait
              name={c.name}
              training={v.training}
              src={c.portrait}
              size={isPj ? "large" : "medium"}
            />
          </div>
          <div className="detail-name-row">
            <h1>{c.name}</h1>
            <ImportanceDot importance={v.importance} label />
          </div>
          <p className="detail-role">{v.playbook || "Non renseigné"}</p>
          <div className="detail-divider" />
          {r.fatigueMax > 0 ? (
            <FatigueMeter
              capacity={r.fatigueMax}
              value={c.fatigue}
              onChange={
                busy ? undefined : (value) => onResource("fatigue", value)
              }
            />
          ) : (
            <div className="resource-absent">
              <b>PNJ non combattant</b>
              <span>Aucune jauge de fatigue</span>
            </div>
          )}
          <div className="detail-divider" />
          <div className="detail-balance-head">
            <b>Équilibre</b>
            {isPj && (
              <button
                className="text-link"
                type="button"
                onClick={(e) => onEdit(e.currentTarget)}
              >
                Modifier le centre
              </button>
            )}
          </div>
          {isPj ? (
            <BalanceMeterPJ
              value={c.balance}
              center={c.center}
              principles={c.principles}
              onChange={
                busy ? undefined : (value) => onResource("balance", value)
              }
            />
          ) : r.balanceMax > 0 ? (
            <BalanceMeterPNJ
              value={c.balance}
              principle={c.principles?.[0] || "Principe non renseigné"}
              min={r.balanceMin}
              max={r.balanceMax}
              onChange={
                busy ? undefined : (value) => onResource("balance", value)
              }
            />
          ) : (
            <p className="micro-note">Aucune jauge d’équilibre.</p>
          )}
          <div className="detail-divider" />
          <ResourceChoices
            title="États / conditions"
            values={c.conditions}
            available={r.conditions}
            busy={busy}
            onChange={(value) => onResource("conditions", value)}
          />
          <ResourceChoices
            title="Statuts"
            values={c.statuses}
            available={[
              "En danger",
              "Renforcé",
              "Avantagé",
              "Gêné",
              "Confiant",
              "Prêt",
              "Piégé",
              "Étourdi",
            ]}
            busy={busy}
            onChange={(value) => onResource("statuses", value)}
          />
          <button
            className="button-secondary full-width"
            type="button"
            disabled={!canUndo || busy}
            onClick={onUndo}
          >
            <RotateCcw />
            Annuler le dernier ajustement
          </button>
          <div className="identity-bottom">
            <TrainingIcon training={v.training} />
            <span>
              <small>Entraînement</small>
              <b>{c.training || "Non renseigné"}</b>
            </span>
          </div>
        </aside>
        <section className="detail-main">
          <div className="detail-main-head">
            <div>
              <span className="eyebrow">
                FICHE {isPj ? "DU PERSONNAGE" : "DU PNJ"}
              </span>
              <p>Ressources permanentes à gauche, détails de la fiche ici.</p>
            </div>
            <button
              className="button-secondary"
              type="button"
              onClick={(e) => onEdit(e.currentTarget)}
            >
              Modifier le personnage
            </button>
          </div>
          <nav className="detail-tabs" aria-label="Sections de la fiche">
            {tabs.map((t) => (
              <button
                type="button"
                key={t}
                className={t === tab ? "active" : ""}
                aria-current={t === tab ? "page" : undefined}
                onClick={() => onTab(t)}
              >
                {t}
              </button>
            ))}
          </nav>
          <div className="detail-tab-panel">
            {tab === "Aperçu" && (
              <div className="overview-tab">
                {isPj ? (
                  <section className="detail-section">
                    <div className="section-heading">
                      <h2>Caractéristiques</h2>
                    </div>
                    <div className="stats-grid">
                      {Object.entries(c.stats).map(([key, value]) => (
                        <div className="stat-card" key={key}>
                          <span>
                            {(
                              {
                                creativite: "Créativité",
                                concentration: "Concentration",
                                harmonie: "Harmonie",
                                enthousiasme: "Enthousiasme",
                              } as Record<string, string>
                            )[key] ?? key}
                          </span>
                          <b>
                            {Number(value) > 0 ? "+" : ""}
                            {String(value)}
                          </b>
                        </div>
                      ))}
                    </div>
                    <h3>Principes</h3>
                    <p>{c.principles.join(" ↔ ") || "Non renseignés"}</p>
                  </section>
                ) : (
                  <section className="detail-section">
                    <h2>Identité du PNJ</h2>
                    <Info label="Rôle" value={c.livret} />
                    <Info label="Désir" value={c.desire} />
                    <Info label="Description" value={c.description} />
                    <Info
                      label="Position actuelle"
                      value={PlaceRules.currentName(session.library, c)}
                    />
                  </section>
                )}
                <section className="detail-section">
                  <Info label="Notes" value={c.notes} />
                </section>
              </div>
            )}
            {tab === "Histoire et relations" && (
              <div className="story-tab">
                <section className="detail-section">
                  <h2>Histoire et relations</h2>
                  <p className="preserve-lines">{showText(c.history)}</p>
                  <h3>Relations</h3>
                  {c.relationships.length ? (
                    <ul>
                      {c.relationships.map((v: string, i: number) => (
                        <li key={i}>{v}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>Aucune relation renseignée.</p>
                  )}
                  <Info label="Notes" value={c.notes} />
                </section>
              </div>
            )}
            {tab === "Livret" && (
              <section className="detail-section">
                <h2>{v.playbook || "Livret non renseigné"}</h2>
                <p>
                  L’intégration des Livrets est prévue au lot dédié. Les suivis
                  existants sont conservés.
                </p>
              </section>
            )}
            {tab === "Techniques" && (
              <section className="detail-section">
                <h2>Techniques conservées</h2>
                <p>
                  L’attribution et la maîtrise seront intégrées au lot dédié.
                  Consultation des données de la fiche uniquement.
                </p>
                {c.techniques.length ? (
                  <ul>
                    {c.techniques.map(
                      (t: { name: string; mastery: string }, i: number) => (
                        <li key={i}>
                          {t.name} ·{" "}
                          {(
                            {
                              acquise: "Acquise",
                              pratiquee: "Pratiquée",
                              maitrisee: "Maîtrisée",
                            } as Record<string, string>
                          )[t.mastery] ?? t.mastery}
                        </li>
                      ),
                    )}
                  </ul>
                ) : (
                  <p>Aucune technique renseignée.</p>
                )}
              </section>
            )}
            {tab === "Lieux" && (
              <section className="detail-section">
                <h2>
                  <MapPin />
                  Lieux du PNJ
                </h2>
                <p>
                  Liens existants en lecture seule ; leur édition viendra au lot
                  3.
                </p>
                <Info
                  label="Domicile"
                  value={placeName(c.placeLinks?.homeId)}
                />
                <Info
                  label="Position actuelle"
                  value={
                    PlaceRules.currentName(session.library, c) || "Non définie"
                  }
                />
                <h3>Lieux associés</h3>
                {c.placeLinks?.associatedIds?.length ? (
                  <ul>
                    {c.placeLinks.associatedIds.map((id) => (
                      <li key={id}>{placeName(id)}</li>
                    ))}
                  </ul>
                ) : (
                  <p>Aucun lieu associé.</p>
                )}
              </section>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
function Info({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="info-item">
      <small>{label}</small>
      <b className="preserve-lines">
        {typeof value === "string" && value ? value : "Non renseigné"}
      </b>
    </div>
  );
}
/** Structure StateManager v0 conservée, avec deux ensembles canoniques distincts. */
export function ResourceChoices({
  title,
  values,
  available,
  onChange,
  busy,
}: {
  title: string;
  values: string[];
  available: string[];
  onChange: (values: string[]) => void;
  busy: boolean;
}) {
  const id = useId(),
    [selected, setSelected] = useState("");
  const choices = available.filter((v) => !values.includes(v));
  const next = choices.includes(selected) ? selected : (choices[0] ?? "");
  const status = title.startsWith("Statuts");
  const noun = status ? "statut" : "état";
  return (
    <section className="state-manager" aria-label={title}>
      <div className="state-manager-heading">
        <b>{title}</b>
      </div>
      {values.length ? (
        <ul className="state-manager-list">
          {values.map((value) => (
            <li key={value}>
              <span>{value}</span>
              <button
                className="icon-button small"
                type="button"
                disabled={busy}
                aria-label={`Retirer ${status ? "le statut" : "l’état"} ${value}`}
                onClick={() => onChange(values.filter((v) => v !== value))}
              >
                <X />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="state-empty">Aucun {noun} actif.</p>
      )}
      <div className="state-add-row">
        <label className="sr-only" htmlFor={id}>
          Choisir un {noun} à ajouter
        </label>
        <select
          id={id}
          value={next}
          disabled={busy || !choices.length}
          onChange={(e) => setSelected(e.target.value)}
        >
          {choices.length ? (
            choices.map((v) => <option key={v}>{v}</option>)
          ) : (
            <option value="">Aucun {noun} disponible</option>
          )}
        </select>
        <button
          className="button-secondary"
          type="button"
          disabled={busy || !next}
          aria-label={`Ajouter ${status ? "le statut" : "l’état"}`}
          onClick={() => onChange([...values, next])}
        >
          <Plus />
          Ajouter
        </button>
      </div>
    </section>
  );
}
