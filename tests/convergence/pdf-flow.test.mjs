import test from "node:test";
import assert from "node:assert/strict";
import {
  flowingText,
  descriptionParagraphs,
  inlineRuns,
} from "../../packages/reference/src/pdf-flow.js";
test("lecture fluide : prose réunie, césures vérifiées retirées, paragraphes distincts", () => {
  assert.equal(
    flowingText(
      "Dans cet envi-\nronnement, le person-\nnage peut agir.\nLa suite reste lisible.\n\nUn autre paragraphe.",
    ),
    "Dans cet environnement, le personnage peut agir. La suite reste lisible.\n\nUn autre paragraphe.",
  );
});
test("traits lexicaux et listes conservés, caractère discrétionnaire réuni", () => {
  assert.equal(
    flowingText(
      "Peut-\nêtre dans un sous-\nlieu.\n\n• Premier élément\n• Second élément",
    ),
    "Peut-être dans un sous-lieu.\n\n• Premier élément\n• Second élément",
  );
  assert.equal(
    flowingText("Un para\u00ad\ngraphe complet."),
    "Un paragraphe complet.",
  );
  assert.equal(flowingText("Un terme\n  continué."), "Un terme continué.");
});
test("italique entre fragments : aucune marque ne bloque la réunion du mot et des lignes", () => {
  const input = "Un *envi-*\n*ronnement* et une *phrase\nitalique*.\n\nFin.";
  const output = flowingText(input, true);
  assert.equal(output, "Un *environnement* et une *phrase italique*.\n\nFin.");
  assert.equal(flowingText(output, true), output);
  assert.deepEqual(
    descriptionParagraphs(output, true)[0]
      .filter((r) => r.italic)
      .map((r) => r.text),
    ["environnement", "phrase italique"],
  );
});
test("lecture seule : littéraux/HTML non interprétés, échappements sûrs, import inchangé", () => {
  const input = "*Texte brut*\n<script>test</script> et chemin \\q";
  const copy = input;
  assert.equal(
    flowingText(input),
    "*Texte brut* <script>test</script> et chemin \\q",
  );
  assert.equal(input, copy);
  assert.deepEqual(inlineRuns("\\*littéral\\* et \\q", true), [
    { text: "*littéral* et \\q", italic: false },
  ]);
});
