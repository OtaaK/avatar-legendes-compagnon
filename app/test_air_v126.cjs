'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(name,options){const s=C.createCombat(),a=C.addFighter(s,'Air'),b=C.addFighter(s,'B'),c=C.addFighter(s,'C');const act={id:'v126',round:s.round,sourceId:a,targetId:b,name,approach:'defendre',options};s.actions.push(act);return {s,a,b,c,act}}
{
 const {s,a,b,c,act}=setup('Vague d’air',{airWaveConfirmed:true,airWaveMode:'blast',airWaveTargets:[]});act.options.airWaveTargets=[b,c];const e=C.propose(s,act);assert.equal(e.filter(x=>x.kind==='fatigue').length,2);assert.throws(()=>C.commit(s,{[e[0].id]:false}),/ensemble/);C.commit(s);assert.equal(C.fighter(s,b).fatigue,2);C.undo(s);assert.equal(C.fighter(s,b).fatigue,0);act.options.airWaveTargets=[b,b];assert.throws(()=>C.propose(s,act),/distincts/);
}
{
 const {s,a,act}=setup('Vague d’air',{airWaveConfirmed:true,airWaveMode:'block'});const e=C.propose(s,act);assert.equal(e[0].amount,1);C.commit(s);assert.equal(C.fighter(s,a).fatigue,1);C.undo(s);
}
{
 const {s,a,act}=setup('Sphère d’air',{airSphereConfirmed:true});const e=C.propose(s,act);assert.equal(e[0].kind,'status_add');C.commit(s);assert.equal(C.fighter(s,a).statuses.includes('avantage'),true);C.undo(s);assert.equal(C.fighter(s,a).statuses.includes('avantage'),false);act.options.airSphereConfirmed=false;assert.throws(()=>C.propose(s,act),/confirmer/);
}
console.log('OK V1.26 : Vague d’air et Sphère d’air, validation groupée, annulation');
