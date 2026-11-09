import {
  ArrowRight,
  CircleHelp,
  Compass,
  MapPin,
  Map as MapIcon,
  Sparkles,
  Swords,
  Users,
} from "lucide-react";
import type { PageName } from "./navigation";
// Classes, composition et illustration CSS reprises de HomeView v0 8b8924d.
export function Home({
  navigate,
  counts,
}: {
  navigate: (page: PageName) => void;
  counts?: { pj: number; pnj: number; places: number };
}) {
  return (
    <div className="page-content home-view">
      <div className="page-heading">
        <div>
          <span className="eyebrow">CARNET DE CAMPAGNE</span>
          <h1>Accueil</h1>
          <p>Votre compagnon de jeu, au fil de l’aventure.</p>
        </div>
      </div>
      <section className="welcome-card">
        <div className="welcome-copy">
          <span className="eyebrow">AVATAR LÉGENDES</span>
          <h2>Chaque voyage commence par une rencontre.</h2>
          <p>
            Retrouvez les personnages, les lieux et les moments qui composent
            votre histoire.
          </p>
          <button
            className="button-quiet"
            type="button"
            onClick={() => navigate("Lieux")}
          >
            Explorer les lieux <ArrowRight />
          </button>
        </div>
        <div className="welcome-art" aria-hidden="true">
          <div className="art-moon" />
          <div className="art-mountain art-mountain-back" />
          <div className="art-mountain art-mountain-front" />
          <div className="art-lantern">✦</div>
          <span>AVATAR LÉGENDES · COMPAGNON</span>
        </div>
      </section>
      <div className="overview-row">
        {[
          { label: "Personnages joueurs", icon: Users, page: "Personnages" },
          {
            label: "Personnages non joueurs",
            icon: Compass,
            page: "Personnages",
          },
          { label: "Lieux répertoriés", icon: MapPin, page: "Lieux" },
        ].map(({ label, icon: Icon, page }) => (
          <div className="overview-stat" key={label}>
            <span className="overview-icon">
              <Icon />
            </span>
            <span>
              <small>{label}</small>
              <b>
                {counts
                  ? label === "Personnages joueurs"
                    ? counts.pj
                    : label === "Personnages non joueurs"
                      ? counts.pnj
                      : counts.places
                  : "—"}
              </b>
            </span>
            <button
              type="button"
              onClick={() => navigate(page as PageName)}
              aria-label={`Voir les ${label.toLocaleLowerCase("fr")}`}
            >
              <ArrowRight />
            </button>
          </div>
        ))}
      </div>
      <section className="home-lower">
        <div className="home-section">
          <div className="section-title-row">
            <div>
              <span className="eyebrow">ACCÈS RAPIDE</span>
              <h2>Votre carnet</h2>
            </div>
          </div>
          <div className="quick-links">
            {[
              {
                name: "Personnages",
                icon: Users,
                description: "Fiches, états et relations",
              },
              {
                name: "Lieux",
                icon: MapIcon,
                description: "Carte des endroits connus",
              },
              {
                name: "Combats",
                icon: Swords,
                description: "Préparer les participants",
              },
              {
                name: "Techniques",
                icon: Sparkles,
                description: "Bibliothèque de référence",
              },
            ].map(({ name, icon: Icon, description }) => (
              <button
                type="button"
                key={name}
                onClick={() => navigate(name as PageName)}
              >
                <span className="quick-link-icon">
                  <Icon />
                </span>
                <span>
                  <b>{name}</b>
                  <small>{description}</small>
                </span>
                <ArrowRight />
              </button>
            ))}
          </div>
        </div>
        <div className="home-section recent-section">
          <div className="section-title-row">
            <div>
              <span className="eyebrow">CONVERGENCE V0 / CODEX</span>
              <h2>Personnages et ressources</h2>
            </div>
          </div>
          <div className="empty-state">
            <span className="empty-mark">
              <Compass />
            </span>
            <b>Vos fiches sont disponibles</b>
            <p>
              Les personnages et la bibliothèque sont disponibles. Les autres rubriques suivront dans leurs lots dédiés.
            </p>
            <button
              type="button"
              className="button-secondary"
              onClick={() => navigate("Personnages")}
            >
              Ouvrir les personnages <ArrowRight />
            </button>
          </div>
        </div>
      </section>
      <p className="disclaimer-line">
        <CircleHelp />
        Les données Codex sont reprises par import explicite. Les copies de combat restent indépendantes.
      </p>
    </div>
  );
}
