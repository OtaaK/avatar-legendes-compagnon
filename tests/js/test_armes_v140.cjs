const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
const s=C.createCombat(),a=C.addFighter(s,'A'),b=C.addFighter(s,'B');C.setEngagement(s,a,b,true);
s.phase='esquiver';const act={id:'v140',sourceId:a,targetId:b,name:'À contretemps',round:s.round,options:{countertimeConfirmed:true}};
s.actions.push(act);C.propose(s,act);C.commit(s);const e=s.temporaryEffects.find(e=>e.originLabel==='À contretemps');s.phase='fin';C.nextRound(s);
// Les deux approches manquantes sont normalement exemptées si les personnages sont incapables d'agir.
C.fighter(s,a).statuses.push('etourdi');C.fighter(s,b).statuses.push('piege');
const snapshot=JSON.stringify({phase:s.phase,fighters:s.fighters,history:s.history});
assert.throws(()=>C.reveal(s),/À contretemps.*révéler/);
assert.strictEqual(JSON.stringify({phase:s.phase,fighters:s.fighters,history:s.history}),snapshot);
C.fighter(s,b).statuses=C.fighter(s,b).statuses.filter(x=>x!=='piege');C.declare(s,b,'attaquer');
assert.strictEqual(C.revealCountertime(s,e.id,true),'attaquer');C.reveal(s);assert.strictEqual(s.phase,'defendre');
console.log('V1.40 : clôture interdite avant révélation, même si bénéficiaire Étourdi, sans mutation partielle');
