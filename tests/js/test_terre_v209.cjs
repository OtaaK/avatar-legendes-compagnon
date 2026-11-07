const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(){const s=C.createCombat(),a=C.addFighter(s,'Terre'),b=C.addFighter(s,'Cible');s.phase='esquiver';C.fighter(s,a).approach='esquiver';return {s,a,b};}
function metal(s,a,b,n){const act={id:'m'+n,round:s.round,sourceId:a,targetId:b,name:'Entraves de métal',approach:'esquiver',options:{earthMetalConfirmed:true}};s.actions.push(act);C.propose(s,act);C.commit(s,{});return s.temporaryEffects.find(e=>e.originActionId===act.id);}
// La première entrave porte la provenance Gêné indépendant, la seconde doit l'hériter.
{const {s,a,b}=setup();C.fighter(s,b).statuses.push('gene');const m1=metal(s,a,b,1),m2=metal(s,a,b,2);assert(m1.metalExternalGene);C.releaseEarthMetal(s,m1.id,'mj_release',true);assert(s.temporaryEffects.find(x=>x.id===m2.id).metalExternalGene);C.releaseEarthMetal(s,m2.id,'mj_release',true);assert(C.fighter(s,b).statuses.includes('gene'));assert(C.undo(s));assert.equal(s.temporaryEffects.length,1);}
// Même transfert de provenance pour l'avantage du lanceur, sur deux cibles.
{const {s,a,b}=setup(),c=C.addFighter(s,'Cible 2');C.fighter(s,a).statuses.push('avantage');C.setEngagement(s,a,b,true);C.setEngagement(s,a,c,true);const m1=metal(s,a,b,1),m2=metal(s,a,c,2);assert(m1.metalExternalAdvantage);C.releaseEarthMetal(s,m1.id,'mj_release',true);assert(s.temporaryEffects.find(x=>x.id===m2.id).metalExternalAdvantage);C.releaseEarthMetal(s,m2.id,'mj_release',true);assert(C.fighter(s,a).statuses.includes('avantage'));}
// Une provenance métallique reste métallique après suppression d'un lien, sans avantage fantôme.
{const {s,a,b}=setup(),c=C.addFighter(s,'Cible 2');C.setEngagement(s,a,b,true);C.setEngagement(s,a,c,true);const m1=metal(s,a,b,1),m2=metal(s,a,c,2);C.releaseEarthMetal(s,m1.id,'mj_release',true);C.releaseEarthMetal(s,m2.id,'mj_release',true);assert(!C.fighter(s,a).statuses.includes('avantage'));}
// La fin de combat conserve la provenance transmise après libération intermédiaire.
{const {s,a,b}=setup();C.fighter(s,b).statuses.push('gene');const m1=metal(s,a,b,1);metal(s,a,b,2);C.releaseEarthMetal(s,m1.id,'mj_release',true);s.actions=[];s.phase='fin';assert.equal(C.endCombat(s,true),1);assert(C.fighter(s,b).statuses.includes('gene'));}
console.log('V2.09 : transfert de provenance métal, fin de combat et undo OK');
