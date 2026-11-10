import { useEffect, useRef, useState } from "react";
import { PlaceRules } from "../../../../../packages/domain/src/places.js";
import { safeSheetPortrait } from "../../../../../packages/domain/src/character-fields.js";
import type { CanonicalSession } from "../../../../../packages/application/src/contracts";
import type { PlacePatch } from "../../../../../packages/application/src/place-commands";
import { AppModal } from "../../shell/AppModal";
import { placeList, placePath, type Place } from "./models";
export function PlaceEditor({
  place,
  parentId,
  library,
  onSave,
  onCancel,
  opener,
}: {
  place?: Place;
  parentId: string | null;
  library: CanonicalSession["library"];
  onSave: (patch: PlacePatch) => Promise<void>;
  onCancel: () => void;
  opener: HTMLElement | null;
}) {
  const initial = {
    name: place?.name ?? "",
    description: place?.description ?? "",
    parentId: place?.parentId ?? parentId,
    portrait: place?.portrait ?? "",
  };
  const [draft, setDraft] = useState(initial),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [reading, setReading] = useState(false);
  const generation = useRef(0);
  const dirty = JSON.stringify(initial) !== JSON.stringify(draft);
  function cancel() {
    if (busy) return;
    if (
      dirty &&
      !confirm("Abandonner les modifications non enregistrées de ce lieu ?")
    )
      return;
    generation.current++;
    onCancel();
  }
  useEffect(() => {
    const nav = (e: Event) => {
      if (
        busy ||
        (dirty &&
          !confirm(
            "Abandonner les modifications non enregistrées de ce lieu ?",
          ))
      )
        e.preventDefault();
      else onCancel();
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
  }, [busy, dirty, onCancel]);
  useEffect(
    () => () => {
      generation.current++;
    },
    [],
  );
  async function read(file?: File) {
    if (!file) return;
    const rev = ++generation.current;
    setReading(true);
    setError("");
    try {
      if (file.size > 262144)
        throw Error("Illustration trop volumineuse : 256 Ko maximum.");
      const value = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = () => reject(Error("Lecture impossible."));
        r.readAsDataURL(file);
      });
      if (!safeSheetPortrait(value))
        throw Error("Image PNG, JPEG ou WebP locale attendue.");
      await new Promise<void>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve();
        image.onerror = () => reject(Error("Image illisible."));
        image.src = value;
      });
      if (rev === generation.current)
        setDraft((d) => ({ ...d, portrait: value }));
    } catch (e) {
      if (rev === generation.current) setError((e as Error).message);
    } finally {
      if (rev === generation.current) setReading(false);
    }
  }
  const excluded = place
      ? PlaceRules.descendants(library, place.id)
      : new Set(),
    options = placeList(library).filter((p) => !excluded.has(p.id));
  async function save() {
    if (busy || reading) return;
    setBusy(true);
    setError("");
    try {
      const patch: PlacePatch = place
        ? Object.fromEntries(
            Object.entries(draft).filter(
              ([k, v]) => initial[k as keyof typeof initial] !== v,
            ),
          )
        : draft;
      await onSave(patch);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <AppModal
      title={
        place
          ? "Modifier le lieu"
          : parentId
            ? "Ajouter un sous-lieu"
            : "Ajouter un lieu racine"
      }
      returnFocus={opener}
      onClose={cancel}
    >
      <form
        className="modal-form place-form"
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <label>
          Nom du lieu
          <input
            disabled={busy}
            required
            maxLength={120}
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          />
        </label>
        <label>
          Lieu parent
          <select
            aria-label="Lieu parent"
            disabled={busy}
            value={draft.parentId ?? ""}
            onChange={(e) =>
              setDraft((d) => ({ ...d, parentId: e.target.value || null }))
            }
          >
            <option value="">Aucun parent — lieu racine</option>
            {draft.parentId &&
              !options.some((p) => p.id === draft.parentId) && (
                <option value={draft.parentId}>
                  Parent absent : {draft.parentId} (conservé)
                </option>
              )}
            {options.map((p) => (
              <option key={p.id} value={p.id}>
                {placePath(library, p.id)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Description
          <textarea
            disabled={busy}
            rows={4}
            maxLength={2000}
            value={draft.description}
            onChange={(e) =>
              setDraft((d) => ({ ...d, description: e.target.value }))
            }
          />
        </label>
        <label>
          Illustration locale
          <input
            disabled={busy}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => {
              void read(e.currentTarget.files?.[0]);
              e.currentTarget.value = "";
            }}
          />
        </label>
        {safeSheetPortrait(draft.portrait) && (
          <img
            className="place-image-preview"
            src={draft.portrait!}
            alt="Illustration du lieu"
          />
        )}
        {draft.portrait && !safeSheetPortrait(draft.portrait) && (
          <p>
            Illustration historique conservée, non affichable comme image
            locale.
          </p>
        )}
        {draft.portrait && (
          <button
            type="button"
            className="button-secondary"
            disabled={busy || reading}
            onClick={() => {
              if (confirm("Retirer cette illustration ?"))
                setDraft((d) => ({ ...d, portrait: "" }));
            }}
          >
            Retirer l’illustration
          </button>
        )}
        {reading && <p role="status">Lecture de l’illustration…</p>}
        {error && <p role="alert">{error}</p>}
        <div className="modal-actions">
          <button
            type="button"
            className="button-secondary"
            disabled={busy}
            onClick={cancel}
          >
            Annuler
          </button>
          <button
            className="button-primary"
            disabled={busy || reading || !draft.name.trim()}
          >
            {place
              ? "Enregistrer le lieu"
              : parentId
                ? "Ajouter le sous-lieu"
                : "Ajouter le lieu racine"}
          </button>
        </div>
      </form>
    </AppModal>
  );
}
