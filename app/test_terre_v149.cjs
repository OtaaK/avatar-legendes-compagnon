const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(){const s=C.createCombat(),a=C.addFighter(s,'Terre','PNJ'),b=C.addFighter(s,'Ennemi','PNJ'),c=C.addFighter(s,'Autre','PNJ');C.setEngagement(s,a,b,true);return {s,a,b,c}}
function act(s,a,attackers,confirmed=true){return {id:'test',name:'Boue gluante',sourceId:a,targetId:a,options:{earthMudConfirmed:confirmed,earthMudAttackers:attackers}}}
{
 const {s,a,b}=setup();const e=C.propose(s,act(s,a,[b]));assert(e.some(x=>x.kind==='status_add'&&x.targetId===b&&x.detail==='gene'));assert(e.some(x=>x.kind==='note'&&x.reason.includes('prochaine passe')));assert(!e.some(x=>x.kind==='fatigue'));s.actions.push(act(s,a,[b]));s.proposals=e;C.commit(s);assert(C.fighter(s,b).statuses.includes('gene'));C.undo(s);assert(!C.fighter(s,b).statuses.includes('gene'));
}
{
 const {s,a,b,c}=setup();assert.throws(()=>C.propose(s,act(s,a,[b],false)),/confirmer/);assert.throws(()=>C.propose(s,act(s,a,[c])),/non engagé/);assert.throws(()=>C.propose(s,act(s,a,[b,b])),/invalide/);assert.throws(()=>C.propose(s,act(s,a,[a])),/invalide/);assert(C.propose(s,act(s,a,[])).some(x=>x.kind==='note'));
}
assert(html.includes('id="earthMudConfirmed"'));assert(html.includes('class="earth-mud-attacker"'));assert(html.includes("'Boue gluante','Détection du pas lourd','Étoile de lave','Bouclier de roche'"));
console.log('Terre V1.49 : Boue gluante — cas valides, rejets, undo, UI et atomicité');
