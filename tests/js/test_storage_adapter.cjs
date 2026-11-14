'use strict';
const assert=require('node:assert/strict');
const {createPersistence}=require('../../src/persistence/index.cjs');
const L='avatar-roster-v020',C='avatar-v020',J='avatar-complete-import-journal-v1';
let count=0;
function test(name,fn){fn();count++;console.log('OK '+name);}
function setup(initial=[],fail=()=>false){
 const values=new Map(initial),calls=[],errors=[],recoveries=[],invalid=[];let allowed=true;
 function operation(op,key,value){calls.push([op,key,...(op==='set'?[value]:[])]);if(fail(op,key,calls))throw Error('Refus simulé');}
 const storage={getItem(k){operation('get',k);return values.get(k)??null;},setItem(k,v){operation('set',k,v);values.set(k,v);},removeItem(k){operation('remove',k);values.delete(k);}};
 const service=createPersistence({storage:()=>storage,recoveryAllowed:()=>allowed,onError:e=>errors.push(e.message),onRecovery:x=>recoveries.push(x),onInvalid:x=>invalid.push(x)});
 return {service,values,calls,errors,recoveries,invalid,block(){allowed=false;}};
}
const old=[[L,'{"oldLibrary":true}'],[C,'{"oldCombat":true}']];
const library={version:1,characters:[],future:{nested:['inconnu']}},combat={version:1,fighters:[],history:[{unknown:true}]};
test('création et import sans DOM ni accès au stockage',()=>{
 let calls=0;createPersistence({storage:()=>{calls++;throw Error('interdit');}});assert.equal(calls,0);
});
test('écriture complète : ordre exact et champs inconnus intacts',()=>{
 const t=setup(old);assert.equal(t.service.persistCompleteBackup(library,combat),true);
 assert.deepEqual(t.calls.map(x=>x.slice(0,2)),[['get',L],['get',C],['set',J],['set',L],['set',C],['remove',J]]);
 assert.deepEqual(JSON.parse(t.values.get(L)),library);assert.deepEqual(JSON.parse(t.values.get(C)),combat);assert.equal(t.values.has(J),false);
});
test('reprise bloquée : refus des deux types d’écriture, aucune opération',()=>{
 const t=setup(old);t.block();assert.equal(t.service.persist('x',{}),false);assert.equal(t.service.persistCompleteBackup(library,combat),false);assert.deepEqual(t.calls,[]);assert.deepEqual([...t.values],old);
});
for(const [op,key] of [['get',L],['get',C],['set',J],['set',L],['set',C],['remove',J]]){
 test('refus ponctuel '+op+' '+key+' : import refusé et anciennes valeurs conservées',()=>{
  let failed=false;const t=setup(old,(o,k)=>{if(!failed&&o===op&&k===key){failed=true;return true;}return false;});
  assert.equal(t.service.persistCompleteBackup(library,combat),false);assert.equal(failed,true);assert.deepEqual([...t.values],old);assert.equal(t.errors.length,1);
 });
}
test('quota persistant : journal conservé, reprise possible avec une nouvelle instance',()=>{
 const t=setup(old,(op,k)=>op==='set'&&k===C);assert.equal(t.service.persistCompleteBackup(library,combat),false);assert.equal(t.values.has(J),true);
 const next=setup([...t.values]);assert.equal(next.service.recoverIncompleteImport(),true);assert.deepEqual([...next.values],old);assert.equal(next.recoveries.length,1);
});
test('restauration de valeurs absentes : retrait exact des deux clés',()=>{
 const t=setup([[J,JSON.stringify({version:1,beforeLibrary:null,beforeCombat:null})],[L,'nouveau'],[C,'nouveau']]);
 assert.equal(t.service.recoverIncompleteImport(),true);assert.equal(t.values.size,0);assert.deepEqual(t.calls.map(x=>x.slice(0,2)),[['get',J],['remove',L],['remove',C],['remove',J]]);
});
test('journal invalide : aucune écriture ni perte du journal',()=>{
 for(const raw of ['{','{}',JSON.stringify({version:2,beforeLibrary:null,beforeCombat:null}),JSON.stringify({version:1,beforeLibrary:42,beforeCombat:null})]){
  const t=setup([[J,raw],...old]);assert.equal(t.service.recoverIncompleteImport(),false);assert.deepEqual([...t.values],[[J,raw],...old]);assert.equal(t.calls.length,1);
 }
});
test('absence de journal : lecture seule, aucune notification',()=>{
 const t=setup(old);assert.equal(t.service.recoverIncompleteImport(),true);assert.deepEqual(t.calls,[['get',J]]);assert.deepEqual(t.recoveries,[]);
});
test('lecture interdite : état de repli et erreur sans écriture',()=>{
 const t=setup(old,op=>op==='get');assert.equal(t.service.loadSaved([L,C],x=>x,()=> 'repli'),'repli');assert.deepEqual(t.calls,[['get',L]]);assert.equal(t.errors.length,1);
});
test('anciennes versions : validation refusée, repli valide et propriétés inconnues conservées',()=>{
 const t=setup([['latest','{"invalid":true}'],['old',JSON.stringify(library)]]);
 assert.deepEqual(JSON.parse(JSON.stringify(t.service.loadSaved(['latest','old'],x=>{if(x.invalid)throw Error('refus validation');return x;},()=>null))),library);assert.deepEqual(t.invalid,[]);assert.ok(t.calls.every(x=>x[0]==='get'));
});
test('toutes versions corrompues : notification explicite puis état de repli',()=>{
 const t=setup([['a','{'],['b','{']]);let fallback=0;assert.equal(t.service.loadSaved(['a','b'],x=>x,()=>++fallback),1);assert.equal(t.invalid.length,1);assert.match(t.invalid[0],/a :/);assert.match(t.invalid[0],/b :/);
});
test('sérialisation impossible : refus et restauration des chaînes originales',()=>{
 const t=setup(old),circular={};circular.self=circular;assert.equal(t.service.persistCompleteBackup(library,circular),false);assert.deepEqual([...t.values],old);assert.equal(t.service.persist('x',circular),false);assert.equal(t.values.has('x'),false);
});
console.log(count+' scénarios de stockage sans DOM réussis');
