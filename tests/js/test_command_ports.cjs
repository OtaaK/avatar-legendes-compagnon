'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {createMutationCommand}=require('../../src/commands/index.cjs');
const preferencesFactory=vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../../src/persistence/preferences.js'),'utf8')+'\ncreatePreferences;');
let count=0;function test(name,fn){fn();count++;console.log('OK '+name);}
function setup(options={}){
 let state={seq:1,items:[],future:{keep:true}},writes=0,redraws=0,fail=false;
 const execute=createMutationCommand({read:()=>state,restore:raw=>{state=JSON.parse(raw)},save:()=>{writes++;if(fail)return false;return true},onRollback:()=>redraws++,failureMessage:'Action annulée',...options});
 return {execute,get state(){return state},set state(value){state=value},get writes(){return writes},get redraws(){return redraws},set fail(value){fail=value}};
}
test('créer une commande ne lit, ne restaure, ne sauvegarde et ne dessine rien',()=>{
 const forbidden=()=>{throw Error('Accès interdit');};createMutationCommand({read:forbidden,restore:forbidden,save:forbidden,onRollback:forbidden});
});
test('retour, mutation et champs inconnus conservés',()=>{const t=setup();assert.equal(t.execute(()=>{t.state.items.push('A');return 42}),42);assert.equal(t.writes,1);assert.deepEqual(t.state.future,{keep:true});assert.equal(t.redraws,0);});
test('bibliothèque : sauvegarder aussi une commande sans changement comme auparavant',()=>{const t=setup();t.execute(()=>{});assert.equal(t.writes,1);});
test('combat : aucune écriture si la commande ne change rien',()=>{const t=setup({nested:true,saveUnchanged:false});t.execute(()=>{});assert.equal(t.writes,0);});
test('refus du stockage : état, compteur et propriétés restaurés',()=>{
 const t=setup();t.fail=true;assert.throws(()=>t.execute(()=>{t.state.seq++;t.state.items.push('perdu');t.state.future.keep=false}),/annulée/);assert.deepEqual(t.state,{seq:1,items:[],future:{keep:true}});assert.equal(t.redraws,1);
});
test('erreur métier : aucune écriture, restauration avant notification',()=>{const t=setup({onRollback:()=>assert.equal(t.state.items.length,0)});assert.throws(()=>t.execute(()=>{t.state.items.push('x');throw Error('métier')}),/métier/);assert.equal(t.writes,0);});
test('exception du port de sauvegarde : même restauration',()=>{const t=setup({save:()=>{throw Error('port refusé')}});assert.throws(()=>t.execute(()=>t.state.items.push('x')),/port refusé/);assert.equal(t.state.items.length,0);});
test('commandes de combat imbriquées : une écriture, valeurs de retour conservées',()=>{const t=setup({nested:true,saveUnchanged:false});assert.equal(t.execute(()=>{t.state.items.push('a');return t.execute(()=>{t.state.items.push('b');return 7})}),7);assert.equal(t.writes,1);assert.deepEqual(t.state.items,['a','b']);});
test('erreur imbriquée : état entier restauré, notification unique',()=>{const t=setup({nested:true});assert.throws(()=>t.execute(()=>{t.state.seq++;t.execute(()=>{t.state.items.push('x');throw Error('interne')})}),/interne/);assert.equal(t.state.seq,1);assert.equal(t.state.items.length,0);assert.equal(t.redraws,1);assert.equal(t.writes,0);});
test('après refus, la profondeur est libérée pour la commande suivante',()=>{const t=setup({nested:true});t.fail=true;assert.throws(()=>t.execute(()=>t.state.items.push('x')),/annulée/);t.fail=false;t.execute(()=>t.state.items.push('y'));assert.equal(t.writes,2);assert.deepEqual(t.state.items,['y']);});
test('remplacement de la racine puis refus : retour à l’ancienne racine',()=>{const t=setup();t.fail=true;assert.throws(()=>t.execute(()=>{t.state={seq:99,items:['nouveau']}}),/annulée/);assert.equal(t.state.seq,1);assert.deepEqual(t.state.future,{keep:true});});
test('instances indépendantes : les commandes imbriquées de deux combats sauvegardent chacune',()=>{const a=setup({nested:true}),b=setup({nested:true});a.execute(()=>{a.state.seq++;b.execute(()=>b.state.seq++)});assert.equal(a.writes,1);assert.equal(b.writes,1);});
test('préférences : aucun accès à la création',()=>{preferencesFactory(()=>{throw Error('interdit')});});
test('préférences : clés et chaînes transmises sans format de campagne',()=>{const values=new Map(),calls=[];const p=preferencesFactory(()=>({getItem:k=>values.get(k)??null,setItem(k,v){calls.push([k,v]);values.set(k,v)},removeItem:k=>values.delete(k)}));assert.equal(p.read('avatar-ui-view','home'),'home');p.write('avatar-ui-view','catalog');assert.equal(p.read('avatar-ui-view','home'),'catalog');assert.deepEqual(calls,[['avatar-ui-view','catalog']]);p.remove('avatar-ui-view');assert.equal(values.size,0);});
test('préférences : refus d’accès sans exception ni écriture de secours',()=>{const p=preferencesFactory(()=>{throw Error('Refus')});assert.equal(p.read('avatar-combat-tab','fighters'),'fighters');assert.doesNotThrow(()=>p.write('avatar-ui-view','combat'));assert.doesNotThrow(()=>p.remove('avatar-session-location'));});
test('préférences : chaîne vide et absence utilisent le même repli historique',()=>{const p=preferencesFactory(()=>({getItem:()=>''}));assert.equal(p.read('x','home'),'home');assert.equal(p.read('x'),'');});
console.log(count+' scénarios de commandes et préférences réussis');
