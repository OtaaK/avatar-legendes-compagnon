import type { PrivateTextValue } from "./PrivateText";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import workerSource from "pdfjs-dist/build/pdf.worker.min.mjs?raw";
import layout from "../../../../../packages/reference/src/pdf-layout.json";
import { TECHNIQUE_LIBRARY } from "../../../../../packages/reference/src/technique-library.js";
import {
  foldPdfLabel,
  labelInRegion,
  textInRegion,
  formattedTextInRegion,
} from "../../../../../packages/reference/src/pdf-text.js";
import {
  parsePrivateDescriptions,
  serializePrivateDescriptions,
} from "../../../../../packages/reference/src/private-descriptions.js";
type PdfWord = {
  text: string;
  x: number;
  top: number;
  width: number;
  size: number;
  italic?: boolean;
};
/** Lecture locale seulement. Pas de rendu PDF, URL externe, JavaScript PDF ou données de campagne. */
export async function readPrivatePdf(
  file: File,
  progress: (done: number, total: number) => void,
  signal: AbortSignal,
) {
  if (file.size > 64 * 1024 * 1024)
    throw Error("PDF trop volumineux (64 Mo maximum).");
  if (signal.aborted) throw new DOMException("Lecture annulée", "AbortError");
  const data = new Uint8Array(await file.arrayBuffer());
  if (signal.aborted) throw new DOMException("Lecture annulée", "AbortError");
  if (String.fromCharCode(...data.slice(0, 5)) !== "%PDF-")
    throw Error("Ce fichier n’est pas un PDF.");
  const workerUrl = URL.createObjectURL(
    new Blob([workerSource], { type: "text/javascript" }),
  );
  GlobalWorkerOptions.workerSrc = workerUrl;
  const task = getDocument({
    data,
    isEvalSupported: false,
    useSystemFonts: true,
    disableFontFace: true,
    stopAtErrors: true,
  });
  const abort = () => {
    void task.destroy();
  };
  signal.addEventListener("abort", abort, { once: true });
  try {
    const pdf = await task.promise;
    if (pdf.numPages < 294)
      throw Error(
        "Édition non reconnue : le plan de lecture attend les pages de l’édition française fournie.",
      );
    const pages = new Map<number, PdfWord[]>();
    const numbers = [
      ...new Set(
        layout.techniques.flatMap((t) => [
          t.title.page,
          ...t.regions.map((r) => r.page),
        ]),
      ),
    ];
    for (const [index, no] of numbers.entries()) {
      if (signal.aborted)
        throw new DOMException("Lecture annulée", "AbortError");
      const page = await pdf.getPage(no),
        viewport = page.getViewport({ scale: 1 });
      if (
        Math.abs(viewport.width - layout.width) > 2 ||
        Math.abs(viewport.height - layout.height) > 2
      )
        throw Error(
          "Mise en page PDF non reconnue. Aucune description enregistrée.",
        );
      const content = await page.getTextContent();
      await page.getOperatorList(); // Métadonnées de police ; aucun rendu ni action PDF.
      const bodyFonts=[...new Set(content.items.filter(i=>"str" in i && Math.hypot(i.transform[2],i.transform[3])>7.5).map(i=>"str" in i?i.fontName:""))];
      await Promise.all(bodyFonts.map(name=>new Promise<void>((resolve,reject)=>{
        if(page.commonObjs.has(name)){resolve();return;}
        const clean=()=>{clearTimeout(timer);signal.removeEventListener("abort",cancel);};
        const cancel=()=>{clean();reject(new DOMException("Lecture annulée","AbortError"));};
        const timer=setTimeout(()=>{clean();reject(Error("Police PDF non disponible. Aucun texte enregistré."));},15000);
        signal.addEventListener("abort",cancel,{once:true});
        page.commonObjs.get(name,()=>{clean();resolve();});
      })));
      pages.set(
        no,
        content.items
          .filter((i) => "str" in i)
          .map((i) => {
            if (!("str" in i)) throw Error("Élément PDF non textuel");
            const size = Math.hypot(i.transform[2], i.transform[3]);
            // PDF.js donne la ligne de base, le plan utilise le haut des caractères.
            const ascent = 0.7; // Même convention géométrique que le plan PDFMiner de cette édition.
            return {
              text: i.str,
              italic: Boolean(
                page.commonObjs.has(i.fontName) &&
                  (page.commonObjs.get(i.fontName)?.italic ||
                    /italic|oblique/i.test(
                      page.commonObjs.get(i.fontName)?.name ?? "",
                    )),
              ),
              x: i.transform[4],
              top: viewport.height - i.transform[5] - size * ascent,
              width: i.width,
              size,
            };
          }),
      );
      progress(index + 1, numbers.length);
    }
    const descriptions: Record<string, PrivateTextValue> = Object.create(null);
    for (const entry of layout.techniques) {
      const expected = TECHNIQUE_LIBRARY.find((t) => t.id === entry.id);
      if (!expected) throw Error("Plan de lecture incohérent.");
      const title = labelInRegion(pages.get(entry.title.page)!, entry.title);
      const approach = labelInRegion(
        pages.get(entry.approach.page)!,
        entry.approach,
      );
      if (
        !foldPdfLabel(title).includes(foldPdfLabel(expected.name)) ||
        !foldPdfLabel(approach).includes(foldPdfLabel(expected.approach))
      )
        throw Error(
          "Titre ou approche non reconnus pour « " +
            expected.name +
            " ». Aucun import partiel silencieux.",
        );
      const body = entry.regions
        .map((r) => textInRegion(pages.get(r.page)!, r, true))
        .join("\n\n");
      if (body.length < 30)
        throw Error(
          "Passage incomplet pour « " +
            expected.name +
            " ». Aucun texte de remplacement créé.",
        );
      const hasItalic = entry.regions.some((r) =>
        pages
          .get(r.page)!
          .some(
            (i) =>
              i.italic &&
              i.x >= r.x0 - 1 &&
              i.x < r.x1 &&
              i.top >= r.top - 1 &&
              i.top < r.bottom,
          ),
      );
      descriptions[entry.id] = hasItalic
        ? {
            text: entry.regions
              .map((r) => formattedTextInRegion(pages.get(r.page)!, r, true))
              .join("\n\n"),
            format: "markdown-lite",
          }
        : body;
    }
    return parsePrivateDescriptions(serializePrivateDescriptions(descriptions));
  } finally {
    signal.removeEventListener("abort", abort);
    await task.destroy();
    URL.revokeObjectURL(workerUrl);
  }
}
