const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
for(const [name,status] of [['Bouclier de roche','gene'],['Armure de terre','avantage']]){
 const s=C.createCombat(),caster=C.addFighter(s,'Terre'),id=C.addFighter(s,'Cible'),f=C.fighter(s,id);
 f.statuses.push(status);f.roundStatuses=[{status,expiresAfterRound:1},{status,expiresAfterRound:2}];
 s.phase='fin';C.nextRound(s);assert(f.statuses.includes(status),'second timed source must survive');
 s.phase='fin';C.nextRound(s);assert(!f.statuses.includes(status),'last timed source must expire');
 const t=C.createCombat(),a=C.addFighter(t,'Terre'),b=C.addFighter(t,'Cible'),target=C.fighter(t,b);
 target.statuses.push(status);target.roundStatuses=[{status,expiresAfterRound:1}];
 for(let i=0;i<2;i++)t.temporaryEffects.push({id:'e'+i,targetId:b,originSourceId:a,originLabel:name,shieldGrantedGene:false,shieldExternalGene:true,armorPoints:3,armorExternalAdvantage:true});
 t.phase='fin';C.nextRound(t);assert(target.statuses.includes(status));
 for(const e of t.temporaryEffects)assert(name==='Bouclier de roche'?!e.shieldExternalGene:!e.armorExternalAdvantage,'all persistent holders must relinquish expired external provenance');
 C.removeTemporaryEffect(t,'e0');assert(target.statuses.includes(status),'second holder still active');
 C.removeTemporaryEffect(t,'e1');assert(!target.statuses.includes(status),'last holder removed');
 assert(C.undo(t));assert(C.fighter(t,b).statuses.includes(status));
}
console.log('V163 : sources temporaires superposées et protections multiples OK');
