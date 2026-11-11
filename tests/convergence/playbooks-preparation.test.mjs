import test from "node:test";
import assert from "node:assert/strict";
import {
  playbookReference,
  findPlaybook,
} from "../../packages/reference/src/playbooks.js";
import {
  createPlaybookDraft,
  selectDraftBook,
  creationSuggestions,
  validateCreationDraft,
  inspectCharacterMoves,
  prepareCampaignBookChange,
  validateAdvancementProposal,
} from "../../packages/application/src/playbook-preparation.js";
import { createPlaybookCommands } from "../../packages/application/src/playbook-commands.js";
import { createSessionStore } from "../../packages/application/src/session-store.js";
import { createRepository } from "../../packages/persistence/src/local-session-repository.js";
import { Roster } from "../../packages/domain/src/roster.js";
import { Playbooks } from "../../packages/domain/src/playbooks.js";
import { TECH_CATALOG } from "../../packages/domain/src/catalog.js";
import { BookState } from "../../packages/domain/src/books.js";
import {
  emptySession,
  exportBackup,
} from "../../packages/persistence/src/codecs.js";
const decision = {
  confirmed: true,
  reason: "Décision synthétique du joueur et du MJ",
  acceptPending: true,
};
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
  return { store, storage, data, commands: createPlaybookCommands(store) };
}
function fixture() {
  const s = emptySession(),
    c = Roster.createCharacter(s.library, "PJ historique", "PJ");
  c.livret = "Livret personnel";
  c.playbookMoves = ["Manœuvre historique"];
  c.extra = { keep: 42 };
  c.history = "Histoire conservée";
  c.techniques = [
    { name: "Technique personnelle", mastery: "pratiquee", future: true },
  ];
  c.playbookState = BookState.patch(c, c.livret, {
    progress: 4,
    notes: "Note ancienne",
    evolutions: "Évolutions déjà jouées",
  });
  c.playbookState.future = true;
  c.playbookState.entries[0].future = "ancien";
  s.library.version = 2;
  Roster.addToCombat(s.library, s.combat, c.id);
  return s;
}
function validDraft(id) {
  const b = findPlaybook(id),
    d = selectDraftBook(createPlaybookDraft(), id),
    c = d.byBook[id];
  Object.assign(d, {
    name: `PJ ${id}`,
    training: "Armes",
    origins: ["Citadin"],
    attitudes: ["Attitude personnalisée"],
    combatStyle: "Style narratif synthétique",
    historyAnswers: Array.from({ length: 5 }, (_, i) => `Réponse ${i + 1}`),
    relationships: ["Relation un", "Relation deux"],
  });
  Object.assign(c, {
    bonusKey: "creativite",
    moveIds: b.moves.slice(3, 5).map((m) => m.id),
    sourceReviewed: true,
  });
  for (const [k, n] of Object.entries(b.feature.choices))
    c.feature[k] = Array.from(
      { length: typeof n === "number" ? n : n.min },
      (_, i) => `${k}-${i + 1}`,
    );
  if (id === "gardien") c.feature.protege = ["autre-pj"];
  if (id === "inflexible") c.feature.repere = ["autre-pj"];
  return d;
}
const other = { characters: [{ id: "autre-pj", kind: "PJ" }] };
test("référence : dix Livrets, cinquante manœuvres, identifiants uniques et sources explicites", () => {
  assert.equal(playbookReference.books.length, 10);
  const moves = playbookReference.books.flatMap((b) => b.moves);
  assert.equal(moves.length, 50);
  assert.equal(new Set(moves.map((m) => m.id)).size, 50);
  for (const b of playbookReference.books) {
    assert.deepEqual(b.principles, Playbooks.byName(b.name).principles);
    assert.equal(b.moves.length, 5);
    assert.ok(b.feature.page);
    assert.equal(b.progressQuestion.kind, "paraphrase");
    assert.equal(b.extraAdvancements, "not-confirmed");
  }
  assert.throws(() => {
    playbookReference.books[0].principles[0] = "Mutation";
  }, TypeError);
});
for (const book of playbookReference.books)
  test(`${book.id} : création préparée, choix spécifiques et aucune attribution de technique`, () => {
    const d = validDraft(book.id),
      before = JSON.stringify(d),
      r = validateCreationDraft(d, other);
    assert.deepEqual(r.errors, []);
    assert.equal(JSON.stringify(d), before);
    assert.deepEqual(r.candidate.principles, book.principles);
    assert.deepEqual(r.candidate.techniques, []);
    assert.equal(BookState.entry(r.candidate).progress, 0);
    assert.equal(BookState.entry(r.candidate).moment, "locked");
    assert.equal(r.candidate.center, 0);
    assert.deepEqual(
      r.candidate.stats,
      Playbooks.initialStats(book, "creativite"),
    );
    const suggestion = creationSuggestions(book.id);
    assert.equal(suggestion.masteredCount, book.id === "prodige" ? 2 : 1);
    assert.equal(suggestion.proposedTechnique.operational, false);
    const broken = structuredClone(d);
    const field = Object.keys(book.feature.choices).find(
      (k) =>
        (typeof book.feature.choices[k] === "number"
          ? book.feature.choices[k]
          : book.feature.choices[k].min) > 0,
    );
    broken.byBook[book.id].feature[field] = [];
    assert.ok(validateCreationDraft(broken, other).errors.length);
  });
