const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
// Dépense d'armure inutile refusée, sans modifier la réserve ni l'historique.
{const s=C.createCombat(),id=C.addFighter(s,'Terre');s.phase='resolution';s.temporaryEffects.push({id:'a',originLabel:'Armure de terre',targetId:id,armorPoints:3,label:'Armure'});assert.throws(()=>C.resolveEarthArmorHit(s,'a','fatigue',1,2,true),/dépense supérieure/);assert.equal(s.temporaryEffects[0].armorPoints,3);assert.equal(s.snapshots.length,0);const r=C.resolveEarthArmorHit(s,'a','fatigue',3,2,true);assert.equal(r.residual,0);C.undo(s);assert.equal(s.temporaryEffects[0].armorPoints,3);}
// Escalier : le désengagement entre préparation et validation invalide le paiement.
{const s=C.createCombat(),a=C.addFighter(s,'Terre'),b=C.addFighter(s,'Adversaire');C.setEngagement(s,a,b,true);s.phase='defendre';const action={id:'stairs',name:'Escalier de poussière',sourceId:a,targetId:b,options:{earthStairsConfirmed:true,earthStairsBlocker:b}};s.actions.push(action);const events=C.propose(s,action);assert(events.some(e=>e.kind==='fatigue'&&e.targetId===b));s.engagements=[];assert.throws(()=>C.commit(s),/désengagé avant validation/);assert.equal(C.fighter(s,b).fatigue,0);assert.equal(s.proposals.length,events.length);const reject=Object.fromEntries(s.proposals.map(e=>[e.id,false]));C.commit(s,reject);assert.equal(C.fighter(s,b).fatigue,0);}
console.log('V1.77 : Escalier et économie de réserve OK');
