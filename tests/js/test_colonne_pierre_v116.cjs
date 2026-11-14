const assert=require('node:assert/strict');
const {CombatCore:C}=require('../../src/domain/index.cjs').loadDomain();
function scenario(statuses=[]){
 const s=C.createCombat(),source=C.addFighter(s,'Maître de la Terre'),target=C.addFighter(s,'Adversaire');
 C.fighter(s,target).statuses.push(...statuses);
 const action={id:'a-colonne',round:s.round,sourceId:source,targetId:target,name:'Colonne de pierre',approach:'attaquer',options:{}};
 s.actions.push(action);return {s,source,target,action};
}
for(const [before,expected] of [[[],'gene'],[['gene'],'piege'],[['piege'],'en_danger'],[['gene','piege'],'en_danger']]){
 const {s,target,action}=scenario(before);const events=C.propose(s,action);
 assert.equal(events.length,1);assert.equal(events[0].kind,'status_add');assert.equal(events[0].detail,expected);
 C.commit(s);assert(C.fighter(s,target).statuses.includes(expected));
 C.undo(s);assert.deepEqual(Array.from(C.fighter(s,target).statuses),before);
}
{
 const {s,source,action}=scenario();action.targetId=source;
 assert.throws(()=>C.propose(s,action),/adversaire distinct/);assert.equal(s.proposals.length,0);
}
{
 const {s,target,action}=scenario();const events=C.propose(s,action);
 C.commit(s,{[events[0].id]:false});assert.equal(C.fighter(s,target).statuses.length,0);
}
console.log('OK : Colonne de pierre, progression, refus, annulation, cible distincte');
