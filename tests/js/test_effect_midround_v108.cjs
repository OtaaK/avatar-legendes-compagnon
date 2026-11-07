const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);
const C=ctx.window.CombatCore;
const s=C.createCombat(),id=C.addFighter(s,'Katara');
s.actions.push({id:'a-1',sourceId:id,targetId:id,name:'Action résolue',round:1});
const effectId=C.addTemporaryEffect(s,id,'Brouillard','scene');
assert.equal(s.temporaryEffects.length,1);
assert.equal(C.editTemporaryEffect(s,effectId,'Brouillard dense','manual'),true);
assert.equal(s.temporaryEffects[0].duration,'manual');
assert.equal(C.removeTemporaryEffect(s,effectId),true);
assert.equal(s.temporaryEffects.length,0);
assert.equal(C.undo(s),true);
assert.equal(s.temporaryEffects[0].label,'Brouillard dense');
s.proposals.push({id:'e-1'});
for(const operation of [()=>C.addTemporaryEffect(s,id,'Test','round'),()=>C.editTemporaryEffect(s,effectId,'Test','round'),()=>C.removeTemporaryEffect(s,effectId)]){
 assert.throws(operation,/propositions en attente/);
}
assert.equal(s.temporaryEffects.length,1);
console.log('OK : effets temporaires modifiables pendant une passe, blocage des propositions, annulation');
