'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(choice='fatigue'){
 const s=C.createCombat(),src=C.addFighter(s,'Air'),dst=C.addFighter(s,'Allié');
 const a={id:'air-123',round:s.round,sourceId:src,targetId:dst,name:'Coussin d’air',approach:'esquiver',options:{airCushionConfirmed:true,airCushionChoice:choice,airCushionCondition:'Confus',airCushionStatus:'gene'}};
 s.actions.push(a);return {s,src,dst,a};
}
{
 const {s,src,dst,a}=setup();C.fighter(s,dst).fatigue=3;
 const e=C.propose(s,a);assert.deepEqual(Array.from(e,x=>x.kind),['fatigue','fatigue']);assert.equal(e[1].amount,-2);
 assert.throws(()=>C.commit(s,{[e[0].id]:false}),/accepter ou refuser/);
 C.commit(s);assert.equal(C.fighter(s,src).fatigue,1);assert.equal(C.fighter(s,dst).fatigue,1);
 C.undo(s);assert.equal(C.fighter(s,src).fatigue,0);assert.equal(C.fighter(s,dst).fatigue,3);
}
{
 const {s,dst,a}=setup('condition');C.fighter(s,dst).conditions.push('Confus');
 assert.deepEqual(Array.from(C.propose(s,a),x=>x.kind),['fatigue','condition_remove']);C.commit(s);
 assert.equal(C.fighter(s,dst).conditions.includes('Confus'),false);C.undo(s);assert.equal(C.fighter(s,dst).conditions.includes('Confus'),true);
}
{
 const {s,dst,a}=setup('status');C.fighter(s,dst).statuses.push('gene');
 assert.deepEqual(Array.from(C.propose(s,a),x=>x.kind),['fatigue','status_remove']);C.commit(s);
 assert.equal(C.fighter(s,dst).statuses.includes('gene'),false);C.undo(s);assert.equal(C.fighter(s,dst).statuses.includes('gene'),true);
}
{
 const {s,dst,a}=setup();assert.throws(()=>C.propose(s,a),/aucune fatigue/);
 C.fighter(s,dst).fatigue=1;a.options.airCushionConfirmed=false;assert.throws(()=>C.propose(s,a),/confirmer/);
 a.options.airCushionConfirmed=true;a.targetId=a.sourceId;assert.throws(()=>C.propose(s,a),/allié distinct/);
}
console.log('OK V1.23 : Coussin d’air, 3 choix, validation groupée, annulation, préconditions');
