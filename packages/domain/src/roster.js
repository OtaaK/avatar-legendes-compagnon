// Extrait de a9079fa, app/simulateur.html. Voir extraction.json.
import { npcResourceProfile, resourceLimits, validateResourceValues, fatigueLimit, resourceConditionNames, balanceValue } from './resources.js';
import { BookState } from './books.js';
import { PlaceRules } from './places.js';
const rosterClone=x=>JSON.parse(JSON.stringify(x));
const STATS=['creativite','concentration','harmonie','enthousiasme'];
const CONDITIONS=['Terrifié','En colère','Coupable','Fragile','Confus'];
const STATUSES=['En danger','Renforcé','Avantagé','Gêné','Confiant','Prêt','Piégé','Étourdi'];
const TO_ENGINE={'En danger':'en_danger','Renforcé':'renforce','Avantagé':'avantage','Gêné':'gene','Confiant':'confiant','Prêt':'pret','Piégé':'piege','Étourdi':'etourdi'};
const FROM_ENGINE=Object.fromEntries(Object.entries(TO_ENGINE).map(([k,v])=>[v,k]));
const TRAININGS=['','Maîtrise de l’Air','Maîtrise de l’Eau','Maîtrise de la Terre','Maîtrise du Feu','Armes','Technologie'];
const MASTERY=['acquise','pratiquee','maitrisee'];
const NPC_IMPORTANCE=['Mineur','Majeur','Champion','Légendaire'];
function npcImportance(c){return NPC_IMPORTANCE.includes(c.importance)?c.importance:'';}
function createLibrary(){return {version:1,seq:1,characters:[]}}
function validateCharacter(c){
 if(!c||typeof c!=='object'||!['PJ','PNJ'].includes(c.kind))throw Error('Type PJ/PNJ requis');
 if(typeof c.name!=='string'||!c.name.trim()||c.name.length>100)throw Error('Nom invalide');
 if(!c.stats||STATS.some(k=>!Number.isInteger(c.stats[k])||c.stats[k]<-3||c.stats[k]>3))throw Error('Caractéristiques invalides');
 if(!Array.isArray(c.conditions)||c.conditions.some(x=>!resourceConditionNames(c).includes(x))||new Set(c.conditions).size!==c.conditions.length)throw Error('États invalides');
 if(!Array.isArray(c.statuses)||c.statuses.some(x=>!STATUSES.includes(x))||new Set(c.statuses).size!==c.statuses.length)throw Error('Statuts invalides');
 if(c.principles!==undefined&&( !Array.isArray(c.principles)||c.principles.length!==2||c.principles.some(x=>typeof x!=='string'||x.length>80)))throw Error('Principes invalides');
 if(c.center!==undefined&&(!Number.isInteger(c.center)||c.center< -3||c.center>3))throw Error('Centre invalide');
 if(c.training!==undefined&&!TRAININGS.includes(c.training))throw Error('Entraînement invalide');
 if(c.relationships!==undefined&&(!Array.isArray(c.relationships)||c.relationships.length>20||c.relationships.some(x=>typeof x!=='string'||x.length>240)))throw Error('Relations invalides');
 if(c.location!==undefined&&(typeof c.location!=='string'||c.location.length>120))throw Error('Lieu invalide');
 if(c.history!==undefined&&(typeof c.history!=='string'||c.history.length>4000))throw Error('Histoire invalide');
 if(c.playbookMoves!==undefined&&(!Array.isArray(c.playbookMoves)||c.playbookMoves.some(x=>typeof x!=='string'||x.length>120)))throw Error('Manœuvres de livret invalides');
 if(!Array.isArray(c.techniques)||c.techniques.some(t=>!t||typeof t.name!=='string'||!MASTERY.includes(t.mastery)))throw Error('Techniques invalides');
 validateResourceValues(c);BookState.validate(c);
 return true;
}
function makeCharacter(id,name,kind='PJ'){
 return {id,name,kind,livret:'',stats:{creativite:0,concentration:0,harmonie:0,enthousiasme:0},
 fatigue:0,balance:0,center:0,principles:['',''],conditions:[],statuses:[],techniques:[],training:'',location:'',relationships:[],history:'',playbookMoves:[],notes:'',updatedAt:null};
}
function createCharacter(lib,name,kind='PJ'){
 const c=makeCharacter('char-'+lib.seq++,name,kind);validateCharacter(c);lib.characters.push(c);return c;
}
function updateCharacter(lib,id,patch){
 const c=lib.characters.find(x=>x.id===id);if(!c)throw Error('Fiche inconnue');
 if(patch.id!==undefined||patch.kind!==undefined&&patch.kind!==c.kind)throw Error('Identité protégée');
 // Les anciennes valeurs importées restent lisibles ; toute nouvelle classification est contrôlée.
 if(Object.hasOwn(patch,'importance')&&patch.importance!==c.importance&&(c.kind!=='PNJ'||!['',...NPC_IMPORTANCE].includes(patch.importance)))throw Error('Importance PNJ invalide');
 const next={...rosterClone(c),...rosterClone(patch),stats:{...c.stats,...(patch.stats||{})}};
 validateCharacter(next);if(Object.hasOwn(patch,'placeLinks'))PlaceRules.setLinks(rosterClone(lib),id,patch.placeLinks);PlaceRules.validate({...lib,characters:lib.characters.map(x=>x.id===id?next:x)});Object.assign(c,next);if(npcResourceProfile(c)||c.placeLinks||c.playbookState)lib.version=2;return c;
}
function assignTechnique(lib,id,name,mastery='acquise'){
 if(!MASTERY.includes(mastery)||!name||name.length>120)throw Error('Technique invalide');
 const c=lib.characters.find(x=>x.id===id);if(!c)throw Error('Fiche inconnue');
 const existing=c.techniques.find(t=>t.name===name);
 if(existing)existing.mastery=mastery;else c.techniques.push({name,mastery});
 validateCharacter(c);return c;
}
function addToCombat(lib,combat,id){
 const c=lib.characters.find(x=>x.id===id);if(!c)throw Error('Fiche inconnue');
 validateCharacter(c);
 if(!resourceLimits(c).combatant)throw Error('Ce PNJ ne possède pas de profil de combattant.');
 if(combat.fighters.some(f=>f.characterId===id))throw Error('Déjà présent dans ce combat');
 const newId='p-'+combat.seq++;
 const f={id:newId,characterId:id,name:c.name,kind:c.kind,fatigue:c.fatigue,balance:c.balance,
 conditions:rosterClone(c.conditions),statuses:c.statuses.map(x=>TO_ENGINE[x]||x),approach:null,roll:null,blocked:[],reactions:[],bonuses:[],
 techniques:rosterClone(c.techniques),stats:rosterClone(c.stats)};
 if(c.npcResources){f.npcResources=rosterClone(c.npcResources);f.principles=rosterClone(c.principles);}combat.fighters.push(f);return f;
}
function syncCombatToLibrary(lib,combat,id){
 const f=combat.fighters.find(x=>x.id===id);if(!f||!f.characterId)throw Error('Combattant non lié à une fiche');
 const c=lib.characters.find(x=>x.id===f.characterId);if(!c)throw Error('Fiche absente');
 // Explicit save: no automatic overwriting of character sheets.
 return updateCharacter(lib,c.id,{fatigue:f.fatigue,balance:f.balance,conditions:rosterClone(f.conditions),statuses:rosterClone(f.statuses.map(x=>FROM_ENGINE[x]||x))});
}
function normalizeCharacter(c){
 // Migration des fiches V0.7–V0.9 sans changement des ressources existantes.
 if(c.center===undefined)c.center=0;
 if(c.location===undefined)c.location='';
 if(c.training===undefined)c.training='';
 if(c.history===undefined)c.history='';
 if(!Array.isArray(c.relationships))c.relationships=[];
 if(!Array.isArray(c.playbookMoves))c.playbookMoves=[];
 if(!Array.isArray(c.principles))c.principles=['',''];
 if(!c.npcResources)c.conditions=Array.isArray(c.conditions)?[...new Set(c.conditions.map(x=>({'Effrayé':'Terrifié','Troublé':'Confus'}[x]||x)))]:[];
 c.statuses=Array.isArray(c.statuses)?[...new Set(c.statuses.map(x=>({'en_danger':'En danger','renforce':'Renforcé','avantage':'Avantagé','gene':'Gêné','pret':'Prêt','confiant':'Confiant','piege':'Piégé','etourdi':'Étourdi'}[x]||x)))]:[];
 return c;
}
function toggleCondition(lib,id,name){
 const c=lib.characters.find(x=>x.id===id);if(!c)throw Error('Fiche inconnue');
 if(!resourceConditionNames(c).includes(name))throw Error('État inconnu');
 const next=c.conditions.includes(name)?c.conditions.filter(x=>x!==name):[...c.conditions,name];
 updateCharacter(lib,id,{conditions:next});return c;
}
function toggleStatus(lib,id,name){
 if(!STATUSES.includes(name))throw Error('Statut inconnu');
 const c=lib.characters.find(x=>x.id===id);if(!c)throw Error('Fiche inconnue');
 const next=c.statuses.includes(name)?c.statuses.filter(x=>x!==name):[...c.statuses,name];
 updateCharacter(lib,id,{statuses:next});return c;
}
function listNpcs(lib,{location='',search='',training='',role='',importance='',sort='name'}={}){
 const q=search.trim().toLocaleLowerCase('fr');
 const npcs=lib.characters.filter(c=>c.kind==='PNJ'&&(!location||(PlaceRules.currentName(lib,c)===location))&&
  (!q||[c.name,c.livret,PlaceRules.currentName(lib,c),c.notes].join(' ').toLocaleLowerCase('fr').includes(q))&&
  (!training||c.training===training)&&(!role||c.livret===role)&&
  (!importance||(importance==='__unspecified__'?!npcImportance(c):npcImportance(c)===importance)));
 const byName=(a,b)=>a.name.localeCompare(b.name,'fr')||String(a.id).localeCompare(String(b.id));
 return npcs.sort((a,b)=>{
  if(sort==='location')return PlaceRules.currentName(lib,a).localeCompare(PlaceRules.currentName(lib,b),'fr')||byName(a,b);
  if(sort==='importance-asc'||sort==='importance-desc'){
   const ai=NPC_IMPORTANCE.indexOf(npcImportance(a)),bi=NPC_IMPORTANCE.indexOf(npcImportance(b));
   // Les fiches non classées restent en fin de liste dans les deux sens.
   if(ai<0||bi<0)return (ai<0)-(bi<0)||byName(a,b);
   return (sort==='importance-desc'?bi-ai:ai-bi)||byName(a,b);
  }
  return byName(a,b);
 });
}
function npcLocations(lib){return [...new Set(lib.characters.filter(c=>c.kind==='PNJ').map(c=>PlaceRules.currentName(lib,c)).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'fr'));}
function importLibrary(raw){
 const lib=typeof raw==='string'?JSON.parse(raw):rosterClone(raw);
 if(![1,2].includes(lib?.version)||!Array.isArray(lib.characters)||!Number.isInteger(lib.seq))throw Error('Format bibliothèque incompatible');
 const ids=new Set();
 for(const c of lib.characters){normalizeCharacter(c);validateCharacter(c);if(ids.has(c.id))throw Error('Identifiant dupliqué');ids.add(c.id)}
 PlaceRules.validate(lib);if(lib.places!==undefined||lib.characters.some(c=>c.npcResources||c.placeLinks||c.playbookState))lib.version=2;
 return lib;
}
const Roster={NPC_IMPORTANCE,npcImportance,listNpcs,npcLocations,TRAININGS,TO_ENGINE,FROM_ENGINE,STATS,MASTERY,CONDITIONS,STATUSES,normalizeCharacter,toggleCondition,toggleStatus,createLibrary,makeCharacter,validateCharacter,createCharacter,updateCharacter,assignTechnique,addToCombat,syncCombatToLibrary,importLibrary};
export { Roster };
