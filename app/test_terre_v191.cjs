const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(){const s=C.createCombat(),a=C.addFighter(s,'Terre'),b=C.addFighter(s,'Ennemi');s.temporaryEffects.push({id:'arm',originLabel:'Armure de terre',targetId:a,armorPoints:3,armorExternalAdvantage:false});C.fighter(s,a).statuses.push('avantage');return {s,a,b};}
function hit(s,a,b,kind,amount=0,detail='',actionId='attaque'){const id='e'+s.seq++;s.proposals.push({id,actionId,sourceId:b,targetId:a,kind,amount,detail,reason:'Attaque',round:s.round});return id;}
function rejectAtomically(s,decisions,pattern){const before=JSON.stringify(s);assert.throws(()=>C.commit(s,decisions),pattern);assert.equal(JSON.stringify(s),before);}
{
 const {s,a,b}=setup();const id=hit(s,a,b,'fatigue',4);
 rejectAtomically(s,{'armor:obsolete':2},/périmé/);
 C.commit(s,{['armor:'+id]:2});assert.equal(C.fighter(s,a).fatigue,0);assert.equal(s.temporaryEffects[0].armorPoints,1);
}
{
 const {s,a,b}=setup();const id=hit(s,a,b,'fatigue',2);
 rejectAtomically(s,{['armor:'+id]:1,[id]:false},/périmé/);
}
{
 const {s,a,b}=setup();const id1=hit(s,a,b,'condition',0,'blesse');const id2=hit(s,a,b,'condition',0,'blesse');
 rejectAtomically(s,{['armor:'+id2]:1},/déjà absorbé/);
 C.commit(s,{['armor:'+id1]:1});assert.equal(s.temporaryEffects[0].armorPoints,2);
}
{
 const {s,a,b}=setup();const first=hit(s,a,b,'fatigue',6,'','a');const second=hit(s,a,b,'fatigue',2,'','b');
 rejectAtomically(s,{['armor:'+first]:3,['armor:'+second]:1},/non applicable/);
}
console.log('V1.91 : choix armure périmés, rejetés, doublons, réserve épuisée, atomicité OK');
