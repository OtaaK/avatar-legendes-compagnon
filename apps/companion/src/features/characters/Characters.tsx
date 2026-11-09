import { useMemo, useRef, useState } from "react";
import { Roster } from "../../../../../packages/domain/src/roster.js";
import type {
  SessionStore,
  Snapshot,
} from "../../../../../packages/application/src/contracts";
import { createCharacterCommands } from "../../../../../packages/application/src/character-commands.js";
import { AppModal } from "../../shell/AppModal";
import { PeopleView } from "./PeopleView";
import {
  CharacterDetail,
  type DetailTab,
  pjTabs,
  npcTabs,
} from "./CharacterDetail";
import { CharacterEditor } from "./CharacterEditor";
import {
  project,
  currentPlace,
  trainingNames,
  type Training,
  type Character,
} from "./models";
export function parseCharacterHash(hash: string) {
  try {
    const raw = decodeURIComponent(hash.replace(/^#/, ""));
    if (!raw.startsWith("personnage-")) return null;
    const parts = [
      "histoire-et-relations",
      "techniques",
      "lieux",
      "livret",
      "apercu",
    ];
    const slug = parts.find((s) => raw.endsWith("-" + s));
    if (!slug) return { id: raw.slice(11), tab: "Aperçu" as DetailTab };
    return {
      id: raw.slice(11, -slug.length - 1),
      tab: (
        {
          "histoire-et-relations": "Histoire et relations",
          techniques: "Techniques",
          lieux: "Lieux",
          livret: "Livret",
          apercu: "Aperçu",
        } as Record<string, DetailTab>
      )[slug],
    };
  } catch {
    return null;
  }
}
export function characterHash(id: string, tab: DetailTab) {
  return (
    "#personnage-" +
    encodeURIComponent(id) +
    "-" +
    {
      Aperçu: "apercu",
      Livret: "livret",
      Techniques: "techniques",
      "Histoire et relations": "histoire-et-relations",
      Lieux: "lieux",
    }[tab]
  );
}
export function Characters({
  store,
  snapshot,
  route,
  onRoute,
  commands,
}: {
  store: SessionStore;
  snapshot: Snapshot;
  route: ReturnType<typeof parseCharacterHash>;
  onRoute: (hash: string, committed?: boolean) => void;
  commands: ReturnType<typeof createCharacterCommands>;
}) {
  const [search, setSearch] = useState(""),
    [location, setLocation] = useState("Tous les lieux"),
    [training, setTraining] = useState("Tous les entraînements"),
    [importance, setImportance] = useState("Toutes les importances"),
    [role, setRole] = useState("Tous les rôles"),
    [sort, setSort] = useState("Nom A–Z");
  const [editor, setEditor] = useState<{
      character: Character;
      isNew: boolean;
      revision: number;
    } | null>(null),
    [feedback, setFeedback] = useState(""),
    [busy, setBusy] = useState(false);
  const opener = useRef<HTMLElement | null>(null);
  const library = snapshot.session.library,
    characters = library.characters as Character[],
    c = characters.find((c) => c.id === route?.id);
  const locations = Roster.npcLocations(library).map((name: string) => ({
    id: name,
    name,
  }));
  const npcs = useMemo(() => {
    const list = Roster.listNpcs(library, {
      search,
      location: location === "Tous les lieux" ? "" : location,
      training:
        training === "Tous les entraînements"
          ? ""
          : trainingNames[training as Training],
      importance: importance === "Toutes les importances" ? "" : importance,
      role: role === "Tous les rôles" ? "" : role,
      sort:
        (
          {
            "Importance croissante": "importance-asc",
            "Importance décroissante": "importance-desc",
            Lieu: "location",
          } as Record<string, string>
        )[sort] ?? "name",
    });
    return sort === "Nom Z–A" ? list.reverse() : list;
  }, [library, search, location, training, importance, role, sort]);
  function create(kind: "pj" | "pnj") {
    opener.current = document.activeElement as HTMLElement;
    setEditor({
      character: Roster.makeCharacter(
        "",
        "",
        kind === "pj" ? "PJ" : "PNJ",
      ) as Character,
      isNew: true,
      revision: snapshot.revision,
    });
    setFeedback("");
  }
  function edit(button: HTMLButtonElement) {
    if (!c) return;
    opener.current = button;
    setEditor({ character: c, isNew: false, revision: snapshot.revision });
    setFeedback("");
  }
  async function resource(kind: string, value: unknown) {
    if (!c) return;
    if (
      kind === "statuses" &&
      !confirm(
        "Modifier ce statut sur la fiche permanente ? Le combat lié reste inchangé.",
      )
    )
      return;
    setBusy(true);
    try {
      await commands.adjust(snapshot.revision, c.id, kind, value);
      setFeedback("Ressources enregistrées.");
    } catch (e) {
      setFeedback((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function undo() {
    if (!c) return;
    setBusy(true);
    try {
      await commands.undo(snapshot.revision, c.id);
      setFeedback("Dernier ajustement annulé.");
    } catch (e) {
      setFeedback((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const tabs = c?.kind === "PJ" ? pjTabs : npcTabs,
    tab = route && tabs.includes(route.tab as never) ? route.tab : "Aperçu";
  return (
    <>
      {feedback && (
        <p className="feature-feedback" role="status">
          {feedback}
        </p>
      )}
      {snapshot.error && (
        <p className="feature-feedback" role="alert">
          {snapshot.error}
        </p>
      )}
      {route ? (
        c ? (
          <CharacterDetail
            character={c}
            session={snapshot.session}
            tab={tab}
            onTab={(t) => onRoute(characterHash(c.id, t))}
            onBack={() => onRoute("#personnages")}
            onEdit={edit}
            onResource={(k, v) => void resource(k, v)}
            onUndo={() => void undo()}
            canUndo={commands.canUndo(c.id)}
            busy={busy || !!snapshot.error}
          />
        ) : (
          <div className="page-content">
            <h1>Fiche introuvable</h1>
            <p>
              La référence de cette URL n’existe pas dans la bibliothèque
              chargée.
            </p>
            <button
              className="button-secondary"
              onClick={() => onRoute("#personnages")}
            >
              Retour aux personnages
            </button>
          </div>
        )
      ) : (
        <PeopleView
          pj={characters.filter((c) => c.kind === "PJ").map(project)}
          npcs={npcs.map((c: Character) => ({
            ...project(c),
            locationId: currentPlace(snapshot.session, c),
          }))}
          locations={locations}
          npcCount={characters.filter((c) => c.kind === "PNJ").length}
          search={search}
          onSearch={setSearch}
          filterLocation={location}
          onFilterLocation={setLocation}
          filterTraining={training}
          onFilterTraining={setTraining}
          filterImportance={importance}
          onFilterImportance={setImportance}
          filterRole={role}
          onFilterRole={setRole}
          roles={[
            ...new Set(
              characters
                .filter((c) => c.kind === "PNJ")
                .map((c) => project(c).role)
                .filter(Boolean),
            ),
          ]}
          sort={sort}
          onSort={setSort}
          onReset={() => {
            setSearch("");
            setLocation("Tous les lieux");
            setTraining("Tous les entraînements");
            setImportance("Toutes les importances");
            setRole("Tous les rôles");
            setSort("Nom A–Z");
          }}
          onCreate={create}
          onOpen={(id) => onRoute(characterHash(id, "Aperçu"))}
        />
      )}
      {editor && (
        <AppModal
          title={
            editor.isNew
              ? `Ajouter un ${editor.character.kind === "PJ" ? "personnage joueur" : "personnage non joueur"}`
              : "Modifier le personnage"
          }
          returnFocus={opener.current}
          onClose={() =>
            window.dispatchEvent(
              new Event("avatar-cancel-character", { cancelable: true }),
            )
          }
        >
          <CharacterEditor
            character={editor.character}
            isNew={editor.isNew}
            onCancel={() => setEditor(null)}
            onSave={async (initial, fields, conditions, statuses) => {
              let id = editor.character.id;
              if (editor.isNew)
                id = await commands.create(
                  editor.revision,
                  editor.character.kind,
                  fields,
                  conditions,
                  statuses,
                  initial,
                );
              else
                await commands.edit(
                  editor.revision,
                  id,
                  initial,
                  fields,
                  conditions,
                  statuses,
                );
              setEditor(null);
              setFeedback("Fiche enregistrée.");
              if (editor.isNew) {
                // Transaction terminée : la navigation ne quitte pas un brouillon en cours.
                onRoute(characterHash(id, "Aperçu"), true);
                requestAnimationFrame(() =>
                  document
                    .querySelector<HTMLButtonElement>(
                      ".detail-main-head button",
                    )
                    ?.focus(),
                );
              }
              window.alert("Fiche enregistrée.");
            }}
          />
        </AppModal>
      )}
    </>
  );
}
