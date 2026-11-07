const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function fixture(){const s=C.createCombat(),a=C.addFighter(s,'A'),b=C.addFighter(s,'B');s.phase='defendre';C.fighter(s,a).approach='defendre';C.fighter(s,b).approach='attaquer';C.setEngagement(s,a,b,true);return {s,a,b};}
function action(s,a,b,choice='fatigue',extra={}){return {id:'v143',sourceId:a,targetId:b,name:'Contre-attaque',round:s.round,options:{weaponCounterConfirmed:true,choice,condition:'Confus',...extra}};}
{
 const {s,a,b}=fixture(),act=action(s,a,b);s.actions.push(act);C.propose(s,act);
 assert.strictEqual(s.proposals.length,1);assert.strictEqual(s.proposals[0].kind,'fatigue');assert.strictEqual(s.proposals[0].targetId,b);assert.strictEqual(s.proposals[0].amount,2);
 C.commit(s);assert.strictEqual(C.fighter(s,a).fatigue,0);assert.strictEqual(C.fighter(s,b).fatigue,2);C.undo(s);assert.strictEqual(C.fighter(s,b).fatigue,0);
}
{
 const {s,a,b}=fixture(),act=action(s,a,b,'condition');C.propose(s,act);assert.strictEqual(s.proposals[0].detail,'Confus');C.fighter(s,b).approach='esquiver';assert.throws(()=>C.propose(s,act),/Avancer/);
 C.fighter(s,b).approach='attaquer';C.fighter(s,a).statuses.push('gene');assert.throws(()=>C.propose(s,act),/statut négatif/);
 C.fighter(s,a).statuses=[];C.fighter(s,a).conditions.push('Confus');assert.throws(()=>C.propose(s,act),/état coché/);
 C.fighter(s,a).conditions=[];assert.throws(()=>C.propose(s,action(s,a,b,'balance')),/imposer/);
 assert.throws(()=>C.propose(s,action(s,a,b,'fatigue',{weaponCounterConfirmed:false})),/confirmation MJ/);
}
{
 const {s,a,b}=fixture();s.engagements=[];assert.throws(()=>C.propose(s,action(s,a,b)),/engagé/);
}
console.log('V1.43 : Contre-attaque, cible, restrictions, Frapper renforcé, annulation');
