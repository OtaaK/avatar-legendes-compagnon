const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(){const s=C.createCombat(),a=C.addFighter(s,'Terre 1'),b=C.addFighter(s,'Terre 2'),c=C.addFighter(s,'Ennemi');return {s,a,b,c};}
function unchanged(s,fn){const before=JSON.stringify(s);assert.throws(fn);assert.strictEqual(JSON.stringify(s),before);}
// Journal corrompu : échec APRÈS le changement des engagements et le recalcul du métal.
for(const operation of ['set','clear','disengage']){
 const {s,a,b,c}=setup();C.setEngagement(s,a,b,true);C.setEngagement(s,b,c,true);
 s.temporaryEffects.push({id:'metal',originLabel:'Entraves de métal',originSourceId:a,targetId:b,metalGrantedAdvantage:true});
 C.fighter(s,b).statuses.push('gene');C.fighter(s,a).statuses.push('avantage');
 s.history=null;
 if(operation==='set')unchanged(s,()=>C.setEngagement(s,a,b,false));
 if(operation==='clear')unchanged(s,()=>C.clearEngagements(s));
 if(operation==='disengage')unchanged(s,()=>C.disengageFighter(s,b));
}
// Référence métal cassée : erreur lors du recalcul APRÈS mutation des liens.
for(const operation of ['set','clear','disengage']){
 const {s,a,b,c}=setup();C.setEngagement(s,a,b,true);C.setEngagement(s,b,c,true);
 s.temporaryEffects.push({id:'broken',originLabel:'Entraves de métal',originSourceId:a,targetId:'absent'});
 if(operation==='set')unchanged(s,()=>C.setEngagement(s,a,b,false));
 if(operation==='clear')unchanged(s,()=>C.clearEngagements(s));
 if(operation==='disengage')unchanged(s,()=>C.disengageFighter(s,b));
}
// Parcours réel : avantage métallique lié à la position, retour arrière complet.
{const {s,a,b,c}=setup();C.fighter(s,b).statuses.push('gene');s.temporaryEffects.push({id:'metal',originLabel:'Entraves de métal',originSourceId:a,targetId:b,metalGrantedAdvantage:true});
 C.setEngagement(s,a,b,true);assert(C.fighter(s,a).statuses.includes('avantage'));
 C.setEngagement(s,b,c,true);assert(C.clearEngagements(s));assert(!C.fighter(s,a).statuses.includes('avantage'));
 assert(C.undo(s));assert(C.fighter(s,a).statuses.includes('avantage'));assert(C.undo(s));assert(C.undo(s));assert(!s.engagements.length);
 C.setEngagement(s,a,b,true);assert(C.disengageFighter(s,b));assert(C.undo(s));assert(C.isEngaged(s,a,b));}
console.log('V2.32 : engagements, métal, transactions et annulations OK');
