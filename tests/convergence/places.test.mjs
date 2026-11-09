import test from "node:test";
import assert from "node:assert/strict";
import { createPlaceCommands } from "../../packages/application/src/place-commands.js";
import { flattenPlaces } from "../../packages/application/src/place-queries.js";
import { createSessionStore } from "../../packages/application/src/session-store.js";
import {
  createRepository,
  SESSION_KEY,
} from "../../packages/persistence/src/local-session-repository.js";
import {
  emptySession,
  exportBackup,
  inspectImport,
  copy,
} from "../../packages/persistence/src/codecs.js";
import { PlaceRules } from "../../packages/domain/src/places.js";
import { Roster } from "../../packages/domain/src/roster.js";
function setup() {
  const data = new Map(),
    storage = {
      fail: false,
      getItem: (k) => data.get(k) ?? null,
      setItem(k, v) {
        if (this.fail) throw Error("Quota");
        data.set(k, v);
      },
    };
  const store = createSessionStore(createRepository({ storage }));
  return { data, storage, store, commands: createPlaceCommands(store) };
}
function fixture() {
  const s = emptySession(),
    a = PlaceRules.create(s.library, "Racine"),
    b = PlaceRules.create(s.library, "Ville", a),
    c = PlaceRules.create(s.library, "Quartier", b);
  const npc = Roster.createCharacter(s.library, "PNJ lié", "PNJ");
  PlaceRules.setLinks(s.library, npc.id, {
    homeId: a,
    currentId: c,
    associatedIds: [a, c],
  });
  npc.future = { keep: true };
  npc.location = "Ancienne position";
  npc.livret = "Historique";
  npc.techniques = [
    { name: "Technique ancienne", mastery: "maitrisee", unknown: 3 },
  ];
  const legacy = Roster.createCharacter(s.library, "PNJ textuel", "PNJ");
  legacy.location = "Position libre";
  const orphan = Roster.createCharacter(s.library, "PNJ orphelin", "PNJ");
  orphan.placeLinks = {
    homeId: "inconnu",
    associatedIds: ["autre-inconnu"],
    currentId: "inconnu",
    future: "keep",
  };
  s.library.places.find((p) => p.id === b).future = { keep: true };
  s.library.places.push({
    id: "racine-orpheline",
    name: "Parent absent",
    description: "Conserver",
    parentId: "parent-absent",
    future: 17,
  });
  s.library.future = { keep: true };
  Roster.addToCombat(s.library, s.combat, npc.id);
  s.combat.future = { keep: true };
  s.backupMetadata.future = "keep";
  return {
    s,
    a,
    b,
    c,
    npcId: npc.id,
    legacyId: legacy.id,
    orphanId: orphan.id,
  };
}
async function load(env, s) {
  await env.store.commitImport(env.store.prepareImport(exportBackup(s)));
}
const rev = (e) => e.store.getSnapshot().revision,
  session = (e) => e.store.getSnapshot().session;
