const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(){const s=C.createCombat(),a=C.addFighter(s,'Terre'),b=C.addFighter(s,'Ennemi');s.temporaryEffects.push({id:'arm',originLabel:'Armure de terre',targetId:a,armorPoints:3,armorExternalAdvantage:false,label:'Armure'});C.fighter(s,a).statuses.push('avantage');return {s,a,b};}
function hit(s,a,b,id,amount){const e={id:'e'+s.seq++,actionId:id,sourceId:b,targetId:a,kind:'fatigue',amount,detail:'',reason:'Attaque',round:s.round};s.proposals.push(e);return e.id;}
{
 const {s,a,b}=setup();hit(s,a,b,'same',2);hit(s,a,b,'same',2);C.commit(s);assert.equal(C.fighter(s,a).fatigue,2);assert.equal(s.temporaryEffects[0].armorPoints,2);C.undo(s);assert.equal(C.fighter(s,a).fatigue,0);assert.equal(s.temporaryEffects[0].armorPoints,3);
}
{
 const {s,a,b}=setup();const first=hit(s,a,b,'same',2);hit(s,a,b,'same',2);C.commit(s,{['armor:'+first]:2});assert.equal(C.fighter(s,a).fatigue,0);assert.equal(s.temporaryEffects[0].armorPoints,1);
}
{
 const {s,a,b}=setup();hit(s,a,b,'same',2);const second=hit(s,a,b,'same',2);const before=JSON.stringify(s);assert.throws(()=>C.commit(s,{['armor:'+second]:2}),/Armure de terre/);assert.equal(JSON.stringify(s),before);
}
{
 const {s,a,b}=setup();hit(s,a,b,'first',2);hit(s,a,b,'second',2);C.commit(s);assert.equal(C.fighter(s,a).fatigue,0);assert.equal(s.temporaryEffects[0].armorPoints,1);
}
console.log('V1.88 : impacts multiples groupés, dépense choisie, atomicité, attaques distinctes et undo OK');
