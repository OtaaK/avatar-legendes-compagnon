const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const code=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
const sync=code.slice(code.indexOf('function syncSheet('),code.indexOf('function exportCompleteBackup('));
const tx=fs.readFileSync(require('node:path').join(require('../support/paths.cjs').ROOT,'src/commands/mutation.js'),'utf8')+'\n'+code.slice(code.indexOf('function commitLibraryMutation('),code.indexOf('function commitCombatMutation('));
let stored,fail=false,alerts=[],renders=0;
const ctx={lib:{version:1,characters:[{id:'a',fatigue:0}]},s:{fighters:[{id:'p-1',characterId:'a',fatigue:3}]},confirm:()=>true,
 Roster:{importLibrary:JSON.parse,syncCombatToLibrary:(lib,s,id)=>{lib.characters[0].fatigue=s.fighters[0].fatigue;return lib.characters[0]}},
 saveLibrary:()=>{if(fail)return false;stored=JSON.stringify(ctx.lib);return true},restoreNpcSessionLocation:()=>{},renderSheets:()=>{},render:()=>renders++,alert:m=>alerts.push(m)};
vm.createContext(ctx);vm.runInContext(tx+sync,ctx);
ctx.syncSheet('p-1');assert.equal(ctx.lib.characters[0].fatigue,3);assert.equal(JSON.parse(stored).characters[0].fatigue,3);
ctx.s.fighters[0].fatigue=5;fail=true;ctx.syncSheet('p-1');assert.equal(ctx.lib.characters[0].fatigue,3);assert.match(alerts.at(-1),/annulée/);
fail=false;ctx.Roster.syncCombatToLibrary=()=>{ctx.lib.characters[0].fatigue=4;throw Error('métier')};ctx.syncSheet('p-1');assert.equal(ctx.lib.characters[0].fatigue,3);assert.equal(alerts.at(-1),'métier');
assert.match(sync,/commitLibraryMutation\(\(\)=>Roster\.syncCombatToLibrary/);
console.log('4 contrôles synchronisation transactionnelle réussis');
