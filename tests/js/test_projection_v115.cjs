const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);
const C=ctx.window.CombatCore;
function scenario(){
 const s=C.createCombat(),id=C.addFighter(s,'Toph');
 const action={id:'a-projection',round:s.round,sourceId:id,targetId:id,name:'Projection tellurique',approach:'defendre',options:{}};
 s.actions.push(action);
 const proposals=C.propose(s,action);
 return {s,id,proposals};
}
{
 const {s,id,proposals}=scenario();
 assert.equal(proposals.filter(e=>e.reason.startsWith('Projection tellurique :')).length,3);
 C.commit(s);
 assert.equal(C.fighter(s,id).fatigue,1);
 assert(C.fighter(s,id).statuses.includes('avantage'));
 assert.equal(s.temporaryEffects.length,1);
 assert.equal(s.temporaryEffects[0].duration,'round');
 C.undo(s);
 assert.equal(C.fighter(s,id).fatigue,0);
 assert.equal(s.temporaryEffects.length,0);
}
{
 const {s,proposals}=scenario();
 const partial={[proposals[0].id]:false};
 assert.throws(()=>C.commit(s,partial),/Projection tellurique/);
 assert.equal(s.proposals.length,proposals.length);
 assert.equal(s.temporaryEffects.length,0);
 const refused=Object.fromEntries(proposals.map(e=>[e.id,false]));
 C.commit(s,refused);
 assert.equal(s.temporaryEffects.length,0);
}
{
 const {s,id}=scenario();
 s.proposals=s.proposals.filter(e=>e.kind==='note');
 C.commit(s);
 assert.equal(s.temporaryEffects.length,0,'une note seule ne doit pas créer le repère');
 assert.equal(C.fighter(s,id).fatigue,0);
}
console.log('OK : Projection tellurique, coût, Avantagé, validation indivisible, refus, annulation, pas de faux déclenchement');
