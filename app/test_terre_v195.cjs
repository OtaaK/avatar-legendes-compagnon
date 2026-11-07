const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(){const s=C.createCombat(),a=C.addFighter(s,'Métal'),b=C.addFighter(s,'Cible');s.engagements=[[a,b]];s.temporaryEffects.push({id:'m',originLabel:'Entraves de métal',originSourceId:a,targetId:b,metalGrantedAdvantage:true,metalExternalAdvantage:false});C.fighter(s,a).statuses.push('avantage');C.fighter(s,b).statuses.push('gene');return {s,a,b};}
{
 const {s,b}=setup();const before=JSON.stringify(s);assert.throws(()=>C.releaseEarthMetal(s,'m','metal_mastery',true,false),/maîtrise/);assert.equal(JSON.stringify(s),before);
 assert.throws(()=>C.releaseEarthMetal(s,'m','metal_mastery',false,true),/confirmation/);
 assert(C.releaseEarthMetal(s,'m','metal_mastery',true,true));assert(!C.fighter(s,b).statuses.includes('gene'));assert(C.undo(s));assert(C.fighter(s,b).statuses.includes('gene'));
}
{
 const {s,a}=setup();const b2=C.addFighter(s,'Cible 2');s.engagements.push([a,b2]);C.fighter(s,b2).statuses.push('gene');s.temporaryEffects.push({id:'m2',originLabel:'Entraves de métal',originSourceId:a,targetId:b2,metalGrantedAdvantage:true,metalExternalAdvantage:false});
 C.releaseEarthMetal(s,'m','mj_release',true);assert(C.fighter(s,a).statuses.includes('avantage'));
 C.releaseEarthMetal(s,'m2','combat_end',true);assert(!C.fighter(s,a).statuses.includes('avantage'));
}
{
 const {s,a}=setup();s.temporaryEffects.push({id:'armor',originLabel:'Armure de terre',targetId:a,armorPoints:1});
 C.releaseEarthMetal(s,'m','mj_release',true);assert(C.fighter(s,a).statuses.includes('avantage'));
 C.removeTemporaryEffect(s,'armor');assert(!C.fighter(s,a).statuses.includes('avantage'));assert(C.undo(s));assert(C.fighter(s,a).statuses.includes('avantage'));
}
{
 const {s,a}=setup();s.temporaryEffects=[{id:'armor',originLabel:'Armure de terre',targetId:a,armorPoints:1}];const before=s.snapshots.length;
 C.removeTemporaryEffect(s,'armor');assert.equal(s.snapshots.length,before+1);assert(C.undo(s));assert.equal(s.temporaryEffects.length,1);
}
console.log('V1.95 : libération motivée, avantages croisés, annulation armure OK');
