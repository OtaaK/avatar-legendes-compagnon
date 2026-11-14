import { createSessionStore } from './session-store.js';
import { createCharacterService } from './character-service.js';
import { createPlaceCommands } from './place-commands.js';
import { createPlaybookCommands } from './playbook-commands.js';
import { filterTechniques } from '../../reference/src/technique-library.js';
import { playbookReference } from '../../reference/src/playbooks.js';
import { copy, exportPrivateCombat } from '../../persistence/src/codecs.js';
import { resourceLimits } from '../../domain/src/resources.js';
function readonly(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value); Object.values(value).forEach(readonly);
  }
  return value;
}
/** Point d'entrée futur Next.js. Aucun stockage/global navigateur lu à l'import.
 * L'appel explicite de cette fabrique charge le repository injecté, sans écrire.
 * Une instance par session cliente ; pas de singleton partagé entre requêtes SSR.
 */
export function createCompanionServices({ repository }) {
  const session = createSessionStore(repository);
  const characters = createCharacterService(session);
  return Object.freeze({
    session,
    characters,
    places: createPlaceCommands(session),
    playbooks: createPlaybookCommands(session),
    queries: Object.freeze({
      techniques: (filters) => readonly(copy(filterTechniques(filters))),
      playbooks: () => readonly(copy(playbookReference)),
      character(id) {
        const c = session.getSnapshot().session.library.characters.find(c => c.id === id);
        return c ? readonly(copy(c)) : null;
      },
      resources(id) {
        const c = session.getSnapshot().session.library.characters.find(c => c.id === id);
        if (!c) throw Error('Fiche absente');
        return readonly(copy(resourceLimits(c)));
      },
    }),
    exports: Object.freeze({
      campaign: () => session.exportBackup(),
      combat: () => {
        session.exportBackup(); // Même refus que l’export complet si la lecture initiale a échoué.
        return exportPrivateCombat(session.getSnapshot().session);
      },
    }),
  });
}
