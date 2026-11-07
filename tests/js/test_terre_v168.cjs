const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(){const s=C.createCombat(),a=C.addFighter(s,'Terre'),b=C.addFighter(s,'Ennemi');s.phase='defendre';C.fighter(s,a).approach='defendre';const act={id:'seismic-1',round:1,sourceId:a,targetId:b,name:'Détection du pas lourd',approach:'defendre',options:{earthSeismicConfirmed:true}};s.actions.push(act);C.propose(s,act);C.commit(s,{});const enemy={id:'enemy-action',round:1,sourceId:b,targetId:a,name:'Frapper',approach:'attaquer',options:{choice:'fatigue'}};s.actions.push(enemy);return {s,a,b,enemy};}
{const {s,a,b,enemy}=setup();C.resolveEarthSeismicInterrupt(s,a,b,'cancel',true,[],'enemy-action');assert(enemy.cancelledBySeismic);assert.throws(()=>C.propose(s,enemy),/annulée/);assert(C.undo(s));assert(!s.actions.find(x=>x.id==='enemy-action').cancelledBySeismic);assert(C.propose(s,s.actions.find(x=>x.id==='enemy-action')).length>0);}
{const {s,a,b,enemy}=setup();assert.throws(()=>C.resolveEarthSeismicInterrupt(s,a,b,'cancel',true,[],'wrong'),/introuvable/);assert(C.fighter(s,a).statuses.includes('pret'));assert(!enemy.cancelledBySeismic);}
{const {s,a,b,enemy}=setup();s.history.push({events:[{actionId:'enemy-action'}]});assert.throws(()=>C.resolveEarthSeismicInterrupt(s,a,b,'cancel',true,[],'enemy-action'),/déjà résolue/);}
{const {s,a,b,enemy}=setup();C.resolveEarthSeismicInterrupt(s,a,b,'pay',true,[],'enemy-action');assert(!enemy.cancelledBySeismic);assert(C.propose(s,enemy).length>0);}
console.log('V1.68 annulation nominative de technique en attente OK');
