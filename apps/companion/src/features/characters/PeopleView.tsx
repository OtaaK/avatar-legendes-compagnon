import { useState } from "react";
import { Plus, Search, Settings2, ChevronDown, RotateCcw } from "lucide-react";
import { CharacterCardPJ, CharacterCardPNJ } from "./v0-ui";
import {
  importanceOrder,
  importanceColors,
  trainings,
  type CharacterView,
} from "./models";
function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="page-heading-action">{action}</div>
    </div>
  );
}
function formatPersonCount(n: number, s: string, p: string) {
  return `${n} ${n > 1 ? p : s}`;
}
export function PeopleView({
  pj,
  npcs,
  locations,
  npcCount,
  search,
  onSearch,
  filterLocation,
  onFilterLocation,
  filterTraining,
  onFilterTraining,
  filterImportance,
  onFilterImportance,
  filterRole,
  onFilterRole,
  roles,
  sort,
  onSort,
  onReset,
  onCreate,
  onOpen,
}: {
  pj: CharacterView[];
  npcs: CharacterView[];
  locations: { id: string; name: string }[];
  npcCount: number;
  search: string;
  onSearch: (value: string) => void;
  filterLocation: string;
  onFilterLocation: (value: string) => void;
  filterTraining: string;
  onFilterTraining: (value: string) => void;
  filterImportance: string;
  onFilterImportance: (value: string) => void;
  filterRole: string;
  onFilterRole: (value: string) => void;
  roles: string[];
  sort: string;
  onSort: (value: string) => void;
  onReset: () => void;
  onCreate: (kind: "pj" | "pnj") => void;
  onOpen: (id: string) => void;
}) {
  const [showPjFilters, setShowPjFilters] = useState(false);
  return (
    <div className="page-content people-view">
      <PageHeading
        eyebrow="CARNET DE CAMPAGNE"
        title="Personnages"
        description="Les visages qui façonnent votre histoire."
        action={
          <button
            className="button-secondary"
            type="button"
            onClick={() => onCreate("pnj")}
          >
            <Plus /> Ajouter un personnage
          </button>
        }
      />
      <section className="character-section">
        <div className="section-title-row">
          <div>
            <div className="section-title">
              <h2>Personnages joueurs</h2>
              <span className="count-pill">{pj.length}</span>
            </div>
            <p className="section-description">
              Le cœur de votre groupe d’aventure.
            </p>
          </div>
          <button
            className="icon-button add-icon"
            type="button"
            aria-label="Ajouter un personnage joueur"
            title="Ajouter un personnage joueur"
            onClick={() => onCreate("pj")}
          >
            <Plus />
          </button>
        </div>
        <div className="character-grid pj-grid">
          {pj.map((character) => (
            <CharacterCardPJ
              character={character}
              key={character.id}
              onOpen={() => onOpen(character.id)}
            />
          ))}
          {!pj.length && (
            <EmptyState
              title="Aucun personnage joueur"
              detail="Ajoutez un premier personnage à votre bibliothèque."
            />
          )}
        </div>
      </section>
      <section className="character-section npc-section">
        <div className="section-title-row">
          <div>
            <div className="section-title">
              <h2>Personnages non joueurs</h2>
              <span className="count-pill">{npcCount}</span>
            </div>
            <p className="section-description">
              Alliés, rencontres et figures du monde.
            </p>
          </div>
          <button
            className="icon-button add-icon"
            type="button"
            aria-label="Ajouter un personnage non joueur"
            title="Ajouter un personnage non joueur"
            onClick={() => onCreate("pnj")}
          >
            <Plus />
          </button>
        </div>
        <div className="filter-panel">
          <div className="filter-top">
            <label className="search-field">
              <Search />
              <input
                value={search}
                onChange={(event) => onSearch(event.target.value)}
                placeholder="Rechercher un personnage…"
                aria-label="Rechercher un personnage non joueur"
              />
            </label>
            <button
              className="filter-expand"
              type="button"
              onClick={() => setShowPjFilters(!showPjFilters)}
            >
              <Settings2 /> Filtres{" "}
              <ChevronDown className={showPjFilters ? "rotate" : ""} />
            </button>
            <label className="sort-select">
              <span>Trier</span>
              <select
                value={sort}
                onChange={(event) => onSort(event.target.value)}
              >
                <option>Nom A–Z</option>
                <option>Nom Z–A</option>
                <option>Importance croissante</option>
                <option>Importance décroissante</option>
                <option>Lieu</option>
              </select>
            </label>
          </div>
          <div
            className={`filter-controls ${showPjFilters ? "filter-controls-open" : ""}`}
          >
            <label>
              <span className="sr-only">Filtrer par lieu</span>
              <select
                value={filterLocation}
                onChange={(event) => onFilterLocation(event.target.value)}
              >
                <option>Tous les lieux</option>
                {locations.map((place) => (
                  <option key={place.id} value={place.id}>
                    {place.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="sr-only">Filtrer par entraînement</span>
              <select
                value={filterTraining}
                onChange={(event) => onFilterTraining(event.target.value)}
              >
                <option>Tous les entraînements</option>
                {trainings.map((training) => (
                  <option key={training}>{training}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="sr-only">Filtrer par importance</span>
              <select
                value={filterImportance}
                onChange={(event) => onFilterImportance(event.target.value)}
              >
                <option>Toutes les importances</option>
                <option value="__unspecified__">Non précisée</option>
                {importanceOrder.map((importance) => (
                  <option key={importance}>{importance}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="sr-only">Filtrer par rôle</span>
              <select
                value={filterRole}
                onChange={(event) => onFilterRole(event.target.value)}
              >
                <option>Tous les rôles</option>
                {roles.map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </select>
            </label>
            <button type="button" className="reset-filters" onClick={onReset}>
              <RotateCcw /> Réinitialiser
            </button>
          </div>
          <div className="importance-legend">
            <span>Importance</span>
            {importanceOrder.map((importance) => (
              <span key={importance}>
                <i style={{ background: importanceColors[importance] }} />
                {importance}
              </span>
            ))}
          </div>
        </div>
        <div className="results-line">
          <span>
            {formatPersonCount(npcs.length, "personnage", "personnages")}{" "}
            affiché{npcs.length > 1 ? "s" : ""} sur {npcCount}
          </span>
          <span>
            Les pastilles indiquent l’importance, voir la légende ci-dessus.
          </span>
        </div>
        <div className="character-grid npc-grid">
          {npcs.map((character) => (
            <CharacterCardPNJ
              key={character.id}
              character={character}
              locationName={
                locations.find((place) => place.id === character.locationId)
                  ?.name ?? ""
              }
              onOpen={() => onOpen(character.id)}
            />
          ))}
          {!npcs.length && (
            <EmptyState
              title="Aucun personnage ne correspond"
              detail="Essayez d’élargir la recherche ou de réinitialiser les filtres."
            />
          )}
        </div>
      </section>
      <p className="prototype-footnote">
        Les ressources des fiches restent indépendantes de leurs copies de
        combat.
      </p>
    </div>
  );
}
function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="empty-state">
      <span className="empty-mark">
        <Search />
      </span>
      <b>{title}</b>
      <p>{detail}</p>
    </div>
  );
}
