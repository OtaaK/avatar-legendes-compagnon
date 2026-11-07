const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function check(label,setup,invoke){
 const s=C.createCombat();const a=C.addFighter(s,'Terre');const b=C.addFighter(s,'Adversaire');
 s.snapshots.push({checkpoint:'ancien',round:0});s.history.push({round:0,events:[]});
 setup(s,a,b);const baseline=JSON.stringify(s);
 // L'historique corrompu permet de provoquer une erreur après les effets métier.
 s.history.push=null;const corrupted=JSON.stringify(s);
 assert.throws(()=>invoke(s,a,b),/push is not a function/,label);
 assert.equal(JSON.stringify(s),corrupted,label+' : restauration intégrale, y compris les anciens snapshots');
 assert.equal(s.snapshots.length,1,label+' : ancien point de restauration conservé');
 // Une fois l'historique réparé, la même transition doit aboutir et être annulable.
 s.history.push=Array.prototype.push;invoke(s,a,b);
 assert.equal(s.snapshots.length,2,label+' : nouvel instantané');
 C.undo(s);assert.equal(JSON.stringify(s),baseline,label+' : annulation fidèle');
}
check('Fin de passe',(s,a,b)=>{s.phase='esquiver';C.fighter(s,a).fatigue=2;C.fighter(s,a).activeStatuses=['renforce'];},s=>C.endRound(s));
check('Nouvelle scène',(s,a,b)=>{s.traps.push({id:'t1'});C.fighter(s,a).equipmentDisabled=true;},s=>C.newScene(s));
check('Fin de combat',(s,a,b)=>{C.fighter(s,b).statuses.push('gene');s.temporaryEffects.push({id:'m1',originLabel:'Entraves de métal',targetId:b,originSourceId:a,metalExternalGene:false});},s=>C.endCombat(s,true));
console.log('V2.18 : rollback intégral fin de passe, fin de combat, scène et undo OK');
