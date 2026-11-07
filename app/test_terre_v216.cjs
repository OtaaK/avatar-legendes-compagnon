const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(){const s=C.createCombat(),earth=C.addFighter(s,'Terre'),foe=C.addFighter(s,'Adversaire');return {s,earth,foe};}
function stable(s){return JSON.stringify(s);}
// Une entrave invalide parmi plusieurs ne doit pas libérer les autres ni créer de snapshot.
{const {s,earth,foe}=setup();s.temporaryEffects.push({id:'m1',originLabel:'Entraves de métal',originSourceId:earth,targetId:foe,metalGrantedAdvantage:false});s.temporaryEffects.push({id:'m2',originLabel:'Entraves de métal',originSourceId:earth,targetId:'absent',metalGrantedAdvantage:false});const before=stable(s);assert.throws(()=>C.endCombat(s,true),/Combattant inconnu/);assert.equal(stable(s),before);}
// Libération multiple réussie, avec une seule entrée d'historique et annulation complète.
{const {s,earth,foe}=setup();const foe2=C.addFighter(s,'Autre');for(const [i,id] of [foe,foe2].entries()){C.fighter(s,id).statuses.push('gene');s.temporaryEffects.push({id:'m'+i,originLabel:'Entraves de métal',originSourceId:earth,targetId:id,metalExternalGene:false,metalGrantedAdvantage:false});}const before=stable(s);assert.equal(C.endCombat(s,true),2);assert(!C.fighter(s,foe).statuses.includes('gene'));assert.equal(s.temporaryEffects.length,0);assert.equal(s.snapshots.length,1);C.undo(s);assert.equal(stable(s),before);}
// Changement de scène normal : restitution du matériel et suppression des pièges, annulables.
{const {s,earth}=setup();C.fighter(s,earth).equipmentDisabled=true;s.traps=[{id:'trap'}];const before=stable(s);assert.equal(C.newScene(s),2);assert.equal(C.fighter(s,earth).equipmentDisabled,false);assert.equal(s.traps.length,0);C.undo(s);assert.equal(stable(s),before);}
// Une anomalie pendant la transition doit restaurer tous les champs, y compris la scène.
{const {s}=setup();s.fighters.push(null);const before=stable(s);assert.throws(()=>C.newScene(s));assert.equal(stable(s),before);}
console.log('V2.16 : fin de combat multi-entraves atomique, scène atomique, échec et undo OK');