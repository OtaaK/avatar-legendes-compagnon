// Extrait de a9079fa, app/simulateur.html. Voir extraction.json.

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
export { publicCombatReport };
