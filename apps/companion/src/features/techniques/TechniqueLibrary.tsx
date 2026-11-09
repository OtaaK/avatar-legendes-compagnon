import { PrivateText } from "./PrivateText";
import type { PrivateTextValue } from "./PrivateText";
import { useRef, useState, type MouseEvent } from "react";
import { BookOpen, Compass, Users, Search, RotateCcw } from "lucide-react";
import {
  FAMILIES,
  APPROACHES,
  filterTechniques,
  familyName,
} from "../../../../../packages/reference/src/technique-library.js";
import { TrainingIcon } from "../characters/v0-ui";
import type { Training } from "../characters/models";
import { AppModal } from "../../shell/AppModal";
export type TechniqueReference = {
  id: string;
  name: string;
  family: string;
  approach: string;
};
export function FamilyIcon({ family }: { family: string }) {
  const name = familyName(family);
  if (["eau", "terre", "feu", "air", "armes", "technologie"].includes(family))
    return (
      <span aria-hidden="true" className="library-family-glyph">
        <TrainingIcon training={name as Training} />
      </span>
    );
  const Icon =
    family === "base" ? BookOpen : family === "groupe_pnj" ? Users : Compass;
  return (
    <span className="training-mark reference-family-icon" aria-hidden="true">
      <Icon />
    </span>
  );
}
export function TechniqueLibrary({
  descriptions,
}: {
  descriptions: Readonly<Record<string, PrivateTextValue>>;
}) {
  const [query, setQuery] = useState(""),
    [family, setFamily] = useState(""),
    [approach, setApproach] = useState(""),
    [selected, setSelected] = useState<TechniqueReference | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const techniques = filterTechniques({
    query,
    family,
    approach,
  }) as readonly TechniqueReference[];
  function open(t: TechniqueReference, event: MouseEvent<HTMLButtonElement>) {
    opener.current = event.currentTarget;
    setSelected(t);
  }
  return (
    <div className="page-content techniques-view reference-library">
      <div className="page-heading">
        <div>
          <span className="eyebrow">BIBLIOTHÈQUE DE RÉFÉRENCE</span>
          <h1>Techniques</h1>
          <p>
            111 techniques du catalogue Codex. Consultation indépendante des
            personnages et du combat.
          </p>
        </div>
      </div>
      <div className="technique-toolbar library-controls">
        <label className="search-field">
          <Search aria-hidden="true" />
          <span className="sr-only">Rechercher une technique par nom</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une technique…"
          />
        </label>
        <fieldset>
          <legend>Famille</legend>
          <div
            className="training-filters"
            role="group"
            aria-label="Filtrer par famille"
          >
            <button
              className={!family ? "selected" : ""}
              aria-pressed={!family}
              type="button"
              onClick={() => setFamily("")}
            >
              Toutes
            </button>
            {FAMILIES.map((f) => (
              <button
                key={f.id}
                className={family === f.id ? "selected" : ""}
                aria-pressed={family === f.id}
                type="button"
                onClick={() => setFamily(f.id)}
              >
                <FamilyIcon family={f.id} />
                {f.name}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>Approche</legend>
          <div
            className="training-filters approach-filters"
            role="group"
            aria-label="Filtrer par approche"
          >
            <button
              className={!approach ? "selected" : ""}
              aria-pressed={!approach}
              type="button"
              onClick={() => setApproach("")}
            >
              Toutes
            </button>
            {APPROACHES.map((a) => (
              <button
                key={a}
                className={approach === a ? "selected" : ""}
                aria-pressed={approach === a}
                type="button"
                onClick={() => setApproach(a)}
              >
                {a}
              </button>
            ))}
          </div>
        </fieldset>
      </div>
      <div className="technique-results">
        <span role="status">
          {techniques.length} technique{techniques.length === 1 ? "" : "s"} sur
          111
        </span>
        <button
          type="button"
          className="reset-filters"
          onClick={() => {
            setQuery("");
            setFamily("");
            setApproach("");
          }}
        >
          <RotateCcw aria-hidden="true" />
          Réinitialiser les filtres
        </button>
      </div>
      <p className="library-availability">
        Les descriptions intégrales ne sont pas distribuées avec l’application.{" "}
        {Object.keys(descriptions).length} texte
        {Object.keys(descriptions).length === 1 ? "" : "s"} privé
        {Object.keys(descriptions).length === 1 ? "" : "s"} disponible
        {Object.keys(descriptions).length === 1 ? "" : "s"} localement.
        Chargement facultatif dans Gestion.
      </p>
      <div className="technique-grid">
        {techniques.map((t) => (
          <button
            className="technique-card library-card"
            key={t.id}
            type="button"
            data-technique-id={t.id}
            data-family={t.family}
            onClick={(e) => open(t, e)}
          >
            <span className="technique-card-head">
              <FamilyIcon family={t.family} />
              <span className="eyebrow">{familyName(t.family)}</span>
            </span>
            <span className="library-card-approach">{t.approach}</span>
            <span className="library-card-name">{t.name}</span>
          </button>
        ))}
      </div>
      {techniques.length === 0 && (
        <div className="empty-state">
          <Search aria-hidden="true" />
          <b>Aucune technique ne correspond</b>
          <p>Modifiez la recherche ou réinitialisez les filtres.</p>
        </div>
      )}
      {selected && (
        <AppModal
          title={selected.name}
          returnFocus={opener.current}
          onClose={() => setSelected(null)}
        >
          <div className="technique-modal library-detail">
            <div className="technique-meta">
              <FamilyIcon family={selected.family} />
              <span>{familyName(selected.family)}</span>
            </div>
            <p className="library-detail-approach">{selected.approach}</p>
            <section aria-label="Description">
              <h3>Description</h3>
              {descriptions[selected.id] ? (
                <PrivateText value={descriptions[selected.id]} />
              ) : (
                <p className="description-unavailable">
                  Description complète non chargée. Consultez votre exemplaire
                  du livre ou chargez un fichier privé de descriptions dans
                  Gestion. Les résumés du moteur ne constituent pas le texte
                  officiel intégral.
                </p>
              )}
            </section>
          </div>
        </AppModal>
      )}
    </div>
  );
}
