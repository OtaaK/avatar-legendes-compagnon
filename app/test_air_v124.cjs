'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(name,options){const s=C.createCombat(),a=C.addFighter(s,'Air'),b=C.addFighter(s,'Ennemi'),c=C.addFighter(s,'Allié'),d=C.addFighter(s,'Autre');const act={id:'air-124',round:s.round,sourceId:a,targetId:b,name,approach:'esquiver',options};s.actions.push(act);return {s,a,b,c,d,act};}
{
 const {s,a,b,c,d,act}=setup('Cône d’air',{airConeInRange:true,airConeAllies:[]});act.options.airConeAllies=[c,d];
 const e=C.propose(s,act);assert.deepEqual(Array.from(e,x=>x.kind),['fatigue','fatigue','fatigue','fatigue']);assert.equal(e[3].amount,4);
 assert.throws(()=>C.commit(s,{[e[0].id]:false}),/accepter ou refuser/);C.commit(s);
 assert.equal(C.fighter(s,a).fatigue,1);assert.equal(C.fighter(s,b).fatigue,4);assert.equal(C.fighter(s,c).fatigue,1);
 C.undo(s);assert.equal(C.fighter(s,b).fatigue,0);act.options.airConeInRange=false;assert.throws(()=>C.propose(s,act),/confirmer/);
}
{
 const {s,a,b,c,d,act}=setup('Onde de choc',{airShockZoneConfirmed:true,airShockTargets:[],airShockResisting:[]});
 act.options.airShockTargets=[b,c];act.options.airShockResisting=[c];s.engagements.push([a,b],[b,c],[c,d]);
 const e=C.propose(s,act);assert.equal(e.filter(x=>x.kind==='disengage').length,3);
 assert.throws(()=>C.commit(s,{[e[0].id]:false}),/accepter ou refuser/);C.commit(s);
 assert.equal(C.fighter(s,a).fatigue,2);assert.equal(C.fighter(s,c).fatigue,4);
 assert.equal(C.fighter(s,b).statuses.includes('etourdi'),true);
 assert.equal(s.engagements.some(p=>p.includes(a)&&p.includes(b)),false);
 assert.equal(s.engagements.some(p=>p.includes(b)&&p.includes(c)),false);
 assert.equal(s.engagements.some(p=>p.includes(c)&&p.includes(d)),false);
 C.undo(s);assert.equal(s.engagements.length,3);assert.equal(C.fighter(s,c).fatigue,0);
 act.options.airShockResisting=[d];assert.throws(()=>C.propose(s,act),/résistances invalides/);
}
console.log('OK V1.24 : Cône d’air et Onde de choc, lots, validations, annulations');
