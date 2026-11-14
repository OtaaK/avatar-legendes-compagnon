let storageWarningShown=false;
function warnStorage(err){
 console.error('Sauvegarde locale impossible',err);
 if(storageWarningShown)return;
 storageWarningShown=true;
 const msg='ATTENTION : sauvegarde locale impossible. Les changements risquent d’être perdus. Exporte immédiatement une sauvegarde complète (bouton Exporter). Détail : '+(err?.message||err);
 const node=document.getElementById('storageWarning');
 if(node){node.textContent=msg;node.hidden=false}else alert(msg);
}
function persist(key,value){if(typeof completeImportRecoveryOk!=='undefined'&&!completeImportRecoveryOk){warnStorage(Error('Import incomplet non restauré'));return false}try{localStorage.setItem(key,JSON.stringify(value));return true}catch(e){warnStorage(e);return false}}
// Journal de restauration : un import complet écrit deux clés distinctes.
// Tant que le journal existe, le démarrage restaure les deux valeurs antérieures.
const COMPLETE_IMPORT_JOURNAL='avatar-complete-import-journal-v1';
function restoreStorageValue(key,raw){
 if(raw===null)localStorage.removeItem(key);else localStorage.setItem(key,raw);
}
function recoverIncompleteImport(){
 let raw;
 try{raw=localStorage.getItem(COMPLETE_IMPORT_JOURNAL)}catch(e){warnStorage(e);return false}
 if(raw===null)return true;
 try{
  const journal=JSON.parse(raw);
  if(!journal||journal.version!==1||typeof journal.beforeLibrary!=='string'&&journal.beforeLibrary!==null||typeof journal.beforeCombat!=='string'&&journal.beforeCombat!==null)throw Error('Journal invalide');
  restoreStorageValue('avatar-roster-v020',journal.beforeLibrary);
  restoreStorageValue('avatar-v020',journal.beforeCombat);
  localStorage.removeItem(COMPLETE_IMPORT_JOURNAL);
  const node=document.getElementById('recoveryWarning');
  if(node){node.textContent='Un import complet interrompu a été annulé. Les données antérieures ont été restaurées.';node.hidden=false}
  return true;
 }catch(e){warnStorage(e);return false}
}
function persistCompleteBackup(library,combat){
 if(!completeImportRecoveryOk)return false;
 let oldLibrary,oldCombat;
 try{
  oldLibrary=localStorage.getItem('avatar-roster-v020');
  oldCombat=localStorage.getItem('avatar-v020');
  localStorage.setItem(COMPLETE_IMPORT_JOURNAL,JSON.stringify({version:1,beforeLibrary:oldLibrary,beforeCombat:oldCombat}));
  localStorage.setItem('avatar-roster-v020',JSON.stringify(library));
  localStorage.setItem('avatar-v020',JSON.stringify(combat));
  localStorage.removeItem(COMPLETE_IMPORT_JOURNAL);
  return true;
 }catch(e){
  warnStorage(e);
  // Si la restauration échoue, conserver le journal pour le prochain démarrage.
  recoverIncompleteImport();
  return false;
 }
}
function loadSaved(keys,validate,fallback){
 let invalid=[];
 for(const key of keys){let raw;try{raw=localStorage.getItem(key)}catch(e){warnStorage(e);break}
  if(raw===null)continue;
  try{return validate(JSON.parse(raw))}catch(e){invalid.push(key+' : '+e.message)}
 }
 if(invalid.length){const msg='Sauvegarde locale endommagée : '+invalid.join(' ; ')+'. Une version antérieure a été recherchée. Conserve tes exports JSON.';console.warn(msg);const node=document.getElementById('recoveryWarning');if(node){node.textContent=msg;node.hidden=false}else alert(msg)}
 return fallback();
}
const ROSTER_KEYS=['avatar-roster-v020','avatar-roster-v019','avatar-roster-v018','avatar-roster-v017','avatar-roster-v016','avatar-roster-v015','avatar-roster-v013','avatar-roster-v012','avatar-roster-v011','avatar-roster-v010','avatar-roster-v09','avatar-roster-v08'];
const COMBAT_KEYS=['avatar-v020','avatar-v019','avatar-v018','avatar-v017','avatar-v016','avatar-v015','avatar-v013','avatar-v012','avatar-v011','avatar-v010','avatar-v09','avatar-v08'];
