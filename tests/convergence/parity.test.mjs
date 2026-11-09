import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import fs from 'node:fs';
import {CombatCore} from '../../packages/domain/src/combat.js';import {Roster} from '../../packages/domain/src/roster.js';import {BookState} from '../../packages/domain/src/books.js';import {PlaceRules} from '../../packages/domain/src/places.js';import {ResourceRules} from '../../packages/domain/src/resources.js';import {CombatRules} from '../../packages/domain/src/combat-rules.js';import {TECH_CATALOG} from '../../packages/domain/src/catalog.js';import {Playbooks} from '../../packages/domain/src/playbooks.js';import {publicCombatReport} from '../../packages/domain/src/public-report.js';
const html=fs.readFileSync(new URL('../../app/simulateur.html',import.meta.url),'utf8'),manifest=JSON.parse(fs.readFileSync(new URL('../../packages/domain/extraction.json',import.meta.url)));
const ctx={};ctx.window=ctx;vm.createContext(ctx);vm.runInContext(manifest.segments.map(({start,end})=>html.slice(html.indexOf(start),html.indexOf(end,html.indexOf(start)))).join('\n'),ctx);
vm.runInContext('window.TECH_CATALOG=TECH_CATALOG',ctx);
const extracted={CombatCore,Roster,BookState,PlaceRules,ResourceRules,CombatRules,TECH_CATALOG,Playbooks,publicCombatReport};
const json=x=>JSON.parse(JSON.stringify(x));
function run(api){
 const C=api.CombatCore,R=api.Roster,P=api.PlaceRules,B=api.BookState,lib=R.createLibrary(),s=C.createCombat(),trace=[];
 const record=(label,fn)=>{let result,error;try{result=fn()}catch(e){error=e.message}if(['coût refusé','retrait interdit'].includes(label))assert(error, label+' doit être refusé');else assert.equal(error,undefined,label);trace.push(json({label,result,error,library:lib,combat:s}));};
 const a=R.createCharacter(lib,'PJ fictif','PJ'),b=R.createCharacter(lib,'PNJ fictif','PNJ');
 record('livret',()=>R.updateCharacter(lib,a.id,{...api.Playbooks.applyPreset(lib,a.id,api.Playbooks.PLAYBOOKS[0].name,'creativite')}));
 record('suivi',()=>R.updateCharacter(lib,a.id,{playbookState:B.patch(a,a.livret,{progress:3,notes:'Test'})}));
 record('profil',()=>R.updateCharacter(lib,b.id,{npcResources:{format:'avatar-npc-resources',version:1,combatant:true,fatigueMax:15,balanceMax:4,conditions:['Un','Deux','Trois']},principles:['Protection',''],importance:'Légendaire'}));
 const root=P.create(lib,'Région'),child=P.create(lib,'Ville',root);record('liens',()=>P.setLinks(lib,b.id,{homeId:root,currentId:child,associatedIds:[root]}));record('renommer',()=>P.update(lib,child,{name:'Ville renommée'}));
 const fa=R.addToCombat(lib,s,a.id),fb=R.addToCombat(lib,s,b.id);
 record('engagement',()=>C.setEngagement(s,fa.id,fb.id,true));record('déclarer',()=>{C.declare(s,fa.id,'defendre','10+');C.declare(s,fb.id,'attaquer','10+');return C.reveal(s)});
 record('armure',()=>{const act={id:'action-test',name:'Armure de terre',sourceId:fa.id,targetId:fa.id,options:{earthArmorConfirmed:true}};const events=C.propose(s,act);s.actions.push(act);s.proposals=events;return C.commit(s)});
 const armor=s.temporaryEffects.find(e=>e.originLabel==='Armure de terre');
 record('coût refusé',()=>C.spendEarthArmor(s,armor.id,'fatigue',false));record('impact réactif',()=>C.resolveEarthArmorHit(s,armor.id,'fatigue',3,1,true));record('annuler impact',()=>C.undo(s));
 record('note de scène',()=>C.addSceneNote(s,'Note fictive'));record('export public',()=>api.publicCombatReport(s));
 record('report explicite',()=>R.syncCombatToLibrary(lib,s,fa.id));record('retrait interdit',()=>C.removeFighter(s,fb.id));
 return trace;
}
test('trace différentielle : personnages, profils, lieux, livret, armure, coût/refus, impact, undo, journal, export et report',()=>assert.deepEqual(run(extracted),run(ctx)));
test('catalogue complet et API publiques identiques à l’oracle',()=>{
 assert.deepEqual(json(TECH_CATALOG),json(ctx.TECH_CATALOG));assert.equal(TECH_CATALOG.length,111);
 for(const name of ['CombatCore','CombatRules','Roster','BookState','PlaceRules','ResourceRules','Playbooks'])assert.deepEqual(Object.keys(extracted[name]),Object.keys(ctx[name]));
});

test('parité des patches de fiche : identité seule, centre, profils volontaires et refus',async()=>{
 const {sheetPatchFromFields:patch}=await import('../../packages/domain/src/character-fields.js');
 const npc=Roster.makeCharacter('char-test','Nom','PNJ');npc.extra={keep:true};npc.placeLinks={homeId:'home',associatedIds:['linked'],currentId:null};
 const pj=Roster.makeCharacter('char-pj','PJ','PJ');
 const cases=[
  [npc,{sheetName:'Nom'},{sheetName:'Renommé'},[],[],[]],
  [npc,{sheetImportance:''},{sheetImportance:'Légendaire'},[],[],[]],
  [pj,{sheetCenter:'0',sheetBalance:'0'},{sheetCenter:'-2',sheetBalance:'1'},[],[],[]],
  [npc,{npcProfileMode:'legacy'},{npcProfileMode:'explicit',npcCombatant:'yes',npcFatigueMax:'15',npcBalanceMax:'4',npcConditionCount:'8',npcConditionNames:'Un\nDeux\nTrois\nQuatre\nCinq'},[],[],[]],
  [npc,{sheetDescription:''},{sheetDescription:'x'.repeat(2001)},[],[],[]],
 ];
 const invoke=(fn,args)=>{try{return {patch:json(fn(...json(args)))}}catch(error){return {error:error.message}}};
 for(const args of cases)assert.deepEqual(invoke(patch,args),invoke(ctx.sheetPatchFromFields,args));
});
