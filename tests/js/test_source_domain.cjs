'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {loadDomain}=require('../../src/domain/index.cjs');
const {loadLegacyApplication,observeContracts}=require('../support/legacy-application.cjs');
const {exerciseContracts}=require('../support/contract-scenario.cjs');
const {ROOT}=require('../../scripts/architecture/assemble.cjs');
const plain=x=>JSON.parse(JSON.stringify(x));let count=0;
function test(name,fn){fn();count++;console.log('OK '+name);}
function memory(){const values=new Map();return {values,fail:null,getItem:k=>values.get(k)??null,setItem(k,v){if(k===this.fail)throw Error('Quota synthétique');values.set(k,String(v));},removeItem(k){if(k===this.fail)throw Error('Retrait refusé');values.delete(k);}};}
test('80 entrées, champs, clés et identifiants identiques entre sources et HTML',()=>{
 const noAccess=()=>{throw Error('Accès interdit au chargement');};const storage={getItem:noAccess,setItem:noAccess,removeItem:noAccess};
 assert.deepEqual(plain(observeContracts(loadDomain({storage}))),plain(observeContracts(loadLegacyApplication({storage}))));
});
test('même scénario complet depuis les sources et le HTML : états, erreurs et undo identiques',()=>{
 assert.deepEqual(exerciseContracts(loadDomain()),exerciseContracts(loadLegacyApplication()));
});
test('import Node sans HTML, gabarit, style ni sources UI',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'avatar-domain-'));
 try {
  fs.cpSync(path.join(ROOT,'src'),path.join(root,'src'),{recursive:true});fs.rmSync(path.join(root,'src/interface'),{recursive:true});
  assert.equal(fs.existsSync(path.join(root,'app')),false);const a=loadDomain({root});assert.equal(a.catalog.length,111);assert.ok(exerciseContracts(a).roundtrip);
 } finally {fs.rmSync(root,{recursive:true,force:true});}
});
test('les domaines chargés sont isolés : aucune mutation de catalogue partagée',()=>{
 const a=loadDomain(),b=loadDomain();a.catalog[0].nom='Modification de fixture';assert.notEqual(b.catalog[0].nom,a.catalog[0].nom);assert.equal(b.persistence,null);
});
test('sauvegarde puis reprise après quota : mêmes chaînes et notifications',()=>{
 function run(load){
  const storage=memory(),a=load({storage}),p=a.persistence,c=exerciseContracts(a);
  const before=JSON.stringify([...storage.values]);assert.equal(before,'[]');
  assert.equal(p.persistCompleteBackup(c.library,c.combat),true);storage.fail=p.COMBAT_KEYS[0];
  const changed=plain(c.library);changed.futureLibrary.extra=true;assert.equal(p.persistCompleteBackup(changed,c.combat),false);
  storage.fail=null;assert.equal(p.recoverIncompleteImport(),true);
  return {entries:[...storage.values],warnings:a.warnings,notices:[...a.notices].map(([k,v])=>[k,{...v}])};
 }
 assert.deepEqual(run(loadDomain),run(loadLegacyApplication));
});
test('reprise bloquée depuis les sources : aucune écriture implicite',()=>{
 const storage=memory(),a=loadDomain({storage,recoveryOk:false});assert.equal(a.persistence.persistCompleteBackup({},{}),false);assert.equal(storage.values.size,0);
});
console.log(count+' scénarios de domaine importable réussis');
