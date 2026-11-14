import { Roster } from '../../domain/src/roster.js';
import { safeSheetPortrait } from '../../domain/src/character-fields.js';
import { assertSafeJson } from '../../domain/src/import-safety.js';
import { copy } from '../../persistence/src/codecs.js';
import { createCharacterCommands } from './character-commands.js';
function checkedPatch(patch) {
  const value = copy(assertSafeJson(patch));
  if (Object.hasOwn(value, 'portrait') && value.portrait && safeSheetPortrait(value.portrait) !== value.portrait)
    throw Error('Portrait invalide : PNG, JPEG ou WebP local attendu.');
  return value;
}
/** Entrées canoniques, sans clés de formulaire sheet*. Le moteur valide les valeurs.
 * La confirmation utilisateur précède l'appel ; aucune décision de jeu automatique.
 * Les ajustements/annulations existants sont réutilisés, sans deuxième état persistant.
 */
export function createCharacterService(store) {
  const resources = createCharacterCommands(store);
  return Object.freeze({
    async create(revision, kind, name, patch = {}) {
      const valid = checkedPatch(patch);
      let id;
      await store.execute(revision, draft => {
        const c = Roster.createCharacter(draft.library, name, kind);
        id = c.id;
        Roster.updateCharacter(draft.library, id, valid);
      });
      resources.invalidate();
      return id;
    },
    async edit(revision, id, patch) {
      const valid = checkedPatch(patch);
      await store.execute(revision, draft => { Roster.updateCharacter(draft.library, id, valid); });
      resources.invalidate();
    },
    adjust: (...args) => resources.adjust(...args),
    canUndo: id => resources.canUndo(id),
    undo: (...args) => resources.undo(...args),
    invalidate: () => resources.invalidate(),
  });
}
