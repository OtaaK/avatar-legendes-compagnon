function exportRoster(){const blob=new Blob([JSON.stringify(lib,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='avatar-fiches-v2-33.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function importRoster(e){
 const f=e.target.files?.[0];if(!f)return;
 f.text().then(text=>{
  let rendering=false;const oldSheet=$('sheetSelect').value;
  try{
   const restored=Roster.importLibrary(text);
   // An isolated roster import must never silently orphan the active combat.
   validateBackupLinks(restored,s);
   commitLibraryMutation(()=>{lib=restored;rendering=true;renderSheets();render();});
  }catch(err){if(rendering){renderSheets(oldSheet);originalRender();}alert('Import des fiches impossible : '+err.message)}
 }).catch(err=>alert('Lecture des fiches impossible : '+err.message))
 .finally(()=>{e.target.value=''});
}
// V1.34 : export de consultation, distinct des sauvegardes restaurables.
// Parcours aussi les instantanés et les actions anciennes : le secret peut y être dupliqué.
function publicCombatReport(combat){
 const scrub=(value)=>{
  if(Array.isArray(value))return value.map(scrub);
  if(value&&typeof value==='object'){
   const out={};
   for(const [key,item] of Object.entries(value)){
    if(key==='airReedPrediction'||key==='reedPrediction')continue;
    // Éviter que les anciennes versions conservent une prédiction dans un champ libre.
    out[key]=scrub(item);
   }
   return out;
  }
  return value;
 };
 return {format:'avatar-compagnon-compte-rendu-public',version:1,
  avertissement:'Document de consultation uniquement. Ne pas importer comme sauvegarde ; vérifier les notes libres avant partage.',
  combat:scrub(combat)};
}
function downloadPublicCombat(){
 const data=publicCombatReport(s);
 const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='avatar-compte-rendu-public-v2-33.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function download(){const blob=new Blob([JSON.stringify(s,null,2)],{type:'application/json'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='avatar-combat-v2-33.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)}
