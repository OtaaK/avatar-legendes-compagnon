const fs=require('fs'),assert=require('assert');
const h=fs.readFileSync(__dirname+'/simulateur.html','utf8');
assert(h.includes('commitCombatMutation(()=>CombatCore.waiveCountertime(s,id,true))'));
assert(h.includes('commitCombatMutation(()=>CombatCore.revealCountertime(s,id,true))'));
assert(!h.includes('CombatCore.waiveCountertime(s,id,true);save()'));
console.log('V1.47 : les deux actions À contretemps sont transactionnelles');
