const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);
const C=ctx.window.CombatCore;
function setup(){const s=C.createCombat();const a=C.addFighter(s,'Métal'),b=C.addFighter(s,'Cible');return {s,a,b};}
function metal(s,a,b){s.temporaryEffects.push({id:'metal'+s.seq++,originLabel:'Entraves de métal',originSourceId:a,targetId:b,metalGrantedAdvantage:true,metalExternalAdvantage:false});C.fighter(s,b).statuses.push('gene');C.fighter(s,a).statuses.push('avantage');}
{
 const {s,a,b}=setup();metal(s,a,b);s.temporaryEffects.push({id:'shield',originLabel:'Bouclier de roche',targetId:b});
 C.removeTemporaryEffect(s,s.temporaryEffects[0].id);assert(C.fighter(s,b).statuses.includes('gene'));assert(C.undo(s));assert.equal(s.temporaryEffects.length,2);
}
{
 const {s,a,b}=setup();metal(s,a,b);C.fighter(s,b).roundStatuses=[{status:'gene',expiresAfterRound:s.round}];
 C.removeTemporaryEffect(s,s.temporaryEffects[0].id);assert(C.fighter(s,b).statuses.includes('gene'));assert.equal(C.fighter(s,b).roundStatuses.length,1);
}
{
 const {s,a,b}=setup();const c=C.addFighter(s,'Autre cible');metal(s,a,b);metal(s,a,c);s.engagements=[[a,c]];
 C.removeTemporaryEffect(s,s.temporaryEffects[0].id);assert(C.fighter(s,a).statuses.includes('avantage'));assert(C.fighter(s,c).statuses.includes('gene'));
}
console.log('V1.94 : coexistence des sources OK');
