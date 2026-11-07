const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(){const s=C.createCombat(),a=C.addFighter(s,'Terre','PNJ'),b=C.addFighter(s,'Cible','PNJ');return {s,a,b}}
function action(name,a,b,options={}){return {id:'test',name,sourceId:a,targetId:b,options}}
for(const [status,expected] of [[null,'gene'],['gene','piege'],['piege','en_danger']]){
 const {s,a,b}=setup();if(status)C.fighter(s,b).activeStatuses=[status];
 const events=C.propose(s,action('Colonne de pierre',a,b));assert(events.some(e=>e.kind==='status_add'&&e.detail===expected));
}
{
 const {s,a,b}=setup();C.fighter(s,b).activeStatuses=['gene'];
 const ev=C.propose(s,action('Mouvements tectoniques',a,b,{tectonicTargets:[b],tectonicZone:false}));
 assert(ev.some(e=>e.kind==='status_add'&&e.detail==='etourdi'));
}
{
 const {s,a,b}=setup();const a1=action('Colonne de pierre',a,b);const ev=C.propose(s,a1);s.actions.push(a1);s.proposals=ev;
 C.commit(s);assert(C.fighter(s,b).statuses.includes('gene'));C.undo(s);assert(!C.fighter(s,b).statuses.includes('gene'));
}
console.log('Terre V1.50 : statuts historiques/actifs, progression et undo');
