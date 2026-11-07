const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(fatigue=5,conditions=[]){const s=C.createCombat(),id=C.addFighter(s,'Terre');s.phase='fin';s.fighters[0].fatigue=fatigue;s.fighters[0].conditions=[...conditions];s.fighters[0].statuses=['avantage'];s.temporaryEffects.push({id:'lava',originLabel:'Étoile de lave',targetId:id,lavaMaintainedRound:0,lavaExternalAdvantage:false,label:'Étoile de lave'});return {s,id};}
// V2.33 / p.100 : l'entretien est un coût volontaire, pas une fatigue subie.
for(const conditions of [[],['Confus']]){
 const {s,id}=setup(5,conditions);const before=JSON.stringify(s);
 assert.throws(()=>C.resolveEarthLava(s,'lava','maintain',true),/coût volontaire/);
 assert.throws(()=>C.resolveEarthLava(s,'lava','maintain',true,['Fragile']),/coût volontaire/);
 assert.equal(JSON.stringify(s),before);
}
{const {s,id}=setup(4);C.resolveEarthLava(s,'lava','maintain',true);assert.equal(C.fighter(s,id).fatigue,5);assert.equal(C.fighter(s,id).conditions.length,0);assert.equal(s.temporaryEffects[0].lavaMaintainedRound,s.round);assert.throws(()=>C.resolveEarthLava(s,'lava','maintain',true),/une seule fois/);C.undo(s);assert.equal(C.fighter(s,id).fatigue,4);assert.equal(s.temporaryEffects[0].lavaMaintainedRound,0);}
console.log('V1.78 actualisé V2.33 : entretien abordable, refus à fatigue pleine, unicité et annulation OK');
