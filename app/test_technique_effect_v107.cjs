const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);
const C=ctx.window.CombatCore;
function setup(name='Projection tellurique'){
 const s=C.createCombat(),id=C.addFighter(s,'Toph');
 s.actions.push({id:'a-test',round:1,sourceId:id,targetId:id,name,approach:'defendre',options:{}});
 s.proposals.push({id:'e-test',actionId:'a-test',sourceId:id,targetId:id,kind:'status_add',amount:0,detail:'avantage',reason:'Projection tellurique : devient Avantagé',round:1});
 return {s,id};
}
{
 const {s,id}=setup();C.commit(s);assert.equal(s.temporaryEffects.length,1);
 assert.equal(s.temporaryEffects[0].originType,'technique');
 assert.equal(s.temporaryEffects[0].targetId,id);assert.equal(s.temporaryEffects[0].duration,'round');
 C.undo(s);assert.equal(s.temporaryEffects.length,0);
}
{
 const {s}=setup();C.commit(s,{'e-test':false});assert.equal(s.temporaryEffects.length,0);
}
{
 const {s}=setup('Autre technique');C.commit(s);assert.equal(s.temporaryEffects.length,0);
}
console.log('OK : repère Projection tellurique validé, refusé, annulation, non-déclenchement autre technique');
