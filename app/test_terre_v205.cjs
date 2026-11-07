const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(){const s=C.createCombat(),a=C.addFighter(s,'Terre'),b=C.addFighter(s,'Ennemi'),c=C.addFighter(s,'Autre');s.phase='attaquer';return {s,a,b,c};}
function act(s,a,b,name,options={}){const x={id:'a'+s.seq++,round:s.round,sourceId:a,targetId:b,name,approach:s.phase,options};s.actions.push(x);C.propose(s,x);return x;}
{const {s,a,b}=setup();act(s,a,b,'Enfouissement');s.proposals=s.proposals.filter(e=>e.kind!=='fatigue');assert.throws(()=>C.commit(s,{}),/Enfouissement : coût/);assert.equal(C.fighter(s,b).statuses.length,0);}
{const {s,a,b}=setup();act(s,a,b,'Mords la poussière');s.proposals=s.proposals.filter(e=>e.kind!=='status_add');assert.throws(()=>C.commit(s,{}),/Mords la poussière : Gêné/);}
{const {s,a,b,c}=setup();act(s,a,b,'Mouvements tectoniques',{tectonicTargets:[b,c],tectonicZone:true});s.proposals=s.proposals.filter(e=>e.targetId!==c);assert.throws(()=>C.commit(s,{}),/Mouvements tectoniques : cibles/);}
{const {s,a,b}=setup();act(s,a,b,'Colonne de pierre');s.proposals.find(e=>e.kind==='status_add').targetId=a;assert.throws(()=>C.commit(s,{}),/Colonne de pierre : progression/);}
{const {s,a,b}=setup();C.setEngagement(s,a,b,true);act(s,a,b,'Gantelet de terre',{choice:'fatigue',earthGauntletProjection:'resist'});C.commit(s,{});assert.equal(C.fighter(s,b).fatigue,3);assert(C.undo(s));}
{const {s,a,b}=setup();act(s,a,b,'Enfouissement');C.commit(s,{});assert(C.fighter(s,b).statuses.includes('piege'));}
console.log('V2.05 : intégrité des cinq techniques Terre OK');
