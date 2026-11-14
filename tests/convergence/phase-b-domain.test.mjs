import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { Roster } from '../../packages/domain/src/roster.js';
import { CombatCore as C } from '../../packages/domain/src/combat.js';
import { BookState } from '../../packages/domain/src/books.js';
import { PlaceRules } from '../../packages/domain/src/places.js';
import { validateCombat } from '../../packages/domain/src/validation.js';
import { assertSafeJson } from '../../packages/domain/src/import-safety.js';
import { emptySession, exportBackup, inspectImport, copy, validateSession } from '../../packages/persistence/src/codecs.js';
import { createBusinessRepository } from '../../packages/persistence/src/business-repository.js';
import { SESSION_KEY } from '../../packages/persistence/src/local-session-repository.js';
import { createCompanionServices } from '../../packages/application/src/companion-services.js';
import { createPlaybookDraft } from '../../packages/application/src/playbook-preparation.js';
import { TECH_CATALOG } from '../../packages/domain/src/catalog.js';
import { TECHNIQUE_LIBRARY } from '../../packages/reference/src/technique-library.js';
import { parsePrivateDescriptions, serializePrivateDescriptions, privateDescriptionRepository, PRIVATE_TEXT_KEY } from '../../packages/reference/src/private-descriptions.js';
const malicious = ["x');globalThis.__phaseBExecuted=true;//", 'x" autofocus onfocus=alert(1)', '<img/src=x>', 'char-1\n', 'char-1\r', '__proto__', '', 'a'.repeat(121), null, 12];
function setup(initial = {}) {
  const data = new Map(Object.entries(initial));
  const storage = {
    writes: 0, fail: false,
    getItem: k => data.get(k) ?? null,
    setItem(k, v) { if (this.fail) throw Error('Stockage refusé'); this.writes++; data.set(k, v); },
    removeItem(k) { data.delete(k); },
  };
  const repository = createBusinessRepository({storage});
  return {data, storage, repository, api: createCompanionServices({repository})};
}
function fixture() {
  const s = emptySession(), pj = Roster.createCharacter(s.library, 'PJ synthétique', 'PJ');
  pj.livret = 'Livret personnel'; pj.center = -2; pj.balance = 1;
  pj.principles = ['Devoir', 'Liberté']; pj.relationships = ['Lien ancien'];
  pj.techniques = [{ name: 'Technique historique personnalisée', mastery: 'pratiquee', future: {original: true} }];
  pj.playbookMoves = ['Manœuvre ancienne'];
  pj.playbookState = BookState.patch(pj, pj.livret, {progress:4, notes:'Notes antérieures', evolutions:'Évolutions déjà enregistrées'});
  pj.playbookState.entries[0].future = {retain: 42};
  pj.playbookPreparation = {...createPlaybookDraft(), status:'recorded', future:{unrecognized:true}, events:[{kind:'legacy-unknown-event', applied:false, payload:{retain:1}}]};
  // Le lecteur conserve les événements inconnus ; il ne prétend pas les exécuter.
  pj.future = {constructor:'simple texte compatible', prototype:{innocent:true}, id:'ID d’extension libre'};
  const home = PlaceRules.create(s.library, 'Domicile');
  s.library.places.push({id:'île/ancienne?x', name:'Lieu historique', parentId:null, future:{retain:true}});
  for (const cap of [0,3,5,10,15]) {
    const npc = Roster.createCharacter(s.library, 'PNJ '+cap, 'PNJ');
    Roster.updateCharacter(s.library, npc.id, {
      importance:'Légendaire', fatigue:cap,
      npcResources:{format:'avatar-npc-resources', version:1, combatant:cap>0, fatigueMax:cap, balanceMax:0, conditions:cap?['État personnalisé']:[], future:{cap}},
      placeLinks:{homeId:home, currentId:'île/ancienne?x', associatedIds:['île/ancienne?x']},
    });
    npc.placeLinks.future=17; npc.future={enriched:cap};
  }
  const f = Roster.addToCombat(s.library, s.combat, pj.id);
  C.declare(s.combat, f.id, 'defendre', '10+'); C.reveal(s.combat);
  C.manual(s.combat, f.id, f.id, 'fatigue', 1, '', 'Arbitrage synthétique'); C.commit(s.combat);
  s.combat.history.push({round:1, events:[{kind:'historical-extension', removedFighterId:'p-999', future:{keep:true}}]});
  s.combat.future={retain:true}; s.library.future={v2:true};
  s.backupMetadata={format:'avatar-compagnon-backup',version:2, future:{retain:true}};
  return s;
}
test('phase B : chaque ID piégé est refusé à import/normalisation/validation sans exécution', () => {
  globalThis.__phaseBExecuted=false;
  for (const id of malicious) {
    const c = Roster.makeCharacter(id, 'Fiche piégée');
    const raw = JSON.stringify({version:2,seq:2,characters:[c]});
    assert.throws(()=>Roster.importLibrary(raw), /Identifiant/);
    assert.throws(()=>Roster.importLibrary(JSON.parse(raw)), /Identifiant/);
    assert.throws(()=>Roster.normalizeCharacter(c), /Identifiant/);
    assert.throws(()=>Roster.validateCharacter(c), /Identifiant/);
  }
  assert.equal(globalThis.__phaseBExecuted,false); delete globalThis.__phaseBExecuted;
});
test('phase B : IDs historiques sûrs, UUID et limites conservés sans renumérotation',()=>{
  for(const id of ['char-1','A_2-3','36fcb3a4-3200-4ecc-95ea-67f1ce01fc11','0','a'.repeat(120)]) {
    const raw={version:1,seq:2,characters:[Roster.makeCharacter(id,'Valide')]};
    assert.equal(Roster.importLibrary(raw).characters[0].id,id);
  }
  const c=Roster.makeCharacter('char-1','Doublon');
  assert.throws(()=>Roster.importLibrary({version:1,seq:3,characters:[c,c]}),/dupliqué/);
});
test('phase B : refus atomique d’une bibliothèque malveillante, avec ancienne sauvegarde intacte',async()=>{
  const {api,storage,data}=setup();
  await api.session.commitImport(api.session.prepareImport(exportBackup(fixture())));
  const before=api.session.getSnapshot(), token=data.get(SESSION_KEY), writes=storage.writes;
  const raw=copy(before.session.library); raw.characters.at(-1).id=malicious[0];
  assert.throws(()=>api.session.prepareImport(JSON.stringify(raw)),/Identifiant/);
  assert.equal(api.session.getSnapshot(),before); assert.equal(data.get(SESSION_KEY),token); assert.equal(storage.writes,writes);
});
test('phase B : liens de fiches, propositions et pièges malveillants refusés',()=>{
  for(const key of ['characterId','proposal','trap','fighter']) {
    const s=fixture(), f=s.combat.fighters[0];
    if(key==='characterId') f.characterId=malicious[0];
    if(key==='fighter') f.id='p-1\n';
    if(key==='proposal') s.combat.proposals=[{id:malicious[0],targetId:f.id}];
    if(key==='trap') s.combat.traps=[{id:malicious[0],ownerId:f.id,zone:'Zone'}];
    assert.throws(()=>validateCombat(s.combat),/invalide/i,key);
  }
});
test('phase B : identités piégées dans les instantanés refusées avant restauration',()=>{
  const s=fixture(); assert(s.combat.snapshots.length);
  s.combat.snapshots[0].fighters[0].characterId=malicious[0];
  assert.throws(()=>validateSession(s),/Identifiant/);
});
test('phase B : pollution de prototype refusée sans supprimer les extensions inoffensives',()=>{
  for(const json of ['{"__proto__":{"polluted":true}}','{"nested":{"constructor":{"prototype":{"polluted":true}}}}']) {
    const s=emptySession(); s.library.future=JSON.parse(json);
    assert.throws(()=>validateSession(s),/prototype/);
    assert.throws(()=>inspectImport(JSON.stringify({format:'avatar-compagnon-backup',version:2,...s})),/prototype/);
  }
  assert.equal({}.polluted,undefined);
  const s=fixture(); assert.deepEqual(validateSession(s).library.characters[0].future,s.library.characters[0].future);
});
test('phase B : getters et toJSON ne sont jamais exécutés à la frontière objet',()=>{
  let calls=0;
  for(const payload of [Object.defineProperty({},'id',{enumerable:true,get(){calls++;throw Error('Exécuté')}}), {toJSON(){calls++;return {};}}, Object.create(Object.defineProperties(Object.create(null), {constructor:{value:Object}, id:{get(){calls++;return 'char-1'}}}))]) {
    const s=emptySession(); s.library.future=payload;
    assert.throws(()=>validateSession(s),/JSON/); assert.throws(()=>Roster.importLibrary(s.library),/JSON/);
  }
  assert.equal(calls,0);
});
test('phase B : cycle/non-JSON refusé ; références partagées et undefined internes compatibles',()=>{
  const shared={ok:true}; const v={a:shared,b:shared,optional:undefined}; assert.doesNotThrow(()=>assertSafeJson(v));
  for(const value of [NaN,Infinity,()=>{},12n,Symbol('x'),new Date()]) assert.throws(()=>assertSafeJson(value),/JSON/);
  const cycle={};cycle.self=cycle;assert.throws(()=>assertSafeJson(cycle),/circular/);
});
test('phase B : roundtrip enrichi v2 exact, historiques et extensions multi-niveaux conservés',async()=>{
  const original=fixture(),{api,repository}=setup();
  await api.session.commitImport(api.session.prepareImport(exportBackup(original)));
  const loaded=repository.load().session;
  assert.deepEqual(loaded.library,original.library); assert.deepEqual(loaded.combat,original.combat);
  assert.deepEqual(inspectImport(api.exports.campaign()).session.library,original.library);
  assert.deepEqual(inspectImport(api.exports.campaign()).session.combat,original.combat);
  assert.deepEqual(loaded.library.characters.slice(1).map(c=>c.npcResources.fatigueMax),[0,3,5,10,15]);
  assert.equal(loaded.library.characters[0].techniques[0].mastery,'pratiquee');
  assert.equal(loaded.library.characters[0].playbookState.entries[0].progress,4);
});
test('phase B : une enveloppe v2 sans profil enrichi ne régresse pas silencieusement vers v1',()=>{
  const raw={format:'avatar-compagnon-backup',version:2,...emptySession(),future:{keep:true}};
  const result=JSON.parse(exportBackup(inspectImport(JSON.stringify(raw)).session));
  assert.equal(result.version,2); assert.deepEqual(result.future,{keep:true});
  assert.equal(JSON.parse(exportBackup(emptySession())).version,1);
});
test('phase B : anciens champs omis et anciens libellés normalisés, sans changement de ressources',()=>{
  const c=Roster.makeCharacter('ancien-1','Ancien');
  for(const key of ['center','training','history','playbookMoves','relationships','principles','location'])delete c[key];
  c.fatigue=3;c.conditions=['Effrayé'];c.statuses=['en_danger'];c.future={old:1};
  const result=Roster.importLibrary({version:1,seq:2,characters:[c]}).characters[0];
  assert.equal(result.fatigue,3);assert.deepEqual(result.conditions,['Terrifié']);assert.deepEqual(result.statuses,['En danger']);assert.deepEqual(result.future,{old:1});
});
test('phase B : quota/refus conserve ensemble PJ, lieux, combat, révision et notifications',async()=>{
  const {api,storage,data}=setup();await api.session.commitImport(api.session.prepareImport(exportBackup(fixture())));
  const before=api.session.getSnapshot(),token=data.get(SESSION_KEY);let signals=0;api.session.subscribe(()=>signals++);
  storage.fail=true;
  await assert.rejects(()=>api.session.execute(before.revision,d=>{d.library.characters[0].name='Perdu';d.library.places=[];d.combat.notes.push('Perdu');}),/refusé/);
  assert.equal(api.session.getSnapshot(),before);assert.equal(data.get(SESSION_KEY),token);assert.equal(signals,0);
  storage.fail=false;await api.session.execute(before.revision,d=>{d.library.characters[0].name='Enregistré';});
  assert.equal(signals,1);assert.equal(api.session.getSnapshot().revision,before.revision+1);
});
test('phase B : restauration validée, aperçu annulé, plan périmé et plan étranger refusés',async()=>{
  const {api,storage}=setup(), before=api.session.getSnapshot();
  const cancelled=api.session.prepareImport(exportBackup(fixture()));
  assert.equal(api.session.getSnapshot(),before);assert.equal(storage.writes,0);
  const other=setup();await assert.rejects(()=>other.api.session.commitImport(cancelled),/inconnu/);
  await api.session.execute(0,d=>{d.backupMetadata.note='Actualisé';});
  await assert.rejects(()=>api.session.commitImport(cancelled),/périmée/);
  const plan=api.session.prepareImport(exportBackup(fixture()));await api.session.commitImport(plan);
  const reloaded=createCompanionServices({repository:createBusinessRepository({storage})});
  assert.deepEqual(reloaded.session.getSnapshot(),api.session.getSnapshot());
});
test('phase B : stockage corrompu ou refusé bloque les écritures et les deux exports',async()=>{
  for(const repository of [setup({[SESSION_KEY]:'{'}).repository,{load(){throw Error('Accès refusé')},save(){assert.fail('Écriture interdite')}}]) {
    const api=createCompanionServices({repository});assert(api.session.getSnapshot().error);
    assert.throws(()=>api.exports.campaign(),/Aucun état valide/);
    assert.throws(()=>api.exports.combat(),/Aucun état valide/);
    await assert.rejects(()=>api.session.execute(0,()=>{}),/bloquée/);
  }
});
test('phase B : un repository injecté ne peut contourner la validation au chargement',()=>{
  const s=fixture();s.library.characters[0].id=malicious[0];
  const api=createCompanionServices({repository:{load:()=>({token:'x',revision:1,session:s}),save(){assert.fail()}}});
  assert.match(api.session.getSnapshot().error,/Identifiant/);
});
test('phase B : renommage PNJ conserve domicile et lieux ; importance ne recalcule rien',async()=>{
  const {api}=setup();await api.session.commitImport(api.session.prepareImport(exportBackup(fixture())));
  const c=api.session.getSnapshot().session.library.characters.at(-1),links=copy(c.placeLinks);
  await api.characters.edit(1,c.id,{name:'PNJ renommé',importance:'Mineur'});
  assert.deepEqual(api.queries.character(c.id).placeLinks,links);assert.equal(api.queries.character(c.id).fatigue,15);assert.equal(api.queries.resources(c.id).fatigueMax,15);
});
test('phase B : catalogue, attribution et fiche/copie de combat restent indépendants',async()=>{
  const {api}=setup();await api.session.commitImport(api.session.prepareImport(exportBackup(fixture())));
  const original=JSON.stringify(TECH_CATALOG), list=api.queries.techniques(), c=api.queries.character('char-1');
  assert.equal(list.length,111);assert.equal(list[0].mastery,undefined);
  assert.throws(()=>{list[0].name='Muté';},TypeError);assert.throws(()=>{c.name='Muté';},TypeError);
  await api.characters.adjust(1,'char-1','fatigue',2);
  await api.session.execute(2,d=>{Roster.assignTechnique(d.library,'char-1',TECHNIQUE_LIBRARY[0].name,'pratiquee');});
  assert.equal(JSON.stringify(TECH_CATALOG),original);assert.equal(api.session.getSnapshot().session.combat.fighters[0].fatigue,1);
  assert.equal(api.session.getSnapshot().session.combat.fighters[0].techniques.length,1);
});
test('phase B : 111 descriptions privées importées/restaurées séparément, jamais dans la campagne',async()=>{
  const {api,storage,data}=setup();await api.session.commitImport(api.session.prepareImport(exportBackup(fixture())));
  const privateRepo=privateDescriptionRepository(storage);
  const text=JSON.stringify({format:'avatar-technique-descriptions-privees',version:2,techniques:TECHNIQUE_LIBRARY.map((t,i)=>({id:t.id,description:'Texte privé synthétique '+i+'\n\nParagraphe <littéral>.',textFormat:i%2?'markdown-lite':'plain'}))});
  const imported=privateRepo.save(parsePrivateDescriptions(text));
  const exported=serializePrivateDescriptions(imported);assert.deepEqual(parsePrivateDescriptions(exported),imported);
  assert.deepEqual(privateRepo.load().descriptions,imported);assert.equal(Object.keys(imported).length,111);
  assert(!api.exports.campaign().includes('Texte privé synthétique'));assert(!api.exports.combat().includes('Texte privé synthétique'));
  assert(data.has(PRIVATE_TEXT_KEY));assert(data.has(SESSION_KEY));
  const token=data.get(PRIVATE_TEXT_KEY);storage.fail=true;assert.throws(()=>privateRepo.save(imported),/refusé/);assert.equal(data.get(PRIVATE_TEXT_KEY),token);
});
test('phase B : import des services et du domaine sans globals navigateur ni réseau',()=>{
  const code=`for(const k of ['window','document','navigator','localStorage','fetch'])Object.defineProperty(globalThis,k,{configurable:true,get(){throw Error('Accès navigateur interdit : '+k)}});
    const fs=await import('node:fs/promises');
    for(const dir of ['domain','application','persistence'])for(const file of await fs.readdir('./packages/'+dir+'/src'))if(file.endsWith('.js'))await import('./packages/'+dir+'/src/'+file);
    const {createCompanionServices}=await import('./packages/application/src/companion-services.js');
    let loads=0;const api=createCompanionServices({repository:{load(){loads++;return {token:null,session:null,revision:0}},save(){throw Error('Écriture inattendue')}}});
    if(loads!==1||api.queries.techniques().length!==111)throw Error('Service incorrect');`;
  const result=spawnSync(process.execPath,['--input-type=module','-e',code],{cwd:new URL('../../',import.meta.url),encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
});

test('phase B : commandes canoniques sans formulaire, portrait refusé et ajustement annulable',async()=>{
  const {api,storage}=setup();
  const id=await api.characters.create(0,'PJ','Création canonique',{principles:['A','B'],center:-1,balance:1,future:{keep:true}});
  assert.equal(id,'char-1');
  await api.characters.edit(1,id,{name:'Renommé'});
  assert.deepEqual(api.queries.character(id).future,{keep:true});
  const before=api.session.getSnapshot(),writes=storage.writes;
  await assert.rejects(()=>api.characters.edit(2,id,{portrait:'javascript:alert(1)'}),/Portrait invalide/);
  await assert.rejects(()=>api.characters.edit(2,id,{id:'autre'}),/Identité protégée/);
  assert.equal(api.session.getSnapshot(),before);assert.equal(storage.writes,writes);
  await api.characters.adjust(2,id,'fatigue',2);assert(api.characters.canUndo(id));
  await api.characters.undo(3,id);assert.equal(api.queries.character(id).fatigue,0);
  assert.equal(api.queries.character(id).center,-1);assert.equal(api.queries.character(id).balance,1);
});
test('phase B : suffixes de ligne interdits pour actions, effets et journal actifs',()=>{
  for(const key of ['actions','temporaryEffects','sceneJournal']) {
    const s=fixture(),id=s.combat.fighters[0].id;
    if(key==='actions')s.combat.actions=[{id:'action-1\n',sourceId:id,round:1}];
    if(key==='temporaryEffects'){C.addTemporaryEffect(s.combat,id,'Effet synthétique','manual');s.combat.temporaryEffects[0].id+='\n';}
    if(key==='sceneJournal'){C.addSceneNote(s.combat,'Note synthétique');s.combat.sceneJournal[0].id+='\n';}
    assert.throws(()=>validateCombat(s.combat),/invalide/i);
  }
});

test('phase B : comparaison oracle/convergence, ancien import permissif remplacé par un refus explicite',()=>{
  const html=fs.readFileSync(new URL('../../app/simulateur.html',import.meta.url),'utf8');
  const manifest=JSON.parse(fs.readFileSync(new URL('../../packages/domain/extraction.json',import.meta.url)));
  const context={};context.window=context;vm.createContext(context);
  vm.runInContext(manifest.segments.map(({start,end})=>html.slice(html.indexOf(start),html.indexOf(end,html.indexOf(start)))).join('\n'),context);
  const data={version:1,seq:2,characters:[Roster.makeCharacter(malicious[0],'Comparaison synthétique')]};
  assert.equal(context.Roster.importLibrary(JSON.stringify(data)).characters[0].id,malicious[0]);
  assert.throws(()=>Roster.importLibrary(JSON.stringify(data)),/Identifiant/);
});
