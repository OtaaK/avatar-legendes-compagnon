import test from 'node:test';
import assert from 'node:assert/strict';
import { emptySession, inspectImport, exportBackup, exportPrivateCombat, copy } from '../../packages/persistence/src/codecs.js';
import {createRepository,LAB_KEY,SESSION_KEY,StorageConflict} from '../../packages/persistence/src/local-session-repository.js';
import {createSessionStore} from '../../packages/application/src/session-store.js';
import {Roster} from '../../packages/domain/src/roster.js';
import {CombatCore as C} from '../../packages/domain/src/combat.js';
function memory(initial={}) { const data=new Map(Object.entries(initial)); return {data,writes:0,getItem:key=>data.get(key)??null,setItem(key,value){this.writes++;data.set(key,value)}} }
function setup(storage=memory(),options={}) {const repository=createRepository({storage,...options});return {storage,repository,store:createSessionStore(repository)}}
function fixture() {
 const session=emptySession(),character=Roster.createCharacter(session.library,'Personnage fictif','PJ');
 character.extra={preserve:['unknown',42]}; character.stats.creativite=-2;
 character.livret='Livret ancien inconnu';
 character.playbookState={format:'avatar-playbook-state',version:1,entries:[{book:character.livret,progress:3,moment:'locked',notes:'Suivi',evolutions:'Texte'}]};
 const f=Roster.addToCombat(session.library,session.combat,character.id);
 session.combat.extra={unknown:true}; session.library.extra={futureVersionField:'keep'};session.backupMetadata={unknownExportField:{retain:true}};
 C.declare(session.combat,f.id,'defendre','10+');C.reveal(session.combat);
 C.manual(session.combat,f.id,f.id,'fatigue',1,'','Arbitrage');C.commit(session.combat);return session;
}
test('lecture/montage/export sans écriture ; anciennes clés intouchées',()=>{
 const initial={'avatar-roster-v021':'ANCIEN','avatar-v021':'COMBAT','avatar-complete-import-journal-v1':'INTERRUPTION','avatar-legendes-compagnon-demo-v1':'DEMO'};
 const {storage,store}=setup(memory(initial));store.getSnapshot();store.exportBackup();assert.equal(storage.writes,0);assert.deepEqual(Object.fromEntries(storage.data),initial);
 assert.throws(()=>createRepository({storage,key:'avatar-roster-v021'}));
});
test('formats v1/v2 et champs inconnus : export/import avec normalisations historiques seulement',()=>{
 for(const version of [1,2]) {const original=fixture(),raw={...JSON.parse(exportBackup(original)),version};const plan=inspectImport(JSON.stringify(raw));
  assert.equal(plan.session.library.extra.futureVersionField,'keep');assert.deepEqual(plan.session.combat,original.combat);assert.deepEqual(plan.session.backupMetadata.unknownExportField,{retain:true});
  const roundtrip=inspectImport(exportBackup(plan.session));assert.deepEqual(roundtrip.session.library,plan.session.library);assert.deepEqual(roundtrip.session.combat,plan.session.combat);
  assert.equal(roundtrip.session.library.characters[0].stats.creativite,-2);
 }
});
test('bibliothèque, combat brut/enveloppe et refus public/démo/version inconnue',()=>{
 const s=fixture();assert.equal(inspectImport(JSON.stringify(s.library),s).kind,'Bibliothèque');
 assert.equal(inspectImport(JSON.stringify(s.combat),s).kind,'Combat historique');
 assert.equal(inspectImport(JSON.stringify({format:'avatar-compagnon-combat',version:2,combat:s.combat,unknown:7}),s).session.combatMetadata.unknown,7);
 for(const data of [{format:'avatar-compagnon-compte-rendu-public',version:1,combat:s.combat},{characters:[],places:[],techniques:[]},{format:'avatar-compagnon-backup',version:3,library:s.library,combat:s.combat}])assert.throws(()=>inspectImport(JSON.stringify(data)));
});
test('profils PNJ : 3/5/10/15 et non combattant préservés sans invention',()=>{
 const s=emptySession();for(const cap of [0,3,5,10,15]){const c=Roster.createCharacter(s.library,'PNJ '+cap,'PNJ');Roster.updateCharacter(s.library,c.id,{npcResources:{format:'avatar-npc-resources',version:1,combatant:cap>0,fatigueMax:cap,balanceMax:0,conditions:cap?['État du MJ']:[]}})}
 const restored=inspectImport(exportBackup(s)).session;assert.deepEqual(restored.library.characters.map(c=>c.npcResources.fatigueMax),[0,3,5,10,15]);
});
test('fichiers malformés, liens incohérents et ressources invalides : aucune mutation',()=>{
 const {storage,store}=setup();const before=store.getSnapshot();
 for(const raw of ['{','null','[]',JSON.stringify({...JSON.parse(exportBackup(fixture())),combat:{...fixture().combat,phase:'inconnue'}})])assert.throws(()=>store.prepareImport(raw));
 const s=fixture();s.library.characters=[];assert.throws(()=>store.prepareImport(JSON.stringify({format:'avatar-compagnon-backup',version:2,...s})));
 const bad=fixture();bad.combat.fighters[0].fatigue=99;assert.throws(()=>inspectImport(JSON.stringify({format:'avatar-compagnon-backup',version:2,...bad})));
 assert.equal(store.getSnapshot(),before);assert.equal(storage.writes,0);
});
test('aperçu/annulation sans mutation ; import atomique et plan périmé refusé',async()=>{
 const {store,storage}=setup(),before=store.getSnapshot(),plan=store.prepareImport(exportBackup(fixture()));assert.equal(store.getSnapshot(),before);assert.equal(storage.writes,0);
 await store.commitImport(plan);assert.equal(storage.writes,1);assert.equal(store.getSnapshot().revision,1);
 await assert.rejects(()=>store.commitImport(plan),/périmée/);assert.equal(storage.writes,1);
 const other=setup();await assert.rejects(()=>other.store.commitImport(plan),/inconnu/);
});
test('quota : brouillon conservé et ancien état intact, nouvelle tentative possible',async()=>{
 const {store,storage}=setup();await store.commitImport(store.prepareImport(exportBackup(fixture())));
 const before=store.getSnapshot(),raw=storage.data.get(SESSION_KEY),original=storage.setItem;
 storage.setItem=()=>{throw new DOMException('Quota dépassé','QuotaExceededError')};
 const plan=store.prepareImport(exportBackup(emptySession()));await assert.rejects(()=>store.commitImport(plan),/Quota/);
 assert.equal(store.getSnapshot(),before);assert.equal(storage.data.get(SESSION_KEY),raw);assert.equal(plan.session.library.characters.length,0);
 storage.setItem=original;await store.commitImport(plan);assert.equal(store.getSnapshot().session.library.characters.length,0);
});
test('erreur métier, erreur de sérialisation et validation : rien de publié ou enregistré',async()=>{
 const {store,storage}=setup();const before=store.getSnapshot();
 await assert.rejects(()=>store.execute(0,d=>{d.library.seq=12;throw Error('Échec métier')}),/métier/);
 await assert.rejects(()=>store.execute(0,d=>{d.library.self=d.library}),/circular/i);
 await assert.rejects(()=>store.execute(0,d=>{d.combat.phase='inconnue'}),/Phase/);
 assert.equal(store.getSnapshot(),before);assert.equal(storage.writes,0);
});
test('storage illisible ou accès refusé : blocage sans écraser par un exemple',async()=>{
 for(const storage of [memory({[SESSION_KEY]:'{'}),{getItem(){throw Error('Accès refusé')},setItem(){assert.fail('Écriture interdite')}}]){
 const {store}=setup(storage);assert(store.getSnapshot().error);assert.throws(()=>store.exportBackup(),/Aucun état valide/);assert.throws(()=>store.prepareImport(exportBackup(emptySession())),/bloquée/);await assert.rejects(()=>store.execute(0,()=>{}),/bloquée/);
 }
});
test('deux sessions : conflit détecté ; export de la copie ancienne possible',async()=>{
 const storage=memory(),a=setup(storage),b=setup(storage);await a.store.commitImport(a.store.prepareImport(exportBackup(fixture())));
 await assert.rejects(()=>b.store.execute(0,d=>{d.library.seq=7}),StorageConflict);
 assert(b.store.checkExternal());assert.equal(b.store.getSnapshot().session.library.characters.length,0);assert.equal(JSON.parse(b.store.exportBackup()).library.characters.length,0);
 assert.equal(a.store.getSnapshot().session.library.characters.length,1);
});
test('double clic : une transaction ; événements publiés seulement après sauvegarde',async()=>{
 const storage=memory();let release;const lock={request:async(_name,_options,task)=>{await new Promise(r=>release=r);return task()}};
 const {store}=setup(storage,{locks:lock});let notifications=0;store.subscribe(()=>notifications++);
 const first=store.execute(0,d=>{d.backupMetadata.note='A'});await assert.rejects(()=>store.execute(0,d=>{d.backupMetadata.note='B'}),/cours/);
 assert.equal(notifications,0);release();await first;assert.equal(notifications,1);assert.equal(storage.writes,1);
});
test('sauvegarde volumineuse : portraits, historiques, snapshots et champs inconnus',async()=>{
 const s=fixture();for(let i=0;i<24;i++){const c=Roster.createCharacter(s.library,'Portrait fictif '+i,'PJ');c.portrait='data:image/png;base64,'+'A'.repeat(300000)}
 s.combat.history.push(...Array.from({length:3000},(_,i)=>({round:1,phase:'declaration',events:[],extra:'historique '+i})));
 const text=exportBackup(s);assert(text.length>7_000_000);const {store}=setup();await store.commitImport(store.prepareImport(text));const reloaded=JSON.parse(store.exportBackup());assert.equal(reloaded.library.characters.length,25);assert.equal(reloaded.combat.history.length,s.combat.history.length);assert.deepEqual(reloaded.combat.snapshots,s.combat.snapshots);
});
test('espace de laboratoire distinct du futur projet',async()=>{
 const storage=memory(),lab=setup(storage,{key:LAB_KEY});await lab.store.execute(0,d=>{d.backupMetadata.note='test'});assert.equal(storage.data.has(SESSION_KEY),false);assert.equal(setup(storage).store.getSnapshot().revision,0);
});
test('lieux : texte ancien, absence/valeur null, orphelins et champs de liens inconnus préservés',()=>{
 const s=emptySession();
 for(const [name,links] of [['texte',undefined],['null',{homeId:null,currentId:null,associatedIds:[],extra:'keep'}],['orphelin',{homeId:'absent',currentId:'inconnu',associatedIds:['autre']}]] ){
  const c=Roster.createCharacter(s.library,name,'PNJ');c.location='Ancien texte';if(links)c.placeLinks=links;
 }
 const restored=inspectImport(exportBackup(s)).session;
 assert.equal(Object.hasOwn(restored.library.characters[0],'placeLinks'),false);assert.equal(restored.library.characters[1].placeLinks.currentId,null);assert.equal(restored.library.characters[1].placeLinks.extra,'keep');assert.equal(restored.library.characters[2].placeLinks.currentId,'inconnu');
});
test('Web Locks : deux écritures simultanées, une seule publiée',async()=>{
 const storage=memory();let tail=Promise.resolve();
 const locks={request:(_name,_options,command)=>{const next=tail.then(command);tail=next.catch(()=>{});return next}};
 const a=setup(storage,{locks}),b=setup(storage,{locks});
 const results=await Promise.allSettled([a.store.execute(0,d=>{d.backupMetadata.note='A'}),b.store.execute(0,d=>{d.backupMetadata.note='B'})]);
 assert.deepEqual(results.map(r=>r.status),['fulfilled','rejected']);assert.equal(storage.writes,1);assert.equal(b.store.getSnapshot().revision,0);
});

test('champs inconnus de l’enveloppe de combat conservés au réexport privé',()=>{
 const s=fixture(),input={format:'avatar-compagnon-combat',version:2,combat:s.combat,futureMetadata:{unknown:true}};
 const result=inspectImport(JSON.stringify(input),s);assert.deepEqual(JSON.parse(exportPrivateCombat(result.session)),input);
});
