'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {ROOT}=require('../support/paths.cjs');
const {readFixture,runFixture}=require('../support/source-fixtures.cjs');
let count=0;function test(name,fn){fn();count++;console.log('OK '+name);}
function fixture(fn){const root=fs.mkdtempSync(path.join(os.tmpdir(),'avatar-fixtures-'));try{fs.cpSync(path.join(ROOT,'src'),path.join(root,'src'),{recursive:true});return fn(root)}finally{fs.rmSync(root,{recursive:true,force:true})}}
test('nom inconnu ou chemin arbitraire : refus avant exécution',()=>{for(const name of ['../app/simulateur.html','__proto__',null])assert.throws(()=>runFixture(name,{}),/inconnue/)});
test('les commandes se chargent sans état, stockage, DOM ni HTML',()=>fixture(root=>{
 fs.rmSync(path.join(root,'src/interface/template.html'));const ctx={};for(const key of ['document','localStorage','lib','s'])Object.defineProperty(ctx,key,{get(){throw Error('Accès interdit '+key)}});
 runFixture('commands',ctx,{root});assert.equal(typeof ctx.commitCombatMutation,'function');assert.equal(fs.existsSync(path.join(root,'app')),false);
}));
test('persistance : aucun accès au stockage ou au DOM au chargement',()=>{const ctx={};for(const key of ['localStorage','document'])Object.defineProperty(ctx,key,{get(){throw Error('Accès interdit')}});runFixture('persistence',ctx);assert.equal(typeof ctx.persistCompleteBackup,'function')});
test('port explicite conservé après le chargement des ponts complets',()=>{const saveLibrary=()=>true,ctx={saveLibrary};runFixture('commands',ctx,{preserve:['saveLibrary']});assert.equal(ctx.saveLibrary,saveLibrary);assert.equal(typeof ctx.commitLibraryMutation,'function')});
test('port absent ou liste dupliquée : refus avant création de fonctions',()=>{const ctx={};assert.throws(()=>runFixture('commands',ctx,{preserve:['saveLibrary']}),/absent/);assert.equal(ctx.commitLibraryMutation,undefined);assert.throws(()=>runFixture('commands',{}, {preserve:['x','x']}),/invalides/)});
test('instances indépendantes : un refus ne contamine pas le scénario suivant',()=>{
 const create=fail=>({s:{round:1},persist:()=>!fail,originalRender:()=>{}}),a=create(true),b=create(false);runFixture('commands',a);runFixture('commands',b);
 assert.throws(()=>a.commitCombatMutation(()=>a.s.round++),/annulée/);b.commitCombatMutation(()=>b.s.round++);assert.equal(a.s.round,1);assert.equal(b.s.round,2);
});
test('source manquante : erreur, aucun repli vers le HTML',()=>fixture(root=>{fs.rmSync(path.join(root,'src/commands/mutation.js'));assert.throws(()=>readFixture('commands',{root}),/ENOENT/)}));
test('source invalide : refus explicite, port de test conservé',()=>fixture(root=>{
 fs.writeFileSync(path.join(root,'src/interface/commands.js'),'function {');const saveLibrary=()=>true,ctx={saveLibrary};assert.throws(()=>runFixture('commands',ctx,{root,preserve:['saveLibrary']}),/Unexpected/);assert.equal(ctx.saveLibrary,saveLibrary);
}));
test('fiche complète : définitions sans démarrage et doubles restaurés',()=>{
 const forbidden=()=>{throw Error('Effet interdit au chargement')},ctx={saveLibrary:forbidden,renderSheets:forbidden,restoreNpcSessionLocation:forbidden,render:forbidden};
 Object.defineProperty(ctx,'document',{get:forbidden});runFixture('sheet-sync',ctx,{preserve:['saveLibrary','renderSheets','restoreNpcSessionLocation','render']});assert.equal(ctx.renderSheets,forbidden);assert.equal(typeof ctx.syncSheet,'function');
});
console.log(count+' scénarios de fixtures sources réussis');
