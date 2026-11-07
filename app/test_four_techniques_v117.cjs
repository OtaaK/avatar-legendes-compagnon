const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function scenario(name,options={}){const s=C.createCombat(),src=C.addFighter(s,'Maître'),dst=C.addFighter(s,'Cible');const a={id:'a-117',round:s.round,sourceId:src,targetId:dst,name,approach:'attaquer',options};s.actions.push(a);return {s,src,dst,a};}
const cases=[
 ['Enfouissement',{},[['fatigue',2],['status_add','piege']]],
 ...[[1,['gene']],[3,['en_danger','gene']],[5,['piege','en_danger','gene']]].map(([cost,status])=>['Jet de flammes',{fireCost:String(cost)},[['fatigue',cost],...status.map(x=>['status_add',x])]]),
 ['Gantelet de terre',{choice:'fatigue'},[['fatigue',1],['fatigue',2],['note','']]],
 ['Gantelet de terre',{choice:'condition',condition:'Fragile'},[['fatigue',1],['condition','Fragile'],['note','']]],
 ['Disque de feu',{fireChoice:'esquive'},[['fatigue',1],['fatigue',1],['note','']]],
 ['Disque de feu',{fireChoice:'conditions',fireConditions:['Fragile','Confus']},[['fatigue',1],['condition','Fragile'],['condition','Confus']]],
];
for(const [name,options,expected] of cases){
 const {s,src,dst,a}=scenario(name,options),events=C.propose(s,a);
 assert.deepEqual(JSON.parse(JSON.stringify(events.map(e=>[e.kind,e.kind==='fatigue'?e.amount:e.detail]))),expected,name);
 assert.throws(()=>C.commit(s,{[events[0].id]:false}),/accepter ou refuser tous les effets ensemble/,name);
 assert.equal(C.fighter(s,src).fatigue,0);assert.equal(s.proposals.length,events.length);
 C.commit(s);assert.equal(C.fighter(s,src).fatigue,expected[0][1]);
 C.undo(s);assert.equal(C.fighter(s,src).fatigue,0);assert.equal(C.fighter(s,dst).conditions.length,0);assert.equal(C.fighter(s,dst).statuses.length,0);
}
for(const [name,options] of [['Jet de flammes',{fireCost:2}],['Gantelet de terre',{choice:'condition',condition:'Inventé'}],['Disque de feu',{fireChoice:'conditions',fireConditions:['Fragile','Fragile']}],['Disque de feu',{fireChoice:'inconnu'}]]){
 const {s,a}=scenario(name,options);assert.throws(()=>C.propose(s,a));assert.equal(s.proposals.length,0);
}
console.log('OK : 4 techniques, paliers, choix, refus indivisible et annulation');
