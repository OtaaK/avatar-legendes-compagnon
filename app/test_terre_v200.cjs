const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(){const s=C.createCombat(),a=C.addFighter(s,'Terre'),b=C.addFighter(s,'Assaillant');s.temporaryEffects.push({id:'arm',originLabel:'Armure de terre',targetId:a,armorPoints:3,armorExternalAdvantage:false});C.fighter(s,a).statuses.push('avantage');return {s,a,b};}
function hit(s,a,b,actionId,kind,amount=0,detail=''){const id='e'+s.seq++;s.proposals.push({id,actionId,sourceId:b,targetId:a,kind,amount,detail,reason:'Attaque',round:s.round});return id;}
{
 const {s,a,b}=setup();hit(s,a,b,'attaque1','fatigue',2);hit(s,a,b,'attaque1','condition',0,'blesse');hit(s,a,b,'attaque2','fatigue',2);hit(s,a,b,'attaque2','condition',0,'fragile');
 C.commit(s,{});assert.equal(C.fighter(s,a).fatigue,0);assert.deepEqual(Array.from(C.fighter(s,a).conditions).sort(),['blesse','fragile']);assert.equal(s.temporaryEffects[0].armorPoints,1);
 C.undo(s);assert.equal(s.temporaryEffects[0].armorPoints,3);assert.equal(C.fighter(s,a).conditions.length,0);
}
{
 const {s,a,b}=setup();const f=hit(s,a,b,'attaque1','fatigue',2),c=hit(s,a,b,'attaque1','condition',0,'blesse');hit(s,a,b,'attaque2','fatigue',2);
 C.commit(s,{['armor:'+f]:0,['armor:'+c]:1});assert.equal(C.fighter(s,a).fatigue,2);assert.equal(C.fighter(s,a).conditions.includes('blesse'),false);assert.equal(s.temporaryEffects[0].armorPoints,1);
}
{
 const {s,a,b}=setup();hit(s,a,b,'attaque1','fatigue',2);hit(s,a,b,'attaque2','fatigue',2);hit(s,a,b,'attaque3','fatigue',2);hit(s,a,b,'attaque4','fatigue',2);
 C.commit(s,{});assert.equal(C.fighter(s,a).fatigue,2);assert.equal(s.temporaryEffects.some(e=>e.id==='arm'),false);
}
console.log('V2.00 : plusieurs attaques, allocation mixte, épuisement et annulation OK');
