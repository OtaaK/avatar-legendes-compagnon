const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(){const s=C.createCombat(),id=C.addFighter(s,'Terre');const f=C.fighter(s,id);f.statuses=['avantage'];f.activeStatuses=['avantage'];s.phase='esquiver';return {s,id,f};}
// L'étoile conserve son avantage en fin de passe et après expiration d'une autre source.
{const {s,id,f}=setup();s.temporaryEffects.push({id:'lava',targetId:id,originLabel:'Étoile de lave',lavaMaintainedRound:1,lavaExternalAdvantage:true});f.roundStatuses=[{status:'avantage',expiresAfterRound:1}];C.endRound(s);assert(f.statuses.includes('avantage'));C.nextRound(s);assert(f.statuses.includes('avantage'));assert.equal(s.temporaryEffects[0].lavaExternalAdvantage,false);s.phase='fin';C.resolveEarthLava(s,'lava','extinguish',true);assert(!f.statuses.includes('avantage'));}
// Une armure garde aussi son avantage jusqu'à l'épuisement de sa réserve.
{const {s,id,f}=setup();s.temporaryEffects.push({id:'armor',targetId:id,originLabel:'Armure de terre',armorPoints:2});C.endRound(s);assert(f.statuses.includes('avantage'));}
// Une source temporaire seule expire normalement.
{const {s,id,f}=setup();f.roundStatuses=[{status:'avantage',expiresAfterRound:1}];C.endRound(s);s.phase='fin';C.nextRound(s);assert(!f.statuses.includes('avantage'));}
console.log('V1.80 : avantage persistant Terre, expiration indépendante et extinction OK');
