const assert=require('assert'),fs=require('fs'),vm=require('vm');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
const s=C.createCombat(),a=C.addFighter(s,'Maître de terre');
// Une activation déjà active est bloquée à la proposition, sans mutation.
s.temporaryEffects.push({id:'armor-existing',targetId:a,originLabel:'Armure de terre',armorPoints:2});
const action={id:'new-armor',sourceId:a,targetId:a,name:'Armure de terre',options:{earthArmorConfirmed:true}};
const before=JSON.stringify(s);
assert.throws(()=>C.propose(s,action),/réserve déjà active/);assert.strictEqual(JSON.stringify(s),before);
// Une proposition préparée AVANT la création d'une armure doit être refusée à la validation.
s.actions.push(action);s.proposals.push({id:'armor-event',actionId:action.id,sourceId:a,targetId:a,kind:'status_add',detail:'avantage',reason:'Armure de terre : Avantagé'});
const pending=JSON.stringify(s);assert.throws(()=>C.commit(s,{}),/armure avec réserve est déjà active/);assert.strictEqual(JSON.stringify(s),pending);
// Refus complet autorisé ; aucune nouvelle réserve créée.
C.commit(s,{'armor-event':false});assert.strictEqual(s.temporaryEffects.length,1);
// Deux propositions simultanées pour le même combattant sont interdites.
const s2=C.createCombat(),b=C.addFighter(s2,'Terre');
for(let i=1;i<=2;i++){s2.actions.push({id:'a'+i,sourceId:b,targetId:b,name:'Armure de terre',options:{earthArmorConfirmed:true}});s2.proposals.push({id:'e'+i,actionId:'a'+i,sourceId:b,targetId:b,kind:'status_add',detail:'avantage',reason:'Armure de terre : Avantagé'});}
const prior=JSON.stringify(s2);assert.throws(()=>C.commit(s2,{}),/armure avec réserve est déjà active/);assert.strictEqual(JSON.stringify(s2),prior);
console.log('V1.84 : unicité de réserve Armure de terre et validation atomique OK');