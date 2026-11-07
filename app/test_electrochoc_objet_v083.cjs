'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
const s=C.createCombat(),a=C.addFighter(s,'Technicien'),b=C.addFighter(s,'Adversaire');
const object={shockInRange:true,shockTargetType:'object',shockObjectName:'Porte métallique'};
const e=C.propose(s,{id:'object',sourceId:a,targetId:a,name:'Électrochoc',options:object});
assert.equal(e.length,2);assert.equal(e[1].targetId,a);assert.match(e[1].reason,/Porte métallique/);
const before=JSON.stringify(s);C.previewCommit(s,{});assert.equal(JSON.stringify(s),before);
C.commit(s,{});assert.equal(C.fighter(s,a).fatigue,1);assert.equal(C.fighter(s,b).fatigue,0);assert(s.notes.some(n=>n.includes('Porte métallique')));
assert(C.undo(s));assert.equal(C.fighter(s,a).fatigue,0);
for(const bad of ['', ' ', 'x'.repeat(101),null,42]){
 const state=C.createCombat(),id=C.addFighter(state,'A');
 assert.throws(()=>C.propose(state,{id:'bad',sourceId:id,targetId:id,name:'Électrochoc',options:{...object,shockObjectName:bad}}),/nom de l’objet/);
 assert.equal(state.proposals.length,0);
}
assert.throws(()=>C.propose(s,{id:'person',sourceId:a,targetId:a,name:'Électrochoc',options:{shockInRange:true,shockTargetType:'person',shockDirection:1,shockMetal:false}}),/distincte/);
assert(html.includes('id="shockObjectName"'));assert(html.includes("effectiveTarget=name==='Électrochoc'"));
console.log('V0.83 Électrochoc objets : 10 vérifications OK');
