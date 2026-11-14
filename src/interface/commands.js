// Pont UI : état courant, persistance et rafraîchissement fournis au service de commande.
function commitLibraryMutation(change){
 if(!commitLibraryMutation.command)commitLibraryMutation.command=createMutationCommand({
  read:()=>lib,restore:raw=>{lib=Roster.importLibrary(raw)},save:()=>saveLibrary(),
  failureMessage:'Modification annulée : impossible d’enregistrer la bibliothèque. Vérifie le stockage et conserve ton export.'
 });
 return commitLibraryMutation.command(change);
}
function commitCombatMutation(change){
 if(!commitCombatMutation.command)commitCombatMutation.command=createMutationCommand({
  read:()=>s,restore:raw=>{s=JSON.parse(raw)},save:()=>persist('avatar-v020',s),
  onRollback:()=>originalRender(),nested:true,saveUnchanged:false,
  failureMessage:'Action de combat annulée : impossible de sauvegarder. Conserve ton export JSON.'
 });
 return commitCombatMutation.command(change);
}
function saveLibrary(){return persist('avatar-roster-v020',lib)}
