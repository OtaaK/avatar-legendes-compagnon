const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(){const s=C.createCombat(),a=C.addFighter(s,'Terre'),b=C.addFighter(s,'Ennemi'),c=C.addFighter(s,'Allié');s.phase='defendre';C.fighter(s,a).approach='defendre';const act={id:'seismic-init',round:1,sourceId:a,targetId:b,name:'Détection du pas lourd',approach:'defendre',options:{earthSeismicConfirmed:true}};s.actions.push(act);C.propose(s,act);C.commit(s,{});return {s,a,b,c};}
{
 const {s,a,b,c}=setup();const enemy={id:'enemy-attack',round:1,sourceId:b,targetId:a,name:'Frapper',approach:'attaquer',options:{choice:'fatigue'}};s.actions.push(enemy);C.propose(s,enemy);
  C.fighter(s,c).approach='defendre';const unrelated=C.manual(s,c,b,'fatigue',1,'','Autre action');assert(s.proposals.some(e=>e.actionId===enemy.id));
 C.resolveEarthSeismicInterrupt(s,a,b,'cancel',true,[],enemy.id);
 assert(!s.proposals.some(e=>e.actionId===enemy.id));assert(s.proposals.some(e=>e.id===unrelated.id));
 assert.throws(()=>C.propose(s,enemy),/annulée/);
 C.commit(s,{});assert.equal(C.fighter(s,b).fatigue,1);
 assert(C.undo(s));assert(s.proposals.some(e=>e.id===unrelated.id));assert(!s.proposals.some(e=>e.actionId===enemy.id));
 assert(C.undo(s));assert(s.proposals.some(e=>e.actionId===enemy.id));assert(!s.actions.find(x=>x.id===enemy.id).cancelledBySeismic);
}
{
 const {s,a,b}=setup();const enemy={id:'enemy-pay',round:1,sourceId:b,targetId:a,name:'Frapper',approach:'attaquer',options:{choice:'fatigue'}};s.actions.push(enemy);C.propose(s,enemy);const count=s.proposals.length;
 C.resolveEarthSeismicInterrupt(s,a,b,'pay',true,[]);assert.equal(s.proposals.length,count);assert.equal(C.fighter(s,b).fatigue,3);C.commit(s,{});
}
{
 const {s,a,b}=setup();const enemy={id:'enemy-forged',round:1,sourceId:b,targetId:a,name:'Frapper',approach:'attaquer',options:{choice:'fatigue'}};s.actions.push(enemy);C.propose(s,enemy);C.resolveEarthSeismicInterrupt(s,a,b,'cancel',true,[],enemy.id);
 const stale=C.propose;const forged={id:'forged',actionId:enemy.id,sourceId:b,targetId:a,kind:'fatigue',amount:1,detail:'',reason:'ancien événement'};s.proposals.push(forged);assert.throws(()=>C.commit(s,{}),/annulée/);
}
console.log('V1.70 interruption des propositions préparées, choix payer, annulation, undo, garde commit OK');
