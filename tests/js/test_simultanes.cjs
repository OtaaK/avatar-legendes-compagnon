const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const code=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(code.slice(0,code.indexOf("'use strict';",10)),ctx);
const C=ctx.window.CombatCore;
function setup(){const s=C.createCombat(),a=C.addFighter(s,'A'),b=C.addFighter(s,'B');C.declare(s,a,'attaquer');C.declare(s,b,'defendre');C.reveal(s);C.advance(s);return {s,a,b}}
let count=0;function test(label,fn){fn();console.log('OK',label);count++}
test('Deux événements excédentaires avec états distincts',()=>{const {s,a}=setup();const f=C.fighter(s,a);f.fatigue=5;const x=C.manual(s,a,a,'fatigue',1),y=C.manual(s,a,a,'fatigue',1);x.overflowConditions=['Fragile'];y.overflowConditions=['Confus'];C.commit(s);assert.deepEqual([...f.conditions],['Fragile','Confus']);assert.equal(f.fatigue,5)});
test('Refus de réutiliser un même état pour deux effets',()=>{const {s,a}=setup();const f=C.fighter(s,a);f.fatigue=5;const x=C.manual(s,a,a,'fatigue',1),y=C.manual(s,a,a,'fatigue',1);x.overflowConditions=['Fragile'];y.overflowConditions=['Fragile'];assert.throws(()=>C.commit(s),/état\(s\) à choisir/);assert.equal(C.fighter(s,a).conditions.length,0);assert.equal(s.proposals.length,2)});
test('Annulation complète si le deuxième effet est invalide',()=>{const {s,a,b}=setup();const f=C.fighter(s,a);f.fatigue=4;C.manual(s,a,b,'balance',1);C.manual(s,a,a,'fatigue',2);assert.throws(()=>C.commit(s),/état\(s\) à choisir/);assert.equal(C.fighter(s,a).fatigue,4);assert.equal(C.fighter(s,b).balance,0);assert.equal(s.history.length,0)});
test('Refus d’un effet laisse les autres applicables',()=>{const {s,a,b}=setup();const x=C.manual(s,a,b,'balance',1),y=C.manual(s,a,b,'balance',1);C.commit(s,{[y.id]:false});assert.equal(C.fighter(s,b).balance,1)});
console.log(count,'tests supplémentaires réussis');
function atEnd(){const {s,a,b}=setup();C.advance(s);C.endRound(s);return {s,a,b}}
test('En danger à fatigue 5 demande un état explicite',()=>{const {s,a}=atEnd();const f=C.fighter(s,a);f.fatigue=5;f.statuses.push('en_danger');assert.throws(()=>C.nextRound(s),/choisir un état/);assert.equal(s.round,1);C.nextRound(s,{[a]:'Fragile'});assert.equal(s.round,2);assert.equal(f.fatigue,5);assert(f.conditions.includes('Fragile'))});
test('En danger avec fatigue disponible coche une case',()=>{const {s,a}=atEnd();const f=C.fighter(s,a);f.fatigue=3;f.statuses.push('en_danger');C.nextRound(s);assert.equal(f.fatigue,4)});
