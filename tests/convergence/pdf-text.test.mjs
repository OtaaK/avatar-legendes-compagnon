import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  textInRegion,
  labelInRegion,
  foldPdfLabel,
} from "../../packages/reference/src/pdf-text.js";
import { TECHNIQUE_LIBRARY } from "../../packages/reference/src/technique-library.js";
const layout = JSON.parse(
  readFileSync(
    new URL("../../packages/reference/src/pdf-layout.json", import.meta.url),
  ),
);
test("plan PDF sans textes : 111 IDs, rectangles non vides et deux continuations explicites", () => {
  assert.deepEqual(
    layout.techniques.map((t) => t.id),
    TECHNIQUE_LIBRARY.map((t) => t.id),
  );
  for (const t of layout.techniques) {
    assert(t.title);
    assert(t.approach);
    const boundary = t.title.page % 2 === 0 ? 312 : 300;
    for (const r of t.regions.slice(0, 1)) {
      if (t.title.x0 < 200) assert(Math.abs(r.x1 - boundary) < 0.5);
      else assert(Math.abs(r.x0 - boundary) < 0.5);
    }
    for (const r of t.regions) {
      assert(r.page >= 159 && r.page <= 294);
      assert(r.x0 < r.x1);
      assert(r.top < r.bottom);
      assert(!Object.hasOwn(r, "text"));
    }
  }
  assert.equal(
    layout.techniques.find((t) => t.id === "base-riposter").regions.length,
    2,
  );
  assert.equal(
    layout.techniques.find((t) => t.id === "base-se-recueillir").regions[1]
      .page,
    162,
  );
});
test("lecture géométrique : colonnes isolées, styles réunis, paragraphes, lignes et césures sans invention", () => {
  const item = (text, x, top, size = 10, width = 35) => ({
    text,
    x,
    top,
    size,
    width,
  });
  const items = [
    item("Ligne", 40, 80),
    item("suite", 79, 80.5),
    item("para\u00ad", 50, 94),
    item("graphe", 40, 106),
    item("Autre colonne", 310, 80),
    item("Pied", 40, 740, 6),
    item("Hors zone", 40, 140),
  ];
  const r = { x0: 35, x1: 295, top: 70, bottom: 130 };
  assert.equal(textInRegion(items, r, true), "Ligne suite\n\nparagraphe");
  assert.equal(
    labelInRegion([item("Nom", 40, 80, 11), item("complet", 80, 80, 11)], r),
    "Nom complet",
  );
  assert.equal(foldPdfLabel("Étoile d’eau *"), "etoiledeau");
});
