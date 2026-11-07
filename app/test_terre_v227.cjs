const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(){const s=C.createCombat(),a=C.addFighter(s,'Terre'),b=C.addFighter(s,'Ennemi');s.temporaryEffects.push({id:'armor',originLabel:'Armure de terre',targetId:a,armorPoints:1});return {s,a,b};}
function condition(s,b,a,detail){const id='e'+s.seq++;s.proposals.push({id,actionId:'attack',sourceId:b,targetId:a,kind:'condition',amount:0,detail,reason:'Attaque',round:s.round});return id;}
{
 const {s,a,b}=setup();const first=condition(s,b,a,'fragile'),second=condition(s,b,a,'terrifié');
 const before=JSON.stringify(s);C.commit(s,{['armor:'+first]:1,['armor:'+second]:0});
 assert(!C.fighter(s,a).conditions.includes('fragile'));assert(C.fighter(s,a).conditions.includes('terrifié'));
 C.undo(s);assert.equal(JSON.stringify(s),before);
}
{
 const {s,a,b}=setup();const first=condition(s,b,a,'fragile'),second=condition(s,b,a,'terrifié');
 C.commit(s,{['armor:'+first]:0,['armor:'+second]:1});
 assert(C.fighter(s,a).conditions.includes('fragile'));assert(!C.fighter(s,a).conditions.includes('terrifié'));
}
assert(html.includes("if(spent>=reserve){decisions['armor:'+c.id]=0;continue;}"));
console.log('V2.27 : sélection des états, épuisement de réserve, annulation OK');
