import { useEffect, useRef, useState } from "react";
import { parsePrivateDescriptions } from "../../../../../packages/reference/src/private-descriptions.js";
import { PrivatePdfPreparation } from "./PrivatePdfPreparation";
import { AppModal } from "../../shell/AppModal";
export function PrivateDescriptionSettings({
  count,
  error,
  onLoad,
  onClear,
  onExport,
}: {
  count: number;
  error: string | null;
  onLoad: (texts: Readonly<Record<string, string>>) => void;
  onClear: () => void;
  onExport: () => void;
}) {
  const input = useRef<HTMLInputElement | null>(null),
    trigger = useRef<HTMLButtonElement | null>(null),
    generation = useRef(0);
  const [pending, setPending] = useState<Readonly<
      Record<string, string>
    > | null>(null),
    [message, setMessage] = useState(""),
    [problem, setProblem] = useState(""),
    [fromPdf, setFromPdf] = useState(false),
    [pdfBusy, setPdfBusy] = useState(false);
  useEffect(
    () => () => {
      generation.current++;
    },
    [],
  );
  function close() {
    generation.current++;
    setPending(null);
    setProblem("");
  }
  async function read(file?: File) {
    if (!file) return;
    const rev = ++generation.current;
    setProblem("");
    setMessage("");
    setFromPdf(false);
    try {
      if (file.size > 16 * 1024 * 1024)
        throw Error("Fichier trop volumineux (16 Mo maximum).");
      const text = await file.text();
      if (rev === generation.current)
        setPending(parsePrivateDescriptions(text));
    } catch (e) {
      if (rev === generation.current) setProblem((e as Error).message);
    }
  }
  function load() {
    if (!pending) return;
    try {
      onLoad(pending);
      setPending(null);
      setProblem("");
      setMessage(
        "Descriptions privées chargées uniquement dans ce navigateur.",
      );
    } catch (e) {
      setProblem((e as Error).message);
    }
  }
  return (
    <section className="management-card private-technique-settings">
      <span className="eyebrow">BIBLIOTHÈQUE</span>
      <h2>Descriptions privées des techniques</h2>
      <p>
        Le texte intégral du livre est protégé. Aucun droit de reproduction dans
        le dépôt ou le prototype distribué n’est établi. Utilisez uniquement un
        contenu que vous pouvez conserver pour votre usage local.
      </p>
      <p>
        Le fichier JSON privé est chargé explicitement, séparément des
        sauvegardes Codex. Il n’est ni envoyé sur un serveur ni inclus dans
        leurs exports. Son contenu reste fourni par vous ; l’application n’en
        certifie pas l’exactitude éditoriale.
      </p>
      <p>
        {count} description{count === 1 ? "" : "s"} disponible
        {count === 1 ? "" : "s"} dans ce navigateur.
      </p>
      <PrivatePdfPreparation
        onBusyChange={setPdfBusy}
        onPrepared={(texts, opener) => {
          generation.current++;
          trigger.current = opener;
          setFromPdf(true);
          setProblem("");
          setMessage("");
          setPending(texts);
        }}
      />
      <button
        ref={trigger}
        className="button-secondary full-width"
        type="button"
        disabled={pdfBusy}
        onClick={() => input.current?.click()}
      >
        Charger un fichier privé de descriptions
      </button>
      <input
        ref={input}
        type="file"
        accept="application/json,.json"
        hidden
        aria-label="Fichier privé de descriptions"
        onChange={(e) => {
          void read(e.currentTarget.files?.[0]);
          e.currentTarget.value = "";
        }}
      />
      <button
        className="button-secondary full-width"
        type="button"
        disabled={!count || !!error || pdfBusy}
        onClick={() => {
          try {
            onExport();
            setProblem("");
            setMessage(
              "Copie privée téléchargée. Conservez ce JSON sur votre Mac, séparément des campagnes.",
            );
          } catch (e) {
            setProblem((e as Error).message);
          }
        }}
      >
        Exporter mes descriptions privées
      </button>
      <button
        className="button-secondary full-width"
        type="button"
        disabled={!count || pdfBusy}
        onClick={() => {
          if (
            !confirm(
              "Effacer uniquement les descriptions privées de ce navigateur ? Les personnages et sauvegardes restent inchangés.",
            )
          )
            return;
          try {
            onClear();
            setMessage("Descriptions privées effacées.");
          } catch (e) {
            setProblem((e as Error).message);
          }
        }}
      >
        Effacer les descriptions privées
      </button>
      {error && <p role="alert">{error}</p>}
      {problem && !pending && <p role="alert">{problem}</p>}
      {message && <p role="status">{message}</p>}
      {pending && (
        <AppModal
          title="Charger les descriptions privées"
          returnFocus={trigger.current}
          onClose={close}
        >
          <div className="modal-form">
            <p className="modal-copy">
              {Object.keys(pending).length} texte
              {Object.keys(pending).length === 1 ? "" : "s"} identifié
              {Object.keys(pending).length === 1 ? "" : "s"} par les
              identifiants du catalogue. Confirmer remplace le jeu privé
              actuellement chargé dans ce navigateur, sans modifier le catalogue
              ni les sauvegardes Codex.
            </p>
            {fromPdf && (
              <p className="modal-copy">
                111 passages extraits automatiquement de votre PDF, sans texte
                inventé ni résumé de remplacement. Les paragraphes, césures et
                continuations peuvent nécessiter une relecture dans le livre.
                Après confirmation, exportez votre copie JSON privée depuis
                Gestion pour la conserver sur votre Mac. Le PDF n’est pas
                conservé.
              </p>
            )}
            {problem && <p role="alert">{problem}</p>}
            <div className="modal-actions">
              <button
                type="button"
                className="button-secondary"
                onClick={close}
              >
                Annuler le chargement
              </button>
              <button type="button" className="button-primary" onClick={load}>
                Confirmer le chargement privé
              </button>
            </div>
          </div>
        </AppModal>
      )}
    </section>
  );
}
