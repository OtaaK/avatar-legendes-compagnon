'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(){const s=C.createCombat(),a=C.addFighter(s,'A'),b=C.addFighter(s,'B');return {s,a,b}}
function shock(s,a,b,o){return C.propose(s,{id:'shock',sourceId:a,targetId:b,name:'Électrochoc',options:o})}
const base={shockInRange:true,shockTargetType:'person',shockDirection:1,shockMetal:false};
{
const {s,a,b}=setup();const ev=shock(s,a,b,base);assert.equal(ev.length,2);assert.equal(ev[0].kind,'fatigue');assert.equal(ev[1].kind,'balance');const before=JSON.stringify(s.fighters);C.previewCommit(s,{});assert.equal(JSON.stringify(s.fighters),before);C.commit(s,{});assert.equal(C.fighter(s,a).fatigue,1);assert.equal(C.fighter(s,b).balance,1);assert(C.undo(s));assert.equal(C.fighter(s,a).fatigue,0);assert.equal(C.fighter(s,b).balance,0);
}
{
const {s,a,b}=setup();const ev=shock(s,a,b,{...base,shockDirection:-1,shockMetal:true});assert.equal(ev.length,3);assert.equal(ev[2].detail,'etourdi');C.commit(s,{});assert.equal(C.fighter(s,b).balance,-1);assert(C.fighter(s,b).statuses.includes('etourdi'));
}
{
const {s,a,b}=setup();const ev=shock(s,a,b,{shockInRange:true,shockTargetType:'object',shockObjectName:'Porte métallique'});assert.equal(ev.length,2);assert.equal(ev[1].kind,'note');C.commit(s,{});assert.equal(C.fighter(s,a).fatigue,1);assert(s.notes.some(x=>x.includes('objet ralenti')));
}
for(const patch of [{shockInRange:false},{shockTargetType:'wrong'},{shockDirection:0},{shockMetal:null}]){
 const {s,a,b}=setup();assert.throws(()=>shock(s,a,b,{...base,...patch}));assert.equal(s.proposals.length,0);
}
{
const {s,a}=setup();assert.throws(()=>shock(s,a,a,base),/distincte/);
}
console.log('V0.82 Électrochoc : 8 scénarios OK');
