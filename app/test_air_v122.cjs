'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(){const s=C.createCombat(),src=C.addFighter(s,'Air'),dst=C.addFighter(s,'Cible'),old=C.addFighter(s,'Ancien');s.engagements.push([src,old]);const a={id:'air-122',round:s.round,sourceId:src,targetId:dst,name:'Boulet de canon',approach:'avancer',options:{condition:'Confus'}};s.actions.push(a);return {s,src,dst,old,a};}
{
 const {s,src,dst,old,a}=setup();const e=C.propose(s,a);
 assert.deepEqual(Array.from(e,x=>x.kind),['fatigue','disengage','engage','condition']);
 assert.throws(()=>C.commit(s,{[e[0].id]:false}),/accepter ou refuser/);
 C.commit(s);assert.equal(C.fighter(s,src).fatigue,1);assert.equal(C.fighter(s,dst).conditions.includes('Confus'),true);
 assert.equal(s.engagements.some(p=>p.includes(src)&&p.includes(old)),false);
 assert.equal(s.engagements.some(p=>p.includes(src)&&p.includes(dst)),true);
 C.undo(s);assert.equal(C.fighter(s,src).fatigue,0);assert.equal(C.fighter(s,dst).conditions.includes('Confus'),false);
 assert.equal(s.engagements.some(p=>p.includes(src)&&p.includes(old)),true);
}
{
 const {s,src,dst,a}=setup();s.engagements.push([src,dst]);assert.throws(()=>C.propose(s,a),/déjà engagée/);
 s.engagements.pop();a.targetId=src;assert.throws(()=>C.propose(s,a),/distinct/);
 a.targetId=dst;a.options.condition='Invalide';assert.throws(()=>C.propose(s,a),/état valide/);
}
console.log('OK V1.22 : Boulet de canon, engagement, état, atomicité, annulation');
