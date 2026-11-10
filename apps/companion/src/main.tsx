import { StrictMode, Component, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./shell/v0.css";
import "./shell/lot1.css";
import "./features/characters/characters.css";
import "./features/techniques/techniques.css";
import "./features/places/places.css";
class RecoveryBoundary extends Component<
  { children: ReactNode },
  { error: string | null }
> {
  state: { error: string | null } = { error: null };
  static getDerivedStateFromError(error: Error) {
    return { error: error.message };
  }
  render() {
    return this.state.error ? (
      <main className="page-content">
        <h1>Affichage interrompu</h1>
        <p role="alert">{this.state.error}</p>
        <p>
          Aucune réinitialisation des données n’a été effectuée. Conservez vos
          exports puis rechargez la page.
        </p>
        <button
          className="button-secondary"
          onClick={() => window.location.reload()}
        >
          Recharger
        </button>
      </main>
    ) : (
      this.props.children
    );
  }
}
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RecoveryBoundary>
      <App />
    </RecoveryBoundary>
  </StrictMode>,
);
