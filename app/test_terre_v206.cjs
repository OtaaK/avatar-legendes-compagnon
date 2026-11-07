const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(){const s=C.createCombat(),a=C.addFighter(s,'Terre'),b=C.addFighter(s,'Cible');s.phase='esquiver';return {s,a,b};}
function cast(s,a,b){const action={id:'a'+s.seq++,round:s.round,sourceId:a,targetId:b,name:'Mouvements tectoniques',approach:'esquiver',options:{tectonicTargets:[b],tectonicZone:false}};s.actions.push(action);C.propose(s,action);C.commit(s,{});}
function advance(s){s.phase='fin';C.nextRound(s);s.phase='esquiver';}
// Deux applications consécutives doivent préserver Gêné jusqu'à la fin de la seconde passe.
{const {s,a,b}=setup();cast(s,a,b);assert(C.fighter(s,b).statuses.includes('gene'));advance(s);assert(C.fighter(s,b).statuses.includes('gene'),'V2.33 : gêne active à la passe suivante');advance(s);assert(!C.fighter(s,b).statuses.includes('gene'));cast(s,a,b);assert(C.fighter(s,b).statuses.includes('gene'));assert(C.undo(s));assert(!C.fighter(s,b).statuses.includes('gene'));}
// Une source temporaire antérieure est renouvelée sans être effacée à la transition.
{const {s,a,b}=setup();const f=C.fighter(s,b);f.statuses.push('gene');f.roundStatuses=[{status:'gene',expiresAfterRound:2}];cast(s,a,b);assert.equal(f.roundStatuses[0].expiresAfterRound,2);assert(C.undo(s));}
// Une source permanente indépendante ne doit pas recevoir de date d'expiration.
{const {s,a,b}=setup();const f=C.fighter(s,b);f.statuses.push('gene');cast(s,a,b);assert.equal(f.roundStatuses?.length||0,0);}
console.log('V2.06 : provenance et renouvellement des statuts temporaires OK');
