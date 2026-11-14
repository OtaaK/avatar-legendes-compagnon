// Service sans DOM : ports fournis explicitement, aucun accès au chargement.
function createPersistence({storage,recoveryAllowed=()=>true,onError=()=>{},onRecovery=()=>{},onInvalid=()=>{},journalKey='avatar-complete-import-journal-v1'}){
function persist(key,value){if(!recoveryAllowed()){onError(Error('Import incomplet non restauré'));return false}try{storage().setItem(key,JSON.stringify(value));return true}catch(e){onError(e);return false}}
// Journal de restauration : un import complet écrit deux clés distinctes.
// Tant que le journal existe, le démarrage restaure les deux valeurs antérieures.
const JOURNAL_KEY=journalKey;
function restoreStorageValue(key,raw){
 if(raw===null)storage().removeItem(key);else storage().setItem(key,raw);
}
function recoverIncompleteImport(){
 let raw;
 try{raw=storage().getItem(JOURNAL_KEY)}catch(e){onError(e);return false}
 if(raw===null)return true;
 try{
  const journal=JSON.parse(raw);
  if(!journal||journal.version!==1||typeof journal.beforeLibrary!=='string'&&journal.beforeLibrary!==null||typeof journal.beforeCombat!=='string'&&journal.beforeCombat!==null)throw Error('Journal invalide');
  restoreStorageValue('avatar-roster-v020',journal.beforeLibrary);
  restoreStorageValue('avatar-v020',journal.beforeCombat);
  storage().removeItem(JOURNAL_KEY);
  onRecovery('Un import complet interrompu a été annulé. Les données antérieures ont été restaurées.');
  return true;
 }catch(e){onError(e);return false}
}
function persistCompleteBackup(library,combat){
 if(!recoveryAllowed())return false;
 let oldLibrary,oldCombat;
 try{
  oldLibrary=storage().getItem('avatar-roster-v020');
  oldCombat=storage().getItem('avatar-v020');
  storage().setItem(JOURNAL_KEY,JSON.stringify({version:1,beforeLibrary:oldLibrary,beforeCombat:oldCombat}));
  storage().setItem('avatar-roster-v020',JSON.stringify(library));
  storage().setItem('avatar-v020',JSON.stringify(combat));
  storage().removeItem(JOURNAL_KEY);
  return true;
 }catch(e){
  onError(e);
  // Si la restauration échoue, conserver le journal pour le prochain démarrage.
  recoverIncompleteImport();
  return false;
 }
}
function readSaved(keys,validate,fallback){
 let invalid=[];
 for(const key of keys){let raw;try{raw=storage().getItem(key)}catch(e){onError(e);break}
  if(raw===null)continue;
  try{return validate(JSON.parse(raw))}catch(e){invalid.push(key+' : '+e.message)}
 }
 if(invalid.length){const msg='Sauvegarde locale endommagée : '+invalid.join(' ; ')+'. Une version antérieure a été recherchée. Conserve tes exports JSON.';onInvalid(msg)}
 return fallback();
}
return {persist,recoverIncompleteImport,persistCompleteBackup,loadSaved:readSaved};
}
