const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function scenario(operation){
 const s=C.createCombat(),a=C.addFighter(s,'Terre'),b=C.addFighter(s,'Allié');
 C.fighter(s,b).statuses.push('gene');
 s.temporaryEffects.push({id:'sh',targetId:b,originSourceId:a,originLabel:'Bouclier de roche',shieldBlockedRound:0,shieldGrantedGene:true,shieldExternalGene:true});
 if(operation==='consume'){
  s.actions.push({id:'act',name:'Enfouissement',sourceId:a,targetId:b,options:{earthShieldDiscountId:'sh'}});
  s.proposals.push({id:'cost',actionId:'act',sourceId:a,targetId:a,kind:'fatigue',amount:2,reason:'Enfouissement : coût',round:1});
  s.proposals.push({id:'trap',actionId:'act',sourceId:a,targetId:b,kind:'status_add',detail:'piege',amount:0,reason:'Enfouissement : cible Piégée',round:1});
  C.commit(s,{});
 }else C.mutateEarthShield(s,'sh','revoke',true);
 assert(C.fighter(s,b).statuses.includes('gene'),'external Gêné must survive '+operation);
 assert(!s.temporaryEffects.some(e=>e.id==='sh'));
 assert(C.undo(s));assert(s.temporaryEffects.some(e=>e.id==='sh'));
}
scenario('revoke');scenario('consume');
const s=C.createCombat(),a=C.addFighter(s,'Terre'),b=C.addFighter(s,'Allié');
C.fighter(s,b).statuses.push('gene');
s.temporaryEffects.push({id:'sh',targetId:b,originSourceId:a,originLabel:'Bouclier de roche',shieldGrantedGene:true});
s.actions.push({id:'a1',name:'Arbitrage MJ',sourceId:a,targetId:b,options:{}});
s.proposals.push({id:'g',actionId:'a1',sourceId:a,targetId:b,kind:'status_add',detail:'gene',reason:'Autre source de gêne',round:1});
C.commit(s,{});assert.equal(s.temporaryEffects[0].shieldExternalGene,true);
C.mutateEarthShield(s,'sh','revoke',true);assert(C.fighter(s,b).statuses.includes('gene'));
console.log('V160 provenance Gêné : validation, révocation, consommation, annulation OK');
