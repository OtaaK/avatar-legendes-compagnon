const assert=require('node:assert/strict');
const ctx={window:require('../../src/domain/index.cjs').loadDomain()};
const C=ctx.window.CombatCore,s=C.createCombat(),id=C.addFighter(s,'PJ');
C.declare(s,id,'attaquer');assert.throws(()=>C.newScene(s),/déclarations/);assert.equal(s.scene,1);assert.equal(s.snapshots.length,0);
C.fighter(s,id).approach=null;C.fighter(s,id).roll=null;
s.actions.push({id:'action-en-attente'});assert.throws(()=>C.newScene(s),/actions en attente/);assert.equal(s.scene,1);
s.actions=[];assert.equal(C.newScene(s),2);assert.equal(C.undo(s),true);assert.equal(s.scene,1);
console.log('V0.98 : protections des déclarations et actions en attente OK');
