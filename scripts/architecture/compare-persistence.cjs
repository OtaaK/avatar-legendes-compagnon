'use strict';
// Contrôle ponctuel : nécessite le commit de référence dans l’historique local.
const {execFileSync}=require('node:child_process');
const assert=require('node:assert/strict');
const {readLegacyBlocks}=require('../../tests/support/legacy-application.cjs');
const {evaluateDomainBlocks}=require('../../scripts/architecture/domain-context.cjs');
const {loadDomain}=require('../../src/domain/index.cjs');
const old=readLegacyBlocks(execFileSync('git',['show','a8cbd38:app/simulateur.html'],{cwd:require('node:path').resolve(__dirname,'../..'),encoding:'utf8',maxBuffer:2000000}));
const L='avatar-roster-v020',C='avatar-v020',J='avatar-complete-import-journal-v1';
function run(load,failAt,permanent,initial,action,recoveryOk=true){
 const data=new Map(initial),calls=[];let n=0;
 function op(o,k,v){calls.push([o,k,...(o==='set'?[v]:[])]);n++;if(n===failAt||(permanent&&n>failAt))throw Error('Refus simulé');}
 const storage={getItem(k){op('get',k);return data.get(k)??null},setItem(k,v){op('set',k,v);data.set(k,v)},removeItem(k){op('remove',k);data.delete(k)}};
 const a=load({storage,recoveryOk});const result=action(a.persistence);
 return JSON.stringify({result,data:[...data],calls,warnings:a.warnings,notices:[...a.notices]});
}
const baseline=o=>evaluateDomainBlocks(old,o);let count=0;
function check(fail,permanent,initial,action,ok=true){assert.equal(run(loadDomain,fail,permanent,initial,action,ok),run(baseline,fail,permanent,initial,action,ok));count++;}
for(const permanent of [false,true])for(let fail=0;fail<=12;fail++)check(fail,permanent,[[L,'{"old":1}'],[C,'{"old":2}']],p=>p.persistCompleteBackup({unknown:{keep:true}},{history:[1]}));
for(const beforeLibrary of [null,'{"old":1}'])for(const beforeCombat of [null,'{"old":2}'])for(let fail=0;fail<=5;fail++)check(fail,false,[[J,JSON.stringify({version:1,beforeLibrary,beforeCombat})],[L,'new'],[C,'new']],p=>p.recoverIncompleteImport());
for(const raw of ['{','{}','{"version":2}','{"version":1,"beforeLibrary":42,"beforeCombat":null}'])check(0,false,[[J,raw]],p=>p.recoverIncompleteImport());
for(const initial of [[],[['a','{']],[['a','{'],['b','{"future":true}']]])check(0,false,initial,p=>p.loadSaved(['a','b'],x=>x,()=>null));
check(0,false,[],p=>[p.persist('x',{}),p.persistCompleteBackup({}, {})],false);
console.log(count+' comparaisons exactes avant/après : valeurs, ordre des opérations, erreurs et notifications identiques');
