'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8'),code=html.match(/<script>([\s\S]*?)<\/script>/)[1],ctx={window:{},console};vm.createContext(ctx);vm.runInContext(code.slice(0,code.indexOf("'use strict';",10)),ctx);const C=ctx.window.CombatCore;
function setup(){const s=C.createCombat(),a=C.addFighter(s,'Eau'),b=C.addFighter(s,'Ennemi'),c=C.addFighter(s,'Tiers'),d=C.addFighter(s,'Autre');for(const id of [a,b,c,d])C.declare(s,id,'esquiver');C.reveal(s);C.advance(s);C.advance(s);return {s,a,b,c,d}}
function cast(s,a,targets,resist=[]){C.propose(s,C.queueTechnique(s,a,'Glissade','esquiver',targets[0],{glissadeEnemies:targets,glissadeResisting:resist}))}
function run(n,f){f();console.log('OK',n)}
run('Rupture du lien avec un tiers',()=>{const {s,a,b,c}=setup();C.setEngagement(s,b,c,true);cast(s,a,[b]);C.commit(s);assert(!C.isEngaged(s,b,c))});
run('Résistance préserve les liens avec les tiers',()=>{const {s,a,b,c}=setup();C.setEngagement(s,b,c,true);cast(s,a,[b],[b]);C.commit(s);assert(C.isEngaged(s,b,c))});
run('Deux ennemis déplacés : lien unique',()=>{const {s,a,b,c}=setup();C.setEngagement(s,b,c,true);cast(s,a,[b,c]);assert.equal(s.proposals.filter(e=>e.kind==='disengage').length,1);C.commit(s);assert(!C.isEngaged(s,b,c))});
run('Lien entre deux résistants conservé',()=>{const {s,a,b,c}=setup();C.setEngagement(s,b,c,true);cast(s,a,[b,c],[b,c]);C.commit(s);assert(C.isEngaged(s,b,c))});
run('Lien non concerné préservé',()=>{const {s,a,b,c,d}=setup();C.setEngagement(s,c,d,true);cast(s,a,[b]);C.commit(s);assert(C.isEngaged(s,c,d))});
run('Prévisualisation pure',()=>{const {s,a,b,c}=setup();C.setEngagement(s,b,c,true);cast(s,a,[b]);const before=JSON.stringify(s);assert(C.previewCommit(s).some(e=>e.kind==='disengage'&&e.sourceId===b&&e.targetId===c));assert.equal(JSON.stringify(s),before)});
run('Refus individuel de rupture',()=>{const {s,a,b,c}=setup();C.setEngagement(s,b,c,true);cast(s,a,[b]);const e=s.proposals.find(e=>e.kind==='disengage');C.commit(s,{[e.id]:false});assert(C.isEngaged(s,b,c))});
run('Annulation restaure les liens tiers',()=>{const {s,a,b,c}=setup();C.setEngagement(s,b,c,true);cast(s,a,[b]);C.commit(s);C.undo(s);assert(C.isEngaged(s,b,c))});
