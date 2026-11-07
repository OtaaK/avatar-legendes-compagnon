const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
for(const count of [0,1,2,3,5]){
 const s=C.createCombat(),a=C.addFighter(s,'Technicien','PNJ'),b=C.addFighter(s,'Adversaire','PNJ');
 C.fighter(s,a).materials=count;
 const action={id:'max'+count,sourceId:a,targetId:b,name:'Puissance maximale',options:{catalogEntry:{famille:'technologie'}}};
 s.actions.push(action);
 const effects=C.propose(s,action),damage=effects.find(e=>e.kind==='fatigue');
 assert.equal(damage.amount,2+count+(count>=3?2:0));
 assert.equal(C.fighter(s,a).materials,count);
 assert.equal(C.previewCommit(s).length,effects.length);
 assert.equal(C.fighter(s,a).equipmentDisabled,undefined);
 if(effects.length>1){const rejected={};rejected[effects[0].id]=false;assert.throws(()=>C.commit(s,rejected),/ensemble/);}
 // Overflow beyond five needs explicit player/MJ condition choices; use low reserve for full commit.
 if(count>1)continue;
 C.commit(s);
 assert.equal(C.fighter(s,a).materials,0);
 assert.equal(C.fighter(s,a).equipmentDisabled,true);
 assert.equal(C.fighter(s,a).statuses.includes('gene'),true);
 assert.equal(C.fighter(s,b).fatigue,2+count);
 assert.equal(C.undo(s),true);
 assert.equal(C.fighter(s,a).materials,count);assert.equal(C.fighter(s,a).equipmentDisabled,undefined);
 C.fighter(s,a).equipmentDisabled=true;
 const add={id:'add',sourceId:a,targetId:a,kind:'materials_add',amount:3,detail:'',reason:'Collecte'};
 s.proposals.push(add);assert.throws(()=>C.commit(s),/hors service/);
 s.proposals=[];
}
console.log('V0.96 puissance maximale : OK');
