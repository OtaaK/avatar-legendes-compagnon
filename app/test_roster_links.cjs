const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const validation=script.slice(script.indexOf('function validateBackupLinks('),script.indexOf('let storageWarningShown='));
const tx=script.slice(script.indexOf('function commitLibraryMutation('),script.indexOf('function commitCombatMutation('));
const rosterImport=script.slice(script.indexOf('function importRoster('),script.indexOf('function download('));
let count=0;function test(name,fn){fn();console.log('OK '+name);count++}
const ctx={lib:{version:1,seq:2,characters:[{id:'a',name:'Ancien'}]},s:{fighters:[{id:'p-1',characterId:'a'}]},Roster:{importLibrary:JSON.parse},persist:()=>true,saveLibrary:()=>ctx.persist(),console,alert:()=>{}};
vm.createContext(ctx);vm.runInContext(validation+tx+rosterImport,ctx);
test('import des fiches compatible avec combat existant',()=>assert.doesNotThrow(()=>ctx.validateBackupLinks({characters:[{id:'a'}]},ctx.s)));
test('import des fiches refuse les combattants orphelins',()=>assert.throws(()=>ctx.validateBackupLinks({characters:[{id:'b'}]},ctx.s),/fiche absente/));
test('combat sans lien autorisé',()=>assert.doesNotThrow(()=>ctx.validateBackupLinks({characters:[]},{fighters:[{id:'x'}]})));
test('échec de persistance restaure la bibliothèque avant import',()=>{ctx.persist=()=>false;assert.throws(()=>ctx.commitLibraryMutation(()=>{ctx.lib={version:1,seq:3,characters:[{id:'a',name:'Nouveau'}]}}),/annulée/);assert.equal(ctx.lib.characters[0].name,'Ancien')});
test('import fiches appelle validation avant transaction',()=>assert.ok(rosterImport.indexOf('validateBackupLinks(restored,s)')<rosterImport.indexOf('commitLibraryMutation(')));
test('import fiches nettoie le sélecteur après échec',()=>assert.match(rosterImport,/\.finally\(\(\)=>\{e\.target\.value=''\}\)/));
console.log(count+' tests de liens fiches/combat réussis');
