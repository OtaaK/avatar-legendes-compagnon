import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  Plus,
  ChevronRight,
  ArrowRight,
  CircleHelp,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { PlaceRules } from "../../../../../packages/domain/src/places.js";
import { safeSheetPortrait } from "../../../../../packages/domain/src/character-fields.js";
import { createPlaceCommands } from "../../../../../packages/application/src/place-commands";
import type {
  SessionStore,
  Snapshot,
} from "../../../../../packages/application/src/contracts";
import { AppModal } from "../../shell/AppModal";
import { Portrait, ImportanceDot } from "../characters/v0-ui";
import { project, type Character } from "../characters/models";
import { characterHash } from "../characters/Characters";
import { PlaceEditor } from "./PlaceEditor";
import { PlaceGlyph } from "./PlaceGlyph";
import { placeList, flattenPlaces, type Place } from "./models";
import { parsePlaceHash, placeHash, returnRoute, withReturn } from "./routes";
function PeopleAtPlace({
  title,
  people,
  onOpen,
  subtitle,
  kind,
}: {
  title: string;
  people: Character[];
  onOpen: (id: string) => void;
  subtitle: string;
  kind: string;
}) {
  return (
    <section className="people-at-place" aria-label={title}>
      <div className="presence-heading">
        <span className={"presence-indicator " + kind} />
        <div>
          <b>{title}</b>
          <small>{subtitle}</small>
        </div>
        <span className="count-pill">{people.length}</span>
      </div>
      {people.length ? (
        <div className="presence-list">
          {people.map((c) => {
            const view = project(c);
            return (
              <button type="button" key={c.id} onClick={() => onOpen(c.id)}>
                <Portrait
                  name={view.name}
                  training={view.training}
                  src={view.portrait}
                  size="small"
                />
                <span>
                  <b>{c.name}</b>
                  <small>{view.role}</small>
                </span>
                <ImportanceDot importance={view.importance} label />
                <ChevronRight />
              </button>
            );
          })}
        </div>
      ) : (
        <div className="presence-empty">Aucun personnage dans cette liste.</div>
      )}
    </section>
  );
}
export function Places({
  store,
  snapshot,
  hash,
  onRoute,
}: {
  store: SessionStore;
  snapshot: Snapshot;
  hash: string;
  onRoute: (hash: string, committed?: boolean) => void;
}) {
  const lib = snapshot.session.library,
    places = placeList(lib),
    route = parsePlaceHash(hash),
    selected = route
      ? places.find((p) => p.id === route.id)
      : places.find((p) => !p.parentId) || places[0],
    recursive = route?.descendants ?? false;
  const [commands] = useState(() => createPlaceCommands(store)),
    [collapsed, setCollapsed] = useState<Set<string>>(new Set()),
    [feedback, setFeedback] = useState("");
  const [editor, setEditor] = useState<{
      place?: Place;
      parentId: string | null;
      revision: number;
    } | null>(null),
    [deletion, setDeletion] = useState<{
      place: Place;
      revision: number;
    } | null>(null),
    [agreed, setAgreed] = useState(false),
    [busy, setBusy] = useState(false),
    [problem, setProblem] = useState("");
  const opener = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!deletion) return;
    const nav = (e: Event) => {
      if (busy) e.preventDefault();
      else setDeletion(null);
    };
    window.addEventListener("avatar-before-navigate", nav);
    return () => window.removeEventListener("avatar-before-navigate", nav);
  }, [deletion, busy]);
  const knownIds = useMemo(() => new Set(places.map((p) => p.id)), [lib]);
  const nodes = useMemo(
      () => flattenPlaces(places, collapsed),
      [lib, collapsed],
    ),
    issues = PlaceRules.issues(lib) as {
      type: string;
      id: string;
      missing: string;
    }[];
  const children = places.filter((p) => p.parentId === selected?.id),
    people = selected
      ? PlaceRules.people(lib, selected.id, recursive)
      : { present: [], domiciled: [], associated: [] };
  const deps = deletion
      ? PlaceRules.dependencies(lib, deletion.place.id)
      : { children: [], characters: [] },
    protectedDelete = deps.children.length > 0 || deps.characters.length > 0;
  const select = (id: string, include = recursive) => {
    const path = PlaceRules.path(lib, id) as Place[];
    setCollapsed(
      (old) =>
        new Set([...old].filter((key) => !path.some((p) => p.id === key))),
    );
    const target = placeHash(id, include),
      back = returnRoute(hash);
    onRoute(back ? withReturn(target, back) : target);
  };
  function form(place?: Place, parentId: string | null = null) {
    opener.current = document.activeElement as HTMLElement;
    setEditor({ place, parentId, revision: snapshot.revision });
    setFeedback("");
  }
  async function remove() {
    if (!deletion || busy) return;
    setBusy(true);
    setProblem("");
    try {
      await commands.remove(
        deletion.revision,
        deletion.place.id,
        protectedDelete ? "promote-unlink" : undefined,
      );
      setDeletion(null);
      setFeedback("Lieu supprimé ; aucun personnage supprimé.");
      onRoute(
        deletion.place.parentId &&
          places.some((p) => p.id === deletion.place.parentId)
          ? placeHash(deletion.place.parentId)
          : "#lieux",
        true,
      );
    } catch (e) {
      setProblem((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const origin = selected ? placeHash(selected.id, recursive) : "#lieux",
    back = returnRoute(hash);
  return (
    <div className="page-content places-view integrated-places">
      <div className="page-heading">
        <div>
          <span className="eyebrow">CARNET DES LIEUX</span>
          <h1>Lieux</h1>
          <p>Les endroits familiers et ceux qui restent à découvrir.</p>
        </div>
        <div className="page-heading-action">
          <button
            type="button"
            className="button-secondary"
            disabled={!!snapshot.error}
            onClick={() => form()}
          >
            Ajouter un lieu racine
          </button>
          <button
            type="button"
            className="button-primary"
            disabled={!selected || !!snapshot.error}
            onClick={() => form(undefined, selected!.id)}
          >
            <Plus /> Ajouter un sous-lieu
          </button>
        </div>
      </div>
      {back && (
        <button
          type="button"
          className="text-link"
          onClick={() => onRoute(back)}
        >
          <ArrowLeft /> Retour à la fiche
        </button>
      )}
      {snapshot.error && <p role="alert">{snapshot.error}</p>}
      {feedback && <p role="status">{feedback}</p>}
      {issues.length > 0 && (
        <details className="place-issues">
          <summary>
            {issues.length} référence(s) de lieu absente(s), conservée(s)
          </summary>
          <ul>
            {issues.map((i, n) => (
              <li key={n}>
                {i.type === "parent" ? "Parent" : "Lien PNJ"} : {i.id} →{" "}
                {i.missing}
              </li>
            ))}
          </ul>
        </details>
      )}
      <div className="places-layout">
        <aside className="location-tree-panel">
          <div className="tree-panel-heading">
            <span className="eyebrow">ARBORESCENCE</span>
            <b>Les lieux connus</b>
            <button
              className="icon-button small"
              type="button"
              aria-label="Créer un lieu racine"
              disabled={!!snapshot.error}
              onClick={() => form()}
            >
              <Plus />
            </button>
          </div>
          <nav className="location-tree" aria-label="Arborescence des lieux">
            {nodes.map(({ place: p, depth, hasChildren }) => (
              <div
                className="integrated-tree-row"
                key={p.id}
                style={{ "--depth": Math.min(depth, 6) } as CSSProperties}
              >
                {hasChildren && (
                  <button
                    type="button"
                    className="tree-expander"
                    aria-expanded={!collapsed.has(p.id)}
                    aria-label={
                      (collapsed.has(p.id) ? "Déplier " : "Replier ") + p.name
                    }
                    onClick={() =>
                      setCollapsed((old) => {
                        const next = new Set(old);
                        next.has(p.id) ? next.delete(p.id) : next.add(p.id);
                        return next;
                      })
                    }
                  >
                    <ChevronRight
                      style={{
                        transform: collapsed.has(p.id)
                          ? undefined
                          : "rotate(90deg)",
                      }}
                    />
                  </button>
                )}
                <button
                  type="button"
                  className={
                    "tree-node " + (selected?.id === p.id ? "selected" : "")
                  }
                  aria-current={selected?.id === p.id ? "location" : undefined}
                  aria-label={`Niveau ${depth + 1} : ${p.name}`}
                  onClick={() => select(p.id)}
                >
                  <span className="tree-icon">
                    <PlaceGlyph symbol={p.icon} />
                  </span>
                  <span>
                    {p.name}
                    {p.parentId && !knownIds.has(p.parentId) && (
                      <small> (parent absent)</small>
                    )}
                  </span>
                </button>
              </div>
            ))}
          </nav>
          <div className="tree-note">
            <CircleHelp /> La profondeur des lieux est libre.
          </div>
        </aside>
        <div className="place-content">
          {selected ? (
            <>
              <div className="place-hero">
                <div className="place-illustration">
                  {safeSheetPortrait(selected.portrait) ? (
                    <img
                      src={selected.portrait!}
                      alt={"Illustration de " + selected.name}
                    />
                  ) : (
                    <>
                      <span>
                        <PlaceGlyph symbol={selected.icon} />
                      </span>
                      <i />
                      <i />
                      <i />
                    </>
                  )}
                </div>
                <div className="place-hero-copy">
                  <nav className="place-breadcrumb" aria-label="Fil d’Ariane">
                    {(PlaceRules.path(lib, selected.id) as Place[]).map(
                      (p, i) => (
                        <span key={p.id}>
                          {i > 0 && <ChevronRight />}
                          <button
                            type="button"
                            onClick={() => select(p.id)}
                            aria-current={
                              p.id === selected.id ? "location" : undefined
                            }
                          >
                            {p.name}
                          </button>
                        </span>
                      ),
                    )}
                  </nav>
                  <div className="place-title-row">
                    <h2>{selected.name}</h2>
                    <span className="place-count">
                      {children.length} sous-lieu
                      {children.length === 1 ? "" : "x"}
                    </span>
                  </div>
                  <p className="place-description">
                    {selected.description || "Aucune description renseignée."}
                  </p>
                  <div className="place-hero-actions">
                    <button
                      type="button"
                      className="button-secondary"
                      disabled={!!snapshot.error}
                      onClick={() => form(undefined, selected.id)}
                    >
                      <Plus /> Ajouter un sous-lieu
                    </button>
                    <button
                      type="button"
                      className="button-secondary"
                      disabled={!!snapshot.error}
                      onClick={() => form(selected)}
                    >
                      Modifier le lieu
                    </button>
                    <button
                      type="button"
                      className="button-secondary"
                      disabled={!!snapshot.error}
                      onClick={() => {
                        opener.current = document.activeElement as HTMLElement;
                        setDeletion({
                          place: selected,
                          revision: snapshot.revision,
                        });
                        setAgreed(false);
                        setProblem("");
                      }}
                    >
                      <Trash2 /> Supprimer le lieu
                    </button>
                    <span>
                      {
                        new Set(
                          [
                            ...people.present,
                            ...people.domiciled,
                            ...people.associated,
                          ].map((c: Character) => c.id),
                        ).size
                      }{" "}
                      PNJ lié(s)
                    </span>
                  </div>
                </div>
              </div>
              <div className="place-descendants">
                {children.map((child) => (
                  <button
                    className="descendant-card"
                    type="button"
                    key={child.id}
                    onClick={() => select(child.id)}
                  >
                    <span className="descendant-icon">
                      <PlaceGlyph symbol={child.icon} />
                    </span>
                    <span>
                      <b>{child.name}</b>
                      <small>{child.description}</small>
                    </span>
                    <ArrowRight />
                  </button>
                ))}
              </div>
              <div className="presence-controls">
                <div>
                  <span className="eyebrow">RELATIONS AUX LIEUX</span>
                  <h3>Les personnes de cet endroit</h3>
                </div>
                <label className="switch-label">
                  <input
                    type="checkbox"
                    checked={recursive}
                    onChange={(e) => select(selected.id, e.target.checked)}
                  />
                  <span className="switch-track" />
                  <span>Inclure les sous-lieux</span>
                </label>
              </div>
              <div className="presence-grid">
                {[
                  ["Présents actuellement", "present", "Position actuelle"],
                  ["Domiciliés ici", "domiciled", "Domicile"],
                  [
                    "Associés au lieu",
                    "associated",
                    "Lien distinct de la position",
                  ],
                ].map(([title, key, subtitle]) => (
                  <PeopleAtPlace
                    key={key}
                    title={title}
                    subtitle={
                      subtitle +
                      (recursive
                        ? " — descendants inclus"
                        : " — ce lieu uniquement")
                    }
                    people={(people as Record<string, Character[]>)[key]}
                    kind={key}
                    onOpen={(id) =>
                      onRoute(withReturn(characterHash(id, "Lieux"), origin))
                    }
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <h2>{route ? "Lieu introuvable" : "Sélectionnez un lieu"}</h2>
              <p>
                {route
                  ? "Cette référence n’existe pas dans les données chargées. Elle n’a pas été effacée."
                  : "Créez un lieu racine pour commencer votre carnet."}
              </p>
              <button
                type="button"
                className="button-secondary"
                onClick={() => onRoute("#lieux")}
              >
                Afficher les lieux connus
              </button>
            </div>
          )}
        </div>
      </div>
      <p className="prototype-footnote">
        Domicile, lieux associés et position actuelle sont indépendants. La
        consultation n’enregistre aucune modification.
      </p>
      {editor && (
        <PlaceEditor
          place={editor.place}
          parentId={editor.parentId}
          library={lib}
          opener={opener.current}
          onCancel={() => setEditor(null)}
          onSave={async (patch) => {
            const id =
              editor.place?.id ??
              (await commands.create(
                editor.revision,
                patch as { name: string },
              ));
            if (editor.place) await commands.edit(editor.revision, id, patch);
            setEditor(null);
            setFeedback("Lieu enregistré. Les liens des PNJ sont conservés.");
            onRoute(placeHash(id, recursive), true);
          }}
        />
      )}
      {deletion && (
        <AppModal
          title="Supprimer le lieu"
          returnFocus={opener.current}
          onClose={() => {
            if (!busy) setDeletion(null);
          }}
        >
          <div className="modal-form place-form">
            <p>
              Supprimer « {deletion.place.name} » ? Cette action retire
              uniquement ce lieu.
            </p>
            {protectedDelete && (
              <>
                <p>
                  {deps.children.length} sous-lieu(x) et{" "}
                  {deps.characters.length} personnage(s) lié(s). Le moteur peut
                  rattacher les sous-lieux au parent du lieu supprimé et retirer
                  uniquement les liens vers ce lieu. Aucun PNJ ni sous-lieu ne
                  sera supprimé.
                </p>
                <label className="check-row">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                  />
                  Je confirme le rattachement des sous-lieux au parent et le
                  retrait des liens vers ce lieu.
                </label>
              </>
            )}
            {problem && <p role="alert">{problem}</p>}
            <div className="modal-actions">
              <button
                type="button"
                className="button-secondary"
                disabled={busy}
                onClick={() => setDeletion(null)}
              >
                Annuler
              </button>
              <button
                type="button"
                className="button-danger"
                disabled={busy || (protectedDelete && !agreed)}
                onClick={() => void remove()}
              >
                Confirmer la suppression
              </button>
            </div>
          </div>
        </AppModal>
      )}
    </div>
  );
}
