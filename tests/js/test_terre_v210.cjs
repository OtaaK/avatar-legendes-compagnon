const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(){const s=C.createCombat(),a=C.addFighter(s,'Terre'),b=C.addFighter(s,'Cible');return {s,a,b};}
function applyEvent(s,a,b,kind,detail){s.phase='esquiver';C.fighter(s,a).approach='esquiver';C.manual(s,a,b,kind,0,detail,'Arbitrage MJ');C.commit(s,{});}
function next(s){s.actions=[];s.phase='fin';C.nextRound(s);}
// Une source indépendante créée après le statut temporaire doit survivre à son expiration.
for(const status of ['gene','avantage','pret']){
 const {s,a,b}=setup();applyEvent(s,a,b,'status_round',status);assert(C.fighter(s,b).statuses.includes(status));
 applyEvent(s,a,b,'status_add',status);assert(C.fighter(s,b).roundStatuses[0].external);
 next(s);assert(C.fighter(s,b).statuses.includes(status),'statut indépendant perdu : '+status);
 assert.equal(C.fighter(s,b).roundStatuses.length,0);assert(C.undo(s));assert(C.fighter(s,b).roundStatuses.length===1);
}
// Sans source indépendante, le statut temporaire expire normalement.
for(const status of ['gene','avantage','pret']){
 const {s,a,b}=setup();applyEvent(s,a,b,'status_round',status);next(s);
 assert(!C.fighter(s,b).statuses.includes(status),'statut temporaire non expiré : '+status);
 assert(!Object.hasOwn(C.fighter(s,b).statusAppliedRound||{},status));
}
// Un statut préexistant ne doit pas être transformé en source temporaire.
{const {s,a,b}=setup();C.fighter(s,b).statuses.push('gene');applyEvent(s,a,b,'status_round','gene');next(s);assert(C.fighter(s,b).statuses.includes('gene'));}
// Retirer explicitement le statut efface également sa provenance temporaire.
{const {s,a,b}=setup();applyEvent(s,a,b,'status_round','gene');applyEvent(s,a,b,'status_add','gene');applyEvent(s,a,b,'status_remove','gene');next(s);assert(!C.fighter(s,b).statuses.includes('gene'));}
console.log('V2.10 : provenance des statuts temporaires, expiration et undo OK');
