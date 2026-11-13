'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {APP_HTML}=require('../support/paths.cjs');
const {loadLegacyApplication,readLegacyBlocks}=require('../support/legacy-application.cjs');
const {exerciseContracts}=require('../support/contract-scenario.cjs');
const {checkContracts}=require('../../scripts/architecture/check-contracts.cjs');
let count=0;
function test(name,fn){fn();count++;console.log('OK '+name);}
const plain=x=>JSON.parse(JSON.stringify(x));
function memory(){
 const data=new Map(),calls=[];
 return {data,calls,fail:null,getItem(k){calls.push(['get',k]);if(this.fail==='read')throw Error('Lecture refusée');return data.get(k)??null;},
 setItem(k,v){calls.push(['set',k]);if(this.fail===k)throw Error('Quota synthétique');data.set(k,String(v));},
 removeItem(k){calls.push(['remove',k]);if(this.fail==='remove:'+k)throw Error('Retrait refusé');data.delete(k);}};
}
test('contrats observés : 80 entrées publiques, 111 techniques et dix Livrets',()=>{
 assert.deepEqual(checkContracts(),{referenceCommit:'55d56f6f0e49e6cb480099fd06282f85d889f0db',htmlIdenticalToReference:true,exportedEntries:80,catalogEntries:111,playbooks:10});
});
test('chargement métier sans DOM, stockage, démarrage UI ou persistance implicite',()=>{
 const a=loadLegacyApplication();assert.equal(a.persistence,null);assert.equal(a.warnings.length,0);
 assert.ok(a.validators.validateCombat(a.CombatCore.createCombat()));
 const s=memory();loadLegacyApplication({storage:s});assert.deepEqual(s.calls,[]);
});
test('contextes indépendants : pas de catalogue ni état global de test partagé',()=>{
 const a=loadLegacyApplication(),b=loadLegacyApplication();a.catalog[0].nom='Altération locale';
 assert.notEqual(b.catalog[0].nom,'Altération locale');
 const lib=a.Roster.createLibrary();a.Roster.createCharacter(lib,'Une fiche');assert.equal(b.Roster.createLibrary().characters.length,0);
});
const html=fs.readFileSync(APP_HTML,'utf8');
for(const [label,changed]of [
 ['script absent',html.replace('<script>','<x-script>').replace('</script>','</x-script>')],
 ['plusieurs scripts',html+'<script>throw Error("ne doit pas être exécuté")</script>'],
 ['script externe',html.replace('<script>','<script src="externe.js">')],
 ['repère absent',html.replace('const rosterClone=','const autreClone=')],
 ['repère dupliqué',html.replace('let s;','let s;\n// let s;')],
 ['repères inversés',html.replace('const rosterClone=','MARKER').replace('let lib=Roster.createLibrary();','const rosterClone=').replace('MARKER','let lib=Roster.createLibrary();')],
])test('refus explicite du chargement : '+label,()=>assert.throws(()=>readLegacyBlocks(changed)));
const result=exerciseContracts(loadLegacyApplication());
test('préréglage et aperçu : pas de mutation avant décision explicite',()=>{
 assert.equal(result.presetDoesNotMutate,true);assert.equal(result.previewDoesNotMutate,true);
});
test('import/export : identifiants, champs inconnus, manœuvre et maîtrise conservés',()=>{
 assert.equal(result.roundtrip,true);assert.deepEqual(result.library.futureLibrary,{keep:true});
 assert.deepEqual(result.library.characters[0].future,{keep:['champ inconnu']});
 assert.deepEqual(result.library.characters[0].playbookMoves,['Manœuvre personnelle']);
 assert.equal(result.library.characters[0].techniques[0].mastery,'maitrisee');
 assert.equal(result.library.characters[0].id,'char-1');
});
test('copie de combat indépendante, report explicite puis annulation conservée',()=>{
 assert.equal(result.independentSheet,true);assert.equal(result.explicitSyncFatigue,1);assert.equal(result.undoSucceeded,true);
 assert.equal(result.committed.fighters[1].fatigue,1);assert.equal(result.combat.fighters[1].fatigue,0);
 assert.equal(result.library.characters[1].fatigue,1);assert.deepEqual(result.combat.futureCombat,{keep:true});
});
test('frontière d’import sécurisée : même refus des identifiants piégés',()=>{
 assert.match(result.invalidIdError,/Identifiant de fiche invalide/);
 const a=loadLegacyApplication(),lib=a.Roster.createLibrary(),c=a.Roster.createCharacter(lib,'Test');
 const before=JSON.stringify(lib);assert.throws(()=>a.Roster.updateCharacter(lib,c.id,{id:'autre'}),/Identité/);assert.equal(JSON.stringify(lib),before);
});
test('contrat des liens : une référence orpheline reste refusée avant persistance',()=>{
 const a=loadLegacyApplication();assert.throws(()=>a.validators.validateBackupLinks({characters:[]},{fighters:[{characterId:'char-absent'}]}),/fiche absente/);
});
test('sauvegarde complète : journal puis deux clés, relecture avec vrais validateurs',()=>{
 const s=memory(),a=loadLegacyApplication({storage:s}),p=a.persistence;
 assert.equal(p.persistCompleteBackup(result.library,result.combat),true);
 assert.deepEqual(s.calls.filter(c=>c[0]!=='get'),[['set',p.COMPLETE_IMPORT_JOURNAL],['set',p.ROSTER_KEYS[0]],['set',p.COMBAT_KEYS[0]],['remove',p.COMPLETE_IMPORT_JOURNAL]]);
 assert.deepEqual(plain(p.loadSaved(p.ROSTER_KEYS,x=>a.Roster.importLibrary(x),()=>null)),result.library);
 assert.deepEqual(plain(p.loadSaved(p.COMBAT_KEYS,x=>a.validators.validateCombat(x),()=>null)),result.combat);
});
test('quota sur la seconde clé : valeurs précédentes et journal conservés pour reprise',()=>{
 const s=memory(),a=loadLegacyApplication({storage:s}),p=a.persistence;
 const oldLibrary=JSON.stringify(a.Roster.createLibrary()),oldCombat=JSON.stringify(a.CombatCore.createCombat());
 s.data.set(p.ROSTER_KEYS[0],oldLibrary);s.data.set(p.COMBAT_KEYS[0],oldCombat);s.fail=p.COMBAT_KEYS[0];
 assert.equal(p.persistCompleteBackup(result.library,result.combat),false);
 assert.equal(s.data.get(p.ROSTER_KEYS[0]),oldLibrary);assert.equal(s.data.get(p.COMBAT_KEYS[0]),oldCombat);
 assert.ok(s.data.has(p.COMPLETE_IMPORT_JOURNAL));assert.ok(a.warnings.some(x=>x.includes('Quota')));
 s.fail=null;assert.equal(p.recoverIncompleteImport(),true);assert.equal(s.data.has(p.COMPLETE_IMPORT_JOURNAL),false);
});
test('reprise préalable refusée : aucune écriture de sauvegarde complète',()=>{
 const s=memory(),a=loadLegacyApplication({storage:s,recoveryOk:false});
 assert.equal(a.persistence.persistCompleteBackup(result.library,result.combat),false);assert.deepEqual(s.calls,[]);
});
test('dernière clé corrompue : repli explicite vers une version ancienne sans écriture',()=>{
 const s=memory(),a=loadLegacyApplication({storage:s}),p=a.persistence;
 s.data.set(p.ROSTER_KEYS[0],'{invalide');s.data.set(p.ROSTER_KEYS[1],JSON.stringify(result.library));
 const restored=p.loadSaved(p.ROSTER_KEYS,x=>a.Roster.importLibrary(x),()=>null);
 assert.deepEqual(plain(restored),result.library);assert.equal(s.calls.filter(c=>c[0]!=='get').length,0);
});
test('journal invalide : conservé et erreur signalée, pas de remplacement des données',()=>{
 const s=memory(),a=loadLegacyApplication({storage:s}),p=a.persistence;
 s.data.set(p.COMPLETE_IMPORT_JOURNAL,'{}');s.data.set(p.ROSTER_KEYS[0],'original');
 assert.equal(p.recoverIncompleteImport(),false);assert.equal(s.data.get(p.COMPLETE_IMPORT_JOURNAL),'{}');
 assert.equal(s.data.get(p.ROSTER_KEYS[0]),'original');assert.equal(s.calls.filter(c=>c[0]!=='get').length,0);assert.ok(a.warnings.length);
});
test('lecture indisponible : défaut explicite sans tentative d’écriture',()=>{
 const s=memory(),a=loadLegacyApplication({storage:s}),p=a.persistence;s.fail='read';
 assert.equal(p.loadSaved(p.ROSTER_KEYS,x=>x,()=>null),null);assert.ok(a.warnings.length);
 assert.equal(s.calls.filter(c=>c[0]!=='get').length,0);
});
console.log(count+' scénarios de contrats et frontières réussis');
