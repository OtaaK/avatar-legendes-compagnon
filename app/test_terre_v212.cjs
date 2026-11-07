const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(){const s=C.createCombat(),a=C.addFighter(s,'Gardien'),b=C.addFighter(s,'Allié');s.phase='esquiver';return {s,a,b};}
// Fin de passe avec protection réussie : Confiant, phase et historique sont annulables.
{const {s,a,b}=setup();C.fighter(s,a).reactions.push({type:'protection',round:1,allyId:b,targeted:false});const n=s.snapshots.length;C.endRound(s);assert.equal(s.phase,'fin');assert(C.fighter(s,a).statuses.includes('confiant'));assert(C.fighter(s,b).statuses.includes('confiant'));assert.equal(s.snapshots.length,n+1);assert(C.undo(s));assert.equal(s.phase,'esquiver');assert(!C.fighter(s,a).statuses.includes('confiant'));assert(!C.fighter(s,b).statuses.includes('confiant'));}
// Une protection effectivement attaquée ne donne pas Confiant.
{const {s,a,b}=setup();C.fighter(s,a).reactions.push({type:'protection',round:1,allyId:b,targeted:true});C.endRound(s);assert(!C.fighter(s,a).statuses.includes('confiant'));assert(!C.fighter(s,b).statuses.includes('confiant'));}
// Renforcé enlève une fatigue en fin de passe, et l'annulation restaure la fatigue.
{const {s,a}=setup();const f=C.fighter(s,a);f.fatigue=3;f.activeStatuses=['renforce'];C.endRound(s);assert.equal(f.fatigue,2);C.undo(s);assert.equal(C.fighter(s,a).fatigue,3);}
// Une deuxième fin de passe ne doit pas dupliquer les bénéfices.
{const {s}=setup();C.endRound(s);assert.throws(()=>C.endRound(s),/Résoudre les trois approches/);}
// Une proposition en attente bloque la fin de passe sans mutation.
{const {s}=setup();s.proposals.push({id:'pending'});assert.throws(()=>C.endRound(s),/Propositions en attente/);assert.equal(s.phase,'esquiver');assert.equal(s.snapshots.length,0);}
console.log('V2.12 : fin de passe annulable, protection, renforcé, idempotence, propositions OK');
