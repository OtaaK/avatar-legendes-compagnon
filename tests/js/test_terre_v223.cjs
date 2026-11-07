const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(){const s=C.createCombat(),a=C.addFighter(s,'Terre'),b=C.addFighter(s,'Adversaire');s.phase='esquiver';C.fighter(s,a).approach='esquiver';return {s,a,b};}
function temporary(s,a,b,status){C.manual(s,a,b,'status_round',0,status,'Mouvements tectoniques : statut pour la passe');C.commit(s,{});}
function metal(s,a,b){const action={id:'m'+s.seq++,round:s.round,sourceId:a,targetId:b,name:'Entraves de métal',approach:'esquiver',options:{earthMetalConfirmed:true}};s.actions.push(action);C.propose(s,action);C.commit(s,{});return s.temporaryEffects.find(e=>e.originLabel==='Entraves de métal');}
function expire(s){s.phase='fin';C.nextRound(s);}
// Le métal ne transforme pas Gêné temporaire en statut permanent autonome.
{const {s,a,b}=setup();temporary(s,a,b,'gene');const f=C.fighter(s,b);const binding=metal(s,a,b);assert(binding);assert.notEqual(f.roundStatuses[0].external,true);expire(s);assert(f.statuses.includes('gene'),'métal maintient Gêné après expiration de passe');C.releaseEarthMetal(s,binding.id,'mj_release',true);assert(!f.statuses.includes('gene'),'pas de Gêné fantôme');C.undo(s);assert(C.fighter(s,b).statuses.includes('gene'));}
// Application permanente réellement indépendante : elle survit à la fin de passe et à la libération.
{const {s,a,b}=setup();temporary(s,a,b,'gene');C.manual(s,a,b,'status_add',0,'gene','Arbitrage MJ indépendant');C.commit(s,{});assert.equal(C.fighter(s,b).roundStatuses[0].external,true);const binding=metal(s,a,b);expire(s);C.releaseEarthMetal(s,binding.id,'mj_release',true);assert(C.fighter(s,b).statuses.includes('gene'));}
// L'armure ne convertit pas un Avantagé temporaire en source indépendante.
{const {s,a,b}=setup();temporary(s,a,a,'avantage');const action={id:'armor',round:1,sourceId:a,targetId:a,name:'Armure de terre',approach:'defendre',options:{earthArmorConfirmed:true}};s.actions.push(action);C.propose(s,action);C.commit(s,{});assert.notEqual(C.fighter(s,a).roundStatuses[0].external,true);expire(s);assert(C.fighter(s,a).statuses.includes('avantage'),'armure encore active');}
console.log('V2.23 : statuts temporaires + métal/armure, expiration, provenance indépendante, libération et undo OK');
