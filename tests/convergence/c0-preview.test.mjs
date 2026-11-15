import test from 'node:test';
import assert from 'node:assert/strict';
import { previewExternalResourceEdits as preview, externalResourceState as state } from '../../packages/application/src/external-field-preview.js';
import { inspectImport, emptySession, validateSession } from '../../packages/persistence/src/codecs.js';
import { Roster } from '../../packages/domain/src/roster.js';
import { createCompanionServices } from '../../packages/application/src/companion-services.js';
import { createBusinessRepository } from '../../packages/persistence/src/business-repository.js';
const fields = ['fatigue','fatigueCapacity','balance'];
const versions = [{}, {value:null}, {value:0}, {value:7}];
test('C0 : absence/null/zéro/positif restent distincts sur 64 combinaisons et un aller-retour JSON',()=>{
  for(const a of versions)for(const b of versions)for(const c of versions){
    const source={id:'pnj-test',kind:'pnj'};
    for(const [i,v] of [a,b,c].entries())if(Object.hasOwn(v,'value'))source[fields[i]]=v.value;
    const before=JSON.stringify(source), result=preview(source);
    assert.equal(JSON.stringify(source),before);assert.equal(JSON.stringify(result.candidate),before);
    const reload=JSON.parse(JSON.stringify(result.candidate));
    for(const f of fields){assert.equal(Object.hasOwn(reload,f),Object.hasOwn(source,f));assert.deepEqual(state(reload,f),state(source,f));}
    assert.equal(result.changed,false);assert.equal(result.canonical,false);assert.equal(result.effectsApplied,false);
  }
});
test('C0 : ouverture/suggestion sans intention ne crée ni fatigue ni capacité',()=>{
  const source={id:'p',kind:'pnj',importance:'Légendaire'};
  const result=preview(source,[{field:'fatigue',action:'keep'},{field:'fatigueCapacity',action:'keep'}]);
  assert.deepEqual(result.candidate,source);assert.equal(result.changed,false);
});
test('C0 : set null, set zéro et remove sont des intentions différentes',()=>{
  const initial={fatigue:3,fatigueCapacity:7,balance:null};
  const zero=preview(initial,[{field:'fatigue',action:'set',value:0}]);assert.equal(zero.candidate.fatigue,0);
  const nil=preview(initial,[{field:'fatigue',action:'set',value:null}]);assert.equal(nil.candidate.fatigue,null);
  const removed=preview(initial,[{field:'fatigue',action:'remove'}]);assert(!Object.hasOwn(removed.candidate,'fatigue'));
  assert.equal(initial.fatigue,3);assert.equal(removed.candidate.balance,null);assert.equal(removed.candidate.fatigueCapacity,7);
});
test('C0 : aucun clamp ni choix de profil par importance ; refus de transport ambigu',()=>{
  const result=preview({importance:'Mineur',fatigueCapacity:27,balance:-2});
  assert.equal(result.candidate.fatigueCapacity,27);assert.equal(result.candidate.balance,-2);
  for(const value of [undefined,'0',false,NaN,Infinity,1.5])assert.throws(()=>state({fatigue:value},'fatigue'));
  assert.throws(()=>preview({},[{field:'fatigue',action:'set'}]));
  assert.throws(()=>preview({},[{field:'fatigue',action:'keep',value:0}]));
});
test('C0 : champs inconnus, trois maîtrises et références provisoires conservés sans interprétation',()=>{
  const source={id:'pj',kind:'pj',future:{constructor:'texte',prototype:{ok:true}},techniques:[{name:'A',mastery:'acquise'},{name:'B',mastery:'pratiquee'},{name:'C',mastery:'maitrisee'}],importantRelationships:[{provisional:true,targetName:'Inconnu',description:'Relation'}],relationships:'Ancien texte',homeLocationId:'home',locationId:'here',associatedLocationIds:['other']};
  const result=preview(source);assert.deepEqual(result.candidate,source);
  assert.throws(()=>{result.candidate.future.prototype.ok=false},TypeError);assert.equal(source.future.prototype.ok,true);
});
test('C0 : graphe d’évolutions et événements inconnus archivés sans transition ni récompense',()=>{
  const source={progression:4,evolutionHistory:[{id:'a',status:'corrected',relatedTo:[],source:'regulatory'},{id:'b',status:'active',relatedTo:['a']},{id:'z',status:'future-status',future:{preserved:true}}],playbookPreparation:{events:[{kind:'unknown',payload:{keep:true}}]}};
  const result=preview(source);assert.deepEqual(result.candidate,source);assert.equal(result.effectsApplied,false);assert.equal(result.candidate.progression,4);
});
test('C0 : même frontière de sécurité B, sans exécution ni réécriture des identifiants',()=>{
  assert.throws(()=>preview(JSON.parse('{"__proto__":{"polluted":true}}')),/prototype/);
  let calls=0;assert.throws(()=>preview({get fatigue(){calls++;return 0}}),/Accesseur/);assert.equal(calls,0);
  assert.throws(()=>preview({toJSON(){calls++;return {}}}));assert.equal(calls,0);
  assert.throws(()=>preview({},[{field:'__proto__',action:'set',value:0}]));
  assert.throws(()=>preview({},[{field:'fatigue',action:'set',value:0},{field:'fatigue',action:'remove'}]));
  assert.throws(()=>preview({id:"x');bad();//"}),/Identifiant/);
  assert.throws(()=>preview({future:{notJson:undefined}}),/undefined/);
  const c=Roster.makeCharacter("x');bad();//",'Test');assert.throws(()=>Roster.importLibrary({version:1,seq:2,characters:[c]}),/Identifiant/);
  assert.equal({}.polluted,undefined);
});
test('C0 : aperçu externe et format v0 restent refusés comme import canonique',()=>{
  const p=preview({id:'npc',kind:'pnj'});
  assert.throws(()=>inspectImport(JSON.stringify(p)));
  assert.throws(()=>inspectImport(JSON.stringify({characters:[],places:[],techniques:[]})));
  for(const value of [undefined,null]){
    const s=emptySession(),c=Roster.createCharacter(s.library,'Historique','PNJ');
    if(value===undefined)delete c.fatigue;else c.fatigue=value;
    assert.throws(()=>validateSession(s)); // Écart documenté, aucune correction du domaine en C0.
  }
});
test('C0 : aperçu/abandon n’écrit ni session, ni anciennes clés, ni descriptions privées',()=>{
  const data=new Map([['avatar-legendes-compagnon-demo-v1','DEMO'],['avatar-compagnon-private-technique-texts-v1','PRIVE']]);
  let writes=0;const storage={getItem:k=>data.get(k)??null,setItem(){writes++}};
  const api=createCompanionServices({repository:createBusinessRepository({storage})}),before=api.session.getSnapshot();
  preview({fatigue:null,importantRelationships:[{provisional:true,targetName:'P'}]},[{field:'fatigue',action:'set',value:0}]);
  assert.equal(writes,0);assert.equal(api.session.getSnapshot(),before);assert.equal(data.size,2);
});
