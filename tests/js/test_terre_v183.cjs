const assert=require('assert');
const {CombatCore:C}=require('../../src/domain/index.cjs').loadDomain();
const s=C.createCombat(),id=C.addFighter(s,'Terre');
s.phase='fin';s.proposals=[{id:'pending',kind:'fatigue',targetId:id,amount:1}];
const before=JSON.stringify(s);assert.throws(()=>C.nextRound(s),/propositions en attente/);
assert.strictEqual(JSON.stringify(s),before,'aucune modification après refus');
s.proposals=[];C.nextRound(s);assert.strictEqual(s.round,2);assert.strictEqual(s.phase,'declaration');
C.undo(s);assert.strictEqual(s.round,1);assert.strictEqual(s.phase,'fin');
console.log('V1.83 : transition avec propositions en attente et annulation OK');