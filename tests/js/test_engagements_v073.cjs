'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8'),code=html.match(/<script>([\s\S]*?)<\/script>/)[1],ctx={window:{},console};vm.createContext(ctx);vm.runInContext(code.slice(0,code.indexOf("'use strict';",10)),ctx);const C=ctx.window.CombatCore;
function setup(){const s=C.createCombat(),a=C.addFighter(s,'Eau','PNJ'),b=C.addFighter(s,'Ennemi','PNJ'),c=C.addFighter(s,'Autre','PNJ');for(const id of [a,b,c])C.declare(s,id,'esquiver');C.reveal(s);C.advance(s);C.advance(s);return {s,a,b,c}}
function cast(s,a,b,c,resist=[]){C.propose(s,C.queueTechnique(s,a,'Glissade','esquiver',b,{glissadeEnemies:[b,c],glissadeResisting:resist}))}
function run(name,fn){fn();console.log('OK',name)}
run('Engagement symétrique',()=>{const {s,a,b}=setup();C.setEngagement(s,a,b,true);assert(C.isEngaged(s,b,a));C.setEngagement(s,b,a,false);assert(!C.isEngaged(s,a,b))});
run('Glissade rompt les engagements déplacés seulement',()=>{const {s,a,b,c}=setup();C.setEngagement(s,a,b,true);C.setEngagement(s,a,c,true);cast(s,a,b,c,[c]);C.commit(s);assert(!C.isEngaged(s,a,b));assert(C.isEngaged(s,a,c))});
run('Prévisualisation sans mutation',()=>{const {s,a,b,c}=setup();C.setEngagement(s,a,b,true);cast(s,a,b,c);const before=JSON.stringify(s),events=C.previewCommit(s);assert(events.some(e=>e.kind==='disengage'));assert.equal(JSON.stringify(s),before)});
run('Refus de rupture conserve le lien',()=>{const {s,a,b,c}=setup();C.setEngagement(s,a,b,true);cast(s,a,b,c);const e=s.proposals.find(x=>x.kind==='disengage');assert(e);C.commit(s,{[e.id]:false});assert(C.isEngaged(s,a,b))});
run('Annulation restaure le lien',()=>{const {s,a,b,c}=setup();C.setEngagement(s,a,b,true);cast(s,a,b,c);C.commit(s);assert(!C.isEngaged(s,a,b));C.undo(s);assert(C.isEngaged(s,a,b))});
run('Modification manuelle annulable',()=>{const {s,a,b}=setup();C.setEngagement(s,a,b,true);C.undo(s);assert(!C.isEngaged(s,a,b))});
run('Pas de modification pendant propositions',()=>{const {s,a,b,c}=setup();cast(s,a,b,c);assert.throws(()=>C.setEngagement(s,a,b,true),/propositions/)});
run('Pas d’auto-engagement',()=>{const {s,a}=setup();assert.throws(()=>C.setEngagement(s,a,a,true),/distincts/)});
