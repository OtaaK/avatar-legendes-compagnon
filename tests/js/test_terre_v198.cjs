const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(){const s=C.createCombat(),a=C.addFighter(s,'Terre'),b=C.addFighter(s,'Ennemi');s.temporaryEffects.push({id:'arm',originLabel:'Armure de terre',targetId:a,armorPoints:3,armorExternalAdvantage:false});C.fighter(s,a).statuses.push('avantage');return {s,a,b};}
function hit(s,a,b,kind,amount=0,detail=''){const id='e'+s.seq++;s.proposals.push({id,actionId:'mixed',sourceId:b,targetId:a,kind,amount,detail,reason:'Attaque',round:s.round});return id;}
{
 const {s,a,b}=setup();const f=hit(s,a,b,'fatigue',2),c=hit(s,a,b,'condition',0,'blesse');
 C.commit(s,{['armor:'+f]:1,['armor:'+c]:0});
 assert.equal(C.fighter(s,a).fatigue,0);assert.equal(C.fighter(s,a).conditions.includes('blesse'),true);assert.equal(s.temporaryEffects[0].armorPoints,2);
 C.undo(s);assert.equal(s.temporaryEffects[0].armorPoints,3);
}
{
 const {s,a,b}=setup();const f=hit(s,a,b,'fatigue',2),c=hit(s,a,b,'condition',0,'blesse');
 C.commit(s,{['armor:'+f]:0,['armor:'+c]:1});
 assert.equal(C.fighter(s,a).fatigue,2);assert.equal(C.fighter(s,a).conditions.includes('blesse'),false);assert.equal(s.temporaryEffects[0].armorPoints,2);
}
{
 const {s,a,b}=setup();const f=hit(s,a,b,'fatigue',2),c=hit(s,a,b,'condition',0,'blesse');const before=JSON.stringify(s);
 assert.throws(()=>C.commit(s,{['armor:'+f]:0,['armor:'+c]:0}),/dépenser entre 1/);assert.equal(JSON.stringify(s),before);
}
console.log('V1.98 : allocation mixte fatigue/état, dépense minimale, annulation OK');