test("changement de Livret du brouillon : aucun choix détruit, retour exact et propositions distinctes", () => {
  const d = validDraft("audacieux");
  d.byBook.audacieux.future = { keep: true };
  const changed = selectDraftBook(d, "prodige");
  assert.deepEqual(changed.byBook.audacieux, d.byBook.audacieux);
  assert.equal(changed.byBook.prodige.bonusKey, null);
  assert.deepEqual(changed.byBook.prodige.moveIds, []);
  assert.deepEqual(
    selectDraftBook(changed, "audacieux").byBook.audacieux,
    d.byBook.audacieux,
  );
  assert.equal(d.activeBookId, "audacieux");
  assert.throws(() => selectDraftBook(d, "inexistant"));
});
test("refus de création : champs, doublons, manœuvres étrangères, contrôle source et version", () => {
  for (const change of [
    (d) => (d.name = ""),
    (d) => (d.training = "Inconnu"),
    (d) => (d.origins = ["Citadin", "Citadin"]),
    (d) => (d.attitudes = []),
    (d) => (d.historyAnswers = []),
    (d) => (d.relationships = []),
    (d) => (d.byBook.audacieux.sourceReviewed = false),
    (d) =>
      (d.byBook.audacieux.moveIds = [
        "prodige-manoeuvre-01",
        "prodige-manoeuvre-02",
      ]),
    (d) =>
      (d.byBook.audacieux.moveIds = [
        "audacieux-manoeuvre-01",
        "audacieux-manoeuvre-01",
      ]),
  ]) {
    const d = validDraft("audacieux");
    change(d);
    assert.ok(validateCreationDraft(d).errors.length);
  }
  assert.throws(() =>
    validateCreationDraft({ ...validDraft("audacieux"), version: 99 }),
  );
  const d = validDraft("gardien");
  assert.ok(
    validateCreationDraft(d).errors.some((e) => e.includes("autre PJ")),
  );
});
test("les cinq bonus passifs sont proposés et exigent une confirmation explicite", () => {
  for (const b of playbookReference.books) {
    const m = b.moves.find((m) => m.passiveStat);
    if (!m) continue;
    const d = validDraft(b.id),
      c = d.byBook[b.id];
    c.moveIds = [m.id, b.moves[4].id];
    assert.ok(
      validateCreationDraft(d, other).errors.some((e) => e.includes("bonus")),
    );
    c.passiveBonusIds = [m.id];
    const r = validateCreationDraft(d, other);
    assert.deepEqual(r.errors, []);
    assert.equal(
      r.candidate.stats[m.passiveStat.key],
      Playbooks.initialStats(b, "creativite")[m.passiveStat.key] + 1,
    );
  }
  const d = validDraft("prodige");
  d.byBook.prodige.bonusKey = "concentration";
  assert.ok(
    validateCreationDraft(d).errors.includes("Maximum +2 à la création"),
  );
});
test("Connaissance du monde : choix distincts, origine et interdiction de deux éléments", () => {
  const d = validDraft("heritier"),
    c = d.byBook.heritier;
  c.moveIds = ["heritier-manoeuvre-01", "heritier-manoeuvre-05"];
  assert.ok(validateCreationDraft(d).errors.length);
  c.secondaryTraining = "Technologie";
  c.additionalOrigin = "Citadin";
  assert.deepEqual(validateCreationDraft(d).errors, []);
  d.training = "Maîtrise de l’Eau";
  c.secondaryTraining = "Maîtrise du Feu";
  assert.ok(
    validateCreationDraft(d).errors.some((e) => e.includes("deux éléments")),
  );
});
test("techniques préparées : quantités propres au Prodige, références réelles, aucun effet métier", () => {
  const real = TECH_CATALOG.filter(
    (t) => !["base", "groupe"].includes(t.famille) && t.accessible_pj,
  );
  for (const id of ["audacieux", "prodige"]) {
    const d = validDraft(id),
      c = d.byBook[id];
    d.combatMode = "full";
    c.techniqueChoices = [
      {
        referenceId: findPlaybook(id).creationTechnique.id,
        mastery: "maitrisee",
        accessReviewed: true,
      },
      { referenceId: real[0].id, mastery: "acquise", accessReviewed: true },
    ];
    if (id === "prodige")
      c.techniqueChoices.push({
        referenceId: real[1].id,
        mastery: "maitrisee",
        accessReviewed: true,
      });
    const r = validateCreationDraft(d);
    assert.deepEqual(r.errors, []);
    assert.deepEqual(r.candidate.techniques, []);
    assert.deepEqual(
      r.candidate.playbookPreparation.byBook[id].techniqueChoices,
      c.techniqueChoices,
    );
    c.techniqueChoices[0].referenceId = "inconnue";
    assert.ok(validateCreationDraft(d).errors.length);
    c.techniqueChoices[0].referenceId = "base-se-preparer";
    assert.ok(validateCreationDraft(d).errors.length);
    c.techniqueChoices[0] = null;
    assert.ok(validateCreationDraft(d).errors.length);
  }
});
test("consultation des manœuvres : courantes, étrangères et personnalisées sans migration", () => {
  const c = fixture().library.characters[0];
  c.livret = findPlaybook("audacieux").name;
  c.playbookMoves = [
    findPlaybook("audacieux").moves[0].name,
    findPlaybook("prodige").moves[0].name,
    "Création personnelle",
  ];
  assert.deepEqual(
    inspectCharacterMoves(c).map((m) => m.origin),
    ["current-book", "other-book", "legacy-or-custom"],
  );
  const before = structuredClone(c),
    p = prepareCampaignBookChange(c, "prodige");
  assert.equal(p.operational, false);
  assert.deepEqual(c, before);
  assert.deepEqual(p.retained, c);
});
test("création transactionnelle : refus, annulation, confirmation, erreur de stockage et nouvel essai", async () => {
  const { store, storage, commands } = setup(),
    initial = store.getSnapshot();
  assert.equal(commands.prepareCreation(createPlaybookDraft()).plan, null);
  assert.deepEqual(store.getSnapshot(), initial);
  let p = commands.prepareCreation(validDraft("audacieux")).plan;
  commands.cancel(p);
  await assert.rejects(commands.commit(p, decision), /annulé/);
  p = commands.prepareCreation(validDraft("audacieux")).plan;
  await assert.rejects(
    commands.commit(p, { confirmed: false }),
    /Confirmation/,
  );
  storage.fail = true;
  await assert.rejects(commands.commit(p, decision), /Quota/);
  assert.deepEqual(store.getSnapshot(), initial);
  storage.fail = false;
  const id = await commands.commit(p, decision);
  assert.equal(store.getSnapshot().session.library.characters[0].id, id);
  assert.equal(store.getSnapshot().revision, 1);
  await assert.rejects(commands.commit(p, decision), /déjà enregistré/);
});
test("brouillon et plan isolés : mutation après aperçu et révision périmée", async () => {
  const { store, commands } = setup(),
    d = validDraft("audacieux"),
    p = commands.prepareCreation(d).plan;
  d.name = "Mutation tardive";
  assert.throws(() => {
    p.candidate.name = "Altération";
  }, TypeError);
  const otherPlan = commands.prepareCreation(validDraft("prodige")).plan;
  await commands.commit(p, decision);
  await assert.rejects(commands.commit(otherPlan, decision), /périmée/);
  assert.equal(
    store.getSnapshot().session.library.characters[0].name,
    "PJ audacieux",
  );
});
test("progression 0 à 4 : aucun gain, consommation, synchronisation du combat ni écrasement des inconnus", async () => {
  const { store, commands } = setup();
  await store.commitImport(store.prepareImport(exportBackup(fixture())));
  const before = store.getSnapshot().session,
    c = before.library.characters[0];
  for (let progress = 0; progress <= 4; progress++)
    await commands.commit(
      commands.prepareProgress(c.id, c.livret, { progress }, decision),
      decision,
    );
  const after = store.getSnapshot().session,
    ac = after.library.characters[0];
  const expected = structuredClone(c);
  expected.playbookState.entries[0].progress = 4;
  assert.deepEqual(ac, expected);
  assert.deepEqual(after.combat, before.combat);
  assert.throws(
    () => commands.prepareProgress(c.id, c.livret, { progress: 5 }, decision),
    /0 à 4/,
  );
  assert.throws(
    () =>
      commands.prepareProgress(c.id, c.livret, { techniques: [] }, decision),
    /protégé/,
  );
});
test("ajout/retrait corrigé : historique conservé, identité stable, refus et annulation", async () => {
  const { store, commands } = setup();
  await store.commitImport(store.prepareImport(exportBackup(fixture())));
  const before = store.getSnapshot().session,
    c = before.library.characters[0];
  assert.throws(
    () =>
      commands.prepareAddMove(c.id, "prodige-manoeuvre-01", {
        confirmed: false,
      }),
    /Confirmation/,
  );
  let p = commands.prepareAddMove(c.id, "prodige-manoeuvre-01", decision);
  commands.cancel(p);
  await assert.rejects(commands.commit(p, decision));
  await commands.commit(
    commands.prepareAddMove(c.id, "prodige-manoeuvre-01", decision),
    decision,
  );
  assert.equal(
    store.getSnapshot().session.library.characters[0].playbookMoves.length,
    2,
  );
  await commands.commit(commands.prepareMoves(c.id, [], decision), decision);
  const after = store.getSnapshot().session,
    ac = after.library.characters[0];
  assert.equal(ac.id, c.id);
  assert.deepEqual(ac.techniques, c.techniques);
  assert.deepEqual(ac.extra, c.extra);
  assert.deepEqual(ac.playbookState, c.playbookState);
  assert.deepEqual(after.combat, before.combat);
  assert.deepEqual(ac.playbookPreparation.events[0].before, [
    "Manœuvre historique",
  ]);
  assert.equal(ac.playbookPreparation.events.length, 2);
  const restored = setup();
  await restored.store.commitImport(
    restored.store.prepareImport(store.exportBackup()),
  );
  assert.deepEqual(restored.store.getSnapshot().session.library, after.library);
  assert.deepEqual(restored.store.getSnapshot().session.combat, after.combat);
});
test("évolutions : cinq familles, validations et propositions seulement, même à quatre cases", async () => {
  const { store, commands } = setup(),
    s = fixture(),
    c = s.library.characters[0];
  c.livret = findPlaybook("audacieux").name;
  c.playbookState = BookState.patch(c, c.livret, { progress: 4 });
  c.center = 3;
  await store.commitImport(store.prepareImport(exportBackup(s)));
  const before = store.getSnapshot().session.library.characters[0];
  for (const proposal of [
    { kind: "own-move", moveId: "audacieux-manoeuvre-01" },
    { kind: "foreign-move", moveId: "prodige-manoeuvre-01" },
    { kind: "stat", stat: "creativite" },
    { kind: "center", direction: 1 },
    { kind: "moment" },
  ]) {
    const p = commands.prepareAdvancement(c.id, proposal, decision);
    assert.equal(p.review.applied, false);
    if (proposal.kind === "center")
      assert.ok(p.review.decisions.some((s) => s.includes("hors jauge")));
    await commands.commit(p, decision);
  }
  const after = store.getSnapshot().session.library.characters[0];
  const without = structuredClone(after);
  delete without.playbookPreparation;
  assert.deepEqual(without, before);
  assert.equal(BookState.entry(after).progress, 4);
  assert.equal(after.playbookPreparation.events.length, 5);
  assert.ok(
    validateAdvancementProposal(
      { ...after, stats: { ...after.stats, creativite: 2 } },
      { kind: "stat", stat: "creativite" },
    ).errors.length,
  );
  assert.ok(
    validateAdvancementProposal(after, {
      kind: "foreign-move",
      moveId: "audacieux-manoeuvre-01",
    }).errors.length,
  );
  assert.throws(
    () =>
      validateAdvancementProposal(
        { ...after, livret: "Personnalisé" },
        { kind: "moment" },
      ),
    /manuelle/,
  );
});
test("extension future : consultation conservée, mutation refusée sans écrasement", async () => {
  const { store, commands } = setup(),
    s = fixture(),
    c = s.library.characters[0];
  c.playbookPreparation = {
    format: "future",
    version: 99,
    secret: { keep: true },
  };
  await store.commitImport(store.prepareImport(exportBackup(s)));
  const before = store.getSnapshot();
  const p = commands.prepareMoves(c.id, ["Correction explicite"], decision);
  await assert.rejects(commands.commit(p, decision), /inconnue/);
  assert.deepEqual(store.getSnapshot(), before);
  // Le suivi Codex existant reste indépendant de cette extension inconnue.
  await commands.commit(
    commands.prepareProgress(
      c.id,
      c.livret,
      { notes: "Note corrigée" },
      decision,
    ),
    decision,
  );
  assert.deepEqual(
    store.getSnapshot().session.library.characters[0].playbookPreparation,
    c.playbookPreparation,
  );
});

