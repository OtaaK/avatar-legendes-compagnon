const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const segment=script.slice(script.indexOf('function validateBackupLinks('),script.indexOf('const ROSTER_KEYS='));
const warnings=[];let data=new Map();const localStorage={setItem(k,v){data.set(k,v)},getItem(k){return data.has(k)?data.get(k):null}};
const document={getElementById(){return {hidden:true,textContent:''}}};
const ctx={localStorage,document,console:{error(){},warn(x){warnings.push(x)}},alert(){}};
vm.createContext(ctx);vm.runInContext(segment,ctx);
let count=0;function test(label,fn){fn();count++;console.log('OK',label)}
test('persistance et relecture JSON',()=>{assert.equal(ctx.persist('test',{a:1}),true);assert.equal(ctx.loadSaved(['test'],x=>x,()=>null).a,1)});
test('repli vers version antérieure si JSON invalide',()=>{data.set('bad','{broken');data.set('old','{"a":2}');assert.equal(ctx.loadSaved(['bad','old'],x=>x,()=>null).a,2)});
test('aucune sauvegarde trouvée : état par défaut',()=>{assert.equal(ctx.loadSaved(['missing'],x=>x,()=>({fresh:true})).fresh,true)});
test('stockage indisponible : échec signalé',()=>{const old=localStorage.setItem;localStorage.setItem=()=>{throw Error('quota')};assert.equal(ctx.persist('blocked',{}),false);localStorage.setItem=old});
test('import : combattant lié à fiche absente refusé',()=>{assert.throws(()=>ctx.validateBackupLinks({characters:[]},{fighters:[{characterId:'missing'}]}),/absente/)});
test('import : combattant lié à fiche présente accepté',()=>{assert.doesNotThrow(()=>ctx.validateBackupLinks({characters:[{id:'a'}]},{fighters:[{characterId:'a'}]}))});
test('combat importé : validation des liens activée',()=>{assert.match(script,/validateCombat\(x\);validateBackupLinks\(lib,x\)/)});
test('premier rendu : ne persiste pas par défaut',()=>{assert.match(script,/originalRender\(\);\s*restoreNpcSessionLocation\(\)/)});
console.log(`${count} tests de persistance réussis`);
