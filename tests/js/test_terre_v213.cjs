const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(){const s=C.createCombat();const earth=C.addFighter(s,'Terre','PJ');const ally=C.addFighter(s,'Allié','PJ');const foe=C.addFighter(s,'Adversaire','PNJ');return {s,earth,ally,foe};}
// Cycle complet sur trois passes, avec statuts temporels, fatigue et retours arrière.
{const {s,earth,ally,foe}=setup();
 const f=C.fighter(s,foe);f.statuses.push('gene');f.roundStatuses=[{status:'gene',expiresAfterRound:1,external:false}];
 s.phase='esquiver';C.endRound(s);assert.equal(s.phase,'fin');C.nextRound(s);assert.equal(s.round,2);assert(!C.fighter(s,foe).statuses.includes('gene'));
 C.undo(s);assert.equal(s.round,1);assert(C.fighter(s,foe).statuses.includes('gene'));assert.equal(s.phase,'fin');
 C.nextRound(s);s.phase='esquiver';C.fighter(s,earth).fatigue=3;C.fighter(s,earth).activeStatuses=['renforce'];
 C.endRound(s);assert.equal(C.fighter(s,earth).fatigue,2);C.nextRound(s);assert.equal(s.round,3);assert.equal(C.fighter(s,earth).fatigue,2);
 C.undo(s);assert.equal(s.round,2);C.undo(s);assert.equal(s.phase,'esquiver');assert.equal(C.fighter(s,earth).fatigue,3);
}
// Une corruption d'effet mécanique ne doit laisser aucune transition partiellement exécutée.
{const {s,earth}=setup();s.phase='esquiver';C.endRound(s);
 s.temporaryEffects.push({id:'broken-star',originLabel:'Étoile de lave',targetId:'missing',duration:'manual',lavaMaintainedRound:0});
 const before=JSON.stringify(s);assert.throws(()=>C.nextRound(s),/Combattant inconnu/);
 assert.equal(JSON.stringify(s),before,'rollback complet après erreur de transition');
}
// Un choix En danger invalide bloque le passage sans perte de fatigue.
{const {s,earth}=setup();s.phase='esquiver';C.fighter(s,earth).statuses.push('en_danger');C.fighter(s,earth).fatigue=5;C.endRound(s);
 const before=JSON.stringify(s);assert.throws(()=>C.nextRound(s),/choisir un état libre/);assert.equal(JSON.stringify(s),before);
 C.nextRound(s,{[earth]:'Confus'});assert.equal(s.round,2);assert(C.fighter(s,earth).conditions.includes('Confus'));
 C.undo(s);assert.equal(s.round,1);assert(!C.fighter(s,earth).conditions.includes('Confus'));
}
console.log('V2.13 : scénarios multi-passes, expiration, renforcé, En danger, atomicité et undo OK');
