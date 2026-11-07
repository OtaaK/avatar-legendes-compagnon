const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(){const s=C.createCombat(),a=C.addFighter(s,'Riposteur'),b=C.addFighter(s,'Assaillant');s.phase='defendre';C.fighter(s,a).approach='defendre';C.fighter(s,b).approach='attaquer';C.setEngagement(s,a,b,true);const act={id:'v145',sourceId:a,targetId:b,name:'Contre-attaque',round:s.round,options:{weaponCounterConfirmed:true,choice:'fatigue'}};s.actions.push(act);return {s,a,b,act};}
// Un tableau de statuts actifs vide ne doit pas masquer les statuts persistés.
{const {s,a,act}=setup();C.fighter(s,a).activeStatuses=[];C.fighter(s,a).statuses=['gene'];assert.throws(()=>C.propose(s,act),/statut négatif/);}
{const {s,a,act}=setup();C.propose(s,act);C.fighter(s,a).activeStatuses=[];C.fighter(s,a).statuses=['piege'];assert.throws(()=>C.commit(s),/statut négatif/);}
{const {s,a,b,act}=setup();C.propose(s,act);C.commit(s);assert.strictEqual(C.fighter(s,b).fatigue,2);}
console.log('V1.45 : Contre-attaque, statuts persistés et actifs vérifiés conjointement');
