const assert=require('node:assert/strict');
const {CombatCore:C}=require('../../src/domain/index.cjs').loadDomain();
const s=C.createCombat();assert.equal(C.renameScene(s,'  Le port embrasé  '),'Le port embrasé');assert.equal(s.sceneTitle,'Le port embrasé');
assert.equal(s.snapshots.length,1);assert.equal(C.renameScene(s,'Le port embrasé'),'Le port embrasé');assert.equal(s.snapshots.length,1);
for(const bad of ['', ' ', 'x'.repeat(121),null])assert.throws(()=>C.renameScene(s,bad));
C.undo(s);assert.equal(s.sceneTitle,'');
C.renameScene(s,'La ville');C.newScene(s);assert.equal(s.scene,2);assert.equal(s.sceneTitle,'');C.undo(s);assert.equal(s.sceneTitle,'La ville');
s.proposals.push({id:'pending'});assert.throws(()=>C.renameScene(s,'Interdit'));assert.equal(s.sceneTitle,'La ville');
console.log('OK : nom de scène, validation, idempotence, changement de scène et annulation');
