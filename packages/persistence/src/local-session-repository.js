import { validateSession } from "./codecs.js";
export const SESSION_KEY = "avatar-compagnon-react-session-v1";
export const LAB_KEY = "avatar-compagnon-react-lab-v1";
export class StorageConflict extends Error {
  constructor() {
    super(
      "Une autre fenêtre a modifié ces données. Exportez votre état avant de recharger.",
    );
    this.name = "StorageConflict";
  }
}
/** Une seule écriture atomique library+combat. Jamais d'accès aux clés historiques.
 * locks : Web Locks quand disponible. Sans ce port, contrôle optimiste seulement :
 * pas de garantie contre deux écritures exactement simultanées (notamment file://).
 */
export function createRepository({ storage, key = SESSION_KEY, locks } = {}) {
  if (![SESSION_KEY, LAB_KEY].includes(key))
    throw Error("Espace de stockage non autorisé.");
  return {
    key,
    concurrency: locks ? "web-locks" : "optimistic",
    load() {
      const token = storage.getItem(key);
      if (token === null) return { token, session: null, revision: 0 };
      const data = JSON.parse(token);
      if (
        data.format !== "avatar-compagnon-react-session" ||
        data.version !== 1 ||
        !Number.isSafeInteger(data.revision) ||
        data.revision < 1
      )
        throw Error(
          "Stockage React invalide : aucune réinitialisation automatique.",
        );
      return {
        token,
        session: validateSession(data.session),
        revision: data.revision,
      };
    },
    async save(session, expectedToken, revision) {
      const valid = validateSession(session);
      const token = JSON.stringify({
        format: "avatar-compagnon-react-session",
        version: 1,
        revision,
        session: valid,
      });
      const commit = () => {
        if (storage.getItem(key) !== expectedToken) throw new StorageConflict();
        storage.setItem(key, token); // Quota/accès refusé : le précédent état reste intact.
        if (storage.getItem(key) !== token) throw new StorageConflict();
        return { token, session: valid, revision };
      };
      return locks
        ? locks.request(`avatar-session:${key}`, { mode: "exclusive" }, commit)
        : commit();
    },
  };
}
