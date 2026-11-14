'use strict';
const assert=require('node:assert/strict');
const {CombatCore:C}=require('../../src/domain/index.cjs').loadDomain();
function scene(){const s=C.createCombat(),a=C.addFighter(s,'Air'),b=C.addFighter(s,'Ennemi');const act={id:'bet',round:s.round,sourceId:a,targetId:b,name:'Souple comme un roseau',approach:'esquiver',options:{airReedConfirmed:true,airReedPrediction:'attaquer'}};s.actions.push(act);C.propose(s,act);C.commit(s);s.phase='fin';C.nextRound(s);C.declare(s,a,'esquiver');C.declare(s,b,'attaquer');C.reveal(s);return {s,a,b,id:s.temporaryEffects[0].id};}
{
 const {s,a,b,id}=scene();s.actions.push({id:'already',round:s.round,sourceId:b,targetId:a,name:'Frapper',approach:'attaquer',options:{}});
 assert.throws(()=>C.resolveReedBet(s,id,true),/trop tardive/);
 assert.equal(s.temporaryEffects[0].reedResolved,false);
 assert.equal((s.reedProtections||[]).length,0);
 s.actions=[];assert.equal(C.resolveReedBet(s,id,true),true);
 assert.throws(()=>C.queueTechnique(s,b,'Frapper','attaquer',a,{}),/cible protégée/);
}
{
 const {s,id}=scene();s.phase='attaquer';assert.throws(()=>C.resolveReedBet(s,id,true),/début de Défendre/);
 assert.equal(s.temporaryEffects[0].reedResolved,false);
}
console.log('OK V1.33 : résolution avant toute technique et uniquement au début de la passe');
