import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type MouseEvent,
} from "react";
import { BookOpen, Download, Search } from "lucide-react";
import { Shell } from "./shell/Shell";
import { Home } from "./shell/Home";
import { AppModal } from "./shell/AppModal";
import { navItems, pageFromHash, type PageName } from "./shell/navigation";
import {
  createRepository,
  LAB_KEY,
  SESSION_KEY,
} from "../../../packages/persistence/src/local-session-repository.js";
import { createSessionStore } from "../../../packages/application/src/session-store.js";
import {
  Characters,
  parseCharacterHash,
} from "./features/characters/Characters";
import { ProjectData } from "./features/ProjectData";
import { createCharacterCommands } from "../../../packages/application/src/character-commands.js";
import { TECH_CATALOG } from "../../../packages/domain/src/catalog.js";

function createLabStore(key = LAB_KEY) {
  // Accès différé et capturé : un navigateur refusant localStorage doit rester utilisable.
  const storage = {
    getItem: (key: string) => window.localStorage.getItem(key),
    setItem: (key: string, value: string) =>
      window.localStorage.setItem(key, value),
  };
  return createSessionStore(
    createRepository({ storage, key, locks: navigator.locks }),
  );
}
function download(text: string, name: string) {
  const url = URL.createObjectURL(
    new Blob([text], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const pending: Record<
  Exclude<PageName, "Accueil" | "Gestion">,
  { lot: number; description: string }
> = {
  Personnages: {
    lot: 2,
    description: "Cartes, fiches, fatigue, équilibre et états.",
  },
  Lieux: {
    lot: 3,
    description: "Lieux hiérarchiques et liens des personnages.",
  },
  Combats: {
    lot: 5,
    description: "Moteur complet, décisions du MJ, effets et historique.",
  },
  Techniques: {
    lot: 4,
    description:
      "Bibliothèque réelle prévue après validation du lot 2 ; attribution et maîtrise dans leurs lots dédiés.",
  },
};
export function App() {
  const [page, setPage] = useState<PageName>(() =>
    parseCharacterHash(window.location.hash)
      ? "Personnages"
      : (pageFromHash(window.location.hash) ?? "Accueil"),
  );
  const [modal, setModal] = useState<"help" | "preview" | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const fileInput = useRef<HTMLInputElement | null>(null);
  const inspectTrigger = useRef<HTMLButtonElement | null>(null);
  const [store] = useState(() => createLabStore());
  const [projectStore] = useState(() => createLabStore(SESSION_KEY));
  const projectSnapshot = useSyncExternalStore(
    projectStore.subscribe,
    projectStore.getSnapshot,
  );
  const [commands] = useState(() => createCharacterCommands(projectStore));
  const [hash, setHash] = useState(window.location.hash);
  const hashRef = useRef(hash);
  function routeTo(next: string, committed = false) {
    if (
      !committed &&
      !window.dispatchEvent(
        new Event("avatar-before-navigate", { cancelable: true }),
      )
    )
      return;
    closeModal();
    hashRef.current = next;
    setHash(next);
    setPage(
      parseCharacterHash(next)
        ? "Personnages"
        : (pageFromHash(next) ?? "Accueil"),
    );
    window.history.pushState(null, "", next);
    window.scrollTo(0, 0);
  }
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot);
  const [note, setNote] = useState(() =>
    String(snapshot.session.backupMetadata?.lot1Note ?? ""),
  );
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<ReturnType<
    typeof store.prepareImport
  > | null>(null);
  const previewGeneration = useRef(0);
  useEffect(() => {
    const restore = () => {
      const next = window.location.hash;
      if (next === hashRef.current) return;
      if (
        !window.dispatchEvent(
          new Event("avatar-before-navigate", { cancelable: true }),
        )
      ) {
        window.history.pushState(null, "", hashRef.current || "#accueil");
        return;
      }
      hashRef.current = next;
      setHash(next);
      setPage(
        parseCharacterHash(next)
          ? "Personnages"
          : (pageFromHash(next) ?? "Accueil"),
      );
      closeModal();
    };
    const external = () => {
      store.checkExternal();
      projectStore.checkExternal();
    };
    window.addEventListener("hashchange", restore);
    window.addEventListener("popstate", restore);
    window.addEventListener("storage", external);
    window.addEventListener("focus", external);
    return () => {
      window.removeEventListener("hashchange", restore);
      window.removeEventListener("popstate", restore);
      window.removeEventListener("storage", external);
      window.removeEventListener("focus", external);
    };
  }, [store, projectStore]);
  function closeModal() {
    previewGeneration.current++;
    setModal(null);
    setPreview(null);
  }
  function navigate(next: PageName) {
    routeTo(`#${next.toLocaleLowerCase("fr")}`);
  }
  function help(event: MouseEvent<HTMLButtonElement>) {
    previewGeneration.current++;
    opener.current = event.currentTarget;
    setModal("help");
  }
  async function saveNote() {
    setSaving(true);
    try {
      await store.execute(snapshot.revision, (draft) => {
        draft.backupMetadata = { ...draft.backupMetadata, lot1Note: note };
      });
      setFeedback("Note technique enregistrée dans l’espace de test isolé.");
    } catch (error) {
      setFeedback(String((error as Error).message));
    } finally {
      setSaving(false);
    }
  }
  async function inspectFile(file: File | undefined, trigger: HTMLElement) {
    if (!file) return;
    opener.current = trigger;
    const generation = ++previewGeneration.current;
    setFeedback("");
    try {
      const text = await file.text();
      if (generation !== previewGeneration.current) return;
      setPreview(store.prepareImport(text));
      setModal("preview");
    } catch (error) {
      setFeedback(String((error as Error).message));
    }
  }
  return (
    <>
      <Shell
        page={page}
        navigate={navigate}
        onHelp={help}
        characterCount={projectSnapshot.session.library.characters.length}
      >
        {page === "Accueil" ? (
          <Home
            navigate={navigate}
            counts={{
              pj: projectSnapshot.session.library.characters.filter(
                (c) => c.kind === "PJ",
              ).length,
              pnj: projectSnapshot.session.library.characters.filter(
                (c) => c.kind === "PNJ",
              ).length,
              places: Array.isArray(projectSnapshot.session.library.places)
                ? projectSnapshot.session.library.places.length
                : 0,
            }}
          />
        ) : page === "Personnages" ? (
          <Characters
            store={projectStore}
            snapshot={projectSnapshot}
            commands={commands}
            route={parseCharacterHash(hash)}
            onRoute={routeTo}
          />
        ) : page === "Gestion" ? (
          <div className="page-content management-view">
            <div className="page-heading">
              <div>
                <span className="eyebrow">PRÉFÉRENCES & DONNÉES</span>
                <h1>Gestion</h1>
                <p>Vérification technique du lot 1.</p>
              </div>
            </div>
            <div className="management-grid">
              <ProjectData
                store={projectStore}
                onImported={() => commands.invalidate()}
              />
              <section className="management-card about-card">
                <div className="management-card-icon">
                  <BookOpen />
                </div>
                <span className="eyebrow">ARCHITECTURE</span>
                <h2>Des fondations vérifiables</h2>
                <p>
                  Interface v0, moteur Codex et stockage séparés. Le catalogue
                  réel contient {TECH_CATALOG.length} techniques.
                </p>
                <div className="prototype-callout">
                  <span>
                    <b>Anciennes sauvegardes préservées</b>
                    <small>
                      Cette démonstration écrit uniquement une note dans un
                      espace de test distinct. Elle ne remplace aucun projet
                      existant.
                    </small>
                  </span>
                </div>
                <button
                  className="button-secondary"
                  type="button"
                  onClick={help}
                >
                  À propos du lot 1
                </button>
              </section>
              <section className="management-card data-card">
                <div className="management-card-icon">
                  <Download />
                </div>
                <span className="eyebrow">ESSAI HORS LIGNE</span>
                <h2>Stockage et fichiers locaux</h2>
                <div className="lab-note">
                  <label htmlFor="lab-note">Note de test</label>
                  <textarea
                    id="lab-note"
                    rows={3}
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Un texte pour vérifier le rechargement…"
                  />
                </div>
                <button
                  className="button-primary full-width"
                  type="button"
                  disabled={saving || !!snapshot.error}
                  onClick={() => void saveNote()}
                >
                  Enregistrer la note de test
                </button>
                <button
                  className="button-secondary full-width"
                  type="button"
                  onClick={() => {
                    try {
                      download(store.exportBackup(), "avatar-lot1-test.json");
                    } catch (error) {
                      setFeedback(String(error));
                    }
                  }}
                >
                  <Download />
                  Exporter l’état de test
                </button>
                <button
                  ref={inspectTrigger}
                  className="button-secondary full-width"
                  type="button"
                  onClick={() => fileInput.current?.click()}
                >
                  Examiner une copie JSON
                </button>
                <input
                  ref={fileInput}
                  hidden
                  aria-label="Examiner une copie JSON"
                  type="file"
                  accept="application/json,.json"
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0];
                    void inspectFile(
                      file,
                      inspectTrigger.current ?? event.currentTarget,
                    );
                    event.currentTarget.value = "";
                  }}
                />
                <p className="prototype-note">
                  L’examen est en lecture seule. L’import réel dans les écrans
                  sera intégré ultérieurement.
                </p>
                {snapshot.error && <p role="alert">{snapshot.error}</p>}
                {feedback && <p role="status">{feedback}</p>}
              </section>
            </div>
          </div>
        ) : (
          <div className="page-content">
            <div className="page-heading">
              <div>
                <span className="eyebrow">
                  {navItems.find((item) => item.name === page)?.eyebrow}
                </span>
                <h1>{page}</h1>
                <p>{pending[page].description}</p>
              </div>
            </div>
            <div className="empty-state">
              <span className="empty-mark">
                <Search />
              </span>
              <b>
                {page === "Techniques"
                  ? "Bibliothèque prévue après validation du lot 2"
                  : `Intégration prévue au lot ${pending[page].lot}`}
              </b>
              <p>
                La navigation est prête. Les fonctionnalités de cette rubrique
                restent disponibles dans l’application HTML historique.
              </p>
              <button
                className="button-secondary"
                type="button"
                onClick={() => navigate("Accueil")}
              >
                Retour à l’accueil
              </button>
            </div>
          </div>
        )}
      </Shell>
      {modal && (
        <AppModal
          title={
            modal === "help" ? "À propos du lot 1" : "Aperçu en lecture seule"
          }
          returnFocus={opener.current}
          onClose={closeModal}
        >
          <div className="modal-form">
            {modal === "help" ? (
              <>
                <p className="modal-copy">
                  Les personnages et ressources sont disponibles. Les lieux,
                  livrets, techniques et combats restent dans leurs lots dédiés.
                </p>
                <p className="modal-copy">
                  Le fichier portable embarque ses ressources. La persistance
                  dépend des autorisations du navigateur ; conservez vos exports
                  JSON.
                </p>
              </>
            ) : (
              <>
                <p className="modal-copy">
                  {preview?.kind} reconnu. Aucun import ni enregistrement n’a
                  été effectué.
                </p>
                <ul className="import-preview-list">
                  <li>{preview?.summary.characters} personnages</li>
                  <li>{preview?.summary.places} lieux</li>
                  <li>{preview?.summary.fighters} combattants</li>
                  <li>{preview?.summary.snapshots} instantanés d’annulation</li>
                </ul>
              </>
            )}
            <div className="modal-actions">
              <button
                className="button-secondary"
                type="button"
                onClick={closeModal}
              >
                {modal === "help" ? "Fermer" : "Annuler l’examen"}
              </button>
            </div>
          </div>
        </AppModal>
      )}
    </>
  );
}
