'use strict';
const assert=require('node:assert/strict');
const {CombatCore:C}=require('../../src/domain/index.cjs').loadDomain();
function start(){const s=C.createCombat(),a=C.addFighter(s,'A'),b=C.addFighter(s,'B');for(const id of [a,b])C.declare(s,id,'attaquer');C.reveal(s);C.advance(s);C.fighter(s,b).reactions.push({type:'cover',round:s.round,used:false});return {s,a,b}}
function check(name,fn){fn();console.log('OK',name)}
check('fatigue nulle ne consomme pas l’abri',()=>{const {s,a,b}=start();C.manual(s,a,b,'fatigue',0);C.commit(s);assert.equal(C.fighter(s,b).reactions[0].used,false)});
check('état déjà coché ne consomme pas l’abri',()=>{const {s,a,b}=start();C.fighter(s,b).conditions.push('Fragile');C.manual(s,a,b,'condition',0,'Fragile');C.commit(s);assert.equal(C.fighter(s,b).reactions[0].used,false)});
check('équilibre saturé ne consomme pas l’abri',()=>{const {s,a,b}=start();C.fighter(s,b).balance=3;C.manual(s,a,b,'balance',1);C.commit(s);assert.equal(C.fighter(s,b).reactions[0].used,false)});
check('premier effet nul, second réel : attaque entière absorbée',()=>{const {s,a,b}=start();const x=C.manual(s,a,b,'fatigue',0);const y=C.manual(s,a,b,'condition',0,'Fragile');y.actionId=x.actionId;C.commit(s);assert.equal(C.fighter(s,b).conditions.length,0);assert.equal(C.fighter(s,b).reactions[0].used,true)});
check('statut déjà présent ne consomme pas l’abri',()=>{const {s,a,b}=start();C.fighter(s,b).statuses.push('gene');C.manual(s,a,b,'status_add',0,'gene');C.commit(s);assert.equal(C.fighter(s,b).reactions[0].used,false)});
check('statut négatif bloqué par garde ne consomme pas l’abri',()=>{const {s,a,b}=start();C.fighter(s,b).reactions.push({type:'status_guard',round:s.round});C.manual(s,a,b,'status_add',0,'gene');C.commit(s);assert.equal(C.fighter(s,b).reactions[0].used,false)});
check('prévisualisation et annulation sur attaque réelle',()=>{const {s,a,b}=start();C.manual(s,a,b,'fatigue',1);const before=JSON.stringify(s);const preview=C.previewCommit(s);assert(preview.some(e=>e.kind==='cover_used'));assert.equal(JSON.stringify(s),before);C.commit(s);assert(C.fighter(s,b).reactions[0].used);C.undo(s);assert.equal(C.fighter(s,b).reactions[0].used,false)});
