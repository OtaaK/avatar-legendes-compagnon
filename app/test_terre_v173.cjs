const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function make(extra){const s=C.createCombat(),id=C.addFighter(s,'Terre'),f=C.fighter(s,id);f.statuses.push('avantage');s.temporaryEffects.push({id:'armor',originLabel:'Armure de terre',targetId:id,armorPoints:1,armorExternalAdvantage:false,label:'Armure de terre : 1 / 3 points'});extra(s,id,f);return {s,id,f};}
for(const [name,extra] of [
 ['lava',(s,id)=>s.temporaryEffects.push({id:'lava',originLabel:'Étoile de lave',targetId:id,duration:'manual'})],
 ['round',(s,id,f)=>f.roundStatuses=[{status:'avantage',expiresAfterRound:2}]],
 ['second armor',(s,id)=>s.temporaryEffects.push({id:'armor2',originLabel:'Armure de terre',targetId:id,armorPoints:2})]
]){
 const {s,id,f}=make(extra);C.spendEarthArmor(s,'armor','fatigue',true);assert(C.fighter(s,id).statuses.includes('avantage'),name+' should retain advantage');assert(!s.temporaryEffects.some(x=>x.id==='armor'));C.undo(s);assert(s.temporaryEffects.some(x=>x.id==='armor'),name+' undo restores armor');
}
const {s,id}=make(()=>{});C.resolveEarthArmorHit(s,'armor','fatigue',2,1,true);assert(!C.fighter(s,id).statuses.includes('avantage'),'Last armor removes own advantage');
const {s:hit,id:hid}=make((s,id)=>s.temporaryEffects.push({id:'lava',originLabel:'Étoile de lave',targetId:id}));C.resolveEarthArmorHit(hit,'armor','fatigue',3,1,true);assert(C.fighter(hit,hid).fatigue===1);assert(C.fighter(hit,hid).statuses.includes('avantage'),'Atomic hit preserves lava advantage');
console.log('V1.73 armor concurrent advantages OK');