/** Frontière JSON, sans DOM. Ne transforme jamais un identifiant invalide. */
export function isSafeId(value) {
  return typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9_-]{0,119}(?![\s\S])/.test(value);
}
export function assertCharacterId(value) {
  if (!isSafeId(value)) throw Error("Identifiant de fiche invalide");
}
/** Vérifier AVANT JSON.stringify : aucun getter/toJSON n'est appelé.
 * Les extensions JSON et les undefined internes (omis comme historiquement) restent admis.
 * Ce n'est pas un bac à sable pour Proxy ni une limite de taille des fichiers.
 */
export function assertSafeJson(value) {
  const ancestors = new WeakSet();
  const stack = [{ value, leave: false }];
  while (stack.length) {
    const item = stack.pop(), v = item.value;
    if (v === null || v === undefined || ["string", "boolean"].includes(typeof v)) continue;
    if (typeof v === "number") {
      if (!Number.isFinite(v)) throw Error("Nombre JSON non fini");
      continue;
    }
    if (typeof v !== "object") throw Error("Valeur non JSON interdite");
    if (item.leave) { ancestors.delete(v); continue; }
    if (ancestors.has(v)) throw Error("Structure JSON circular interdite");
    // Prototypes Object/Array natifs, y compris ceux d'un autre contexte JS.
    const proto = Object.getPrototypeOf(v);
    if (proto !== null) {
      const ctor = Object.getOwnPropertyDescriptor(proto, "constructor");
      if (!ctor || typeof ctor.value !== "function" ||
          Object.getOwnPropertyDescriptor(ctor.value, "prototype")?.value !== proto ||
          !/^function (Object|Array)\(\) \{ \[native code\] \}$/.test(Function.prototype.toString.call(ctor.value)))
        throw Error("Prototype non JSON interdit");
    }
    ancestors.add(v); stack.push({ value: v, leave: true });
    const descriptors = Object.getOwnPropertyDescriptors(v);
    for (const key of Reflect.ownKeys(descriptors)) {
      if (typeof key !== "string") throw Error("Clé non JSON interdite");
      const d = descriptors[key];
      if (!Object.hasOwn(d, "value")) throw Error("Accesseur JSON interdit");
      if (key === "__proto__" || (key === "constructor" && d.value && typeof d.value === "object" && Object.hasOwn(d.value, "prototype")))
        throw Error("Clé de pollution de prototype interdite");
      if (key === "toJSON" && typeof d.value === "function") throw Error("Conversion JSON exécutable interdite");
      if (d.enumerable) stack.push({ value: d.value, leave: false });
    }
    // JSON.stringify recherche aussi un toJSON hérité : ne pas l'exécuter.
    for (let parent = proto; parent; parent = Object.getPrototypeOf(parent))
      if (Object.hasOwn(parent, "toJSON")) throw Error("Conversion JSON héritée interdite");
  }
  return value;
}
export function parseSafeJson(text) {
  if (typeof text !== "string") throw Error("Texte JSON attendu");
  return assertSafeJson(JSON.parse(text));
}
/** Références actives et instantanés : les historiques orphelins restent autorisés.
 * Ne pas interpréter un champ id d'une extension inconnue comme une fiche.
 */
export function assertCombatIdentifiers(raw) {
  const queue = [raw], seen = new Set();
  while (queue.length) {
    const node = queue.pop();
    if (!node || typeof node !== "object" || seen.has(node)) continue;
    seen.add(node);
    for (const f of Array.isArray(node.fighters) ? node.fighters : []) {
      if (!f || typeof f.id !== "string" || !/^p-\d+(?![\s\S])/.test(f.id)) throw Error("Identifiant de combattant invalide");
      if (f.characterId !== undefined) assertCharacterId(f.characterId);
    }
    for (const key of ["actions", "proposals", "traps", "temporaryEffects", "sceneJournal"])
      for (const entry of Array.isArray(node[key]) ? node[key] : [])
        if (entry?.id !== undefined && !isSafeId(entry.id)) throw Error("Identifiant de combat invalide : " + key);
    if (Array.isArray(node.snapshots)) queue.push(...node.snapshots);
  }
}
