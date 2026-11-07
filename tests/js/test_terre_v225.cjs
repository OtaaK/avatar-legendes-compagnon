const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(){const s=C.createCombat(),a=C.addFighter(s,'Terre 1'),b=C.addFighter(s,'Terre 2'),enemy=C.addFighter(s,'Ennemi');s.temporaryEffects.push({id:'arm',originLabel:'Armure de terre',targetId:a,armorPoints:3});C.fighter(s,a).statuses.push('avantage');return {s,a,b,enemy};}
function hit(s,source,target,attack,kind,amount=0,detail=''){const id='e'+s.seq++;s.proposals.push({id,actionId:attack,sourceId:source,targetId:target,kind,amount,detail,reason:'Attaque',round:s.round});return id;}
// Deux attaques mixtes, choix ciblés, réserve cumulative et annulation.
{const {s,a,enemy}=setup();const f=hit(s,enemy,a,'one','fatigue',2),c=hit(s,enemy,a,'one','condition',0,'fragile');hit(s,enemy,a,'two','fatigue',2);hit(s,enemy,a,'two','condition',0,'blesse');const before=JSON.stringify(s);C.commit(s,{['armor:'+f]:0,['armor:'+c]:1});assert.equal(C.fighter(s,a).fatigue,2);assert.equal(C.fighter(s,a).conditions.includes('fragile'),false);assert.equal(C.fighter(s,a).conditions.includes('blesse'),true);assert.equal(s.temporaryEffects.find(x=>x.id==='arm').armorPoints,1);C.undo(s);assert.equal(JSON.stringify(s),before);}
// Réserve insuffisante: refus atomique des allocations explicites.
{const {s,a,enemy}=setup();s.temporaryEffects[0].armorPoints=1;const c1=hit(s,enemy,a,'one','condition',0,'fragile'),c2=hit(s,enemy,a,'one','condition',0,'blesse');const before=JSON.stringify(s);assert.throws(()=>C.commit(s,{['armor:'+c1]:1,['armor:'+c2]:1}),/Armure de terre/);assert.equal(JSON.stringify(s),before);C.commit(s,{['armor:'+c1]:0,['armor:'+c2]:1});assert(C.fighter(s,a).conditions.includes('fragile'));assert(!C.fighter(s,a).conditions.includes('blesse'));}
// Le préfiltre UI ne doit pas traiter une fatigue convertie en note par une protection comme une nouvelle attaque à absorber.
assert(html.includes("if(e.kind==='note'&&!String(e.reason||'').includes('Armure de terre'))continue;"));
console.log('V2.25 : armure multi-attaque, allocations, refus atomique, undo et filtrage des effets neutralisés OK');
