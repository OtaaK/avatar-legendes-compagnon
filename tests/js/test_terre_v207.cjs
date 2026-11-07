const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function fixture(){const s=C.createCombat(),a=C.addFighter(s,'Lave'),b=C.addFighter(s,'Cible');s.temporaryEffects.push({id:'star',originLabel:'Étoile de lave',targetId:a,originActionId:'activate'});s.actions.push({id:'hit',sourceId:a,targetId:b,name:'Frapper',round:1});return {s,a,b};}
{const {s,a,b}=fixture();s.history.push({round:1,events:[{actionId:'hit',kind:'fatigue',targetId:b,amount:1}]},{round:1,events:[{actionId:'activate',kind:'fatigue',targetId:a,amount:1}]});assert.throws(()=>C.earthLavaFracture(s,'star','hit','Mur',true),/antérieure/);assert.equal((s.lavaFractures||[]).length,0);}
{const {s,a,b}=fixture();s.history.push({round:1,events:[{actionId:'activate',kind:'fatigue',targetId:a,amount:1}]},{round:1,events:[{actionId:'hit',kind:'fatigue',targetId:b,amount:1}]});C.earthLavaFracture(s,'star','hit','Mur',true);assert.equal(s.lavaFractures.length,1);C.undo(s);assert.equal((s.lavaFractures||[]).length,0);}
{const {s,a,b}=fixture();s.history.push({round:1,events:[{actionId:'activate',kind:'fatigue',targetId:a,amount:1}]},{round:2,events:[{actionId:'hit',kind:'fatigue',targetId:b,amount:1}]});assert.throws(()=>C.earthLavaFracture(s,'star','hit','Mur',true),/non résolue/);}
{const {s,a,b}=fixture();s.history.push({round:1,events:[{actionId:'activate',kind:'fatigue',targetId:a,amount:1}]},{round:1,events:[{actionId:'hit',kind:'note',reason:'Étoile de lave : Fracasser gratuit du décor — Mur'}]});assert.throws(()=>C.earthLavaFracture(s,'star','hit','Mur',true),/non résolue/);}
console.log('V2.07 : chronologie étoile de lave, passe, provenance et annulation OK');
