'use strict';
// Scénario synthétique commun à la VM Node et au vrai script du navigateur.
// Aucune règle n’est réimplémentée : seuls les points d’entrée existants sont appelés.
function exerciseContracts(app) {
  const { CombatCore: C, CombatRules: Rules, Roster: R, Playbooks: P, catalog, validators } = app;
  const plain = value => JSON.parse(JSON.stringify(value));
  const library = R.createLibrary(); library.futureLibrary = { keep: true };
  const player = R.createCharacter(library,'Personnage synthétique','PJ');
  const npc = R.createCharacter(library,'PNJ synthétique','PNJ');
  player.future = { keep: ['champ inconnu'] };
  const beforePreset = JSON.stringify(library);
  const patch = P.applyPreset(library,player.id,P.PLAYBOOKS[0].name,'creativite');
  const presetDoesNotMutate = JSON.stringify(library) === beforePreset;
  R.updateCharacter(library,player.id,{...patch,history:'Histoire synthétique',playbookMoves:['Manœuvre personnelle']});
  const technique = catalog.find(t=>t.famille!=='base' && t.accessible_pj!==false);
  R.assignTechnique(library,player.id,technique.nom,'maitrisee');
  const restored = R.importLibrary(JSON.stringify(library));
  const roundtrip = JSON.stringify(restored) === JSON.stringify(library);
  let invalidIdError = '';
  const invalid = plain(library); invalid.characters[0].id="char-1');window.__contractMarker=1;//";
  try { R.importLibrary(JSON.stringify(invalid)); } catch(error) { invalidIdError=error.message; }
  const combat = C.createCombat();combat.futureCombat={keep:true};
  const a=R.addToCombat(library,combat,player.id),b=R.addToCombat(library,combat,npc.id);
  C.setEngagement(combat,a.id,b.id,true);
  combat.phase='attaquer';a.approach='attaquer';b.approach='attaquer';a.roll='7-9';
  const advancedAllowed=Rules.available(a,technique,'attaquer');
  const proposal=C.manual(combat,a.id,b.id,'fatigue',1,'','Scénario de contrat');
  const beforePreview=JSON.stringify(combat);
  const preview=C.previewCommit(combat);
  const previewDoesNotMutate=JSON.stringify(combat)===beforePreview;
  C.commit(combat);
  const committed=plain(combat);
  const independentSheet=npc.fatigue===0;
  R.syncCombatToLibrary(library,combat,b.id);
  const explicitSyncFatigue=npc.fatigue;
  const undoSucceeded=C.undo(combat);
  validators.validateCombat(combat);
  validators.validateBackupLinks(library,combat);
  return plain({presetDoesNotMutate,roundtrip,invalidIdError,advancedAllowed,previewDoesNotMutate,
    proposal,preview,committed,independentSheet,explicitSyncFatigue,undoSucceeded,
    library,combat,catalogIds:catalog.map(t=>t.id),playbookIds:P.PLAYBOOKS.map(p=>p.id)});
}
module.exports={exerciseContracts};
if(require.main===module){
  const {loadLegacyApplication}=require('./legacy-application.cjs');
  const {loadDomain}=require('../../src/domain/index.cjs');
  process.stdout.write(JSON.stringify({scenarioSource:exerciseContracts.toString(),expected:exerciseContracts(loadLegacyApplication()),sourceExpected:exerciseContracts(loadDomain())}));
}
