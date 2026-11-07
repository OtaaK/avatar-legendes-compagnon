const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function scene(){const s=C.createCombat(),a=C.addFighter(s,'Terre 1'),b=C.addFighter(s,'Terre 2'),c=C.addFighter(s,'Ennemi');for(const id of [a,b,c])C.fighter(s,id).approach='defendre';return {s,a,b,c};}
// Le dernier combattant invalide ne doit PAS laisser payer les deux premiers.
{const {s,a,b,c}=scene();for(const id of [a,b,c]){const f=C.fighter(s,id);f.statuses.push('gene');f.geneChoice='fatigue';}C.fighter(s,c).fatigue=5;const before=JSON.stringify(s);assert.throws(()=>C.reveal(s),/impossible de payer Gêné/);assert.equal(JSON.stringify(s),before,'révélation entièrement atomique');C.fighter(s,c).geneChoice='malus';C.reveal(s);assert.equal(s.phase,'defendre');assert.equal(C.fighter(s,a).fatigue,1);assert.equal(C.fighter(s,b).fatigue,1);assert.equal(C.fighter(s,c).fatigue,5);assert.equal(C.fighter(s,c).geneChoice,'malus');}
// Refus d'approche manquante, puis reprise, sans modification.
{const {s,a,b,c}=scene();C.fighter(s,c).approach=null;C.fighter(s,a).statuses.push('gene');C.fighter(s,a).geneChoice='fatigue';const before=JSON.stringify(s);assert.throws(()=>C.reveal(s),/Approches manquantes/);assert.equal(JSON.stringify(s),before);C.fighter(s,c).approach='esquiver';C.reveal(s);assert.equal(C.fighter(s,a).fatigue,1);}
// Combat complet : deux maîtres de Terre et un ennemi, trois passes,
// déclarations, révélations, phases, effets temporels, fatigue et annulations.
{const {s,a,b,c}=scene();const foe=C.fighter(s,c);foe.statuses.push('gene');foe.roundStatuses=[{status:'gene',expiresAfterRound:1,external:false}];
 for(let round=1;round<=3;round++){
  for(const id of [a,b,c])C.fighter(s,id).approach=round%2?'defendre':'esquiver';
  C.reveal(s);assert.equal(s.phase,'defendre');
  C.advance(s);assert.equal(s.phase,'attaquer');C.advance(s);assert.equal(s.phase,'esquiver');
  C.endRound(s);assert.equal(s.phase,'fin');C.nextRound(s);assert.equal(s.round,round+1);
  if(round===1)assert(!C.fighter(s,c).statuses.includes('gene'),'Gêné expiré');
 }
 assert.equal(s.round,4);assert.equal(s.snapshots.length,6);
 for(let i=0;i<6;i++)assert(C.undo(s));assert.equal(s.round,1);assert.equal(s.phase,'esquiver');assert(C.fighter(s,c).statuses.includes('gene'));assert.equal(s.snapshots.length,0);
}
console.log('V2.20 : révélation Gêné atomique, reprise après erreur, combat 3 passes / 3 combattants / 6 annulations OK');