'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8'),code=html.match(/<script>([\s\S]*?)<\/script>/)[1],ctx={window:{},console};vm.createContext(ctx);vm.runInContext(code.slice(0,code.indexOf("'use strict';",10)),ctx);const C=ctx.window.CombatCore;
function setup(){const s=C.createCombat(),a=C.addFighter(s,'Maître de l’eau','PNJ'),b=C.addFighter(s,'Cible','PNJ');C.declare(s,a,'defendre');C.declare(s,b,'defendre');C.reveal(s);return {s,a,b};}
function run(name,fn){fn();console.log('OK',name)}
function cast(s,a,b,options){const action=C.queueTechnique(s,a,'Fouet d’eau','defendre',b,options);return C.propose(s,action)}
run('Choix 2 fatigues',()=>{const {s,a,b}=setup();const ev=cast(s,a,b,{choice:'fatigue'});assert.equal(ev.length,2);C.commit(s);assert.equal(C.fighter(s,a).fatigue,1);assert.equal(C.fighter(s,b).fatigue,2)});
run('Choix un état',()=>{const {s,a,b}=setup();cast(s,a,b,{choice:'condition',condition:'Fragile'});C.commit(s);assert.equal(C.fighter(s,a).fatigue,1);assert(C.fighter(s,b).conditions.includes('Fragile'))});
run('Cible obligatoire',()=>{const {s,a}=setup();assert.throws(()=>cast(s,a,a,{choice:'fatigue'}),/adversaire distinct/)});
run('Choix absent rejeté',()=>{const {s,a,b}=setup();assert.throws(()=>cast(s,a,b,{}),/choisit/)});
run('État invalide rejeté',()=>{const {s,a,b}=setup();assert.throws(()=>cast(s,a,b,{choice:'condition',condition:'Inconnu'}),/invalide/)});
run('Prévisualisation sans mutation',()=>{const {s,a,b}=setup();cast(s,a,b,{choice:'fatigue'});const before=JSON.stringify(s);const p=C.previewCommit(s);assert.equal(p.length,2);assert.equal(JSON.stringify(s),before)});
run('Annulation restaure fatigue et état',()=>{const {s,a,b}=setup();cast(s,a,b,{choice:'condition',condition:'Confus'});C.commit(s);C.undo(s);assert.equal(C.fighter(s,a).fatigue,0);assert(!C.fighter(s,b).conditions.includes('Confus'))});
run('Refus du dommage préserve le coût',()=>{const {s,a,b}=setup();const ev=cast(s,a,b,{choice:'fatigue'});C.commit(s,{[ev[1].id]:false});assert.equal(C.fighter(s,a).fatigue,1);assert.equal(C.fighter(s,b).fatigue,0)});
