const assert=require('assert');
const fs=require('fs');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:require('../../src/domain/index.cjs').loadDomain()};const C=ctx.window.CombatCore;
assert(source.includes("action.name==='Entraves de métal'"));assert(source.includes("action.name==='Escalier de poussière'"));
assert(html.includes('id="earthMetalConfirmed"'));assert(html.includes('id="earthStairsBlocker"'));
console.log('Terre V1.48 : branches moteur et contrôles UI présents');