test("lieux : consultation/projection sans écriture, orphelins visibles, profondeur non limitée", () => {
  const e = setup();
  assert.equal(e.data.size, 0);
  e.store.getSnapshot();
  assert.equal(e.data.size, 0);
  const places = Array.from({ length: 2000 }, (_, i) => ({
    id: "p" + i,
    name: "N" + i,
    parentId: i ? "p" + (i - 1) : null,
  }));
  places.push({ id: "orphelin", parentId: "absent", name: "Sans parent" });
  const before = JSON.stringify(places),
    nodes = flattenPlaces(places);
  assert.equal(nodes.length, 2001);
  assert.equal(nodes[1999].depth, 1999);
  assert.equal(flattenPlaces(places, new Set(["p0"])).length, 2);
  assert.equal(JSON.stringify(places), before);
});
test("lieux : création racine, sous-lieu, nom/description/parent et IDs stables, combat et fiches inchangés", async () => {
  const e = setup(),
    f = fixture();
  await load(e, f.s);
  const before = copy(session(e)),
    id = await e.commands.create(rev(e), {
      name: "Nouvelle racine",
      description: "Description\ncomplète",
      parentId: null,
    });
  const child = await e.commands.create(rev(e), {
    name: "Niveau suivant",
    parentId: id,
  });
  await e.commands.edit(rev(e), child, {
    name: "Renommé",
    description: "Texte corrigé",
    parentId: f.c,
  });
  const result = session(e);
  assert.equal(PlaceRules.find(result.library, child).name, "Renommé");
  assert.equal(PlaceRules.path(result.library, child).length, 4);
  assert.deepEqual(result.combat, before.combat);
  assert.deepEqual(result.library.characters, before.library.characters);
  assert.deepEqual(PlaceRules.find(result.library, f.b).future, { keep: true });
  assert.deepEqual(result.backupMetadata, before.backupMetadata);
});
test("lieux : refus de cycles, parent absent et champ protégé, aucune mutation/écriture", async () => {
  const e = setup(),
    f = fixture();
  await load(e, f.s);
  const before = JSON.stringify(session(e)),
    raw = e.data.get(SESSION_KEY);
  for (const patch of [
    { parentId: f.c },
    { parentId: f.a },
    { parentId: "absent" },
    { id: "autre" },
  ])
    await assert.rejects(e.commands.edit(rev(e), f.a, patch));
  assert.equal(JSON.stringify(session(e)), before);
  assert.equal(e.data.get(SESSION_KEY), raw);
});
test("lieux : renommage et déplacement conservent tous les liens PNJ et actualisent le nom courant", async () => {
  const e = setup(),
    f = fixture();
  await load(e, f.s);
  const characters = copy(session(e).library.characters);
  await e.commands.edit(rev(e), f.c, { name: "Nom actuel", parentId: f.a });
  assert.deepEqual(session(e).library.characters, characters);
  const npc = session(e).library.characters.find((c) => c.id === f.npcId);
  assert.equal(PlaceRules.currentName(session(e).library, npc), "Nom actuel");
});
test("liens PNJ : domicile, position et associations indépendants, legacy et champs inconnus conservés", async () => {
  const e = setup(),
    f = fixture();
  await load(e, f.s);
  const before = copy(session(e));
  await e.commands.links(rev(e), f.legacyId, { homeId: f.a });
  const legacy = session(e).library.characters.find((c) => c.id === f.legacyId);
  assert(!Object.hasOwn(legacy.placeLinks, "currentId"));
  assert.equal(
    PlaceRules.currentName(session(e).library, legacy),
    "Position libre",
  );
  await e.commands.links(rev(e), f.legacyId, { currentId: f.c });
  assert.equal(
    session(e).library.characters.find((c) => c.id === f.legacyId).location,
    "Position libre",
  );
  assert.equal(
    session(e).library.characters.find((c) => c.id === f.legacyId).placeLinks
      .homeId,
    f.a,
  );
  await e.commands.links(rev(e), f.npcId, { associatedIds: [f.b] });
  let c = session(e).library.characters.find((c) => c.id === f.npcId);
  assert.equal(c.placeLinks.currentId, f.c);
  assert.equal(c.placeLinks.homeId, f.a);
  await e.commands.links(rev(e), f.npcId, { homeId: f.b });
  c = session(e).library.characters.find((c) => c.id === f.npcId);
  assert.equal(c.placeLinks.currentId, f.c);
  assert.deepEqual(
    c.techniques,
    before.library.characters.find((c) => c.id === f.npcId).techniques,
  );
  assert.deepEqual(session(e).combat, before.combat);
  await e.commands.links(rev(e), f.orphanId, { homeId: f.a });
  assert.equal(
    session(e).library.characters.find((c) => c.id === f.orphanId).placeLinks
      .future,
    "keep",
  );
  assert(
    PlaceRules.issues(session(e).library).some(
      (i) => i.missing === "autre-inconnu",
    ),
  );
});
test("relations : descendants récursifs et aucun doublon par groupe, un PNJ peut appartenir à plusieurs groupes", () => {
  const f = fixture();
  let people = PlaceRules.people(f.s.library, f.a, false);
  assert.equal(people.present.length, 0);
  assert.equal(people.associated.length, 1);
  people = PlaceRules.people(f.s.library, f.a, true);
  assert.equal(people.present.length, 1);
  assert.equal(people.domiciled.length, 1);
  assert.equal(people.associated.length, 1);
});
test("suppression : refus sans stratégie, annulation sans commande, puis promotion/retrait explicites sans pertes", async () => {
  const e = setup(),
    f = fixture();
  await load(e, f.s);
  const before = copy(session(e)),
    revision = rev(e);
  PlaceRules.dependencies(session(e).library, f.a);
  assert.equal(rev(e), revision);
  await assert.rejects(e.commands.remove(revision, f.a), /explicitement/);
  assert.deepEqual(session(e), before);
  await e.commands.remove(rev(e), f.a, "promote-unlink");
  assert(!PlaceRules.find(session(e).library, f.a));
  assert.equal(PlaceRules.find(session(e).library, f.b).parentId, null);
  assert.equal(
    session(e).library.characters.length,
    before.library.characters.length,
  );
  const npc = session(e).library.characters.find((c) => c.id === f.npcId);
  assert.equal(npc.placeLinks.homeId, null);
  assert.equal(npc.placeLinks.currentId, f.c);
  assert.deepEqual(npc.placeLinks.associatedIds, [f.c]);
  assert.deepEqual(session(e).combat, before.combat);
});
test("illustrations : signatures locales et limites, aucune URL distante ou SVG introduit", async () => {
  const e = setup(),
    f = fixture();
  await load(e, f.s);
  for (const portrait of [
    "https://example.org/a.png",
    "data:image/svg+xml;base64,PHN2Zz4=",
    "data:image/png;base64,AAAA",
  ])
    await assert.rejects(e.commands.edit(rev(e), f.a, { portrait }));
  const portrait = "data:image/png;base64,iVBORw0KGgo=";
  await e.commands.edit(rev(e), f.a, { portrait });
  assert.equal(PlaceRules.find(session(e).library, f.a).portrait, portrait);
  await e.commands.edit(rev(e), f.a, { portrait: "" });
  assert.equal(PlaceRules.find(session(e).library, f.a).portrait, "");
});
test("quota : création/édition/suppression/liens atomiques ; compteurs et état restent intacts", async () => {
  const e = setup(),
    f = fixture();
  await load(e, f.s);
  const before = copy(session(e)),
    raw = e.data.get(SESSION_KEY);
  e.storage.fail = true;
  for (const cmd of [
    () => e.commands.create(rev(e), { name: "Refusé" }),
    () => e.commands.edit(rev(e), f.b, { name: "Refusé" }),
    () => e.commands.remove(rev(e), f.a, "promote-unlink"),
    () => e.commands.links(rev(e), f.npcId, { homeId: f.b }),
  ]) {
    await assert.rejects(cmd(), /Quota/);
    assert.deepEqual(session(e), before);
    assert.equal(e.data.get(SESSION_KEY), raw);
  }
  e.storage.fail = false;
  assert(await e.commands.create(rev(e), { name: "Réessai" }));
});
test("révision périmée et conflit entre stores : aucun écrasement ; export/rechargement/import gardent les inconnus", async () => {
  const e = setup(),
    f = fixture();
  await load(e, f.s);
  const stale = rev(e),
    other = createSessionStore(createRepository({ storage: e.storage }));
  await e.commands.edit(rev(e), f.b, { name: "Édition récente" });
  await assert.rejects(
    e.commands.edit(stale, f.b, { name: "Périmé" }),
    /périmée/,
  );
  await assert.rejects(
    createPlaceCommands(other).edit(other.getSnapshot().revision, f.b, {
      name: "Conflit",
    }),
    /autre fenêtre/,
  );
  const restored = createSessionStore(createRepository({ storage: e.storage }));
  assert.equal(
    PlaceRules.find(restored.getSnapshot().session.library, f.b).name,
    "Édition récente",
  );
  const exported = inspectImport(e.store.exportBackup()).session;
  assert.deepEqual(exported.library, session(e).library);
  assert.deepEqual(exported.combat, session(e).combat);
});
