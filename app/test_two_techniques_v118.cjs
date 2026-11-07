const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(name,options={}){const s=C.createCombat(),src=C.addFighter(s,'Maître'),dst=C.addFighter(s,'Cible');const a={id:'v118',round:s.round,sourceId:src,targetId:dst,name,approach:'esquiver',options};s.actions.push(a);return {s,src,dst,a};}
{
 const {s,dst,a}=setup('Mords la poussière'),e=C.propose(s,a);
 assert.deepEqual(Array.from(e,x=>x.kind),['status_add','block_next']);
 assert.throws(()=>C.commit(s,{[e[0].id]:false}),/accepter ou refuser/);
 C.commit(s);assert(C.fighter(s,dst).statuses.includes('gene'));
 assert(C.fighter(s,dst).bonuses.some(x=>x.type==='blocked'&&x.approach==='defendre'));
 C.undo(s);assert(!C.fighter(s,dst).statuses.includes('gene'));
}
{
 const {s,src,dst,a}=setup('Arc de foudre',{condition:'Fragile'});
 assert.throws(()=>C.propose(s,a),/engagé/);
 C.setEngagement(s,src,dst,true);
 assert.throws(()=>C.propose(s,a),/Avancer et attaquer/);
 s.actions.push({id:'ennemi',round:s.round,sourceId:dst,targetId:src,name:'Frapper',approach:'attaquer',options:{}});
 const e=C.propose(s,a);assert.deepEqual(Array.from(e,x=>x.kind),['fatigue','condition']);
 assert.throws(()=>C.commit(s,{[e[0].id]:false}),/accepter ou refuser/);
 C.commit(s);assert.equal(C.fighter(s,src).fatigue,1);assert(C.fighter(s,dst).conditions.includes('Fragile'));
 C.undo(s);assert.equal(C.fighter(s,src).fatigue,0);
}
{
 const {s,src,dst,a}=setup('Arc de foudre',{condition:'Fragile'});
 C.setEngagement(s,src,dst,true);C.fighter(s,dst).conditions=['Confus','Coupable'];
 s.actions.push({id:'ennemi',round:s.round,sourceId:dst,targetId:src,name:'Frapper',approach:'attaquer',options:{}});
 assert(C.propose(s,a).some(e=>e.kind==='status_add'&&e.detail==='etourdi'));
}
console.log('OK V1.18 : Mords la poussière, Arc de foudre, garde-fous, indivisibilité, annulation');
