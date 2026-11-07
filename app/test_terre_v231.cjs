const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(){const s=C.createCombat(),a=C.addFighter(s,'Terre'),b=C.addFighter(s,'Ennemi');return {s,a,b};}
function unchanged(s,fn){const before=JSON.stringify(s);assert.throws(fn);assert.strictEqual(JSON.stringify(s),before);}
// Erreur tardive : après insertion du repère et consommation de son identifiant.
{const {s,a}=setup();s.history=null;unchanged(s,()=>C.addTemporaryEffect(s,a,'Repère','round'));}
// Erreur tardive : après changement du libellé, de la durée et de la provenance.
{const {s,a}=setup();const id=C.addTemporaryEffect(s,a,'Ancien','round');s.history=null;unchanged(s,()=>C.editTemporaryEffect(s,id,'Nouveau','scene'));}
// Erreur tardive : après retrait des entraves, quand la justification doit être écrite.
{const {s,a,b}=setup();s.temporaryEffects.push({id:'metal',originLabel:'Entraves de métal',targetId:b,originSourceId:a,label:'Entraves',metalGrantedAdvantage:true});C.fighter(s,b).statuses.push('gene');C.fighter(s,a).statuses.push('avantage');s.history=null;unchanged(s,()=>C.releaseEarthMetal(s,'metal','mj_release',true));}
// Opérations valides : création, édition, libération et annulation indépendantes.
{const {s,a,b}=setup();const id=C.addTemporaryEffect(s,a,'Ancien','round');assert(C.editTemporaryEffect(s,id,'Nouveau','scene'));assert.equal(s.temporaryEffects[0].label,'Nouveau');assert(C.undo(s));assert.equal(s.temporaryEffects[0].label,'Ancien');assert(C.undo(s));assert.equal(s.temporaryEffects.length,0);s.temporaryEffects.push({id:'metal',originLabel:'Entraves de métal',targetId:b,originSourceId:a,label:'Entraves'});C.fighter(s,b).statuses.push('gene');assert(C.releaseEarthMetal(s,'metal','mj_release',true));assert(s.history.at(-1).events[0].reason.includes('libération narrative'));assert(C.undo(s));assert(C.fighter(s,b).statuses.includes('gene'));}
console.log('V2.31 : création/édition des effets et libération du métal atomiques OK');
