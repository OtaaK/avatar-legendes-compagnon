import { useEffect, useRef, useState } from "react";
export function PrivatePdfPreparation({
  onPrepared,
  onBusyChange,
}: {
  onBusyChange: (busy: boolean) => void;
  onPrepared: (
    texts: Readonly<Record<string, string>>,
    opener: HTMLButtonElement | null,
  ) => void;
}) {
  const input = useRef<HTMLInputElement>(null),
    opener = useRef<HTMLButtonElement>(null),
    controller = useRef<AbortController | null>(null);
  const [busy, setBusy] = useState(false),
    [progress, setProgress] = useState(""),
    [error, setError] = useState("");
  useEffect(
    () => () => {
      controller.current?.abort();
    },
    [],
  );
  async function read(file?: File) {
    if (!file) return;
    controller.current?.abort();
    const request = new AbortController();
    controller.current = request;
    setBusy(true);
    onBusyChange(true);
    setError("");
    setProgress("Ouverture locale du PDF…");
    try {
      const { readPrivatePdf } = await import("./read-private-pdf");
      const texts = await readPrivatePdf(
        file,
        (done, total) => {
          if (!request.signal.aborted)
            setProgress(`Lecture locale : ${done}/${total} pages utiles…`);
        },
        request.signal,
      );
      if (!request.signal.aborted) onPrepared(texts, opener.current);
    } catch (e) {
      if (!request.signal.aborted)
        setError("Préparation impossible : " + (e as Error).message);
    } finally {
      if (!request.signal.aborted) {
        setBusy(false);
        onBusyChange(false);
        setProgress("");
      }
    }
  }
  return (
    <div className="private-pdf-preparation">
      <p>
        Vous avez le PDF français ? Préparez les 111 textes en une seule lecture
        locale, sans copier-coller. Édition et mise en page reconnues uniquement
        ; le résultat extrait doit être relu dans votre exemplaire.
      </p>
      <button
        ref={opener}
        className="button-secondary full-width"
        type="button"
        disabled={busy}
        onClick={() => input.current?.click()}
      >
        Préparer depuis mon PDF personnel
      </button>
      <input
        ref={input}
        hidden
        type="file"
        accept="application/pdf,.pdf"
        aria-label="PDF personnel des règles"
        onChange={(e) => {
          void read(e.currentTarget.files?.[0]);
          e.currentTarget.value = "";
        }}
      />
      {busy && (
        <>
          <p role="status">{progress}</p>
          <button
            type="button"
            className="button-secondary"
            onClick={() => {
              controller.current?.abort();
              setBusy(false);
              onBusyChange(false);
              setProgress("Lecture annulée, aucune description enregistrée.");
            }}
          >
            Annuler la lecture du PDF
          </button>
        </>
      )}
      {!busy && progress && <p role="status">{progress}</p>}
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
