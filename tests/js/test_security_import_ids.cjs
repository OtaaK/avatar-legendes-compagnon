'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const code=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const roster=code.slice(code.indexOf('const rosterClone='),code.indexOf('window.Roster=')+code.slice(code.indexOf('window.Roster=')).indexOf(';')+1);
const context={window:{}};vm.createContext(context);vm.runInContext(roster,context);const R=context.window.Roster;
let count=0;const test=(name,f)=>{f();count++;console.log('OK '+name);};
const invalid=[undefined,null,0,{},[],true,'',' ','a b','a\nb','a\n','a\r','a\r\n','a\tb','a\u0000b','é','_hidden','a'.repeat(121),"char-1');globalThis.__audit=1;//",'a&quot;onclick=&quot;alert(1)','a" autofocus onfocus="alert(1)'];
for(const id of invalid)test('identifiant invalide refusé sans normalisation silencieuse : '+JSON.stringify(id),()=>{
 const c=R.makeCharacter(id,'Fiche synthétique');const before=JSON.stringify(c);
 assert.throws(()=>R.validateCharacter(c),/Identifiant/);assert.throws(()=>R.normalizeCharacter(c),/Identifiant/);assert.equal(JSON.stringify(c),before);
 assert.throws(()=>R.importLibrary(JSON.stringify({version:1,seq:2,characters:[c]})),/Identifiant/);assert.equal(globalThis.__audit,undefined);
});
test('anciens identifiants ASCII conservés exactement, y compris inconnus et liens',()=>{
 for(const id of ['char-1','a','123','legacy_ID-42','c3d3d971-5b30-4dc2-8750-53a2ae2d5811','a'.repeat(120)]){
  const c=R.makeCharacter(id,'Nom <privé>');c.future={keep:'texte libre'};
  const lib=R.importLibrary({version:1,seq:9,characters:[c],future:true});assert.equal(lib.characters[0].id,id);assert.equal(lib.characters[0].future.keep,'texte libre');assert.equal(lib.future,true);
 }
});
test('doublons toujours refusés',()=>{const c=R.makeCharacter('char-1','Test');assert.throws(()=>R.importLibrary({version:1,seq:2,characters:[c,c]}),/dupliqué/);});
test('aucune donnée dynamique dans les attributs de code événementiel',()=>{
 const events=[...html.matchAll(/\bon\w+="([^"]*)"/g)];assert.ok(events.length>0);
 for(const [,body]of events)assert.ok(!body.includes('${')&&!body.includes("'+"),'Handler dynamique résiduel : '+body);
 const dispatch=code.slice(code.indexOf('function handleDataAction('),code.indexOf('// Le premier affichage'));
 assert.ok(dispatch.includes('switch(action)'));assert.doesNotMatch(dispatch,/eval\(|new Function|window\[|globalThis\[/);
});
const vcode=code.slice(code.indexOf('function validateCombat('),code.indexOf('function validateBackupLinks('));
const cctx={Roster:{CONDITIONS:R.CONDITIONS},CombatCore:{STATUS:[],APPROACHES:['attaquer','esquiver','defendre']}};vm.createContext(cctx);vm.runInContext(vcode,cctx);
const combat=()=>({round:1,seq:2,phase:'declaration',fighters:[{id:'p-1',name:'Test',kind:'PJ',fatigue:0,balance:0,conditions:[],statuses:[],blocked:[],reactions:[],bonuses:[],approach:null,roll:null}],actions:[],proposals:[],history:[],snapshots:[],notes:[]});
test('références importées : characterId, id de piège et id de proposition contrôlés',()=>{
 for(const payload of invalid){
  if(payload===undefined)continue;
  const a=combat();a.fighters[0].characterId=payload;assert.throws(()=>cctx.validateCombat(a));
  const b=combat();b.traps=[{id:payload,ownerId:'p-1',zone:'Zone',round:1}];assert.throws(()=>cctx.validateCombat(b));
  const c=combat();c.proposals=[{id:payload,targetId:'p-1'}];assert.throws(()=>cctx.validateCombat(c));
 }
 const good=combat();good.fighters[0].characterId='legacy_ID-42';good.traps=[{id:'trap-e-3',ownerId:'p-1',zone:'Zone'}];good.proposals=[{id:'e-3',targetId:'p-1'}];assert.doesNotThrow(()=>cctx.validateCombat(good));
});
console.log(count+' scénarios de sécurité réussis');
