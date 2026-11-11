import { BookState } from "../../domain/src/books.js";
import { Playbooks } from "../../domain/src/playbooks.js";
import { Roster } from "../../domain/src/roster.js";
import { TECH_CATALOG } from "../../domain/src/catalog.js";
import { copy } from "../../persistence/src/codecs.js";
import {
  playbookReference,
  findPlaybook,
  findMove,
  freeze,
} from "../../reference/src/playbooks.js";

export const PREPARATION_FORMAT = "avatar-playbook-preparation";
const text = (v, max = 2000) =>
  typeof v === "string" && !!v.trim() && v.length <= max;
const strings = (v, min, max, length = 120) =>
  Array.isArray(v) &&
  v.length >= min &&
  v.length <= max &&
  v.every((s) => text(s, length)) &&
  new Set(v).size === v.length;
const trainings = Roster.TRAININGS.filter(Boolean);
const requireBook = (id) => {
  const b = findPlaybook(id);
  if (!b) throw Error("Livret officiel inconnu");
  return b;
};
function checkDraft(draft) {
  if (
    draft?.format !== PREPARATION_FORMAT ||
    draft.version !== 1 ||
    !draft.byBook ||
    typeof draft.byBook !== "object" ||
    Array.isArray(draft.byBook)
  )
    throw Error("Brouillon de Livret non pris en charge");
}
export function createPlaybookDraft() {
  return {
    format: PREPARATION_FORMAT,
    version: 1,
    activeBookId: null,
    name: "",
    training: "",
    origins: [],
    attitudes: [],
    combatStyle: "",
    historyAnswers: [],
    relationships: [],
    combatMode: "deferred",
    byBook: {},
  };
}
/** Changer le Livret actif conserve intégralement les choix des autres Livrets. */
export function selectDraftBook(draft, bookId) {
  checkDraft(draft);
  requireBook(bookId);
  const next = copy(draft);
  next.activeBookId = bookId;
  if (!Object.hasOwn(next.byBook, bookId))
    next.byBook[bookId] = {
      bonusKey: null,
      moveIds: [],
      feature: {},
      sourceReviewed: false,
      passiveBonusIds: [],
      techniqueChoices: [],
    };
  return next;
}
/** Propositions uniquement : elles ne sont jamais recopiées comme choix du joueur. */
export function creationSuggestions(bookId) {
  const b = requireBook(bookId);
  return freeze({
    bookId: b.id,
    principles: [...b.principles],
    baseStats: Object.fromEntries(
      Playbooks.KEYS.map((k, i) => [k, b.stats[i]]),
    ),
    feature: b.feature,
    availableMoves: b.moves,
    proposedTechnique: b.creationTechnique,
    masteredCount: b.creationMasteredCount,
    acquiredCount: 1,
    historyAnswerCount: 5,
    historyThemes: b.historyThemes,
    initialMoment: "locked",
    relationshipCount: 2,
    sourcePages: [118, 120, 121, 122, 124, b.page, b.feature.page],
  });
}
export function inspectCharacterMoves(character) {
  const current = playbookReference.books.find(
    (b) => b.name === character.livret,
  );
  return (character.playbookMoves ?? []).map((name) => {
    const owner = playbookReference.books.find((b) =>
      b.moves.some((m) => m.name === name),
    );
    const move = owner?.moves.find((m) => m.name === name);
    return {
      name,
      id: move?.id ?? null,
      bookId: owner?.id ?? null,
      origin: !owner
        ? "legacy-or-custom"
        : owner.id === current?.id
          ? "current-book"
          : "other-book",
    };
  });
}
/** Validation structurelle des choix ; le MJ vérifie les options dans son livre. */
export function validateCreationDraft(draft, library = { characters: [] }) {
  checkDraft(draft);
  const errors = [],
    warnings = [],
    book = findPlaybook(draft.activeBookId);
  if (!book)
    return {
      errors: ["Choisir un Livret officiel"],
      warnings,
      candidate: null,
    };
  const chosen = draft.byBook[book.id];
  if (!chosen || typeof chosen !== "object")
    return { errors: ["Choix du Livret absents"], warnings, candidate: null };
  if (!text(draft.name, 100))
    errors.push("Nom obligatoire, 100 caractères maximum");
  if (!trainings.includes(draft.training))
    errors.push("Entraînement principal obligatoire");
  if (!strings(draft.attitudes, 1, 12))
    errors.push("Choisir au moins une attitude, libre ou proposée");
  if (!text(draft.combatStyle)) errors.push("Décrire le style de combat");
  if (
    !Array.isArray(draft.historyAnswers) ||
    draft.historyAnswers.length !== 5 ||
    draft.historyAnswers.some((s) => !text(s))
  )
    errors.push("Répondre aux cinq questions d’histoire du Livret");
  if (
    !Array.isArray(draft.relationships) ||
    draft.relationships.length !== 2 ||
    draft.relationships.some((s) => !text(s, 240))
  )
    errors.push("Préparer les deux relations de création");
  if (
    !strings(chosen.moveIds, 2, 2) ||
    chosen.moveIds.some((id) => !book.moves.some((m) => m.id === id))
  )
    errors.push("Choisir deux manœuvres distinctes de ce Livret");
  const selected = Array.isArray(chosen.moveIds)
    ? chosen.moveIds.map(findMove).filter(Boolean)
    : [];
  const extraTraining = selected.some(
    (m) => m.bookId === "heritier" && m.id === "heritier-manoeuvre-01",
  );
  if (
    !Array.isArray(draft.origins) ||
    draft.origins.length > (extraTraining ? 3 : 2) ||
    new Set(draft.origins).size !== draft.origins.length ||
    draft.origins.some((o) => !playbookReference.origins.includes(o))
  )
    errors.push("Origines invalides (deux maximum, sauf manœuvre vérifiée)");
  if (extraTraining) {
    if (
      !trainings.includes(chosen.secondaryTraining) ||
      chosen.secondaryTraining === draft.training ||
      (chosen.secondaryTraining.startsWith("Maîtrise") &&
        draft.training.startsWith("Maîtrise"))
    )
      errors.push(
        "Entraînement secondaire distinct requis, jamais deux éléments",
      );
    if (
      !text(chosen.additionalOrigin, 120) ||
      !draft.origins.includes(chosen.additionalOrigin)
    )
      errors.push("Identifier l’origine supplémentaire choisie");
    warnings.push(
      "L’entraînement secondaire est conservé comme choix préparatoire ; les commandes de combat ne l’utilisent pas encore.",
    );
  }
  if (chosen.sourceReviewed !== true)
    errors.push(
      "Faire vérifier les options propres au Livret avec le joueur/MJ et le livre",
    );
  for (const [key, rule] of Object.entries(book.feature.choices)) {
    const min = typeof rule === "number" ? rule : rule.min,
      max = typeof rule === "number" ? rule : rule.max;
    if (!strings(chosen.feature?.[key], min, max))
      errors.push(`Choix ${key} : ${min} à ${max} valeur(s) distincte(s)`);
  }
  for (const key of ["protege", "repere"]) {
    const id = chosen.feature?.[key]?.[0];
    if (id && !library.characters.some((c) => c.id === id && c.kind === "PJ"))
      errors.push(`${key} : choisir un autre PJ existant`);
  }
  let stats;
  try {
    stats = Playbooks.initialStats(book, chosen.bonusKey);
  } catch (e) {
    errors.push(e.message);
  }
  const passive = selected.filter((m) => m.passiveStat);
  if (
    !strings(chosen.passiveBonusIds, passive.length, passive.length) ||
    passive.some((m) => !chosen.passiveBonusIds.includes(m.id))
  )
    errors.push(
      "Confirmer explicitement chaque bonus de caractéristique des manœuvres choisies",
    );
  if (stats)
    for (const move of passive) {
      const s = move.passiveStat;
      stats[s.key] += s.amount;
      if (stats[s.key] > s.max) errors.push("Bonus de manœuvre : maximum +3");
    }
  if (!["deferred", "full"].includes(draft.combatMode))
    errors.push("Mode de préparation des techniques inconnu");
  const tc = chosen.techniqueChoices;
  if (
    !Array.isArray(tc) ||
    tc.some((t) => !t || typeof t !== "object" || Array.isArray(t))
  )
    errors.push("Choix de techniques invalides");
  else if (draft.combatMode === "full") {
    if (
      tc.length !== book.creationMasteredCount + 1 ||
      tc.filter((t) => t.mastery === "maitrisee").length !==
        book.creationMasteredCount ||
      tc.filter((t) => t.mastery === "acquise").length !== 1
    )
      errors.push("Nombre de techniques préparées incompatible avec ce Livret");
    const refs = new Set();
    for (const choice of tc) {
      const known =
        choice?.referenceId === book.creationTechnique.id ||
        TECH_CATALOG.some(
          (t) =>
            t.id === choice?.referenceId &&
            !["base", "groupe"].includes(t.famille) &&
            t.accessible_pj === true,
        );
      if (
        !known ||
        refs.has(choice.referenceId) ||
        choice.accessReviewed !== true
      )
        errors.push(
          "Technique inconnue, dupliquée ou accessibilité non confirmée",
        );
      refs.add(choice?.referenceId);
    }
    warnings.push(
      "Les techniques choisies restent en attente : aucune attribution ni maîtrise opérationnelle dans ce lot.",
    );
  } else if (tc.length)
    errors.push("Choisir le mode complet pour préparer des techniques");
  if (book.id === "prodige")
    warnings.push(
      "Divergence interne p. 208 sur le seuil Communauté : apprentissage non automatisé.",
    );
  if (errors.length) return { errors, warnings, candidate: null };
  const c = Roster.makeCharacter("brouillon", draft.name.trim(), "PJ");
  Object.assign(c, {
    livret: book.name,
    training: draft.training,
    stats,
    principles: [...book.principles],
    history: draft.historyAnswers.join("\n\n"),
    relationships: [...draft.relationships],
    playbookMoves: selected.map((m) => m.name),
  });
  // L’extension garde les choix et les inconnus du brouillon ; aucun second compteur de progression.
  c.playbookState = BookState.patch(c, book.name, { moment: "locked" });
  c.playbookPreparation = {
    ...copy(draft),
    status: "prepared",
    activeBookId: book.id,
  };
  try {
    Roster.validateCharacter(c);
  } catch (e) {
    errors.push(e.message);
  }
  return { errors, warnings, candidate: errors.length ? null : c };
}
/** Préparer un changement en campagne n’est pas appliquer un préréglage de création. */
export function prepareCampaignBookChange(character, bookId) {
  if (character.kind !== "PJ") throw Error("PJ requis");
  const book = requireBook(bookId);
  return freeze({
    from: character.livret,
    to: book.name,
    sourcePages: [222, 223],
    retained: copy(character),
    requiredDecisions: [
      "Nouveaux principes, centre à zéro et position initiale à décider",
      "Nouvelle spécificité et éventuels éléments conservés avec le MJ",
      "Échanges de manœuvres facultatifs, un pour un",
      "Report explicite des cases de progression et traitement des évolutions",
    ],
    operational: false,
  });
}
/** Vérifie une proposition, sans appliquer l’évolution, ni inférer les usages historiques. */
export function validateAdvancementProposal(character, proposal) {
  if (character.kind !== "PJ") throw Error("PJ requis");
  const book = playbookReference.books.find((b) => b.name === character.livret);
  if (!book)
    throw Error(
      "Livret historique/personnalisé : décision manuelle nécessaire",
    );
  if (!proposal || !book.advancements.includes(proposal.kind))
    throw Error("Évolution inconnue");
  const problems = [],
    decisions = [
      "Accord explicite joueur/MJ",
      "Vérifier les évolutions déjà utilisées : aucun compteur historique déduit",
    ];
  if (["own-move", "foreign-move"].includes(proposal.kind)) {
    const move = findMove(proposal.moveId);
    if (
      !move ||
      (move.bookId === book.id) !== (proposal.kind === "own-move") ||
      character.playbookMoves.includes(move.name)
    )
      problems.push("Manœuvre indisponible ou déjà choisie");
    if (move?.passiveStat || proposal.moveId === "heritier-manoeuvre-01")
      decisions.push("Résoudre les effets et choix associés à cette manœuvre");
  }
  if (
    proposal.kind === "stat" &&
    (!Playbooks.KEYS.includes(proposal.stat) ||
      character.stats[proposal.stat] >= 2)
  )
    problems.push("Augmentation standard limitée à +2");
  if (proposal.kind === "center") {
    if (![1, -1].includes(proposal.direction))
      problems.push("Choisir un déplacement d’un cran");
    else if (Math.abs((character.center ?? 0) + proposal.direction) > 3)
      decisions.push(
        "Transition hors jauge : consulter p. 222–223, sans écrêter ni stocker un centre illégal",
      );
  }
  if (proposal.kind === "moment")
    decisions.push(
      "Second déblocage seulement après utilisation du premier ; vérifier l’historique",
    );
  return freeze({
    bookId: book.id,
    proposal: copy(proposal),
    errors: problems,
    decisions,
    sourcePage: 214,
    status: "pending",
    applied: false,
  });
}
