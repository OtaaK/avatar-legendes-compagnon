import {
  copy,
  emptySession,
  inspectImport,
  validateSession,
  exportBackup,
} from "../../persistence/src/codecs.js";
function freeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) freeze(child);
  }
  return value;
}
/** Store externe React : snapshot stable ; aucun effet de montage n'écrit. */
export function createSessionStore(repository) {
  let token = null,
    revision = 0,
    blocked = false,
    busy = false;
  let snapshot,
    loadFailed = false;
  try {
    const loaded = repository.load();
    token = loaded.token;
    revision = loaded.revision;
    snapshot = {
      session: loaded.session ?? emptySession(),
      revision,
      error: null,
    };
  } catch (error) {
    blocked = true;
    loadFailed = true;
    snapshot = { session: emptySession(), revision, error: error.message };
  }
  snapshot = freeze(snapshot);
  const listeners = new Set(),
    plans = new WeakSet();
  function publish(next) {
    snapshot = freeze(next);
    listeners.forEach((listener) => listener());
  }
  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    prepareImport(text) {
      if (blocked)
        throw Error(
          "Lecture bloquée : conserver le contenu local et restaurer dans un espace sain.",
        );
      const plan = freeze({
        ...inspectImport(text, snapshot.session),
        revision,
      });
      plans.add(plan);
      return plan;
    },
    async commitImport(plan) {
      if (!plans.has(plan)) throw Error("Aperçu inconnu.");
      return this.execute(plan.revision, () => copy(plan.session));
    },
    async execute(expectedRevision, command) {
      if (blocked)
        throw Error(
          "Écriture bloquée : aucune ancienne donnée ne sera remplacée.",
        );
      if (busy || revision !== expectedRevision)
        throw Error(
          "Action périmée ou déjà en cours : recommencez depuis l’état courant.",
        );
      busy = true;
      try {
        const draft = copy(snapshot.session);
        const next = command(draft) ?? draft;
        if (next && typeof next.then === "function")
          throw Error(
            "Une commande métier doit être synchrone ; les décisions précèdent la transaction.",
          );
        const valid = validateSession(next);
        const saved = await repository.save(valid, token, revision + 1);
        token = saved.token;
        revision = saved.revision;
        publish({ session: saved.session, revision, error: null });
        return snapshot;
      } finally {
        busy = false;
      }
    },
    checkExternal() {
      try {
        if (repository.load().token !== token) {
          blocked = true;
          publish({
            ...snapshot,
            error:
              "Modification externe détectée. Exportez votre état avant de recharger ; aucune fusion automatique.",
          });
          return true;
        }
      } catch (error) {
        blocked = true;
        publish({ ...snapshot, error: error.message });
        return true;
      }
      return false;
    },
    exportBackup: () => {
      if (loadFailed)
        throw Error(
          "Aucun état valide chargé : conservez le stockage original et utilisez une sauvegarde privée.",
        );
      return exportBackup(snapshot.session);
    },
  };
}
