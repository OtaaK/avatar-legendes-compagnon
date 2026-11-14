const completeImportRecoveryOk=recoverIncompleteImport();
lib=loadSaved(ROSTER_KEYS,x=>Roster.importLibrary(x),()=>Roster.createLibrary());
s=loadSaved(COMBAT_KEYS,x=>validateCombat(x),()=>CombatCore.createCombat());
const originalRender=render;
// Rendering is read-only. Persistence belongs to the transaction, not to a repaint.
render=function(){originalRender()};
