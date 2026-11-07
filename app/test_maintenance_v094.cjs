const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(){const s=C.createCombat(),id=C.addFighter(s,'Technicien','PNJ');const f=C.fighter(s,id);f.conditions.push('Terrifié');f.approach='defendre';s.phase='defendre';return {s,id,f};}
{
 const {s,id,f}=setup();const a=C.queueTechnique(s,id,'Maintenance','defendre',id,{maintenanceCondition:'Terrifié'});
 const events=C.propose(s,a);assert.equal(events.length,3);assert.deepEqual(Array.from(events.map(e=>e.kind)),['fatigue','condition_remove','materials_add']);
 const preview=C.previewCommit(s);assert.equal(f.fatigue,0);assert.equal(f.materials,0);assert.equal(f.conditions.length,1);
 C.commit(s);assert.equal(f.fatigue,1);assert.equal(f.materials,3);assert.equal(f.conditions.length,0);
 C.undo(s);const restored=C.fighter(s,id);assert.equal(restored.fatigue,0);assert.equal(restored.materials,0);assert(restored.conditions.includes('Terrifié'));
}
{
 const {s,id}=setup();const a=C.queueTechnique(s,id,'Maintenance','defendre',id,{maintenanceCondition:'Confus'});
 assert.throws(()=>C.propose(s,a),/n’est pas coché/);
}
{
 const {s,id}=setup();const a=C.queueTechnique(s,id,'Maintenance','defendre',id,{maintenanceCondition:'Terrifié'});const events=C.propose(s,a);
 C.commit(s,{[events[1].id]:false});const f=C.fighter(s,id);assert.equal(f.fatigue,1);assert.equal(f.materials,3);assert(f.conditions.includes('Terrifié'));
}
console.log('Maintenance V0.94 OK');
