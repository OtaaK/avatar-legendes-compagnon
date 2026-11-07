const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(){const s=C.createCombat(),a=C.addFighter(s,'Terre'),b=C.addFighter(s,'Cible');C.setEngagement(s,a,b,true);s.phase='resolution';return {s,a,b};}
function action(s,a,b,mode){return {id:'gauntlet',name:'Gantelet de terre',sourceId:a,targetId:b,options:{choice:'fatigue',earthGauntletProjection:mode}};}
for(const [mode,extra,disengaged] of [['none',0,false],['resist',1,false],['project',0,true]]){
 const {s,a,b}=setup();const ev=C.propose(s,action(s,a,b,mode));assert.equal(ev.filter(e=>e.kind==='fatigue'&&e.targetId===b).reduce((x,e)=>x+e.amount,0),2+extra);
 assert.equal(ev.filter(e=>e.kind==='disengage').length,disengaged?1:0);
 s.actions.push(action(s,a,b,mode));s.proposals=ev;C.commit(s,{});assert.equal(C.fighter(s,b).fatigue,2+extra);assert.equal(C.isEngaged(s,a,b),!disengaged);
 C.undo(s);assert.equal(C.fighter(s,b).fatigue,0);assert(C.isEngaged(s,a,b));
}
for(const mode of ['project','resist']){const {s,a,b}=setup();s.engagements=[];assert.throws(()=>C.propose(s,action(s,a,b,mode)),/engagé/);}
{const {s,a,b}=setup();assert.throws(()=>C.propose(s,action(s,a,b,'invalid')),/invalide/);}
console.log('V1.74 Gantelet projection/résistance/annulation OK');
