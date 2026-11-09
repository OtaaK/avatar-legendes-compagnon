import { Roster } from "../../domain/src/roster.js";
import { sheetPatchFromFields } from "../../domain/src/character-fields.js";
import { ResourceRules } from "../../domain/src/resources.js";
import { copy } from "../../persistence/src/codecs.js";
const resourceState = (c) => ({
  fatigue: c.fatigue,
  balance: c.balance,
  conditions: [...c.conditions],
});
const fingerprint = (c) =>
  JSON.stringify({
    resources: resourceState(c),
    profile: c.npcResources ?? null,
    kind: c.kind,
  });
/** Une instance par session. Aucun couplage fiche/copie de combat. */
export function createCharacterCommands(store) {
  let undo = null;
  const find = (session, id) => {
    const c = session.library.characters.find((c) => c.id === id);
    if (!c) throw Error("Fiche absente");
    return c;
  };
  const same = (entry) => store.getSnapshot().revision === entry;
  return {
    async create(revision, kind, fields, conditions, statuses, initial = {}) {
      let id;
      await store.execute(revision, (d) => {
        const c = Roster.createCharacter(d.library, fields.sheetName, kind);
        id = c.id;
        const patch = sheetPatchFromFields(
          c,
          initial,
          fields,
          conditions,
          statuses,
          [],
        );
        Roster.updateCharacter(d.library, id, patch);
      });
      undo = null;
      return id;
    },
    async edit(revision, id, initial, fields, conditions, statuses) {
      await store.execute(revision, (d) => {
        const c = find(d, id),
          patch = sheetPatchFromFields(
            c,
            initial,
            fields,
            conditions,
            statuses,
            c.techniques,
          );
        Roster.updateCharacter(d.library, id, patch);
      });
      undo = null;
    },
    async adjust(revision, id, kind, value) {
      const current = find(store.getSnapshot().session, id),
        before = resourceState(current);
      if (!["fatigue", "balance", "conditions", "statuses"].includes(kind))
        throw Error("Ressource inconnue");
      if (["fatigue", "balance"].includes(kind)) {
        const r = ResourceRules.limits(current),
          [min, max] =
            kind === "fatigue"
              ? [0, r.fatigueMax]
              : [r.balanceMin, r.balanceMax];
        if (!Number.isInteger(value) || value < min || value > max)
          throw Error("Valeur hors des limites de la fiche.");
      }
      await store.execute(revision, (draft) => {
        Roster.updateCharacter(draft.library, id, { [kind]: value });
      });
      // L'ancien undo concerne fatigue/équilibre/états ; les statuts restent distincts.
      undo =
        kind === "statuses"
          ? null
          : {
              id,
              before,
              after: fingerprint(find(store.getSnapshot().session, id)),
              session: store.getSnapshot().revision,
            };
    },
    canUndo(id) {
      if (!undo || undo.id !== id || !same(undo.session)) return false;
      return fingerprint(find(store.getSnapshot().session, id)) === undo.after;
    },
    async undo(revision, id) {
      if (!this.canUndo(id))
        throw Error(
          "Les données ont changé : cette annulation n’est plus disponible.",
        );
      const entry = copy(undo);
      await store.execute(revision, (draft) => {
        Roster.updateCharacter(draft.library, id, entry.before);
      });
      undo = null;
    },
    invalidate() {
      undo = null;
    },
  };
}
