'use strict';
// Sources du projet de confiance uniquement ; aucun démarrage ou HTML distribué chargé.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {ROOT}=require('./paths.cjs');
const commands=['src/commands/mutation.js','src/interface/commands.js'];
const persistence=['src/persistence/storage.js','src/persistence/preferences.js','src/legacy/persistence.js'];
const validation=['src/legacy/validation.js'];
const exportsSource=['src/interface/exports.js'];
const screen=['src/interface/application-after-validation.js'];
const bundles={commands,persistence,validation,exports:exportsSource,screen,
 'validation-persistence':[...validation,...persistence],
 'roster-links':[...validation,...commands,...exportsSource],
 'sheet-sync':[...commands,...screen]};
function readFixture(name,{root=ROOT}={}){
 if(typeof name!=='string'||!Object.hasOwn(bundles,name))throw Error('Fixture source inconnue');
 return bundles[name].map(file=>fs.readFileSync(path.join(root,file),'utf8')).join('\n');
}
function runFixture(name,context,{root=ROOT,preserve=[]}={}){
 if(!Array.isArray(preserve)||new Set(preserve).size!==preserve.length)throw Error('Ports de test invalides');
 const saved=preserve.map(key=>{
  if(typeof key!=='string'||!Object.hasOwn(context,key)||typeof context[key]!=='function')throw Error('Port de test absent : '+String(key));
  return [key,context[key]];
 });
 const source=readFixture(name,{root});
 if(!vm.isContext(context))vm.createContext(context);
 try{vm.runInContext(source,context,{filename:'source-fixture:'+name,timeout:2000});}
 finally{for(const [key,value]of saved)context[key]=value;}
 return context;
}
module.exports={readFixture,runFixture};
