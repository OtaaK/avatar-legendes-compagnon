const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(points=3){const s=C.createCombat(),a=C.addFighter(s,'Terre'),b=C.addFighter(s,'Adversaire');s.temporaryEffects.push({id:'arm',originLabel:'Armure de terre',targetId:a,armorPoints:points,armorExternalAdvantage:false});C.fighter(s,a).statuses.push('avantage');return {s,a,b};}
function hit(s,a,b,kind,amount=0,detail=''){const id='e'+s.seq++;s.proposals.push({id,actionId:'mixed',sourceId:b,targetId:a,kind,amount,detail,reason:'Attaque',round:s.round});return id;}
{
 const {s,a,b}=setup();hit(s,a,b,'fatigue',2);hit(s,a,b,'condition',0,'blesse');
 C.commit(s,{});assert.equal(C.fighter(s,a).fatigue,0);assert.equal(C.fighter(s,a).conditions.includes('blesse'),true);assert.equal(s.temporaryEffects[0].armorPoints,2);
 C.undo(s);assert.equal(s.temporaryEffects[0].armorPoints,3);assert.equal(C.fighter(s,a).conditions.includes('blesse'),false);
}
{
 const {s,a,b}=setup();hit(s,a,b,'condition',0,'blesse');hit(s,a,b,'fatigue',2);
 C.commit(s,{});assert.equal(C.fighter(s,a).fatigue,0);assert.equal(C.fighter(s,a).conditions.includes('blesse'),true);assert.equal(s.temporaryEffects[0].armorPoints,2);
}
{
 const {s,a,b}=setup();hit(s,a,b,'condition',0,'blesse');hit(s,a,b,'condition',0,'fragile');
 C.commit(s,{});assert.equal(s.temporaryEffects[0].armorPoints,2);assert.equal(C.fighter(s,a).conditions.includes('blesse'),false);assert.equal(C.fighter(s,a).conditions.includes('fragile'),true);
}
console.log('V1.99 : dépense implicite unique pour attaque mixte, ordre inversé, états multiples, annulation OK');