test("création enregistrée puis rechargée : choix inconnus/inactifs, techniques en attente et moment verrouillé conservés", async () => {
  const { store, storage, commands } = setup();
  const first = validDraft("audacieux");
  first.byBook.audacieux.future = { keep: ["choix inactif"] };
  const d = selectDraftBook(first, "prodige");
  const source = validDraft("prodige");
  d.byBook.prodige = source.byBook.prodige;
  d.future = { keep: true };
  const p = commands.prepareCreation(d).plan;
  assert.equal(p.candidate.playbookPreparation.status, "prepared");
  const id = await commands.commit(p, decision);
  const c = store.getSnapshot().session.library.characters[0];
  assert.equal(c.playbookPreparation.status, "recorded");
  assert.deepEqual(c.playbookPreparation.creationDecision, decision);
  assert.deepEqual(c.playbookPreparation.byBook.audacieux.future, {
    keep: ["choix inactif"],
  });
  assert.deepEqual(c.playbookPreparation.future, { keep: true });
  assert.deepEqual(c.techniques, []);
  assert.equal(BookState.entry(c).moment, "locked");
  const loaded = createSessionStore(createRepository({ storage }));
  assert.deepEqual(loaded.getSnapshot().session, store.getSnapshot().session);
  const restored = setup();
  await restored.store.commitImport(
    restored.store.prepareImport(store.exportBackup()),
  );
  assert.deepEqual(
    restored.store
      .getSnapshot()
      .session.library.characters.find((c) => c.id === id),
    c,
  );
});

test("refus de plans étrangers/forgés, avertissements et erreurs de quota sur les corrections", async () => {
  const a = setup(),
    b = setup();
  const p = a.commands.prepareCreation(validDraft("prodige")).plan;
  await assert.rejects(b.commands.commit(p, decision), /inconnu/);
  await assert.rejects(a.commands.commit({ ...p }, decision), /inconnu/);
  await assert.rejects(
    a.commands.commit(p, { confirmed: true, reason: "Sans acceptation" }),
    /limites/,
  );
  const initial = a.store.getSnapshot();
  assert.equal(initial.session.library.characters.length, 0);
  await a.store.commitImport(a.store.prepareImport(exportBackup(fixture())));
  const c = a.store.getSnapshot().session.library.characters[0];
  const plans = [
    a.commands.prepareProgress(c.id, c.livret, { progress: 1 }, decision),
    a.commands.prepareMoves(c.id, ["Correction"], decision),
  ];
  const before = a.store.getSnapshot();
  a.storage.fail = true;
  for (const plan of plans)
    await assert.rejects(a.commands.commit(plan, decision), /Quota/);
  assert.deepEqual(a.store.getSnapshot(), before);
});
