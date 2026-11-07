'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(){const s=C.createCombat(),a=C.addFighter(s,'Poseur','PNJ'),b=C.addFighter(s,'Intrus','PNJ');return {s,a,b}}
function arm(s,a,b,zone='Entrée du hangar'){return C.propose(s,{id:'pose',sourceId:a,targetId:b,name:'Pose de pièges',options:{trapZone:zone}})}
{
 const {s,a,b}=setup();const events=arm(s,a,b);assert.equal(events.length,2);
 const before=JSON.stringify(s);const preview=C.previewCommit(s,{});assert.equal(preview.length,2);assert.equal(JSON.stringify(s),before);
 C.commit(s,{});assert.equal(C.fighter(s,a).fatigue,1);assert.equal(s.traps.length,1);
 const id=s.traps[0].id;const snapshot=JSON.stringify(s.fighters);
 assert.throws(()=>C.triggerTrap(s,id,b,'Invalide',1));assert.throws(()=>C.triggerTrap(s,id,b,'Terrifié',0));assert.equal(s.traps.length,1);
 const out=C.triggerTrap(s,id,b,'Terrifié',-1);assert.equal(out.length,2);assert.equal(s.traps.length,0);
 assert(C.fighter(s,b).conditions.includes('Terrifié'));assert.equal(C.fighter(s,b).balance,-1);
 assert.throws(()=>C.triggerTrap(s,id,b,'Confus',1));
 assert(C.undo(s));assert.equal(JSON.stringify(s.fighters),snapshot);assert.equal(s.traps.length,1);
 assert(C.undo(s));assert.equal(s.traps.length,0);assert.equal(C.fighter(s,a).fatigue,0);
}
{
 const {s,a,b}=setup();const ev=arm(s,a,b);C.commit(s,{[ev[1].id]:false});assert.equal(s.traps.length,0);assert.equal(C.fighter(s,a).fatigue,1);
}
for(const zone of ['', ' '.repeat(3),'x'.repeat(121)]){const {s,a,b}=setup();assert.throws(()=>arm(s,a,b,zone));assert.equal(s.proposals.length,0)}
{
 const {s,a,b}=setup();arm(s,a,b);C.commit(s,{});const id=s.traps[0].id;
 assert.throws(()=>C.triggerTrap(s,id,a,'Terrifié',1));
 s.proposals.push({id:'pending'});assert.throws(()=>C.triggerTrap(s,id,b,'Terrifié',1));
 assert.equal(s.traps.length,1);
}
console.log('V0.91 Pose de pièges : création, validation, déclenchement, refus, annulation et erreurs OK');
