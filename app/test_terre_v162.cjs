const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
for(const [name,status] of [['Bouclier de roche','gene'],['Armure de terre','avantage']]){
 const s=C.createCombat(),a=C.addFighter(s,'Terre'),b=C.addFighter(s,'Allié');const f=C.fighter(s,b);
 f.statuses.push(status);f.roundStatuses=[{status,expiresAfterRound:1}];
 s.temporaryEffects.push({id:'persistent',targetId:b,originSourceId:a,originLabel:name,shieldGrantedGene:false,shieldExternalGene:false,armorPoints:3,armorExternalAdvantage:true});
 s.phase='fin';C.nextRound(s);assert(f.statuses.includes(status),name+' must survive temporary status expiry');
 assert(!f.roundStatuses.length);
 const e=s.temporaryEffects[0];assert(name==='Bouclier de roche'?e.shieldGrantedGene:!e.armorExternalAdvantage);
 C.removeTemporaryEffect(s,'persistent');assert(!f.statuses.includes(status),name+' must be removed when last source expires');
 assert(C.undo(s));assert(C.fighter(s,b).statuses.includes(status));
}
for(const [name,status] of [['Bouclier de roche','gene'],['Armure de terre','avantage']]){
 const s=C.createCombat(),b=C.addFighter(s,'Allié'),f=C.fighter(s,b);
 f.statuses.push(status);f.roundStatuses=[{status,expiresAfterRound:1}];s.phase='fin';C.nextRound(s);assert(!f.statuses.includes(status),'ordinary expiration must work');
}
console.log('V162 : expiration des statuts et protections Terre persistantes OK');
