'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8'),code=html.match(/<script>([\s\S]*?)<\/script>/)[1],ctx={window:{},console};vm.createContext(ctx);vm.runInContext(code.slice(0,code.indexOf("'use strict';",10)),ctx);const C=ctx.window.CombatCore;
function setup(){const s=C.createCombat(),a=C.addFighter(s,'A','PNJ'),b=C.addFighter(s,'B','PNJ'),c=C.addFighter(s,'C','PNJ');return {s,a,b,c}}
function test(name,fn){fn();console.log('OK',name)}
test('Aucun lien : aucune transaction',()=>{const {s,a}=setup();assert.equal(C.disengageFighter(s,a),false);assert.equal(s.history.length,0)});
test('Désengagement ciblé conserve les autres liens',()=>{const {s,a,b,c}=setup();C.setEngagement(s,a,b,true);C.setEngagement(s,a,c,true);C.setEngagement(s,b,c,true);assert.equal(C.disengageFighter(s,a),true);assert.equal(C.isEngaged(s,a,b),false);assert.equal(C.isEngaged(s,a,c),false);assert.equal(C.isEngaged(s,b,c),true)});
test('Une seule transaction et historique complet',()=>{const {s,a,b,c}=setup();C.setEngagement(s,a,b,true);C.setEngagement(s,a,c,true);const n=s.history.length;C.disengageFighter(s,a);assert.equal(s.history.length,n+1);assert.equal(s.history.at(-1).events.length,2)});
test('Annulation restaure les deux liens',()=>{const {s,a,b,c}=setup();C.setEngagement(s,a,b,true);C.setEngagement(s,a,c,true);C.disengageFighter(s,a);C.undo(s);assert.equal(C.isEngaged(s,a,b),true);assert.equal(C.isEngaged(s,a,c),true)});
test('Propositions en attente bloquent le déplacement',()=>{const {s,a,b}=setup();C.setEngagement(s,a,b,true);s.proposals.push({id:'pending'});assert.throws(()=>C.disengageFighter(s,a),/valider les propositions/);assert.equal(C.isEngaged(s,a,b),true)});
test('Combattant inconnu rejeté',()=>{const {s}=setup();assert.throws(()=>C.disengageFighter(s,'missing'),/Combattant inconnu/)});
test('Aucune modification des ressources',()=>{const {s,a,b}=setup();C.setEngagement(s,a,b,true);C.fighter(s,a).fatigue=4;C.disengageFighter(s,a);assert.equal(C.fighter(s,a).fatigue,4)});
