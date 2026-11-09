import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { PlaceRules } from "../../../../../packages/domain/src/places.js";
import { createPlaceCommands } from "../../../../../packages/application/src/place-commands";
import type {
  SessionStore,
  Snapshot,
} from "../../../../../packages/application/src/contracts";
import type { Character } from "../characters/models";
import { placeList, placePath } from "./models";
export function CharacterPlaces({
  character: c,
  store,
  snapshot,
  onOpen,
}: {
  character: Character;
  store: SessionStore;
  snapshot: Snapshot;
  onOpen: (id: string) => void;
}) {
  const lib = snapshot.session.library,
    places = placeList(lib),
    initial = PlaceRules.links(c),
    oldCurrent = Object.hasOwn(c.placeLinks ?? {}, "currentId")
      ? (initial.currentId ?? "")
      : "__legacy__";
  const [home, setHome] = useState<string>(initial.homeId ?? ""),
    [current, setCurrent] = useState<string>(oldCurrent),
    [associated, setAssociated] = useState<string[]>(initial.associatedIds),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const dirty =
    home !== (initial.homeId ?? "") ||
    current !== oldCurrent ||
    JSON.stringify(associated) !== JSON.stringify(initial.associatedIds);
  useEffect(() => {
    const nav = (e: Event) => {
      if (
        busy ||
        (dirty && !confirm("Abandonner les changements des liens aux lieux ?"))
      )
        e.preventDefault();
    };
    const unload = (e: BeforeUnloadEvent) => {
      if (dirty || busy) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("avatar-before-navigate", nav);
    window.addEventListener("beforeunload", unload);
    return () => {
      window.removeEventListener("avatar-before-navigate", nav);
      window.removeEventListener("beforeunload", unload);
    };
  }, [dirty, busy]);
  const options = (value: string) => (
    <>
      {value &&
        value !== "__legacy__" &&
        !places.some((p) => p.id === value) && (
          <option value={value}>Lieu absent : {value} (conservé)</option>
        )}
      {places.map((p) => (
        <option key={p.id} value={p.id}>
          {placePath(lib, p.id)}
        </option>
      ))}
    </>
  );
  async function save() {
    if (busy || !dirty) return;
    if (
      !confirm(
        "Enregistrer ces liens sur la fiche permanente ? Domicile, position et associations restent indépendants ; la copie de combat reste inchangée.",
      )
    )
      return;
    setBusy(true);
    setError("");
    try {
      const patch: {
        homeId?: string | null;
        currentId?: string | null;
        associatedIds?: string[];
      } = {};
      if (home !== (initial.homeId ?? "")) patch.homeId = home || null;
      if (current !== oldCurrent) patch.currentId = current || null;
      if (JSON.stringify(associated) !== JSON.stringify(initial.associatedIds))
        patch.associatedIds = associated;
      await createPlaceCommands(store).links(snapshot.revision, c.id, patch);
      setMessage("Liens enregistrés.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const missing = associated.filter((id) => !places.some((p) => p.id === id));
  return (
    <section className="detail-section character-place-links">
      <h2>Lieux du PNJ</h2>
      <p>
        La position actuelle, le domicile et les associations sont indépendants.
        Aucun changement de ressource ou de copie de combat.
      </p>
      <form
        className="modal-form place-link-form"
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <label className="place-link-field">
          <span>Position actuelle</span>
          <div>
            <select
              aria-label="Position actuelle"
              value={current}
              disabled={busy || !!snapshot.error}
              onChange={(e) => setCurrent(e.target.value)}
            >
              {oldCurrent === "__legacy__" && (
                <option value="__legacy__">
                  Conserver la position textuelle :{" "}
                  {c.location || "non définie"}
                </option>
              )}
              <option value="">Non définie</option>
              {options(current)}
            </select>
            {current &&
              current !== "__legacy__" &&
              places.some((p) => p.id === current) && (
                <button
                  type="button"
                  className="icon-button"
                  aria-label="Ouvrir la position actuelle"
                  onClick={() => onOpen(current)}
                >
                  <ArrowRight aria-hidden="true" />
                </button>
              )}
          </div>
        </label>
        <label className="place-link-field">
          <span>Domicile</span>
          <div>
            <select
              aria-label="Domicile"
              value={home}
              disabled={busy || !!snapshot.error}
              onChange={(e) => setHome(e.target.value)}
            >
              <option value="">Non défini</option>
              {options(home)}
            </select>
            {home && places.some((p) => p.id === home) && (
              <button
                type="button"
                className="icon-button"
                aria-label="Ouvrir le domicile"
                onClick={() => onOpen(home)}
              >
                <ArrowRight aria-hidden="true" />
              </button>
            )}
          </div>
          <small>Changer le domicile ne déplace pas ce personnage.</small>
        </label>
        <fieldset
          className="associated-location-fields"
          disabled={busy || !!snapshot.error}
        >
          <legend>Lieux associés</legend>
          {[...places.map((p) => p.id), ...missing].map((id) => (
            <label key={id}>
              <input
                type="checkbox"
                checked={associated.includes(id)}
                onChange={(e) =>
                  setAssociated((old) =>
                    e.target.checked
                      ? [...old, id]
                      : old.filter((v) => v !== id),
                  )
                }
              />
              {places.some((p) => p.id === id)
                ? placePath(lib, id)
                : "Lieu absent : " + id}
              {places.some((p) => p.id === id) && (
                <button
                  type="button"
                  className="text-link"
                  onClick={() => onOpen(id)}
                  aria-label={"Ouvrir le lieu associé " + id}
                >
                  Ouvrir
                </button>
              )}
            </label>
          ))}
        </fieldset>
        {!places.length && !missing.length && (
          <p>Aucun lieu enregistré. Créez un lieu dans la rubrique Lieux.</p>
        )}
        {error && <p role="alert">{error}</p>}
        {message && <p role="status">{message}</p>}
        <div className="modal-actions">
          <button
            type="button"
            className="button-secondary"
            disabled={busy || !dirty}
            onClick={() => {
              if (confirm("Annuler les changements des liens ?")) {
                setHome(initial.homeId ?? "");
                setCurrent(oldCurrent);
                setAssociated(initial.associatedIds);
                setError("");
              }
            }}
          >
            Annuler les changements
          </button>
          <button
            className="button-primary"
            disabled={busy || !dirty || !!snapshot.error}
          >
            Enregistrer les liens
          </button>
        </div>
      </form>
    </section>
  );
}
