'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
let count=0;function test(name,run){try{run();count++;}catch(e){e.message=name+' : '+e.message;throw e;}}
function setup(){const s=C.createCombat(),a=C.addFighter(s,'PNJ'),b=C.addFighter(s,'Autre');C.renameScene(s,'Avant modification');return {s,a,b};}
function unchanged(s,run,pattern){const before=JSON.stringify(s);assert.throws(run,pattern);assert.equal(JSON.stringify(s),before);}
test('édition de préparation et annulation exacte',()=>{const {s,a}=setup();const before=JSON.stringify(s);C.updateFighter(s,a,{name:' Garde ',fatigue:2,balance:1,materials:3,conditions:['Confus'],statuses:['pret']});const f=C.fighter(s,a);assert.equal(f.name,'Garde');assert.equal(f.fatigue,2);assert.equal(f.balance,1);assert.equal(f.materials,3);assert(f.conditions.includes('Confus'));assert(f.statuses.includes('pret'));assert.equal(s.history.at(-1).events[0].kind,'fighter_edit');assert(C.undo(s));assert.equal(JSON.stringify(s),before);assert(C.undo(s));assert.equal(s.sceneTitle,'');});
for(const patch of [{name:''},{name:'x'.repeat(101)},{fatigue:6},{fatigue:-1},{fatigue:1.5},{balance:4},{materials:-1},{conditions:['Inventé']},{conditions:['Confus','Confus']},{statuses:['inconnu']},{kind:'PJ'},{characterId:'autre'}])test('validation '+JSON.stringify(patch),()=>{const {s,a}=setup();unchanged(s,()=>C.updateFighter(s,a,patch));});
test('erreur tardive restaure les instantanés précédents',()=>{const {s,a}=setup();s.history=null;unchanged(s,()=>C.updateFighter(s,a,{name:'Nouveau'}));assert.equal(s.snapshots.length,1);});
test('aucune édition après révélation',()=>{const {s,a}=setup();s.phase='defendre';unchanged(s,()=>C.updateFighter(s,a,{fatigue:1}),/avant la révélation/);});
test('actions et propositions en attente protégées',()=>{for(const field of ['actions','proposals']){const {s,a}=setup();s[field].push({id:'pending'});unchanged(s,()=>C.updateFighter(s,a,{fatigue:1}),/sans action en attente/);}});
test('métal verrouille Gêné',()=>{const {s,a,b}=setup();C.fighter(s,b).statuses.push('gene');s.temporaryEffects.push({id:'metal',originLabel:'Entraves de métal',targetId:b,originSourceId:a});unchanged(s,()=>C.updateFighter(s,b,{statuses:[]}),/effet actif/);});
test('armure verrouille Avantagé sans empêcher le nom',()=>{const {s,a}=setup();C.fighter(s,a).statuses.push('avantage');s.temporaryEffects.push({id:'armor',originLabel:'Armure de terre',targetId:a,armorPoints:3});unchanged(s,()=>C.updateFighter(s,a,{statuses:[]}),/effet actif/);C.updateFighter(s,a,{name:'Maître'});assert(C.fighter(s,a).statuses.includes('avantage'));assert.equal(s.temporaryEffects[0].armorPoints,3);});
test('nouveau statut invalide une déclaration déjà faite',()=>{const {s,a}=setup();C.declare(s,a,'attaquer','10+');C.updateFighter(s,a,{statuses:['piege']});assert.equal(C.fighter(s,a).approach,null);assert.throws(()=>C.declare(s,a,'attaquer','10+'),/Piégé/);});
test('le lien permanent est conservé',()=>{const {s,a}=setup();C.fighter(s,a).characterId='char-1';C.updateFighter(s,a,{name:'Copie de combat',fatigue:1});assert.equal(C.fighter(s,a).characterId,'char-1');});
test('équipement hors service ne gagne pas de matériels',()=>{const {s,a}=setup();C.fighter(s,a).equipmentDisabled=true;unchanged(s,()=>C.updateFighter(s,a,{materials:2}),/hors service/);});
console.log('Retours recette V2.33 : '+count+' scénarios de modification de combattant, validations, effets protégés et undo OK');
