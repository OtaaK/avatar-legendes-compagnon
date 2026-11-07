const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(name,options={}){const s=C.createCombat(),a=C.addFighter(s,'Terre'),b=C.addFighter(s,'Cible');s.actions.push({id:'act',name,sourceId:a,targetId:b,options});return {s,a,b};}
function put(s,kind,targetId,amount,detail,reason,id){s.proposals.push({id,actionId:'act',sourceId:s.actions[0].sourceId,targetId,kind,amount,detail:detail||'',reason,round:s.round});}
function reject(s,regex){const before=JSON.stringify(s);assert.throws(()=>C.commit(s,{}),regex);assert.equal(JSON.stringify(s),before,'rejet sans mutation');}
// Enfouissement ne peut plus dépenser la fatigue sans piéger, ni piéger sans coût.
{const {s,a,b}=setup('Enfouissement');put(s,'fatigue',a,2,'','Enfouissement : coût','cost');reject(s,/Enfouissement/);put(s,'status_add',b,0,'piege','Enfouissement : cible Piégée','trap');C.commit(s,{});assert.equal(C.fighter(s,a).fatigue,2);assert(C.fighter(s,b).statuses.includes('piege'));assert(C.undo(s));assert.equal(C.fighter(s,a).fatigue,0);}
{const {s,a,b}=setup('Enfouissement');put(s,'fatigue',a,2,'','Enfouissement : coût','cost');put(s,'status_add',a,0,'piege','Enfouissement : cible Piégée','trap');reject(s,/Enfouissement/);}
// Gantelet : montants exacts (coût et cible), sans effets clandestins.
for(const [sourceAmount,targetAmount] of [[3,2],[1,4]]){const {s,a,b}=setup('Gantelet de terre',{choice:'fatigue',earthGauntletProjection:'none'});put(s,'fatigue',a,sourceAmount,'','Gantelet de terre : coût','cost');put(s,'fatigue',b,targetAmount,'','Gantelet de terre : cible','hit');reject(s,/Gantelet de terre/);}
{const {s,a,b}=setup('Gantelet de terre',{choice:'fatigue',earthGauntletProjection:'none'});put(s,'fatigue',a,1,'','Gantelet de terre : coût','cost');put(s,'fatigue',b,2,'','Gantelet de terre : cible','hit');put(s,'status_add',b,0,'gene','Gantelet de terre : bonus illicite','extra');reject(s,/Gantelet de terre/);}
{const {s,a,b}=setup('Gantelet de terre',{choice:'fatigue',earthGauntletProjection:'none'});put(s,'fatigue',a,1,'','Gantelet de terre : coût','cost');put(s,'fatigue',b,2,'','Gantelet de terre : cible','hit');C.commit(s,{});assert.equal(C.fighter(s,a).fatigue,1);assert.equal(C.fighter(s,b).fatigue,2);}
console.log('V2.14 : Enfouissement atomique et Gantelet montants exacts, undo et anti-corruption OK');
