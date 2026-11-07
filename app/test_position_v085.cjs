'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
const name='Meilleur, plus rapide, plus fort';
const options=(bonus='none')=>({positionUnopposed:true,positionDescription:'Plateforme supérieure',positionBonus:bonus});
function setup(){const s=C.createCombat(),a=C.addFighter(s,'Inventrice'),b=C.addFighter(s,'Rival');return {s,a,b}}
function propose(s,a,b,o){return C.propose(s,{id:'position',sourceId:a,targetId:b,name,options:o})}
let n=0;
for(const [bonus,cost,status,notes] of [['none',1,false,1],['reinforced',2,true,1],['secure',2,false,2]]){
 const {s,a,b}=setup(),before=JSON.stringify(s.fighters),events=propose(s,a,b,options(bonus));
 assert.equal(events.length,1+notes+(status?1:0));
 C.previewCommit(s,{});assert.equal(JSON.stringify(s.fighters),before);
 C.commit(s,{});assert.equal(C.fighter(s,a).fatigue,cost);assert.equal(C.fighter(s,b).fatigue,0);
 assert.equal(C.fighter(s,a).statuses.includes('renforce'),status);
 assert(s.notes.some(x=>x.includes('Plateforme supérieure')));
 assert(C.undo(s));assert.equal(JSON.stringify(s.fighters),before);n++;
}
for(const o of [{...options(),positionUnopposed:false},{...options(),positionDescription:''},{...options(),positionDescription:'x'.repeat(161)},{...options(),positionBonus:'invalid'}]){
 const {s,a,b}=setup();assert.throws(()=>propose(s,a,b,o));assert.equal(s.proposals.length,0);n++;
}
{
 const {s,a,b}=setup(),ev=propose(s,a,b,options('reinforced'));
 C.commit(s,{[ev[2].id]:false});assert.equal(C.fighter(s,a).fatigue,2);assert(!C.fighter(s,a).statuses.includes('renforce'));n++;
}
console.log('V0.85 : '+n+' scénarios position OK');
