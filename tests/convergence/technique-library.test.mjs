import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { TECH_CATALOG, TECH_AUDIT } from "../../packages/domain/src/catalog.js";
import {
  FAMILIES,
  APPROACHES,
  TECHNIQUE_LIBRARY,
  filterTechniques,
} from "../../packages/reference/src/technique-library.js";
import {
  parsePrivateDescriptions,
  serializePrivateDescriptions,
  privateDescriptionRepository,
  PRIVATE_TEXT_KEY,
} from "../../packages/reference/src/private-descriptions.js";
const pack = (techniques) =>
  JSON.stringify({
    format: "avatar-technique-descriptions-privees",
    version: 1,
    techniques,
  });
const synthetic =
  "Texte synthétique de recette, sans extrait du livre.\n\n• Premier élément\n• Dernier élément";
test("111 techniques, neuf familles, neuf techniques de base, identifiants uniques et projection minimale", () => {
  assert.equal(TECHNIQUE_LIBRARY.length, 111);
  assert.equal(new Set(TECHNIQUE_LIBRARY.map((t) => t.id)).size, 111);
  assert.deepEqual(
    FAMILIES.map(
      (f) => TECHNIQUE_LIBRARY.filter((t) => t.family === f.id).length,
    ),
    [9, 13, 13, 13, 13, 13, 13, 12, 12],
  );
  assert.deepEqual(
    TECHNIQUE_LIBRARY.map((t) => t.id),
    TECH_CATALOG.map((t) => t.id),
  );
  for (const t of TECHNIQUE_LIBRARY) {
    assert.deepEqual(Object.keys(t), ["id", "name", "family", "approach"]);
    assert(APPROACHES.includes(t.approach));
    assert(Object.isFrozen(t));
  }
});
test("recherche partielle par nom, sans casse ni accents, jamais dans les résumés", () => {
  assert(
    filterTechniques({ query: "ETOILE" }).some(
      (t) => t.id === "terre-etoile-de-lave",
    ),
  );
  assert.deepEqual(
    filterTechniques({ query: "ÉTOILE" }),
    filterTechniques({ query: "etoile" }),
  );
  assert.equal(filterTechniques({ query: "statut contextuel" }).length, 0);
  assert.equal(filterTechniques({ query: "introuvable-xyz" }).length, 0);
  assert.equal(filterTechniques({ query: "   " }).length, 111);
});
test("famille seule, approche seule et intersection ET", () => {
  const fire = filterTechniques({ family: "feu" });
  assert.equal(fire.length, 13);
  const attacking = filterTechniques({ approach: APPROACHES[0] });
  assert(attacking.length > 13);
  assert(attacking.every((t) => t.approach === APPROACHES[0]));
  assert.deepEqual(
    filterTechniques({ family: "feu", approach: APPROACHES[0] }).map(
      (t) => t.id,
    ),
    [
      "feu-disque-de-feu",
      "feu-lame-de-feu",
      "feu-poignards-de-feu",
      "feu-rayon-explosif",
      "feu-souffle-de-feu",
      "feu-tourbillon-de-flammes",
      "feu-trait-de-foudre",
    ],
  );
});
test("famille + recherche, approche + recherche, trois critères, réinitialisation", () => {
  assert(
    filterTechniques({ family: "feu", query: "FEU" }).every((t) =>
      t.name.toLocaleLowerCase("fr").includes("feu"),
    ),
  );
  assert(
    filterTechniques({ approach: APPROACHES[0], query: "feu" }).every(
      (t) => t.approach === APPROACHES[0],
    ),
  );
  assert.deepEqual(
    filterTechniques({
      family: "feu",
      approach: APPROACHES[0],
      query: "feu",
    }).map((t) => t.id),
    [
      "feu-disque-de-feu",
      "feu-lame-de-feu",
      "feu-poignards-de-feu",
      "feu-souffle-de-feu",
    ],
  );
  assert.equal(
    filterTechniques({
      family: "base",
      approach: APPROACHES[0],
      query: "etoile",
    }).length,
    0,
  );
  assert.equal(filterTechniques().length, 111);
});
test("consultation et filtres sans mutation du catalogue ou des indications d’assistance", () => {
  const before = JSON.stringify({ TECH_CATALOG, TECH_AUDIT });
  for (const f of FAMILIES)
    for (const a of APPROACHES)
      filterTechniques({ family: f.id, approach: a, query: "e" });
  assert.equal(JSON.stringify({ TECH_CATALOG, TECH_AUDIT }), before);
});
test("matrice PDF : correspondance des 111 identifiants, noms, familles, approches et passages sans texte intégral", () => {
  const matrix = JSON.parse(
    readFileSync(
      new URL(
        "../../docs/reference/CONTROLE_TECHNIQUES_PDF.json",
        import.meta.url,
      ),
    ),
  );
  assert.equal(matrix.techniques.length, 111);
  assert.deepEqual(
    matrix.techniques.map((t) => t.id),
    TECH_CATALOG.map((t) => t.id),
  );
  for (const t of matrix.techniques) {
    assert(
      t.nom_verifie &&
        t.famille_verifiee &&
        t.approche_verifiee &&
        t.passage_source_present,
    );
    assert.equal(t.description_distribuee, false);
    assert.equal(t.passage_sha256.length, 64);
    assert(!Object.hasOwn(t, "description"));
  }
});
test("texte privé préservé intégralement, paragraphes et listes compris", () => {
  const parsed = parsePrivateDescriptions(
    pack([{ id: "base-frapper", description: synthetic }]),
  );
  assert.equal(parsed["base-frapper"], synthetic);
  assert(Object.isFrozen(parsed));
});
test("texte privé invalide : JSON, version, IDs inconnus/dupliqués, vide ou type incorrect", () => {
  for (const value of [
    "{",
    "null",
    JSON.stringify({
      format: "avatar-technique-descriptions-privees",
      version: 2,
      techniques: [],
    }),
    pack([{ id: "demo-technique", description: synthetic }]),
    pack([
      { id: "base-frapper", description: synthetic },
      { id: "base-frapper", description: synthetic },
    ]),
    pack([{ id: "base-frapper", description: " " }]),
    pack([{ id: "base-frapper", description: 3 }]),
  ])
    assert.throws(() => parsePrivateDescriptions(value));
});
test("chargement privé : lecture seule au montage, stockage isolé et effacement ciblé", () => {
  const data = new Map([
    ["avatar-roster-v021", "HISTORIQUE"],
    ["avatar-compagnon-react-session-v1", "PROJET"],
  ]);
  let writes = 0;
  const storage = {
    getItem: (k) => data.get(k) ?? null,
    setItem(k, v) {
      writes++;
      data.set(k, v);
    },
    removeItem: (k) => data.delete(k),
  };
  const repo = privateDescriptionRepository(storage);
  repo.load();
  assert.equal(writes, 0);
  repo.save(
    parsePrivateDescriptions(
      pack([{ id: "base-frapper", description: synthetic }]),
    ),
  );
  assert.equal(writes, 1);
  assert.equal(repo.load().descriptions["base-frapper"], synthetic);
  repo.clear();
  assert.equal(data.get("avatar-roster-v021"), "HISTORIQUE");
  assert.equal(data.get("avatar-compagnon-react-session-v1"), "PROJET");
  assert(!data.has(PRIVATE_TEXT_KEY));
});
test("quota ou corruption privée : erreur explicite, conservation du précédent contenu", () => {
  const raw = pack([{ id: "base-frapper", description: synthetic }]);
  const storage = {
    getItem: () => raw,
    setItem() {
      throw Error("Quota");
    },
    removeItem() {
      throw Error("Refus");
    },
  };
  const repo = privateDescriptionRepository(storage);
  assert.throws(() => repo.save(parsePrivateDescriptions(pack([]))), /Quota/);
  assert.equal(repo.load().descriptions["base-frapper"], synthetic);
  assert.throws(() => repo.clear(), /Refus/);
  assert(
    privateDescriptionRepository({ ...storage, getItem: () => "{" }).load()
      .error,
  );
});

test("banque complète : export privé réimportable des 111 IDs sans perdre une lettre et sans campagne", () => {
  const entries = TECHNIQUE_LIBRARY.map((t, i) => ({
    id: t.id,
    description: `${synthetic}\n\nPassage synthétique ${i}`,
  }));
  const descriptions = parsePrivateDescriptions(pack(entries));
  const raw = serializePrivateDescriptions(descriptions);
  assert.equal(Object.keys(descriptions).length, 111);
  assert.deepEqual(parsePrivateDescriptions(raw), descriptions);
  assert.deepEqual(Object.keys(JSON.parse(raw)), [
    "format",
    "version",
    "techniques",
  ]);
  assert(!raw.includes("combat"));
  assert(!raw.includes("library"));
  assert.throws(() => serializePrivateDescriptions({ inconnu: "texte" }));
});
