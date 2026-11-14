const assert=require('assert');
const {CombatCore:C}=require('../../src/domain/index.cjs').loadDomain();
function setup(){const s=C.createCombat(),id=C.addFighter(s,'Terre');s.fighters[0].approach='defendre';s.phase='defendre';return {s,id};}
{const {s,id}=setup();s.temporaryEffects.push({id:'lava',originLabel:'Étoile de lave',targetId:id});const a={id:'a',name:'Étoile de lave',sourceId:id,targetId:id,options:{earthLavaConfirmed:true}};assert.throws(()=>C.propose(s,a),/déjà active/);assert.equal(s.proposals.length,0);}
{const {s,id}=setup();const a={id:'a',name:'Étoile de lave',sourceId:id,targetId:id,options:{earthLavaConfirmed:true}};s.actions.push(a);s.proposals=C.propose(s,a);s.temporaryEffects.push({id:'lava',originLabel:'Étoile de lave',targetId:id});const before=JSON.stringify(s);assert.throws(()=>C.commit(s),/déjà active/);assert.equal(JSON.stringify(s),before);}
{const {s,id}=setup();const a={id:'a',name:'Étoile de lave',sourceId:id,targetId:id,options:{earthLavaConfirmed:true}};s.actions.push(a);s.proposals=C.propose(s,a);s.temporaryEffects.push({id:'lava',originLabel:'Étoile de lave',targetId:id});const reject=Object.fromEntries(s.proposals.map(e=>[e.id,false]));C.commit(s,reject);assert.equal(s.temporaryEffects.length,1);}
console.log('V1.79 : unicité étoile de lave, validation atomique et refus MJ OK');
