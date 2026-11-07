const fs=require('fs'),vm=require('vm'),assert=require('assert');
const code=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(code.slice(0,code.indexOf("'use strict';",10)),ctx);
const C=ctx.window.CombatCore;assert(C);
function setup(status,kind='PNJ'){const s=C.createCombat();const a=C.addFighter(s,'A',kind),b=C.addFighter(s,'B','PJ');C.fighter(s,a).statuses=[status];return {s,a,b,f:C.fighter(s,a)}}
let n=0;function test(name,fn){fn();n++;console.log('OK',name)}
test('Gêné PNJ réduit quota',()=>{let {s,a,b,f}=setup('gene');C.declare(s,a,'attaquer');C.declare(s,b,'defendre');C.reveal(s);assert.equal(C.allowance(f),0)});
test('Gêné coût fatigue annule réduction',()=>{let {s,a,b,f}=setup('gene');C.setGeneChoice(s,a,'fatigue');C.declare(s,a,'attaquer');C.declare(s,b,'defendre');C.reveal(s);assert.equal(f.fatigue,1);assert.equal(C.allowance(f),1)});
test('Avantagé donne +1 technique puis disparaît',()=>{let {s,a,b,f}=setup('avantage');C.declare(s,a,'attaquer');C.declare(s,b,'defendre');C.reveal(s);assert.equal(C.allowance(f),2);C.advance(s);C.advance(s);C.endRound(s);assert(!f.statuses.includes('avantage'))});
test('Étourdi empêche déclaration',()=>{let {s,a}=setup('etourdi');assert.throws(()=>C.declare(s,a,'attaquer'),/Étourdi/)});
test('Piégé exige fiction et 3 coûts',()=>{let {s,a,f}=setup('piege');assert.throws(()=>C.escapeTrap(s,a,3,[],false),/MJ/);C.escapeTrap(s,a,3,[],true);assert.equal(f.fatigue,3);assert(!f.statuses.includes('piege'))});
test('Renforcé gagné pendant la passe ne soigne pas immédiatement',()=>{let {s,a,b,f}=setup('');f.fatigue=2;C.declare(s,a,'attaquer');C.declare(s,b,'defendre');C.reveal(s);f.statuses.push('renforce');C.advance(s);C.advance(s);C.endRound(s);assert.equal(f.fatigue,2)});
console.log(n,'tests OK');
