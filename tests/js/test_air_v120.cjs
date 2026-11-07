'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(name,options={}){const s=C.createCombat(),src=C.addFighter(s,'Air'),dst=C.addFighter(s,'Cible');const a={id:'air-test',round:s.round,sourceId:src,targetId:dst,name,approach:'attaquer',options};s.actions.push(a);return {s,src,dst,a};}
{
 const {s,src,dst,a}=setup('Tourbillon miniature');const e=C.propose(s,a);
 assert.deepEqual(Array.from(e,x=>x.kind),['fatigue','status_add','status_add']);
 assert.throws(()=>C.commit(s,{[e[0].id]:false}),/accepter ou refuser/);
 C.commit(s);assert.equal(C.fighter(s,src).fatigue,3);assert(C.fighter(s,dst).statuses.includes('gene'));assert(C.fighter(s,dst).statuses.includes('etourdi'));
 C.undo(s);assert.equal(C.fighter(s,src).fatigue,0);assert(!C.fighter(s,dst).statuses.includes('gene'));
}
for(const choice of ['fatigue','etourdi']){
 const {s,dst,a}=setup('Souffle du vent',{windChoice:choice});const e=C.propose(s,a);
 assert.equal(e.length,2);assert.throws(()=>C.commit(s,{[e[0].id]:false}),/accepter ou refuser/);
 C.commit(s);if(choice==='fatigue'){assert.equal(C.fighter(s,dst).fatigue,4);assert(!C.fighter(s,dst).statuses.includes('etourdi'));}else assert(C.fighter(s,dst).statuses.includes('etourdi'));
 C.undo(s);assert.equal(C.fighter(s,dst).fatigue,0);assert(!C.fighter(s,dst).statuses.includes('etourdi'));
}
{
 const {s,a,src}=setup('Souffle du vent',{windChoice:'invalid'});assert.throws(()=>C.propose(s,a),/choix/);a.targetId=src;assert.throws(()=>C.propose(s,a),/distinct/);
}
console.log('OK V1.20 : Tourbillon miniature, Souffle du vent, choix, indivisibilité, annulation');
