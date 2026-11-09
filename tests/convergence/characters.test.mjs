import test from "node:test";
import assert from "node:assert/strict";
import { createSessionStore } from "../../packages/application/src/session-store.js";
import { createCharacterCommands } from "../../packages/application/src/character-commands.js";
import { createRepository } from "../../packages/persistence/src/local-session-repository.js";
import { Roster } from "../../packages/domain/src/roster.js";
import { CombatCore } from "../../packages/domain/src/combat.js";
import { ResourceRules } from "../../packages/domain/src/resources.js";
import {
  emptySession,
  exportBackup,
  inspectImport,
} from "../../packages/persistence/src/codecs.js";
import {
  sheetPatchFromFields,
  safeSheetPortrait,
} from "../../packages/domain/src/character-fields.js";
function setup() {
  const data = new Map();
  const storage = {
    fail: false,
    getItem: (k) => data.get(k) ?? null,
    setItem(k, v) {
      if (this.fail) throw Error("Quota simulé");
      data.set(k, v);
    },
  };
  const store = createSessionStore(createRepository({ storage }));
  return { store, storage, commands: createCharacterCommands(store) };
}
function fixture() {
  const s = emptySession(),
    c = Roster.createCharacter(s.library, "Ancien PNJ", "PNJ");
  c.extra = { keep: 42 };
  c.placeLinks = {
    homeId: "absent",
    associatedIds: ["ailleurs"],
    currentId: null,
    unknown: "préservé",
  };
  c.livret = "Rôle ancien";
  c.history = "Historique";
  c.techniques = [
    { name: "Technique ancienne", mastery: "maitrisee", extra: true },
  ];
  s.library.future = { keep: true };
  Roster.addToCombat(s.library, s.combat, c.id);
  return s;
}
test("édition du nom seulement : lieux, inconnus, techniques, histoire et combat inchangés", async () => {
  const { store, commands } = setup();
  await store.commitImport(store.prepareImport(exportBackup(fixture())));
  const before = store.getSnapshot().session;
  await commands.edit(
    1,
    before.library.characters[0].id,
    { sheetName: "Ancien PNJ" },
    { sheetName: "Nouveau PNJ" },
    [],
    [],
  );
  const after = store.getSnapshot().session;
  assert.deepEqual(after.library.characters[0], {
    ...before.library.characters[0],
    name: "Nouveau PNJ",
  });
  assert.deepEqual(after.combat, before.combat);
  assert.deepEqual(after.library.future, before.library.future);
});
test("importance seule ne modifie pas les capacités ou ressources", async () => {
  const { store, commands } = setup();
  await store.commitImport(store.prepareImport(exportBackup(fixture())));
  const c = store.getSnapshot().session.library.characters[0];
  await commands.edit(
    1,
    c.id,
    { sheetImportance: "" },
    { sheetImportance: "Légendaire" },
    [],
    [],
  );
  const after = store.getSnapshot().session.library.characters[0];
  assert.equal(after.importance, "Légendaire");
  assert.equal(ResourceRules.limits(after).fatigueMax, 5);
  assert.equal(after.npcResources, undefined);
});
test("création puis édition : identifiants stables, compteurs conservés, ressources bornées", async () => {
  const { store, commands } = setup();
  const id = await commands.create(
    0,
    "PJ",
    {
      sheetName: "PJ réel",
      principleLeft: "Devoir",
      principleRight: "Liberté",
    },
    [],
    [],
  );
  assert.equal(id, "char-1");
  await commands.edit(
    1,
    id,
    { sheetName: "PJ réel" },
    { sheetName: "PJ modifié" },
    [],
    [],
  );
  assert.equal(store.getSnapshot().session.library.characters[0].id, id);
  assert.equal(store.getSnapshot().session.library.seq, 2);
  await assert.rejects(() => commands.adjust(2, id, "fatigue", 6), /limites/);
  assert.equal(store.getSnapshot().revision, 2);
});
test("capacités PNJ 3/5/10/15 et non-combattant : ajustement, refus, undo sans toucher au combat", async () => {
  for (const cap of [0, 3, 5, 10, 15]) {
    const { store, commands } = setup(),
      s = emptySession(),
      c = Roster.createCharacter(s.library, "Profil " + cap, "PNJ");
    Roster.updateCharacter(s.library, c.id, {
      npcResources: {
        format: "avatar-npc-resources",
        version: 1,
        combatant: cap > 0,
        fatigueMax: cap,
        balanceMax: 0,
        conditions: cap ? ["Du profil"] : [],
      },
    });
    await store.commitImport(store.prepareImport(exportBackup(s)));
    await assert.rejects(
      () => commands.adjust(1, c.id, "fatigue", cap + 1),
      /limites/,
    );
    await commands.adjust(1, c.id, "fatigue", cap);
    assert(commands.canUndo(c.id));
    store.getSnapshot();
    assert(commands.canUndo(c.id));
    await commands.undo(2, c.id);
    assert.equal(store.getSnapshot().session.library.characters[0].fatigue, 0);
    assert(!commands.canUndo(c.id));
  }
});
test("centre distinct de position ; conditions distinctes des statuts", async () => {
  const { store, commands } = setup();
  const id = await commands.create(
    0,
    "PJ",
    { sheetName: "Équilibre", sheetBalance: "1", sheetCenter: "-2" },
    [],
    [],
  );
  await commands.adjust(1, id, "balance", 3);
  let c = store.getSnapshot().session.library.characters[0];
  assert.equal(c.center, -2);
  assert.equal(c.balance, 3);
  await commands.adjust(2, id, "conditions", ["En colère"]);
  await commands.adjust(3, id, "statuses", ["Gêné"]);
  c = store.getSnapshot().session.library.characters[0];
  assert.deepEqual(c.conditions, ["En colère"]);
  assert.deepEqual(c.statuses, ["Gêné"]);
  assert(!commands.canUndo(id));
});
test("annulation refusée après import identique, édition ou modification intermédiaire", async () => {
  const { store, commands } = setup(),
    id = await commands.create(0, "PJ", { sheetName: "Annulation" }, [], []);
  await commands.adjust(1, id, "fatigue", 2);
  const text = store.exportBackup();
  await store.commitImport(store.prepareImport(text));
  assert(!commands.canUndo(id));
  await assert.rejects(() => commands.undo(3, id), /annulation/);
});
test("quota : aucun identifiant consommé, aucune ressource perdue, nouvelle tentative possible", async () => {
  const { store, commands, storage } = setup();
  storage.fail = true;
  await assert.rejects(
    () => commands.create(0, "PNJ", { sheetName: "Échec" }, [], []),
    /Quota/,
  );
  assert.equal(store.getSnapshot().session.library.seq, 1);
  storage.fail = false;
  const id = await commands.create(0, "PNJ", { sheetName: "Réussi" }, [], []);
  await commands.adjust(1, id, "fatigue", 1);
  storage.fail = true;
  await assert.rejects(() => commands.adjust(2, id, "fatigue", 2), /Quota/);
  assert.equal(store.getSnapshot().session.library.characters[0].fatigue, 1);
  assert(commands.canUndo(id));
  storage.fail = false;
  await commands.undo(2, id);
  assert.equal(store.getSnapshot().session.library.characters[0].fatigue, 0);
});
test("édition périmée refusée, brouillon non publié", async () => {
  const { store, commands } = setup(),
    id = await commands.create(0, "PJ", { sheetName: "Original" }, [], []);
  await commands.adjust(1, id, "fatigue", 1);
  await assert.rejects(
    () =>
      commands.edit(
        1,
        id,
        { sheetName: "Original" },
        { sheetName: "Périmé" },
        [],
        [],
      ),
    /périmée/,
  );
  assert.equal(
    store.getSnapshot().session.library.characters[0].name,
    "Original",
  );
});
test("roundtrip après édition : données supplémentaires et combat conservés", async () => {
  const { store, commands } = setup();
  await store.commitImport(store.prepareImport(exportBackup(fixture())));
  const c = store.getSnapshot().session.library.characters[0];
  await commands.adjust(1, c.id, "fatigue", 3);
  const restored = inspectImport(store.exportBackup()).session;
  assert.deepEqual(restored.library, store.getSnapshot().session.library);
  assert.deepEqual(restored.combat, fixture().combat);
});
test("portrait : seules signatures locales PNG/JPEG/WebP, taille et champs non modifiés préservés", () => {
  const png =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==";
  assert.equal(safeSheetPortrait(png), png);
  for (const bad of [
    "https://example.com/a.png",
    "data:image/svg+xml;base64,PHN2Zz4=",
    "data:image/png;base64,AAAA",
    "x".repeat(360001),
  ])
    assert.equal(safeSheetPortrait(bad), "");
  const c = Roster.makeCharacter("char-1", "Nom");
  c.portrait = "ancien champ non modifié";
  assert.deepEqual(
    sheetPatchFromFields(
      c,
      { sheetName: "Nom" },
      { sheetName: "Autre" },
      [],
      [],
      [],
    ),
    { name: "Autre" },
  );
});
test("création depuis un formulaire PJ complet : aucun champ PNJ activé implicitement", async () => {
  const { store, commands } = setup(),
    initial = {
      sheetName: "",
      sheetImportance: "",
      npcProfileMode: "legacy",
      npcCombatant: "yes",
      npcFatigueMax: "5",
      npcBalanceMax: "3",
      npcConditionCount: "5",
      npcConditionNames: Roster.CONDITIONS.join("\n"),
    };
  const id = await commands.create(
    0,
    "PJ",
    { ...initial, sheetName: "PJ formulaire" },
    [],
    [],
    initial,
  );
  const c = store.getSnapshot().session.library.characters[0];
  assert.equal(c.id, id);
  assert.equal(c.kind, "PJ");
  assert.equal(c.npcResources, undefined);
  assert.equal(c.importance, undefined);
});
