const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(){let s=C.createCombat(),a=C.addFighter(s,'Terre'),b=C.addFighter(s,'Cible');return {s,a,b};}
function effect(s,props){s.temporaryEffects.push({id:'scene'+s.seq++,duration:'scene',label:'Test',...props});}
// Bouclier + armure + étoile : la nouvelle scène supprime les effets ET leurs statuts.
{const {s,a,b}=setup();C.fighter(s,b).statuses.push('gene');C.fighter(s,a).statuses.push('avantage');
 effect(s,{originLabel:'Bouclier de roche',targetId:b,originSourceId:a,shieldGrantedGene:true});
 effect(s,{originLabel:'Armure de terre',targetId:a,originSourceId:a,armorPoints:2,armorGrantedAdvantage:true});
 effect(s,{originLabel:'Étoile de lave',targetId:a,originSourceId:a,lavaExternalAdvantage:false});
 const before=JSON.stringify(s);assert.equal(C.newScene(s),2);assert.equal(s.temporaryEffects.length,0);assert(!C.fighter(s,b).statuses.includes('gene'));assert(!C.fighter(s,a).statuses.includes('avantage'));assert.equal(s.snapshots.length,1);assert.equal(s.history.length,1);assert(C.undo(s));assert.equal(JSON.stringify(s),before);}
// Une source indépendante d'Avantagé et de Gêné doit survivre.
{const {s,a,b}=setup();C.fighter(s,b).statuses.push('gene');C.fighter(s,a).statuses.push('avantage');
 effect(s,{originLabel:'Bouclier de roche',targetId:b,originSourceId:a,shieldGrantedGene:false,shieldExternalGene:true});
 effect(s,{originLabel:'Armure de terre',targetId:a,originSourceId:a,armorPoints:2,armorGrantedAdvantage:false,armorExternalAdvantage:true});
 C.newScene(s);assert(C.fighter(s,b).statuses.includes('gene'));assert(C.fighter(s,a).statuses.includes('avantage'));}
// Référence corrompue : la transition doit être atomique et conserver les snapshots.
{const {s,a,b}=setup();effect(s,{originLabel:'Bouclier de roche',targetId:b,originSourceId:a,shieldGrantedGene:true});effect(s,{originLabel:'Bouclier de roche',targetId:'absent',originSourceId:a,shieldGrantedGene:true});const before=JSON.stringify(s);assert.throws(()=>C.newScene(s));assert.equal(JSON.stringify(s),before);}
console.log('V2.28 : scène, protections persistantes, sources indépendantes, atomicité et undo OK');
