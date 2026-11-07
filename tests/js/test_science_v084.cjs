'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(){const s=C.createCombat(),a=C.addFighter(s,'Technicien'),b=C.addFighter(s,'Adversaire');return {s,a,b}}
function use(s,a,b,o){return C.propose(s,{id:'science',sourceId:a,targetId:b,name:'Aveuglé par la science',options:o})}
for(const n of [1,2,3]){
 const {s,a,b}=setup();const o={scienceFatigue:n,scienceExtra:'piege'};
 const events=use(s,a,b,o);assert.equal(events.length,n===1?3:n===2?4:5);
 const before=JSON.stringify(s.fighters);C.previewCommit(s,{});assert.equal(JSON.stringify(s.fighters),before);
 C.commit(s,{});assert.equal(C.fighter(s,a).fatigue,n);assert.equal(C.fighter(s,b).fatigue,1);
 const st=C.fighter(s,b).statuses;assert(st.includes('gene'));assert.equal(st.includes('piege'),n>=2);assert.equal(st.includes('etourdi'),n===3);
 assert(C.undo(s));assert.equal(JSON.stringify(s.fighters),before);
}
{
 const {s,a,b}=setup();use(s,a,b,{scienceFatigue:2,scienceExtra:'etourdi'});C.commit(s,{});
 assert(C.fighter(s,b).statuses.includes('etourdi'));assert(!C.fighter(s,b).statuses.includes('piege'));
}
for(const o of [{scienceFatigue:0},{scienceFatigue:4},{scienceFatigue:1.5},{scienceFatigue:2,scienceExtra:'invalid'}]){
 const {s,a,b}=setup();assert.throws(()=>use(s,a,b,o));assert.equal(s.proposals.length,0);
}
{
 const {s,a}=setup();assert.throws(()=>use(s,a,a,{scienceFatigue:1}),/distinct/);
}
{
 const {s,a,b}=setup();const ev=use(s,a,b,{scienceFatigue:3});
 C.commit(s,{[ev[0].id]:false,[ev[4].id]:false});
 assert.equal(C.fighter(s,a).fatigue,0);assert.equal(C.fighter(s,b).fatigue,1);
 assert(C.fighter(s,b).statuses.includes('gene'));assert(!C.fighter(s,b).statuses.includes('etourdi'));
}
console.log('V0.84 Aveuglé par la science : 10 scénarios OK');
