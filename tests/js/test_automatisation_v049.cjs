const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const script=html.split('<script>')[1].split('</script>')[0];
const core=script.slice(script.indexOf("'use strict';"),script.indexOf('window.CombatCore=')+script.slice(script.indexOf('window.CombatCore=')).indexOf(';')+1);
const ctx={window:{}};vm.runInNewContext(core,ctx);const C=ctx.window.CombatCore;
function setup(approach){const s=C.createCombat(),a=C.addFighter(s,'Attaquant','PNJ'),b=C.addFighter(s,'Cible','PNJ');C.declare(s,a,approach);C.declare(s,b,approach);C.reveal(s);if(approach==='attaquer')C.advance(s);if(approach==='esquiver'){C.advance(s);C.advance(s)}return {s,a,b}}
let n=0;function test(name,fn){fn();n++;console.log('✓ '+name)}
test('Acharnement : cible normale devient Gênée et coût 1',()=>{const {s,a,b}=setup('attaquer');const x=C.queueTechnique(s,a,'Acharnement','attaquer',b);C.propose(s,x);C.commit(s);assert.equal(C.fighter(s,a).fatigue,1);assert.ok(C.fighter(s,b).statuses.includes('gene'))});
test('Acharnement : cible Gênée devient Étourdie',()=>{const {s,a,b}=setup('attaquer');C.fighter(s,b).statuses.push('gene');const x=C.queueTechnique(s,a,'Acharnement','attaquer',b);C.propose(s,x);C.commit(s);assert.ok(C.fighter(s,b).statuses.includes('etourdi'))});
test('Acharnement : cible Étourdie subit 5 fatigue',()=>{const {s,a,b}=setup('attaquer');C.fighter(s,b).statuses.push('etourdi');const x=C.queueTechnique(s,a,'Acharnement','attaquer',b);C.propose(s,x);C.commit(s);assert.equal(C.fighter(s,b).fatigue,5)});
test('Acharnement : impossible de se cibler',()=>{const {s,a}=setup('attaquer');const x=C.queueTechnique(s,a,'Acharnement','attaquer',a);assert.throws(()=>C.propose(s,x),/adversaire distinct/);assert.equal(s.proposals.length,0)});
test('Dérobade : efface un état, coûte 1 fatigue et rend Avantagé',()=>{const {s,a}=setup('esquiver');C.fighter(s,a).conditions.push('Fragile');const x=C.queueTechnique(s,a,'Dérobade','esquiver',a,{condition:'Fragile'});C.propose(s,x);C.commit(s);assert.equal(C.fighter(s,a).fatigue,1);assert.ok(!C.fighter(s,a).conditions.includes('Fragile'));assert.ok(C.fighter(s,a).statuses.includes('avantage'))});
test('Dérobade : refuse un état absent sans proposition ni coût',()=>{const {s,a}=setup('esquiver');const x=C.queueTechnique(s,a,'Dérobade','esquiver',a,{condition:'Fragile'});assert.throws(()=>C.propose(s,x),/actuellement coché/);assert.equal(s.proposals.length,0);assert.equal(C.fighter(s,a).fatigue,0)});
test('Dérobade : refuse un choix vide',()=>{const {s,a}=setup('esquiver');const x=C.queueTechnique(s,a,'Dérobade','esquiver',a);assert.throws(()=>C.propose(s,x),/actuellement coché/)});
const audit=JSON.parse(html.match(/const TECH_AUDIT=(\{[^\n]*\});/)[1]);assert.equal(Object.values(audit).filter(x=>x.automatisation==='validee_v049').length,2);
console.log(`${n} tests de combat V0.49 réussis`);
