const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(){const s=C.createCombat(),id=C.addFighter(s,'Terre');s.phase='resolution';const f=C.fighter(s,id);f.fatigue=4;f.statuses.push('avantage');s.temporaryEffects.push({id:'armor',originLabel:'Armure de terre',targetId:id,armorPoints:2,armorExternalAdvantage:false,label:'Armure de terre : 2 / 3 points'});return {s,id,f};}
{const {s,id}=setup();const r=C.resolveEarthArmorHit(s,'armor','fatigue',5,1,true,['Terrifié','Fragile']);assert.equal(r.residual,3);assert.equal(C.fighter(s,id).fatigue,5);assert.deepEqual(Array.from(C.fighter(s,id).conditions),['Terrifié','Fragile']);assert.equal(s.temporaryEffects[0].armorPoints,1);C.undo(s);assert.equal(C.fighter(s,id).fatigue,4);assert.equal(s.temporaryEffects[0].armorPoints,2);assert.equal(C.fighter(s,id).conditions.length,0);}
for(const bad of [[],['Terrifié'],['Terrifié','Terrifié'],['Terrifié','Inconnu']]){const {s,id}=setup();assert.throws(()=>C.resolveEarthArmorHit(s,'armor','fatigue',5,1,true,bad));assert.equal(C.fighter(s,id).fatigue,4);assert.equal(s.temporaryEffects[0].armorPoints,2);assert.equal(s.snapshots.length,0);}
{const {s,id}=setup();const r=C.resolveEarthArmorHit(s,'armor','fatigue',4,2,true);assert.equal(r.residual,0);assert.equal(C.fighter(s,id).fatigue,4);assert.equal(s.temporaryEffects.length,0);}
console.log('V1.75 Armure de terre : fatigue excédentaire, états et annulation OK');
