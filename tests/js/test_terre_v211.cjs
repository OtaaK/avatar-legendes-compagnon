const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(){const s=C.createCombat(),a=C.addFighter(s,'Maître de terre'),b=C.addFighter(s,'Cible');return {s,a,b};}
function shield(s,a,b){const id='shield-test';s.temporaryEffects.push({id,targetId:b,originSourceId:a,originLabel:'Bouclier de roche',shieldGrantedGene:true,shieldExternalGene:false,duration:'manual'});C.fighter(s,b).statuses.push('gene');return id;}
function next(s){s.actions=[];s.phase='fin';C.nextRound(s);}
// Le retrait d'un bouclier ne doit pas effacer une source temporaire indépendante.
{const {s,a,b}=setup();const id=shield(s,a,b);C.fighter(s,b).roundStatuses=[{status:'gene',expiresAfterRound:s.round}];C.mutateEarthShield(s,id,'revoke',true);assert(C.fighter(s,b).statuses.includes('gene'));next(s);assert(!C.fighter(s,b).statuses.includes('gene'));assert(C.undo(s));assert(C.fighter(s,b).statuses.includes('gene'));}
// Même garantie lorsqu'une entrave de métal est encore active, même avec les anciens indicateurs de provenance.
{const {s,a,b}=setup();const id=shield(s,a,b);s.temporaryEffects.push({id:'metal-test',targetId:b,originSourceId:a,originLabel:'Entraves de métal',metalExternalGene:false,metalGrantedAdvantage:false,duration:'manual'});C.mutateEarthShield(s,id,'revoke',true);assert(C.fighter(s,b).statuses.includes('gene'));C.releaseEarthMetal(s,'metal-test','mj_release',true);assert(!C.fighter(s,b).statuses.includes('gene'));}
// La consommation d'un bouclier respecte elle aussi les sources temporaires.
{const {s,a,b}=setup();const id=shield(s,a,b);C.fighter(s,b).roundStatuses=[{status:'gene',expiresAfterRound:s.round}];const r=C.mutateEarthShield(s,id,'consume',true,2);assert.equal(r.netCost,1);assert(C.fighter(s,b).statuses.includes('gene'));next(s);assert(!C.fighter(s,b).statuses.includes('gene'));}
console.log('V2.11 : bouclier, statuts temporaires, entraves, consommation, expiration et undo OK');
