import { flowingText } from "./pdf-flow.js";
// Lecture déterministe d'un plan de rectangles, indépendante du DOM et des règles.
export const foldPdfLabel = (text) =>
  text
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
export function layoutTextInRegion(items, region, paragraphs = false) {
  const selected = items.filter(
    (i) =>
      i.x >= region.x0 - 1 &&
      i.x < region.x1 &&
      i.top >= region.top - 1 &&
      i.top < region.bottom &&
      i.size > 7.5 &&
      i.size < 12,
  );
  const lines = [];
  for (const item of selected.toSorted((a, b) => a.top - b.top || a.x - b.x)) {
    let line = lines.find((l) => Math.abs(l.top - item.top) < 2);
    if (!line) {
      line = { top: item.top, items: [] };
      lines.push(line);
    }
    line.items.push(item);
  }
  const left = Math.min(...selected.map((i) => i.x));
  return lines
    .map((line, index) => {
      const words = line.items.toSorted((a, b) => a.x - b.x);
      let value = "";
      for (let i = 0; i < words.length; i++) {
        const prev = words[i - 1],
          w = words[i];
        if (prev && w.x - (prev.x + prev.width) > 0.8) value += " ";
        value += w.text;
      }
      const blank =
        paragraphs &&
        index > 0 &&
        (line.top - lines[index - 1].top > 16 || words[0].x > left + 6);
      return (blank ? "\n" : "") + value.trim();
    })
    .join("\n")
    .trim();
}
export function labelInRegion(items, region) {
  return items
    .filter(
      (i) =>
        i.x >= region.x0 - 1 &&
        i.x < region.x1 &&
        i.top >= region.top - 2 &&
        i.top < region.bottom,
    )
    .toSorted((a, b) => a.top - b.top || a.x - b.x)
    .map((i) => i.text)
    .join(" ");
}

/** Même texte/retours que la lecture simple, avec balises d'italique échappées. */
export function layoutFormattedTextInRegion(items, region, paragraphs = true) {
  const escape = (s) => s.replace(/[\\*]/g, "\\$&");
  return layoutTextInRegion(
    items.map((i) => ({
      ...i,
      text: i.italic ? "*" + escape(i.text) + "*" : escape(i.text),
    })),
    region,
    paragraphs,
  );
}

export function textInRegion(items, region, paragraphs = false) {
  return flowingText(layoutTextInRegion(items, region, paragraphs));
}
export function formattedTextInRegion(items, region, paragraphs = true) {
  return flowingText(
    layoutFormattedTextInRegion(items, region, paragraphs),
    true,
  );
}
