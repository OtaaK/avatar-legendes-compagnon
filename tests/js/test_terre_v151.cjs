const assert=require('assert');
const fs=require('fs');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:require('../../src/domain/index.cjs').loadDomain()};const C=ctx.window.CombatCore;
for(const name of ['Détection du pas lourd','Étoile de lave'])assert(source.includes("action.name==='"+name+"'"));
assert(html.includes('id="earthSeismicConfirmed"'));assert(html.includes('id="earthLavaConfirmed"'));
assert(source.includes('earthLavaConfirmed!==true'));assert(source.includes('earthSeismicConfirmed!==true'));
console.log('Terre V1.51 : moteur, contrôles et confirmation MJ');
