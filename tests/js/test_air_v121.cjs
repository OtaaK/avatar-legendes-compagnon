'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(name,options={}){const s=C.createCombat(),src=C.addFighter(s,'Air'),dst=C.addFighter(s,'Cible');const a={id:'air-121',round:s.round,sourceId:src,targetId:dst,name,approach:'analyser',options};s.actions.push(a);return {s,src,dst,a};}
{
 const {s,src,a}=setup('Aspiration',{airObject:'clef',airResistance:'none'});const e=C.propose(s,a);assert.equal(e.length,1);assert.equal(e[0].kind,'note');C.commit(s);assert.equal(C.fighter(s,src).fatigue,0);C.undo(s);assert.equal(s.notes.length,0);
}
{
 const {s,dst,a}=setup('Aspiration',{airObject:'clef',airResistance:'resist'});const e=C.propose(s,a);assert.equal(e.length,2);assert.throws(()=>C.commit(s,{[e[0].id]:false}),/accepter ou refuser/);C.commit(s);assert.equal(C.fighter(s,dst).fatigue,2);C.undo(s);assert.equal(C.fighter(s,dst).fatigue,0);
}
{
 const {s,a}=setup('Aspiration',{airObject:'',airResistance:'none'});assert.throws(()=>C.propose(s,a),/objet/);a.options={airObject:'clef',airResistance:'resist'};a.targetId=a.sourceId;assert.throws(()=>C.propose(s,a),/distinct/);
}
{
 const {s,src,dst,a}=setup('Vélocité du vent');s.engagements.push([src,dst]);const e=C.propose(s,a);assert.deepEqual(Array.from(e,x=>x.kind),['fatigue','disengage','note']);assert.throws(()=>C.commit(s,{[e[0].id]:false}),/accepter ou refuser/);C.commit(s);assert.equal(C.fighter(s,src).fatigue,1);assert.equal(s.engagements.length,0);C.undo(s);assert.equal(C.fighter(s,src).fatigue,0);assert.equal(s.engagements.length,1);
}
console.log('OK V1.21 : Aspiration, Vélocité du vent, validation groupée, annulation');
