const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(){const s=C.createCombat(),id=C.addFighter(s,'Terre');s.phase='resolution';s.temporaryEffects.push({id:'armor',originLabel:'Armure de terre',targetId:id,armorPoints:3,armorExternalAdvantage:true,label:'Armure de terre : 3 / 3 points'});return {s,id};}
{const {s,id}=setup();const r=C.resolveEarthArmorHit(s,'armor','fatigue',8,3,true,['Terrifié']);assert.equal(r.residual,2);assert.equal(C.fighter(s,id).fatigue,2);assert.equal(s.temporaryEffects.length,0);C.undo(s);assert.equal(s.temporaryEffects[0].armorPoints,3);}
{const {s,id}=setup();C.fighter(s,id).conditions.push('Terrifié');assert.throws(()=>C.resolveEarthArmorHit(s,'armor','condition','Terrifié',1,true),/déjà coché/);assert.equal(s.temporaryEffects[0].armorPoints,3);assert.equal(s.snapshots.length,0);}
{const {s}=setup();for(const n of [0,-1,21,2.5,NaN])assert.throws(()=>C.resolveEarthArmorHit(s,'armor','fatigue',n,1,true));assert.equal(s.temporaryEffects[0].armorPoints,3);}
console.log('V1.76 impacts lourds et état déjà coché OK');
