const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);
const C=ctx.window.CombatCore;
function setup(){const s=C.createCombat(),a=C.addFighter(s,'Terre'),b=C.addFighter(s,'Adversaire');s.temporaryEffects.push({id:'armor1',originLabel:'Armure de terre',targetId:a,armorPoints:3,armorExternalAdvantage:false,label:'Armure de terre : 3 / 3 points'});C.fighter(s,a).statuses.push('avantage');return {s,a,b};}
function hit(s,a,b,kind,amount,detail=''){const id='attack'+s.seq++;s.proposals.push({id:'event'+s.seq++,actionId:id,sourceId:b,targetId:a,kind,amount,detail,reason:'Attaque',round:s.round});}
{
 const {s,a,b}=setup();hit(s,a,b,'fatigue',3);C.commit(s);assert.equal(C.fighter(s,a).fatigue,1);assert.equal(s.temporaryEffects[0].armorPoints,2);C.undo(s);assert.equal(C.fighter(s,a).fatigue,0);assert.equal(s.temporaryEffects[0].armorPoints,3);
}
{
 const {s,a,b}=setup();hit(s,a,b,'condition',0,'Terrifié');C.commit(s);assert.equal(C.fighter(s,a).conditions.length,0);assert.equal(s.temporaryEffects[0].armorPoints,2);
}
{
 const {s,a,b}=setup();hit(s,a,b,'fatigue',2);hit(s,a,b,'fatigue',2);hit(s,a,b,'fatigue',2);C.commit(s);assert.equal(C.fighter(s,a).fatigue,0);assert.equal(s.temporaryEffects.length,0);assert.equal(C.fighter(s,a).statuses.includes('avantage'),false);
}
{
 const {s,a,b}=setup();hit(s,a,b,'fatigue',3);const eventId=s.proposals[0].id;C.commit(s,{['armor:'+eventId]:2});assert.equal(C.fighter(s,a).fatigue,0);assert.equal(s.temporaryEffects[0].armorPoints,1);
}
{
 const {s,a,b}=setup();hit(s,a,b,'fatigue',3);const before=JSON.stringify(s);assert.throws(()=>C.commit(s,{['armor:'+s.proposals[0].id]:3}),/Armure de terre/);assert.equal(JSON.stringify(s),before);
}
console.log('V1.86: armor auto absorption, condition, depletion, undo, extra spend and rejection OK');
