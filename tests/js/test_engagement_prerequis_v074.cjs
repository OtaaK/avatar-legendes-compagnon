'use strict';
const assert=require('node:assert/strict');
const {CombatCore:C}=require('../../src/domain/index.cjs').loadDomain();
function setup(){const s=C.createCombat(),a=C.addFighter(s,'A','PNJ'),b=C.addFighter(s,'B','PNJ');C.declare(s,a,'attaquer');C.declare(s,b,'attaquer');C.reveal(s);C.advance(s);C.fighter(s,b).statuses.push('gene');return {s,a,b}}
function attack(s,a,b,flag){return C.queueTechnique(s,a,'Frapper un point faible','attaquer',b,{engagedConfirmed:flag})}
function test(n,fn){fn();console.log('OK',n)}
test('Refuse une confirmation isolée sans engagement réel',()=>{const{s,a,b}=setup();assert.throws(()=>C.propose(s,attack(s,a,b,true)),/engagée/)});
test('Accepte engagement enregistré sans case historique',()=>{const{s,a,b}=setup();C.setEngagement(s,a,b,true);C.propose(s,attack(s,a,b,false));assert(s.proposals.length>0)});
test('Rupture bloque une attaque ultérieure',()=>{const{s,a,b}=setup();C.setEngagement(s,a,b,true);C.setEngagement(s,a,b,false);assert.throws(()=>C.propose(s,attack(s,a,b,true)),/engagée/)});
test('Engagement symétrique reconnu',()=>{const{s,a,b}=setup();C.setEngagement(s,b,a,true);C.propose(s,attack(s,a,b));assert(s.proposals.length>0)});
test('Cible non gênée toujours refusée',()=>{const{s,a,b}=setup();C.setEngagement(s,a,b,true);C.fighter(s,b).statuses=[];assert.throws(()=>C.propose(s,attack(s,a,b)),/Gênée/)});
