const assert=require('assert');
const {CombatCore:C}=require('../../src/domain/index.cjs').loadDomain();
function scenario(external=false){const s=C.createCombat(),id=C.addFighter(s,'Terre');const f=C.fighter(s,id);f.statuses.push('avantage');s.temporaryEffects.push({id:'armor',targetId:id,originLabel:'Armure de terre',armorPoints:1,armorExternalAdvantage:external});return {s,id,f};}
let x=scenario();C.resolveEarthArmorHit(x.s,'armor','fatigue',2,1,true);assert(!x.f.statuses.includes('avantage'));assert(C.undo(x.s));assert(C.fighter(x.s,x.id).statuses.includes('avantage'));
x=scenario(true);C.resolveEarthArmorHit(x.s,'armor','fatigue',2,1,true);assert(x.f.statuses.includes('avantage'));
x=scenario();C.spendEarthArmor(x.s,'armor','condition',true);assert(!x.f.statuses.includes('avantage'));
x=scenario();x.s.temporaryEffects.push({id:'other',targetId:x.id,originLabel:'Armure de terre',armorPoints:2});C.spendEarthArmor(x.s,'armor','fatigue',true);assert(x.f.statuses.includes('avantage'));
console.log('V1.56 : épuisement, autre source, autre armure, annulation');
