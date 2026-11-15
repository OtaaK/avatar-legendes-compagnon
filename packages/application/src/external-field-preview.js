import { assertSafeJson, assertCharacterId } from '../../domain/src/import-safety.js';
import { copy } from '../../persistence/src/codecs.js';
const FIELDS = Object.freeze(['fatigue', 'fatigueCapacity', 'balance']);
function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value); Object.values(value).forEach(freeze);
  }
  return value;
}
function record(value) {
  assertSafeJson(value);
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error('Objet JSON externe attendu.');
  if (Object.hasOwn(value,'id')) assertCharacterId(value.id);
  const queue = [value], seen = new Set();
  while (queue.length) {
    const node = queue.pop();
    if (node === undefined) throw Error('undefined externe non JSON : suppression explicite requise.');
    if (!node || typeof node !== 'object' || seen.has(node)) continue;
    seen.add(node);
    for (const child of Array.isArray(node) ? node : Object.values(node)) queue.push(child);
  }
}
function fieldName(field) {
  if (!FIELDS.includes(field)) throw Error('Champ de ressource externe inconnu.');
}
/** Contrat de transport, PAS une validation du profil ni un import Codex. */
export function externalResourceState(source, field) {
  record(source); fieldName(field);
  if (!Object.hasOwn(source, field)) return Object.freeze({kind:'absent'});
  const value = source[field];
  if (value === null) return Object.freeze({kind:'null'});
  if (typeof value !== 'number' || !Number.isSafeInteger(value))
    throw Error('Ressource externe : nombre entier sûr ou null attendu ; undefined n’est pas une suppression.');
  return Object.freeze({kind:'value', value});
}
/** Aperçu pur, non connecté au store. Un défaut affiché ne devient jamais une saisie.
 * Pas de clamp, profil, compensation, mutation de fiche ou écriture de stockage.
 * Seuls set/remove explicites changent la copie ; keep ne crée aucune propriété.
 */
export function previewExternalResourceEdits(source, intents = []) {
  record(source); assertSafeJson(intents);
  if (!Array.isArray(intents)) throw Error('Liste d’intentions attendue.');
  for (const field of FIELDS) externalResourceState(source, field);
  const candidate = copy(source), seen = new Set();
  for (const intent of intents) {
    record(intent); fieldName(intent.field);
    if (seen.has(intent.field)) throw Error('Intention dupliquée.');
    seen.add(intent.field);
    const allowed = intent.action === 'set' ? ['field','action','value'] : ['field','action'];
    if (Object.keys(intent).some(k => !allowed.includes(k))) throw Error('Champ d’intention inconnu.');
    if (intent.action === 'keep') continue;
    if (intent.action === 'remove') { delete candidate[intent.field]; continue; }
    if (intent.action !== 'set' || !Object.hasOwn(intent,'value')) throw Error('Intention explicite set/remove/keep attendue.');
    externalResourceState({[intent.field]:intent.value}, intent.field);
    candidate[intent.field] = intent.value;
  }
  const before = Object.fromEntries(FIELDS.map(f => [f,externalResourceState(source,f)]));
  const after = Object.fromEntries(FIELDS.map(f => [f,externalResourceState(candidate,f)]));
  return freeze({
    format:'avatar-external-resource-preview', version:1,
    canonical:false, effectsApplied:false,
    changed: JSON.stringify(before) !== JSON.stringify(after),
    before, after, candidate,
  });
}
