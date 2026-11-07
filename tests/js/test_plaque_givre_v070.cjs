'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8'),code=html.match(/<script>([\s\S]*?)<\/script>/)[1],ctx={window:{},console};vm.createContext(ctx);vm.runInContext(code.slice(0,code.indexOf("'use strict';",10)),ctx);const C=ctx.window.CombatCore;
function setup(){const s=C.createCombat(),a=C.addFighter(s,'Maître de l’eau','PNJ'),b=C.addFighter(s,'Cible','PNJ');C.declare(s,a,'esquiver');C.declare(s,b,'esquiver');C.reveal(s);C.advance(s);C.advance(s);return {s,a,b};}
function cast(s,a,b,o={iceConfirmed:true}){const act=C.queueTechnique(s,a,'Plaque de givre','esquiver',b,o);return C.propose(s,act)}
function run(n,f){f();console.log('OK',n)}
run('Gêné et Prêt appliqués',()=>{const {s,a,b}=setup();cast(s,a,b);C.commit(s);assert(C.fighter(s,b).statuses.includes('gene'));assert(C.fighter(s,a).statuses.includes('pret'))});
run('Confirmation de la glace obligatoire',()=>{const {s,a,b}=setup();assert.throws(()=>cast(s,a,b,{iceConfirmed:false}),/confirmer/) });
run('Cible distincte',()=>{const {s,a}=setup();assert.throws(()=>cast(s,a,a),/distinct/) });
run('Deux propositions séparées',()=>{const {s,a,b}=setup();const e=cast(s,a,b);assert.equal(e.length,2);assert.equal(e[0].targetId,b);assert.equal(e[1].targetId,a)});
run('Prévisualisation sans mutation',()=>{const {s,a,b}=setup();cast(s,a,b);const before=JSON.stringify(s);const e=C.previewCommit(s);assert.equal(e.length,2);assert.equal(JSON.stringify(s),before)});
run('Validation partielle',()=>{const {s,a,b}=setup();const e=cast(s,a,b);C.commit(s,{[e[0].id]:false});assert(!C.fighter(s,b).statuses.includes('gene'));assert(C.fighter(s,a).statuses.includes('pret'))});
run('Annulation',()=>{const {s,a,b}=setup();cast(s,a,b);C.commit(s);C.undo(s);assert(!C.fighter(s,b).statuses.includes('gene'));assert(!C.fighter(s,a).statuses.includes('pret'))});
run('Statut Gêné déjà présent : pas de doublon',()=>{const {s,a,b}=setup();C.fighter(s,b).statuses.push('gene');cast(s,a,b);C.commit(s);assert.equal(C.fighter(s,b).statuses.filter(x=>x==='gene').length,1)});
