const assert=require('assert');
const {CombatCore:C}=require('../../src/domain/index.cjs').loadDomain();
function setup(){const s=C.createCombat(),a=C.addFighter(s,'Terre');const action={id:'armor',sourceId:a,targetId:a,name:'Armure de terre',options:{earthArmorConfirmed:true}};s.actions.push(action);s.proposals.push(...C.propose(s,action));return {s,a};}
for(const kind of ['status_add','note']){const {s}=setup();const e=s.proposals.find(x=>x.kind===kind);assert(e);const prior=JSON.stringify(s);assert.throws(()=>C.commit(s,{[e.id]:false}),/accepter ou refuser tous les effets ensemble|valider ou refuser ensemble/);assert.strictEqual(JSON.stringify(s),prior);}
{const {s,a}=setup();const decisions=Object.fromEntries(s.proposals.map(e=>[e.id,false]));C.commit(s,decisions);assert(!s.temporaryEffects.some(e=>e.originLabel==='Armure de terre'));assert(!C.fighter(s,a).statuses.includes('avantage'));}
{const {s,a}=setup();C.commit(s,{});assert(s.temporaryEffects.some(e=>e.originLabel==='Armure de terre'&&e.armorPoints===3));assert(C.fighter(s,a).statuses.includes('avantage'));}
console.log('V1.85 : activation atomique Armure de terre OK');
