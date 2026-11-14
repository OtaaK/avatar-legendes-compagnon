'use strict';
const assert=require('node:assert/strict');
const {CombatCore:C}=require('../../src/domain/index.cjs').loadDomain();
function setup(){const s=C.createCombat(),a=C.addFighter(s,'A','PNJ'),b=C.addFighter(s,'B','PNJ'),c=C.addFighter(s,'C','PNJ');return {s,a,b,c}}
function test(label,fn){fn();console.log('OK',label)}
test('Terrain vide : aucune transaction',()=>{const {s}=setup();assert.equal(C.clearEngagements(s),false);assert.equal(s.history.length,0);assert.equal(s.snapshots.length,0)});
test('Deux liens effacés dans une transaction',()=>{const {s,a,b,c}=setup();C.setEngagement(s,a,b,true);C.setEngagement(s,b,c,true);const before=s.history.length;assert.equal(C.clearEngagements(s),true);assert.equal(s.engagements.length,0);assert.equal(s.history.length,before+1);assert.equal(s.history.at(-1).events.length,2)});
test('Remise à zéro répétée sans transaction',()=>{const {s,a,b}=setup();C.setEngagement(s,a,b,true);C.clearEngagements(s);const count=s.history.length;assert.equal(C.clearEngagements(s),false);assert.equal(s.history.length,count)});
test('Annulation restaure toutes les paires',()=>{const {s,a,b,c}=setup();C.setEngagement(s,a,b,true);C.setEngagement(s,b,c,true);C.clearEngagements(s);C.undo(s);assert.equal(C.isEngaged(s,a,b),true);assert.equal(C.isEngaged(s,b,c),true)});
test('Propositions en attente bloquent la remise à zéro',()=>{const {s,a,b}=setup();C.setEngagement(s,a,b,true);s.proposals.push({id:'pending'});assert.throws(()=>C.clearEngagements(s),/valider les propositions/);assert.equal(C.isEngaged(s,a,b),true)});
test('Remise à zéro ne touche pas aux ressources',()=>{const {s,a,b}=setup();C.setEngagement(s,a,b,true);C.fighter(s,a).fatigue=3;C.clearEngagements(s);assert.equal(C.fighter(s,a).fatigue,3)});
