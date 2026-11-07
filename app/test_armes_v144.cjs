const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(){const s=C.createCombat(),a=C.addFighter(s,'Riposteur'),b=C.addFighter(s,'Assaillant');s.phase='defendre';C.fighter(s,a).approach='defendre';C.fighter(s,b).approach='attaquer';C.setEngagement(s,a,b,true);const act={id:'v144',sourceId:a,targetId:b,name:'Contre-attaque',round:s.round,options:{weaponCounterConfirmed:true,choice:'fatigue'}};s.actions.push(act);C.propose(s,act);return {s,a,b};}
{const {s,a,b}=setup();C.fighter(s,b).approach='esquiver';assert.throws(()=>C.commit(s),/modifié avant validation/);assert.strictEqual(C.fighter(s,b).fatigue,0);C.fighter(s,b).approach='attaquer';C.commit(s);assert.strictEqual(C.fighter(s,b).fatigue,2);}
{const {s,a,b}=setup();s.engagements=[];assert.throws(()=>C.commit(s),/modifié avant validation/);assert.strictEqual(C.fighter(s,b).fatigue,0);}
{const {s,a,b}=setup();C.fighter(s,a).conditions.push('Confus');assert.throws(()=>C.commit(s),/statut négatif/);assert.strictEqual(C.fighter(s,b).fatigue,0);}
{const {s,a,b}=setup();C.fighter(s,b).approach='esquiver';const decisions=Object.fromEntries(s.proposals.map(e=>[e.id,false]));C.commit(s,decisions);assert.strictEqual(C.fighter(s,b).fatigue,0);}
console.log('V1.44 : Contre-attaque, revalidation à la confirmation et refus intégral');
