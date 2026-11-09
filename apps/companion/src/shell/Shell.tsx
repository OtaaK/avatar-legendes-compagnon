import type { ReactNode, MouseEventHandler } from "react";
import {
  Sparkles,
  Compass,
  ChevronDown,
  ChevronRight,
  Settings2,
  CircleHelp,
} from "lucide-react";
import { navItems, type PageName } from "./navigation";
export function Shell({
  page,
  navigate,
  onHelp,
  children,
  characterCount = 0,
}: {
  page: PageName;
  navigate: (page: PageName) => void;
  onHelp: MouseEventHandler<HTMLButtonElement>;
  children: ReactNode;
  characterCount?: number;
}) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-lockup">
          <div className="brand-mark">
            <Sparkles aria-hidden="true" />
          </div>
          <div>
            <strong>Compagnon</strong>
            <small>AVATAR LÉGENDES</small>
          </div>
        </div>
        <div className="campaign-switcher">
          <span className="campaign-glyph">
            <Compass aria-hidden="true" />
          </span>
          <span>
            <b title="Avatar Légendes">Avatar Légendes</b>
            <small>Carnet de campagne</small>
          </span>
          <ChevronDown aria-hidden="true" />
        </div>
        <nav className="side-nav" aria-label="Navigation principale">
          {navItems.map(({ name, icon: Icon, eyebrow }, index) => (
            <div key={name} className="nav-group">
              {(index === 0 || navItems[index - 1].eyebrow !== eyebrow) && (
                <span className="nav-eyebrow">{eyebrow}</span>
              )}
              <button
                type="button"
                aria-label={name}
                title={name}
                className={`nav-item ${page === name ? "active" : ""}`}
                onClick={() => navigate(name)}
                aria-current={page === name ? "page" : undefined}
              >
                <Icon aria-hidden="true" />
                <span>{name}</span>
                {name === "Personnages" && <small>{characterCount}</small>}
              </button>
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="session-card">
            <span className="session-pulse" />
            <span>
              <b>Session en préparation</b>
              <small>Aucune session programmée</small>
            </span>
            <ChevronRight aria-hidden="true" />
          </div>
          <button
            className="user-chip"
            type="button"
            onClick={() => navigate("Gestion")}
          >
            <span className="user-avatar">M</span>
            <span>
              <b>Maître du jeu</b>
              <small>Espace local</small>
            </span>
            <Settings2 aria-hidden="true" />
          </button>
        </div>
      </aside>
      <main className="main-column">
        <header className="topbar">
          <div className="breadcrumbs">
            <span
              title="Avatar Légendes"
              aria-label="Campagne : Avatar Légendes"
            >
              Campagne
            </span>
            <ChevronRight aria-hidden="true" />
            <b>{page}</b>
          </div>
          <div className="topbar-actions">
            <span className="demo-flag">
              <i /> Compagnon local
            </span>
            <button
              className="icon-button"
              type="button"
              aria-label="Aide sur le lot 1"
              onClick={onHelp}
            >
              <CircleHelp />
            </button>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
