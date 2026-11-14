'use strict';
const assert=require('node:assert/strict');
const {CombatCore:C}=require('../../src/domain/index.cjs').loadDomain();
function setup(){const s=C.createCombat(),a=C.addFighter(s,'A','PNJ'),b=C.addFighter(s,'B','PNJ');return {s,a,b}}
function test(name,fn){fn();console.log('OK',name)}
test('Désengager un couple déjà libre ne produit pas de transaction',()=>{const{s,a,b}=setup();assert.equal(C.setEngagement(s,a,b,false),false);assert.equal(s.history.length,0);assert.equal(s.snapshots.length,0)});
test('Engager deux fois conserve une seule transaction',()=>{const{s,a,b}=setup();C.setEngagement(s,a,b,true);C.setEngagement(s,a,b,true);assert.equal(s.history.length,1);assert.equal(s.snapshots.length,1);assert.equal(s.engagements.length,1)});
test('Symétrie : confirmer B-A ne duplique pas A-B',()=>{const{s,a,b}=setup();C.setEngagement(s,a,b,true);C.setEngagement(s,b,a,true);assert.equal(s.history.length,1);assert.equal(s.engagements.length,1)});
test('Désengager deux fois ne crée qu’une opération',()=>{const{s,a,b}=setup();C.setEngagement(s,a,b,true);C.setEngagement(s,a,b,false);C.setEngagement(s,b,a,false);assert.equal(s.history.length,2);assert.equal(s.snapshots.length,2)});
test('Annuler après confirmation répétée revient à l’état précédent',()=>{const{s,a,b}=setup();C.setEngagement(s,a,b,true);C.setEngagement(s,b,a,true);C.undo(s);assert.equal(C.isEngaged(s,a,b),false)});
test('Propositions en attente bloquent même une confirmation sans changement',()=>{const{s,a,b}=setup();s.proposals.push({id:'test'});assert.throws(()=>C.setEngagement(s,a,b,false),/valider les propositions/)});
