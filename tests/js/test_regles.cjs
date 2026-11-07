const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const script=html.split('<script>')[1].split('</script>')[0];
const core=script.slice(script.indexOf("'use strict';"),script.indexOf('window.CombatCore=')+script.slice(script.indexOf('window.CombatCore=')).indexOf(';')+1);
const ctx={window:{}};vm.runInNewContext(core,ctx);const C=ctx.window.CombatCore;
function setup(){const s=C.createCombat();const a=C.addFighter(s,'A');const b=C.addFighter(s,'B');C.declare(s,a,'attaquer');C.declare(s,b,'attaquer');C.reveal(s);C.advance(s);return {s,a,b};}
let n=0;
function test(name,fn){fn();console.log('✓ '+name);n++}
test('Frapper gratuit : 2 fatigues au choix de la cible',()=>{const {s,a,b}=setup();const x=C.queueTechnique(s,a,'Frapper','attaquer',b,{choice:'fatigue'});const ev=C.propose(s,x);assert.equal(ev.length,1);assert.equal(ev[0].amount,2);assert.equal(ev[0].targetId,b)});
test('Frapper payant : 1 fatigue attaquant et 1 état cible',()=>{const {s,a,b}=setup();const x=C.queueTechnique(s,a,'Frapper','attaquer',b,{choice:'condition',condition:'Fragile',forceStrike:true});const ev=C.propose(s,x);assert.equal(ev.length,2);assert.equal(ev[0].targetId,a);assert.equal(ev[0].amount,1);assert.equal(ev[1].detail,'Fragile')});
test('Frapper payant : équilibre interdit',()=>{const {s,a,b}=setup();const x=C.queueTechnique(s,a,'Frapper','attaquer',b,{choice:'balance',direction:1,forceStrike:true});assert.throws(()=>C.propose(s,x),/pas équilibre/)});
test('Frapper gratuit : décalage équilibre possible',()=>{const {s,a,b}=setup();const x=C.queueTechnique(s,a,'Frapper','attaquer',b,{choice:'balance',direction:-1});const ev=C.propose(s,x);assert.equal(ev[0].kind,'balance');assert.equal(ev[0].amount,-1)});
test('Frapper payant : application de la fatigue après validation',()=>{const {s,a,b}=setup();const x=C.queueTechnique(s,a,'Frapper','attaquer',b,{choice:'fatigue',forceStrike:true});C.propose(s,x);C.commit(s);assert.equal(C.fighter(s,a).fatigue,1);assert.equal(C.fighter(s,b).fatigue,2)});
test('Les techniques non documentées ne produisent pas de faux effets',()=>{const {s,a,b}=setup();const x=C.queueTechnique(s,a,'Technique inconnue','attaquer',b,{});const ev=C.propose(s,x);assert.equal(ev.length,1);assert.equal(ev[0].kind,'note')});
console.log(`${n} tests réussis`);
