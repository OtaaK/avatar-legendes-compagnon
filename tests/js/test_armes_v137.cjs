'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function scene(options){const s=C.createCombat(),a=C.addFighter(s,'Héros'),b=C.addFighter(s,'A'),c=C.addFighter(s,'B');const act={id:'feinte',round:s.round,sourceId:a,targetId:b,name:'Feinte',approach:'analyser',options};s.actions.push(act);return {s,a,b,c,act}}
{
 const {s,a,b,c,act}=scene({weaponFeintConfirmed:true,weaponFeintAttackers:[],weaponFeintConditions:{}});
 act.options.weaponFeintAttackers=[b,c];act.options.weaponFeintConditions={[b]:'Confus',[c]:'Terrifié'};
 const events=C.propose(s,act);assert.equal(events.length,3);
 assert.throws(()=>C.commit(s,{[events[1].id]:false}),/accepter ou refuser tous/);
 C.commit(s);assert.equal(C.fighter(s,a).fatigue,1);assert(C.fighter(s,b).conditions.includes('Confus'));assert(C.fighter(s,c).conditions.includes('Terrifié'));
 C.undo(s);assert.equal(C.fighter(s,a).fatigue,0);assert.equal(C.fighter(s,b).conditions.length,0);
}
for(const options of [{weaponFeintConfirmed:false,weaponFeintAttackers:['x']},{weaponFeintConfirmed:true,weaponFeintAttackers:[]},{weaponFeintConfirmed:true,weaponFeintAttackers:['x'],weaponFeintConditions:{x:'Confus'}}]){
 const {s,act}=scene(options);assert.throws(()=>C.propose(s,act));
}
console.log('OK V1.37 Feinte : coûts, assaillants, états, validation indivisible et annulation');
