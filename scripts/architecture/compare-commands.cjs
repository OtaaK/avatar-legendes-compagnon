'use strict';
// Contrôle ponctuel : nécessite le commit de référence local, sans accès réseau.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'../..');
const old=execFileSync('git',['show','ae4c86a:app/simulateur.html'],{cwd:root,encoding:'utf8',maxBuffer:2000000});
const baseline=old.slice(old.indexOf('function commitLibraryMutation('),old.indexOf('function exportRoster('));
const current=fs.readFileSync(path.join(root,'src/commands/mutation.js'),'utf8')+'\n'+fs.readFileSync(path.join(root,'src/interface/commands.js'),'utf8');
function run(source,type,saveMode,scenario){
 const calls=[];let mode=saveMode;
 const ctx={lib:{version:1,seq:1,characters:[],future:{keep:true}},s:{round:1,fighters:[],future:{keep:true}},Roster:{importLibrary:JSON.parse},
  persist(key,value){calls.push(['persist',key,JSON.stringify(value)]);if(mode==='throw')throw Error('Quota simulé');return mode!=='refuse'},
  originalRender(){calls.push(['render',JSON.stringify(ctx.s)])}};
 vm.createContext(ctx);vm.runInContext(source,ctx);
 const mutate=()=>{if(type==='library'){ctx.lib.seq++;ctx.lib.characters.push({id:'char-1',unknown:true})}else{ctx.s.round++;ctx.s.fighters.push({id:'p-1',unknown:true})}};
 const execute=type==='library'?ctx.commitLibraryMutation:ctx.commitCombatMutation;
 let result,error;
 try{
  result=execute(()=>{
   if(scenario==='noop')return 'sans changement';
   if(scenario==='replace'){if(type==='library')ctx.lib={version:1,seq:8,characters:[]};else ctx.s={round:8,fighters:[]};return 'remplacement'}
   mutate();
   if(scenario==='throw')throw Error('Refus métier');
   if(scenario==='nested')return execute(()=>{mutate();return 42});
   if(scenario==='nested-throw')return execute(()=>{mutate();throw Error('Refus interne')});
   return 7;
  });
 }catch(e){error=e.message}
 // Vérifie aussi que la commande suivante n’hérite pas d’une profondeur bloquée.
 mode='ok';execute(()=>{if(type==='library')ctx.lib.seq++;else ctx.s.round++});
 return JSON.stringify({result,error,lib:ctx.lib,s:ctx.s,calls});
}
let count=0;
for(const type of ['library','combat'])for(const mode of ['ok','refuse','throw'])for(const scenario of ['noop','replace','mutate','throw','nested','nested-throw']){
 assert.equal(run(current,type,mode,scenario),run(baseline,type,mode,scenario),type+' / '+mode+' / '+scenario);count++;
}
console.log(count+' comparaisons exactes de commandes avant/après : états, résultats, erreurs, écritures et rendus identiques');
