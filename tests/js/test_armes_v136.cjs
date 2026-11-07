'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function scene(name,options){const s=C.createCombat(),a=C.addFighter(s,'Armes'),b=C.addFighter(s,'Ennemi');const act={id:'arme',round:s.round,sourceId:a,targetId:b,name,approach:'attaquer',options};s.actions.push(act);return {s,a,b,act}}
function check(name,options,expect){const {s,a,b,act}=scene(name,options);const events=C.propose(s,act);assert.equal(events.length,expect);C.commit(s);return {s,a,b}}
{
 const {s,a,b}=check('Estocade précise',{weaponPiercingConfirmed:true,weaponMoveExtra:false},3);
 assert.equal(C.fighter(s,a).fatigue,1);assert.equal(C.fighter(s,b).fatigue,2);assert(C.fighter(s,b).statuses.includes('gene'));
 C.undo(s);assert.equal(C.fighter(s,a).fatigue,0);assert.equal(C.fighter(s,b).fatigue,0);
}
{
 const {s,a,b,act}=scene('Estocade précise',{weaponPiercingConfirmed:true,weaponMoveExtra:true,weaponMoveConfirmed:true,weaponMoveBlocked:false});
 C.propose(s,act);const bundle=s.proposals.filter(e=>e.reason.startsWith('Estocade précise :'));assert.equal(bundle.length,5);
 assert.throws(()=>C.commit(s,{[bundle[0].id]:false}),/accepter ou refuser tous/);
 C.commit(s);assert.equal(C.fighter(s,a).fatigue,2);
}
{
 const {s,a,b,act}=scene('Estocade précise',{weaponPiercingConfirmed:true,weaponMoveExtra:true,weaponMoveConfirmed:true,weaponMoveBlocked:true,weaponBlockerId:''});
 act.options.weaponBlockerId=b;
 assert.throws(()=>C.propose(s,act),/bloqueur/);
 C.setEngagement(s,a,b,true);C.propose(s,act);C.commit(s);assert.equal(C.fighter(s,b).fatigue,3);
}
for(const cost of [1,3]){
 const {s,a,b}=check('Clouer une mouche contre un tronc d’arbre',{weaponArrowsConfirmed:true,weaponArrowCost:cost},cost===1?2:3);
 assert.equal(C.fighter(s,a).fatigue,cost);assert(C.fighter(s,b).statuses.includes('gene'));assert.equal(C.fighter(s,b).statuses.includes('piege'),cost===3);
}
{
 const {s,a}=check('Position surélevée',{weaponHighGroundConfirmed:true},3);
 assert.equal(C.fighter(s,a).fatigue,1);assert(C.fighter(s,a).statuses.includes('avantage')||C.fighter(s,a).activeStatuses.includes('avantage'));
 assert(s.notes.some(n=>n.includes('Position surélevée')));
}
for(const [name,opts] of [['Estocade précise',{weaponMoveExtra:false}],['Clouer une mouche contre un tronc d’arbre',{weaponArrowCost:2}],['Position surélevée',{}]]){
 const {s,act}=scene(name,opts);assert.throws(()=>C.propose(s,act));
}
console.log('OK V1.36 : trois techniques d’armes, coûts, statut, déplacement, refus partiel et annulation');
