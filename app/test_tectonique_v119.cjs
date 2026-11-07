'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(zone=false){const s=C.createCombat(),src=C.addFighter(s,'Lanceur'),a=C.addFighter(s,'A'),b=C.addFighter(s,'B');const action={id:'tech',round:1,sourceId:src,targetId:a,name:'Mouvements tectoniques',approach:'esquiver',options:{tectonicZone:zone,tectonicTargets:zone?[a,b]:[a]}};s.actions.push(action);return {s,src,a,b,action};}
{
 const {s,a,action}=setup();const e=C.propose(s,action);assert.equal(e.length,1);assert.equal(e[0].kind,'status_round');C.commit(s);assert(C.fighter(s,a).statuses.includes('gene'));s.phase='fin';C.nextRound(s);assert(C.fighter(s,a).statuses.includes('gene'));s.phase='fin';C.nextRound(s);assert(!C.fighter(s,a).statuses.includes('gene'));
}
{
 const {s,src,a,b,action}=setup(true);C.fighter(s,b).statuses.push('gene');const e=C.propose(s,action);assert.equal(e.length,3);assert.equal(e[0].kind,'fatigue');assert(e.some(x=>x.targetId===b&&x.kind==='status_add'&&x.detail==='etourdi'));assert.throws(()=>C.commit(s,{[e[0].id]:false}),/accepter ou refuser/);C.commit(s);assert.equal(C.fighter(s,src).fatigue,1);assert(C.fighter(s,a).statuses.includes('gene'));assert(C.fighter(s,b).statuses.includes('etourdi'));s.phase='fin';C.nextRound(s);assert(C.fighter(s,a).statuses.includes('gene'));s.phase='fin';C.nextRound(s);assert(!C.fighter(s,a).statuses.includes('gene'));assert(C.fighter(s,b).statuses.includes('gene'));assert(C.fighter(s,b).statuses.includes('etourdi'));
}
{
 const {s,a,action}=setup();C.fighter(s,a).statuses.push('gene');const e=C.propose(s,action);assert.equal(e[0].kind,'status_add');C.commit(s);C.undo(s);assert(!C.fighter(s,a).statuses.includes('etourdi'));
}
{
 const {s,action,b}=setup();action.options.tectonicTargets=[b,b];assert.throws(()=>C.propose(s,action),/distincts/);
}
console.log('OK V1.19 : Mouvements tectoniques, coût de zone, durée, préexistence, indivisibilité, undo');
