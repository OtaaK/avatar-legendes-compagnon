'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(prediction){const s=C.createCombat(),a=C.addFighter(s,'Air'),b=C.addFighter(s,'Adversaire');const act={id:'reed132',round:s.round,sourceId:a,targetId:b,name:'Souple comme un roseau',approach:'esquiver',options:{airReedConfirmed:true,airReedPrediction:prediction}};s.actions.push(act);C.propose(s,act);C.commit(s);assert(!s.temporaryEffects[0].label.includes(prediction));s.phase='fin';C.nextRound(s);return {s,a,b,id:s.temporaryEffects[0].id};}
{
 const {s,a,b,id}=setup('attaquer');
 assert.throws(()=>C.resolveReedBet(s,id,true),/révélation/);
 C.declare(s,a,'esquiver');C.declare(s,b,'attaquer');C.reveal(s);
 assert.throws(()=>C.resolveReedBet(s,id,false),/MJ/);
 assert.equal(C.resolveReedBet(s,id,true),true);
 assert(C.fighter(s,a).activeStatuses.includes('avantage'));
 assert.throws(()=>C.queueTechnique(s,b,'Frapper','attaquer',a,{}),/cible protégée/);
 assert.throws(()=>C.resolveReedBet(s,id,true),/déjà résolu/);
 C.undo(s);assert.equal(s.temporaryEffects[0].reedResolved,false);
 assert(!C.fighter(s,a).activeStatuses.includes('avantage'));
}
{
 const {s,a,b,id}=setup('defendre');C.declare(s,a,'esquiver');C.declare(s,b,'attaquer');C.reveal(s);
 assert.equal(C.resolveReedBet(s,id,true),false);
 assert.equal(C.fighter(s,a).reedMayChangeApproach,true);
 C.changeReedApproach(s,a,'defendre');assert.equal(C.fighter(s,a).approach,'defendre');
 C.undo(s);assert.equal(C.fighter(s,a).approach,'esquiver');
}
console.log('OK V1.32 : secret, pari juste/faux, validation MJ, ciblage, changement, annulation');
