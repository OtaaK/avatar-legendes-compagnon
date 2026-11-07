'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const script=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
const rosterExport=script.match(/window\.Roster=\{[^;]+;/)[0];
const context={window:{},console};vm.createContext(context);vm.runInContext(script.slice(0,script.indexOf('window.Roster='))+rosterExport,context);
context.CombatCore=context.window.CombatCore;context.Roster=context.window.Roster;
vm.runInContext(script.slice(script.indexOf('function validateCombat('),script.indexOf('function validateBackupLinks(')),context);
const C=context.CombatCore;let count=0;
function test(label,run){try{run();count++;}catch(error){error.message=label+' : '+error.message;throw error;}}
function setup(){const s=C.createCombat(),a=C.addFighter(s,'A'),b=C.addFighter(s,'B');s.engagements=[[a,b]];s.traps=[{id:'trap-e-3',ownerId:a,zone:'Passage',round:1}];return {s,a,b};}
function reject(label,change,pattern){test(label,()=>{const f=setup();change(f);const before=JSON.stringify(f.s);assert.throws(()=>context.validateCombat(f.s),pattern);assert.equal(JSON.stringify(f.s),before,'Le validateur ne doit pas réparer ou altérer les données');});}
test('combat valide conservé à l’identique',()=>{const {s}=setup(),before=JSON.stringify(s);assert.equal(context.validateCombat(s),s);assert.equal(JSON.stringify(s),before);});
for(const value of [{},'invalide',false,42])reject('engagements non tabulaires '+JSON.stringify(value),({s})=>s.engagements=value,/Engagement/);
for(const [label,pair] of [['paire vide',()=>[]],['paire incomplète',a=>[a]],['paire trop longue',(a,b)=>[a,b,a]],['paire objet',a=>({source:a})],['auto-engagement',a=>[a,a]],['référence absente',a=>[a,'absent']],['référence nulle',a=>[a,null]]])reject(label,({s,a,b})=>s.engagements=[pair(a,b)],/Engagement/);
for(const value of [{},'invalide',true,42])reject('pièges non tabulaires '+JSON.stringify(value),({s})=>s.traps=value,/Piège/);
reject('piège nul',({s})=>s.traps=[null],/Piège/);
reject('piège sans identifiant',({s})=>delete s.traps[0].id,/Piège/);
reject('identifiant de piège vide',({s})=>s.traps[0].id='',/Piège/);
reject('identifiants de pièges dupliqués',({s})=>s.traps.push({...s.traps[0]}),/Piège/);
reject('propriétaire de piège absent',({s})=>s.traps[0].ownerId='absent',/Piège/);
reject('zone non textuelle',({s})=>s.traps[0].zone={},/Piège/);
reject('zone vide',({s})=>s.traps[0].zone=' ',/Piège/);
reject('zone trop longue',({s})=>s.traps[0].zone='x'.repeat(121),/Piège/);
reject('passe de piège négative',({s})=>s.traps[0].round=-1,/Piège/);
reject('passe de piège future',({s})=>s.traps[0].round=2,/Piège/);
test('champs optionnels anciens absents',()=>{const {s}=setup();delete s.traps;delete s.engagements;assert.doesNotThrow(()=>context.validateCombat(s));});
test('champs optionnels anciens nuls',()=>{const {s}=setup();s.traps=null;s.engagements=null;assert.doesNotThrow(()=>context.validateCombat(s));});
test('ancien identifiant de piège conservé sans renumérotation',()=>{const {s}=setup();s.traps[0].id='ancien-piege';delete s.traps[0].round;const before=JSON.stringify(s);context.validateCombat(s);assert.equal(JSON.stringify(s),before);});
test('engagement inversé valide',()=>{const {s,a,b}=setup();s.engagements=[[b,a]];assert.doesNotThrow(()=>context.validateCombat(s));});
console.log('Validité des sauvegardes : '+count+' scénarios, références, formats et compatibilité des champs optionnels OK');
