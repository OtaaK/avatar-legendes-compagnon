/** Écarts AUTORISÉS phase B ; l'oracle HTML a9079fa reste inchangé.
 * Source de la protection ID : main a8cbd38 ; profils enrichis conservés.
 * Chaque ancre doit exister exactement une fois : pas de correction silencieuse.
 */
export const SECURITY_OVERLAY = "phase-b-import-safety-v1";
export function applySecurityOverlay(file, source) {
  function replace(before, after) {
    if (source.split(before).length !== 2) throw Error("Ancre sécurité absente/ambiguë : " + file + " / " + before);
    source = source.replace(before, after);
  }
  if (file === "roster.js") {
    source = "import { assertSafeJson, assertCharacterId, parseSafeJson } from './import-safety.js';\n" + source;
    replace("const rosterClone=x=>JSON.parse(JSON.stringify(x));", "const rosterClone=x=>JSON.parse(JSON.stringify(assertSafeJson(x)));");
    replace("function validateCharacter(c){", "function validateCharacter(c){\n assertSafeJson(c);assertCharacterId(c?.id);");
    replace("function normalizeCharacter(c){", "function normalizeCharacter(c){\n assertSafeJson(c);assertCharacterId(c?.id);");
    replace("typeof raw==='string'?JSON.parse(raw):rosterClone(raw)", "typeof raw==='string'?parseSafeJson(raw):rosterClone(raw)");
  }
  if (file === "validation.js") {
    source = "import { assertSafeJson, assertCombatIdentifiers, isSafeId } from './import-safety.js';\n" + source;
    replace("function validateCombat(raw){", "function validateCombat(raw){\n assertSafeJson(raw);assertCombatIdentifiers(raw);");
    replace("typeof f.characterId!=='string'||!f.characterId", "!isSafeId(f.characterId)");
    replace("typeof trap.id!=='string'||!trap.id.trim()", "!isSafeId(trap.id)");
    replace("typeof e.id!=='string')throw Error('Proposition invalide')", "!isSafeId(e.id))throw Error('Proposition invalide')");
    for (const prefix of ["p-", "temp-", "scene-note-"])
      replace("/^" + prefix + "\\d+$/", "/^" + prefix + "\\d+(?![\\s\\S])/");
  }
  return source;
}
