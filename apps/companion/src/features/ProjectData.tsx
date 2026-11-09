import { useEffect, useRef, useState } from "react";
import type {
  SessionStore,
  ImportPlan,
} from "../../../../packages/application/src/contracts";
import { AppModal } from "../shell/AppModal";
export function ProjectData({
  store,
  onImported,
}: {
  store: SessionStore;
  onImported: () => void;
}) {
  const [plan, setPlan] = useState<ImportPlan | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const input = useRef<HTMLInputElement | null>(null),
    trigger = useRef<HTMLButtonElement | null>(null),
    generation = useRef(0);
  function close() {
    if (busy) return;
    generation.current++;
    setPlan(null);
    setMessage("");
  }
  useEffect(() => {
    const handler = (event: Event) => {
      if (busy) event.preventDefault();
      else {
        generation.current++;
        setPlan(null);
      }
    };
    window.addEventListener("avatar-before-navigate", handler);
    return () => window.removeEventListener("avatar-before-navigate", handler);
  }, [busy]);
  function exportFile() {
    try {
      const url = URL.createObjectURL(
          new Blob([store.exportBackup()], { type: "application/json" }),
        ),
        a = document.createElement("a");
      a.href = url;
      a.download = "avatar-sauvegarde-react.json";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function inspect(file?: File) {
    if (!file) return;
    const current = ++generation.current;
    setError("");
    setMessage("");
    try {
      const text = await file.text();
      if (current === generation.current) setPlan(store.prepareImport(text));
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function apply() {
    if (!plan || busy) return;
    if (
      !confirm(
        "Remplacer les fiches et le combat du projet React par cette sauvegarde ? Les anciennes données Codex restent intactes.",
      )
    )
      return;
    setBusy(true);
    setError("");
    try {
      await store.commitImport(plan);
      setPlan(null);
      onImported();
      setMessage("Sauvegarde importée et enregistrée.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="management-card data-card project-data">
      <span className="eyebrow">PROJET CODEX</span>
      <h2>Vos personnages et sauvegardes</h2>
      <p>
        Importer explicitement une bibliothèque ou une sauvegarde Codex. Le
        combat et les autres données sont conservés sans être encore modifiables
        ici.
      </p>
      <button
        className="button-secondary full-width"
        type="button"
        onClick={exportFile}
      >
        Exporter la sauvegarde du projet
      </button>
      <button
        className="button-secondary full-width"
        type="button"
        ref={trigger}
        onClick={() => input.current?.click()}
      >
        Importer une sauvegarde Codex
      </button>
      <input
        ref={input}
        type="file"
        hidden
        aria-label="Importer une sauvegarde Codex"
        accept="application/json,.json"
        onChange={(e) => {
          void inspect(e.currentTarget.files?.[0]);
          e.currentTarget.value = "";
        }}
      />
      {store.getSnapshot().error && (
        <p role="alert">{store.getSnapshot().error}</p>
      )}
      {error && !plan && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
      {plan && (
        <AppModal
          title="Aperçu de la sauvegarde Codex"
          returnFocus={trigger.current}
          onClose={close}
        >
          <div className="modal-form">
            <p className="modal-copy">
              {plan.kind} : {plan.summary.characters} personnages,{" "}
              {plan.summary.places} lieux, {plan.summary.fighters} combattants,{" "}
              {plan.summary.snapshots} instantanés. Aucun changement avant
              confirmation.
            </p>
            <p className="modal-copy">
              Exportez d’abord le projet actuel pour disposer d’un retour
              arrière. L’import ne touche jamais aux clés historiques.
            </p>
            {error && <p role="alert">{error}</p>}
            <div className="modal-actions">
              <button
                className="button-secondary"
                type="button"
                onClick={exportFile}
              >
                Exporter avant remplacement
              </button>
              <button
                className="button-secondary"
                type="button"
                disabled={busy}
                onClick={close}
              >
                Annuler l’import
              </button>
              <button
                className="button-primary"
                type="button"
                disabled={busy}
                onClick={() => void apply()}
              >
                Confirmer l’import
              </button>
            </div>
          </div>
        </AppModal>
      )}
    </section>
  );
}
