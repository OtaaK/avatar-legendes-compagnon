let storageWarningShown=false;
function warnStorage(err){
 console.error('Sauvegarde locale impossible',err);
 if(storageWarningShown)return;
 storageWarningShown=true;
 const msg='ATTENTION : sauvegarde locale impossible. Les changements risquent d’être perdus. Exporte immédiatement une sauvegarde complète (bouton Exporter). Détail : '+(err?.message||err);
 const node=document.getElementById('storageWarning');
 if(node){node.textContent=msg;node.hidden=false}else alert(msg);
}
// Pont de compatibilité : signatures et messages historiques conservés.
const COMPLETE_IMPORT_JOURNAL='avatar-complete-import-journal-v1';
let persistenceService;
function getPersistenceService(){
 if(!persistenceService)persistenceService=createPersistence({
  storage:()=>localStorage,
  recoveryAllowed:()=>typeof completeImportRecoveryOk==='undefined'||completeImportRecoveryOk,
  journalKey:COMPLETE_IMPORT_JOURNAL,
  onError:warnStorage,
  onRecovery:msg=>{const node=document.getElementById('recoveryWarning');if(node){node.textContent=msg;node.hidden=false}},
  onInvalid:msg=>{console.warn(msg);const node=document.getElementById('recoveryWarning');if(node){node.textContent=msg;node.hidden=false}else alert(msg)}
 });
 return persistenceService;
}
function persist(key,value){return getPersistenceService().persist(key,value)}
function recoverIncompleteImport(){return getPersistenceService().recoverIncompleteImport()}
function persistCompleteBackup(library,combat){return getPersistenceService().persistCompleteBackup(library,combat)}
function loadSaved(keys,validate,fallback){return getPersistenceService().loadSaved(keys,validate,fallback)}
const ROSTER_KEYS=['avatar-roster-v020','avatar-roster-v019','avatar-roster-v018','avatar-roster-v017','avatar-roster-v016','avatar-roster-v015','avatar-roster-v013','avatar-roster-v012','avatar-roster-v011','avatar-roster-v010','avatar-roster-v09','avatar-roster-v08'];
const COMBAT_KEYS=['avatar-v020','avatar-v019','avatar-v018','avatar-v017','avatar-v016','avatar-v015','avatar-v013','avatar-v012','avatar-v011','avatar-v010','avatar-v09','avatar-v08'];
