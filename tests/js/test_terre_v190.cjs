const assert=require('assert');
const {CombatCore:C}=require('../../src/domain/index.cjs').loadDomain();
function setup(){const s=C.createCombat(),a=C.addFighter(s,'Terre'),b=C.addFighter(s,'Adversaire');s.temporaryEffects.push({id:'arm',originLabel:'Armure de terre',targetId:a,armorPoints:3,armorExternalAdvantage:false});C.fighter(s,a).statuses.push('avantage');return {s,a,b};}
function hit(s,a,b,actionId,kind,amount=0,detail=''){s.proposals.push({id:'e'+s.seq++,actionId,sourceId:b,targetId:a,kind,amount,detail,reason:'Attaque',round:s.round});}
{
 const {s,a,b}=setup();hit(s,a,b,'hit','condition',0,'blesse');hit(s,a,b,'hit','condition',0,'blesse');C.commit(s);assert.equal(s.temporaryEffects[0].armorPoints,2);assert.equal(C.fighter(s,a).conditions.length,0);C.undo(s);assert.equal(s.temporaryEffects[0].armorPoints,3);
}
{
 const {s,a,b}=setup();hit(s,a,b,'hit','condition',0,'blesse');hit(s,a,b,'hit','fatigue',2);hit(s,a,b,'hit','condition',0,'blesse');C.commit(s);assert.equal(s.temporaryEffects[0].armorPoints,2);assert.equal(C.fighter(s,a).fatigue,0);assert.equal(C.fighter(s,a).conditions.length,1);
}
{
 const {s,a,b}=setup();C.fighter(s,a).conditions.push('blesse');hit(s,a,b,'hit','condition',0,'blesse');C.commit(s);assert.equal(s.temporaryEffects[0].armorPoints,3);
}
console.log('V1.90 : états dupliqués, impacts mixtes et annulation OK');
