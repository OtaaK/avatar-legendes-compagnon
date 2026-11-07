const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(){const s=C.createCombat(),a=C.addFighter(s,'Terre'),b=C.addFighter(s,'Ennemi');s.phase='esquiver';C.fighter(s,a).approach='esquiver';return {s,a,b};}
function metal(s,a,b,n){const act={id:'metal-'+n,round:s.round,sourceId:a,targetId:b,name:'Entraves de métal',approach:'esquiver',options:{earthMetalConfirmed:true}};s.actions.push(act);C.propose(s,act);C.commit(s,{});return s.temporaryEffects.find(e=>e.originActionId===act.id);}
// Gêné préexistant doit survivre à la libération.
{const {s,a,b}=setup();C.fighter(s,b).statuses.push('gene');const m=metal(s,a,b,1);assert(m.metalExternalGene);C.releaseEarthMetal(s,m.id,'mj_release',true);assert(C.fighter(s,b).statuses.includes('gene'));assert(C.undo(s));assert.equal(s.temporaryEffects.length,1);}
// Plusieurs entraves ne doivent pas considérer leur propre avantage comme indépendant.
{const {s,a,b}=setup(),c=C.addFighter(s,'Ennemi 2');C.setEngagement(s,a,b,true);C.setEngagement(s,a,c,true);const m1=metal(s,a,b,1);const m2=metal(s,a,c,2);assert(m1.metalGrantedAdvantage&&m2.metalGrantedAdvantage);assert(!m2.metalExternalAdvantage);C.releaseEarthMetal(s,m1.id,'mj_release',true);assert(C.fighter(s,a).statuses.includes('avantage'));C.releaseEarthMetal(s,m2.id,'mj_release',true);assert(!C.fighter(s,a).statuses.includes('avantage'));}
// L'avantage indépendant antérieur doit rester après libération.
{const {s,a,b}=setup();C.fighter(s,a).statuses.push('avantage');C.setEngagement(s,a,b,true);const m=metal(s,a,b,1);assert(m.metalExternalAdvantage);C.releaseEarthMetal(s,m.id,'mj_release',true);assert(C.fighter(s,a).statuses.includes('avantage'));}
console.log('V2.02 : provenance Entraves de métal OK');
