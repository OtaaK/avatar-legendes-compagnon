'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');const code=html.match(/<script>([\s\S]*?)<\/script>/)[1];const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(code.slice(0,code.indexOf("'use strict';",10)),ctx);const C=ctx.window.CombatCore;
function setup(){const s=C.createCombat(),a=C.addFighter(s,'A'),b=C.addFighter(s,'B');C.declare(s,a,'attaquer');C.declare(s,b,'attaquer');C.reveal(s);C.advance(s);return {s,a,b};}
function mark(s,a,b,extra=false){C.fighter(s,a).bonuses.push({type:'weakness',targetId:b,round:s.round,direction:-1,extra});}
function test(name,fn){fn();console.log('OK',name)}
test('fatigue declenche decalage et consomme marque',()=>{const {s,a,b}=setup();mark(s,a,b);C.manual(s,a,b,'fatigue',1);const out=C.commit(s);assert.equal(C.fighter(s,b).balance,-1);assert.equal(C.fighter(s,b).fatigue,1);assert(!C.fighter(s,a).bonuses.some(x=>x.type==='weakness'));assert.equal(out.filter(x=>x.kind==='weakness_used').length,1)});
test('etat declenche decalage',()=>{const {s,a,b}=setup();mark(s,a,b);C.manual(s,a,b,'condition',0,'Fragile');C.commit(s);assert.equal(C.fighter(s,b).balance,-1)});
test('fatigue nulle conserve marque',()=>{const {s,a,b}=setup();mark(s,a,b);C.manual(s,a,b,'fatigue',0);C.commit(s);assert(C.fighter(s,a).bonuses.some(x=>x.type==='weakness'))});
test('etat deja present conserve marque',()=>{const {s,a,b}=setup();mark(s,a,b);C.fighter(s,b).conditions.push('Fragile');C.manual(s,a,b,'condition',0,'Fragile');C.commit(s);assert(C.fighter(s,a).bonuses.some(x=>x.type==='weakness'))});
test('abri conserve marque',()=>{const {s,a,b}=setup();mark(s,a,b);C.fighter(s,b).reactions.push({type:'cover',round:s.round,used:false});C.manual(s,a,b,'fatigue',1);C.commit(s);assert(C.fighter(s,a).bonuses.some(x=>x.type==='weakness'))});
test('attaque multi effets consomme une seule fois',()=>{const {s,a,b}=setup();mark(s,a,b);const x=C.manual(s,a,b,'fatigue',1),y=C.manual(s,a,b,'condition',0,'Fragile');y.actionId=x.actionId;const out=C.commit(s);assert.equal(out.filter(x=>x.kind==='weakness_used').length,1);assert.equal(C.fighter(s,b).balance,-1)});
test('second decalage paie fatigue',()=>{const {s,a,b}=setup();mark(s,a,b,true);C.manual(s,a,b,'fatigue',1);C.commit(s);assert.equal(C.fighter(s,b).balance,-2);assert.equal(C.fighter(s,a).fatigue,1)});
test('preview et annulation',()=>{const {s,a,b}=setup();mark(s,a,b);C.manual(s,a,b,'fatigue',1);const before=JSON.stringify(s);assert(C.previewCommit(s).some(x=>x.kind==='weakness_used'));assert.equal(JSON.stringify(s),before);C.commit(s);C.undo(s);assert(C.fighter(s,a).bonuses.some(x=>x.type==='weakness'));assert.equal(C.fighter(s,b).balance,0)});
