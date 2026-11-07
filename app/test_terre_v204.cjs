const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(){const s=C.createCombat(),a=C.addFighter(s,'Terre'),b=C.addFighter(s,'Ennemi');s.phase='attaquer';C.fighter(s,a).approach='attaquer';return {s,a,b};}
function act(s,a,b,name,options={}){const x={id:'a'+s.seq++,round:s.round,sourceId:a,targetId:b,name,approach:s.phase,options};s.actions.push(x);C.propose(s,x);return x;}
{const {s,a,b}=setup();C.setEngagement(s,a,b,true);act(s,a,b,'Gantelet de terre',{choice:'fatigue',earthGauntletProjection:'project'});s.engagements=[];assert.throws(()=>C.commit(s,{}),/engagement modifié/);assert(s.proposals.length);}
{const {s,a,b}=setup();C.setEngagement(s,a,b,true);act(s,a,b,'Gantelet de terre',{choice:'fatigue',earthGauntletProjection:'resist'});C.commit(s,{});assert.equal(C.fighter(s,b).fatigue,3);assert(C.isEngaged(s,a,b));assert(C.undo(s));}
{const {s,a,b}=setup();C.setEngagement(s,a,b,true);act(s,a,b,'Projection tellurique',{earthAirUnableTargets:[b]});s.engagements=[];assert.throws(()=>C.commit(s,{}),/engagement modifié/);}
{const {s,a,b}=setup();act(s,a,b,'Mords la poussière');C.commit(s,{});assert(C.fighter(s,b).bonuses.some(x=>x.type==='blocked'&&x.approach==='defendre'));assert(C.undo(s));}
{const {s,a,b}=setup();act(s,a,b,'Mouvements tectoniques',{tectonicTargets:[b],tectonicZone:false});C.commit(s,{});assert(C.fighter(s,b).statuses.includes('gene'));assert(C.undo(s));}
console.log('V2.04 : quatre techniques de Terre — contrôles différés OK');
