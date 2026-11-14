const assert=require('node:assert/strict');
const {CombatCore:C}=require('../../src/domain/index.cjs').loadDomain();
function start(){const s=C.createCombat(),a=C.addFighter(s,'A'),b=C.addFighter(s,'B');for(const id of [a,b])C.declare(s,id,'attaquer');C.reveal(s);C.advance(s);C.fighter(s,b).reactions.push({type:'riposte',round:s.round});return {s,a,b}}
function check(n,fn){fn();console.log('OK',n)}
check('état déjà coché : aucune riposte',()=>{const {s,a,b}=start();C.fighter(s,b).conditions.push('Fragile');C.manual(s,a,b,'condition',0,'Fragile');C.commit(s);assert.equal(C.fighter(s,a).fatigue,0)});
check('décalage nul : aucune riposte',()=>{const {s,a,b}=start();C.manual(s,a,b,'balance',0);C.commit(s);assert.equal(C.fighter(s,a).fatigue,0)});
check('équilibre à la limite : aucune riposte',()=>{const {s,a,b}=start();C.fighter(s,b).balance=3;C.manual(s,a,b,'balance',1);C.commit(s);assert.equal(C.fighter(s,a).fatigue,0)});
check('fatigue nulle : aucune riposte',()=>{const {s,a,b}=start();C.manual(s,a,b,'fatigue',0);C.commit(s);assert.equal(C.fighter(s,a).fatigue,0)});
check('nouvel état : riposte',()=>{const {s,a,b}=start();C.manual(s,a,b,'condition',0,'Fragile');C.commit(s);assert.equal(C.fighter(s,a).fatigue,1)});
check('décalage effectif : riposte',()=>{const {s,a,b}=start();C.manual(s,a,b,'balance',1);C.commit(s);assert.equal(C.fighter(s,a).fatigue,1)});
check('prévisualisation et annulation',()=>{const {s,a,b}=start();C.manual(s,a,b,'balance',1);const before=JSON.stringify(s);const events=C.previewCommit(s);assert(events.some(e=>e.reason==='Riposter'));assert.equal(JSON.stringify(s),before);C.commit(s);C.undo(s);assert.equal(C.fighter(s,a).fatigue,0)});
