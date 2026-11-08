import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
export function AppModal({
  title,
  children,
  onClose,
  returnFocus,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  returnFocus: HTMLElement | null;
}) {
  const dialogRef = useRef<HTMLElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(returnFocus);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (
      !returnFocusRef.current &&
      document.activeElement instanceof HTMLElement &&
      !dialogRef.current?.contains(document.activeElement)
    )
      returnFocusRef.current = document.activeElement;
    const appShell = document.querySelector<HTMLElement>(".app-shell");
    const wasInert = appShell?.inert ?? false;
    const previousOverflow = document.body.style.overflow;
    if (appShell) appShell.inert = true;
    document.body.style.overflow = "hidden";
    const dialog = dialogRef.current;
    const focusFirst = () =>
      (
        dialog?.querySelector<HTMLElement>(
          "input:not(:disabled), select:not(:disabled), textarea:not(:disabled)",
        ) ??
        dialog?.querySelector<HTMLElement>(
          "button:not(:disabled), [href], [tabindex]:not([tabindex='-1'])",
        )
      )?.focus();
    focusFirst();
    return () => {
      if (appShell) appShell.inert = wasInert;
      document.body.style.overflow = previousOverflow;
      const returnFocus = returnFocusRef.current;
      if (returnFocus?.isConnected)
        window.requestAnimationFrame(() => {
          if (!dialog?.isConnected) returnFocus.focus();
        });
    };
  }, []);

  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onCloseRef.current();
      return;
    }
    if (event.key !== "Tab" || !dialogRef.current) return;
    const focusable = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(
        "button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [href], [tabindex]:not([tabindex='-1'])",
      ),
    ).filter(
      (element) =>
        element.getAttribute("aria-hidden") !== "true" &&
        element.offsetParent !== null,
    );
    if (!focusable.length) {
      event.preventDefault();
      dialogRef.current.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (
      event.shiftKey &&
      (document.activeElement === first ||
        !dialogRef.current.contains(document.activeElement))
    ) {
      event.preventDefault();
      last.focus();
    } else if (
      !event.shiftKey &&
      (document.activeElement === last ||
        !dialogRef.current.contains(document.activeElement))
    ) {
      event.preventDefault();
      first.focus();
    }
  }

  const modal = (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCloseRef.current();
      }}
    >
      <section
        ref={dialogRef}
        className="app-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        <header className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button
            className="icon-button"
            type="button"
            aria-label="Fermer la fenêtre"
            onClick={() => onCloseRef.current()}
          >
            <X />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
  return typeof document === "undefined"
    ? null
    : createPortal(modal, document.body);
}
