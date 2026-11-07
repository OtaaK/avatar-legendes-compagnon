const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(){const s=C.createCombat(),a=C.addFighter(s,'Terre'),b=C.addFighter(s,'Ennemi');C.renameScene(s,'Ancienne scène');return {s,a,b};}
function unchanged(s,fn){const before=JSON.stringify(s);assert.throws(fn);assert.equal(JSON.stringify(s),before);}
// L'historique invalide fait échouer tardivement une dépense d'armure, même à zéro point restant.
{const {s,a}=setup();s.temporaryEffects.push({id:'armor',originLabel:'Armure de terre',targetId:a,originSourceId:a,armorPoints:1,label:'Armure',duration:'scene'});C.fighter(s,a).statuses.push('avantage');s.history=null;unchanged(s,()=>C.spendEarthArmor(s,'armor','fatigue',true));}
// La libération d'entraves modifie Gêné et les provenances avant l'écriture dans l'historique.
{const {s,a,b}=setup();s.temporaryEffects.push({id:'metal',originLabel:'Entraves de métal',targetId:b,originSourceId:a,metalGrantedAdvantage:true,metalExternalAdvantage:false,metalExternalGene:false,label:'Entraves',duration:'scene'});C.fighter(s,b).statuses.push('gene');C.fighter(s,a).statuses.push('avantage');s.history=null;unchanged(s,()=>C.removeTemporaryEffect(s,'metal'));}
// Une révocation manuelle d'armure ne peut laisser Avantagé retiré en cas d'échec.
{const {s,a}=setup();s.temporaryEffects.push({id:'armor',originLabel:'Armure de terre',targetId:a,originSourceId:a,armorPoints:2,label:'Armure',duration:'scene'});C.fighter(s,a).statuses.push('avantage');s.history=null;unchanged(s,()=>C.removeTemporaryEffect(s,'armor'));}
// Les opérations réussies restent annulables.
{const {s,a}=setup();s.temporaryEffects.push({id:'armor',originLabel:'Armure de terre',targetId:a,originSourceId:a,armorPoints:2,label:'Armure',duration:'scene'});C.spendEarthArmor(s,'armor','condition',true);assert.equal(s.temporaryEffects[0].armorPoints,1);assert(C.undo(s));assert.equal(s.temporaryEffects[0].armorPoints,2);}
{const {s,a,b}=setup();s.temporaryEffects.push({id:'metal',originLabel:'Entraves de métal',targetId:b,originSourceId:a,label:'Entraves',duration:'scene'});C.fighter(s,b).statuses.push('gene');C.removeTemporaryEffect(s,'metal');assert(!C.fighter(s,b).statuses.includes('gene'));assert(C.undo(s));assert(C.fighter(s,b).statuses.includes('gene'));}
console.log('V2.30 : transactions atomiques et undo des protections et entraves OK');
