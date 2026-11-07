'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8'),code=html.match(/<script>([\s\S]*?)<\/script>/)[1],ctx={window:{},console};vm.createContext(ctx);vm.runInContext(code.slice(0,code.indexOf("'use strict';",10)),ctx);const C=ctx.window.CombatCore;
function setup(){const s=C.createCombat(),a=C.addFighter(s,'Eau','PNJ'),b=C.addFighter(s,'Ennemi 1','PNJ'),c=C.addFighter(s,'Ennemi 2','PNJ');for(const id of [a,b,c])C.declare(s,id,'esquiver');C.reveal(s);C.advance(s);C.advance(s);return {s,a,b,c}}
function cast(s,a,b,c,resist=[]){return C.propose(s,C.queueTechnique(s,a,'Glissade','esquiver',b,{glissadeEnemies:[b,c],glissadeResisting:resist}))}
function run(name,fn){fn();console.log('OK',name)}
run('Efface fatigue et résistance',()=>{const {s,a,b,c}=setup();C.fighter(s,a).fatigue=3;cast(s,a,b,c,[b]);C.commit(s);assert.equal(C.fighter(s,a).fatigue,2);assert.equal(C.fighter(s,b).fatigue,1);assert(C.fighter(s,b).statuses.includes('gene'));assert.equal(C.fighter(s,c).fatigue,0)});
run('Prévisualisation sans mutation',()=>{const {s,a,b,c}=setup();cast(s,a,b,c,[c]);const before=JSON.stringify(s);const effects=C.previewCommit(s);assert(effects.some(e=>e.targetId===c&&e.kind==='status_add'));assert.equal(JSON.stringify(s),before)});
run('Annulation',()=>{const {s,a,b,c}=setup();C.fighter(s,a).fatigue=2;cast(s,a,b,c,[b]);C.commit(s);C.undo(s);assert.equal(C.fighter(s,a).fatigue,2);assert.equal(C.fighter(s,b).fatigue,0)});
run('Refuse liste vide',()=>{const {s,a,b}=setup();assert.throws(()=>C.propose(s,C.queueTechnique(s,a,'Glissade','esquiver',b,{glissadeEnemies:[]})),/au moins un/)});
run('Refuse cible répétée',()=>{const {s,a,b}=setup();assert.throws(()=>C.propose(s,C.queueTechnique(s,a,'Glissade','esquiver',b,{glissadeEnemies:[b,b]})),/répétée/)});
run('Refuse résistance hors portée',()=>{const {s,a,b,c}=setup();assert.throws(()=>C.propose(s,C.queueTechnique(s,a,'Glissade','esquiver',b,{glissadeEnemies:[b],glissadeResisting:[c]})),/invalide/)});
run('Refuse soi-même',()=>{const {s,a,b}=setup();assert.throws(()=>C.propose(s,C.queueTechnique(s,a,'Glissade','esquiver',b,{glissadeEnemies:[a]})),/propre ennemi/)});
