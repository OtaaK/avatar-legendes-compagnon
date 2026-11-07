const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(){const s=C.createCombat(),a=C.addFighter(s,'Attaquant'),b=C.addFighter(s,'Protégé');s.temporaryEffects.push({id:'shield',originLabel:'Bouclier de roche',originSourceId:b,targetId:b,shieldBlockedRound:0,shieldGrantedGene:true});C.fighter(s,b).statuses.push('gene');return {s,a,b};}
function hit(x,id,amount=2){x.s.proposals=[{id:'e'+id,actionId:'attack'+id,sourceId:x.a,targetId:x.b,kind:'fatigue',amount,detail:'',reason:'Attaque',round:x.s.round}];return C.commit(x.s);}
let x=setup();x.s.proposals=[{id:'e1',actionId:'attack1',sourceId:x.a,targetId:x.b,kind:'fatigue',amount:2,detail:'',reason:'Attaque',round:1}];
const before=JSON.stringify(x.s);const preview=C.previewCommit(x.s);assert(preview.some(e=>/première attaque.*bloquée/.test(e.reason)));assert.equal(JSON.stringify(x.s),before);
C.commit(x.s);assert.equal(C.fighter(x.s,x.b).fatigue,0);assert.equal(x.s.temporaryEffects[0].shieldBlockedRound,1);
assert(C.undo(x.s));assert.equal(x.s.temporaryEffects[0].shieldBlockedRound,0);
hit(x,2);assert.equal(C.fighter(x.s,x.b).fatigue,0);hit(x,3);assert.equal(C.fighter(x.s,x.b).fatigue,2);
x=setup();x.s.proposals=[{id:'e1',actionId:'combo',sourceId:x.a,targetId:x.b,kind:'fatigue',amount:2,detail:'',reason:'Attaque',round:1},{id:'e2',actionId:'combo',sourceId:x.a,targetId:x.b,kind:'condition',amount:0,detail:'Terrifié',reason:'Attaque',round:1}];C.commit(x.s);assert.equal(C.fighter(x.s,x.b).fatigue,0);assert(!C.fighter(x.s,x.b).conditions.includes('Terrifié'));
console.log('V1.58 bouclier : interception automatique, attaque multiple, prévisualisation, annulation OK');
