/** Extraction contrôlée depuis l'oracle HTML figé. Aucun corps de fonction réécrit. */
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../../', import.meta.url));
const html = readFileSync(root + 'app/simulateur.html', 'utf8');
const sha = createHash('sha256').update(html).digest('hex');
if (sha !== '69f8ddb8e86f01bcc7138c3c2cb9645742aaff2f7b3d6081267b612b11c491bb') throw Error('Oracle modifié : réexaminer la référence avant extraction');
const segments = [];
function extract(file, start, end, imports = '', named = []) {
  const a = html.indexOf(start), b = html.indexOf(end, a);
  if (a < 0 || b < 0) throw Error('Bornes absentes : ' + file);
  const original = html.slice(a, b).trimEnd();
  const globals = [];
  const body = original.replace(/window\.(\w+)=([^;]+);/g, (_, name, value) => {
    globals.push(name);
    return value === name ? '' : `const ${name}=${value};`;
  });
  if (/\b(window|document|localStorage)\s*[.[]|\b(alert|confirm|prompt)\s*\(/.test(body)) throw Error('Couplage navigateur : ' + file);
  const output = `// Extrait de a9079fa, app/simulateur.html. Voir extraction.json.\n${imports}\n${body}\nexport { ${[...globals, ...named].join(', ')} };\n`;
  const target = root + 'packages/domain/src/' + file;
  if (process.argv.includes('--check')) {
    if (readFileSync(target, 'utf8') !== output) throw Error('Écart extraction : ' + file);
  } else writeFileSync(target, output);
  segments.push({file, start, end, sha256: createHash('sha256').update(original).digest('hex'), exports:[...globals, ...named]});
}
const resources = "import { npcResourceProfile, resourceLimits, validateResourceValues, fatigueLimit, resourceConditionNames, balanceValue } from './resources.js';";
extract('resources.js', '// Profils PNJ explicites.', "\nconst APPROACHES=", '', ['npcResourceProfile','resourceLimits','validateResourceValues','fatigueLimit','resourceConditionNames','balanceValue']);
extract('combat.js', "const APPROACHES=", "\n\n\n'use strict';\nconst APPROACH_NAME", resources);
extract('combat-rules.js', 'const APPROACH_NAME=', '\n\n\nlet s;');
extract('books.js', 'const BookState=(()=>{', '\n\n// UI/UX lot 4');
extract('places.js', 'const PlaceRules=(()=>{', '\n\nconst rosterClone=');
extract('roster.js', 'const rosterClone=', "\n\n\n'use strict';\n// Sources", resources + "\nimport { BookState } from './books.js';\nimport { PlaceRules } from './places.js';");
extract('playbooks.js', 'const PLAYBOOKS=', '\n\n\n\nconst TECH_CATALOG');
extract('catalog.js', 'const TECH_CATALOG=', '\nlet lib=', '', ['TECH_CATALOG', 'TECH_AUDIT']);
extract('validation.js', 'function validateCombat(raw){', '\nlet storageWarningShown=', resources + "\nimport { CombatCore } from './combat.js';", ['validateCombat','validateBackupLinks']);
extract('storage-version.js', 'function profileStorageRequired(', '\n\nfunction restoreStorageValue', '', ['profileStorageRequired']);
extract('public-report.js', 'function publicCombatReport(combat){', '\nfunction downloadPublicCombat', '', ['publicCombatReport']);
extract('character-fields.js', 'function safeSheetPortrait(value){', '\nfunction sheetResourcePreview', resources + "\nimport { Roster } from './roster.js';\nimport { BookState } from './books.js';", ['safeSheetPortrait','sheetPatchFromFields','npcProfileFromFields']);
extract('npc-presets.js', 'const NPC_PROFILE_PRESETS=', '\nfunction npcImportanceChanged', '', ['NPC_PROFILE_PRESETS']);
const manifest = JSON.stringify({sourceCommit:'a9079fa5b1babc560ee11a8d28430504df8704fc',htmlSha256:sha,segments},null,2)+'\n';
if(process.argv.includes('--check')) {
 if(readFileSync(root+'packages/domain/extraction.json','utf8')!==manifest)throw Error('Manifest divergent');
} else writeFileSync(root+'packages/domain/extraction.json',manifest);
console.log(`Extraction ${process.argv.includes('--check')?'vérifiée':'produite'} : ${segments.length} modules, corps inchangés.`);
