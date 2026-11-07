const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(kind,external=false){const s=C.createCombat(),a=C.addFighter(s,'Terre'),b=C.addFighter(s,'Allié');const f=C.fighter(s,b);const status=kind==='Bouclier de roche'?'gene':'avantage';f.statuses.push(status);s.temporaryEffects.push({id:'effect',targetId:b,originSourceId:a,originLabel:kind,shieldGrantedGene:true,shieldExternalGene:external,armorPoints:3,armorExternalAdvantage:external});return {s,b,status};}
for(const kind of ['Bouclier de roche','Armure de terre'])for(const external of [false,true]){
 const {s,b,status}=setup(kind,external);const before=JSON.stringify(s);assert.throws(()=>C.editTemporaryEffect(s,'effect','x','manual'),/Effet mécanique/);assert.strictEqual(JSON.stringify(s),before);
 C.removeTemporaryEffect(s,'effect');assert(!s.temporaryEffects.length);assert.strictEqual(C.fighter(s,b).statuses.includes(status),external,kind+' external='+external);assert(C.undo(s));assert(s.temporaryEffects.length===1);assert(C.fighter(s,b).statuses.includes(status));
}
const {s,b}=setup('Bouclier de roche');s.proposals.push({id:'pending'});const before=JSON.stringify(s);assert.throws(()=>C.removeTemporaryEffect(s,'effect'),/attente/);assert.strictEqual(JSON.stringify(s),before);
assert(html.includes('commitCombatMutation(()=>CombatCore.removeTemporaryEffect(s,id))'));
console.log('V161 : retrait mécanique, autres sources, annulation, édition interdite, attente, persistance UI OK');
