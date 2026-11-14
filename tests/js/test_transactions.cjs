const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const helper=fs.readFileSync(require('node:path').join(require('../support/paths.cjs').ROOT,'src/commands/mutation.js'),'utf8')+'\n'+script.slice(script.indexOf('function commitLibraryMutation('),script.indexOf('function exportRoster('));
let saved=null,fail=false, warnings=0;
const ctx={lib:{seq:2,characters:[{id:'a',name:'Avant'}]},Roster:{importLibrary:txt=>JSON.parse(txt)},persist:(key,obj)=>{if(fail)return false;saved=JSON.stringify(obj);return true;},console,Error};
vm.createContext(ctx);vm.runInContext(helper,ctx);
let count=0;function test(label,fn){fn();count++;console.log('OK '+label)}
test('modification enregistrée',()=>{ctx.commitLibraryMutation(()=>{ctx.lib.characters[0].name='Après'});assert.equal(JSON.parse(saved).characters[0].name,'Après')});
test('échec stockage restaure la fiche',()=>{fail=true;assert.throws(()=>ctx.commitLibraryMutation(()=>{ctx.lib.characters[0].name='Perdue'}),/annulée/);assert.equal(ctx.lib.characters[0].name,'Après')});
test('échec stockage restaure aussi le compteur',()=>{assert.throws(()=>ctx.commitLibraryMutation(()=>{ctx.lib.seq++;ctx.lib.characters.push({id:'b'})}),/annulée/);assert.equal(ctx.lib.seq,2);assert.equal(ctx.lib.characters.length,1)});
test('erreur métier restaure état initial',()=>{fail=false;assert.throws(()=>ctx.commitLibraryMutation(()=>{ctx.lib.characters[0].name='Erreur';throw Error('invalide')}),/invalide/);assert.equal(ctx.lib.characters[0].name,'Après')});
test('actions critiques utilisent la transaction',()=>{for(const name of ['createFromWizard','newSheet','saveSheet','addSheetTechnique','toggleSheetCondition','toggleSheetStatus','applySelectedBook']){const start=script.indexOf('function '+name+'(');const end=script.indexOf('\nfunction ',start+10);assert.match(script.slice(start,end<0?undefined:end),/commitLibraryMutation\(/,name)}});
console.log(count+' tests transactionnels réussis');
