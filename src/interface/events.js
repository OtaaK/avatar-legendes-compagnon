// Données inertes dans les attributs ; seules ces actions fixes peuvent être appelées.
function handleDataAction(event){
 const node=event.target.closest?.('[data-ui-'+event.type+']');
 if(!node||node.disabled)return;
 const action=node.getAttribute('data-ui-'+event.type);
 if(event.type==='keydown'){
  if(action!=='openCharacterDetail'||event.target!==node||!['Enter',' '].includes(event.key))return;
  event.preventDefault();openCharacterDetail(node.dataset.id);return;
 }
 if(event.type==='change'){
  switch(action){
   case 'changeEngagement':changeEngagement(node.dataset.id,node.dataset.extra,node.checked);break;
   case 'setGeneCombatChoice':setGeneCombatChoice(node.dataset.id,node.value);break;
   case 'setApproach':setApproach(node.dataset.id,node.value);break;
   case 'setRoll':setRoll(node.dataset.id,node.value);break;
  }
  return;
 }
 if(event.type!=='click')return;
 switch(action){
  case 'chooseWizardBonus':chooseWizardBonus(node.dataset.id);break;
  case 'chooseWizardTraining':chooseWizardTraining(node.dataset.id);break;
  case 'disengageOne':disengageOne(node.dataset.id);break;
  case 'earthLavaFractureUI':earthLavaFractureUI(node.dataset.id);break;
  case 'earthLavaUI':earthLavaUI(node.dataset.id,node.dataset.extra);break;
  case 'earthMudStrikeUI':earthMudStrikeUI(node.dataset.id,node.dataset.extra);break;
  case 'earthSeismicInterruptUI':earthSeismicInterruptUI(node.dataset.id);break;
  case 'earthShieldUI':earthShieldUI(node.dataset.id,node.dataset.extra);break;
  case 'editCombatFighter':editCombatFighter(node.dataset.id);break;
  case 'editSceneNoteUI':editSceneNoteUI(node.dataset.id);break;
  case 'editTemporaryEffectUI':editTemporaryEffectUI(node.dataset.id);break;
  case 'includeSheet':includeSheet(node.dataset.id);break;
  case 'openCatalogDetail':openCatalogDetail(node.dataset.id);break;
  case 'openCharacterDetail':openCharacterDetail(node.dataset.id);break;
  case 'openCombatSheet':openCombatSheet(node.dataset.id);break;
  case 'quickSheetCondition':quickSheetCondition(node.dataset.id);break;
  case 'releaseTrapped':releaseTrapped(node.dataset.id);break;
  case 'removeSceneNoteUI':removeSceneNoteUI(node.dataset.id);break;
  case 'removeTemporaryEffectUI':removeTemporaryEffectUI(node.dataset.id);break;
  case 'resolveEarthArmorHitUI':resolveEarthArmorHitUI(node.dataset.id);break;
  case 'resolveReedBetUI':resolveReedBetUI(node.dataset.id);break;
  case 'revealCountertimeUI':revealCountertimeUI(node.dataset.id);break;
  case 'selectCatalogTechnique':selectCatalogTechnique(node.dataset.id);break;
  case 'spendEarthArmorUI':spendEarthArmorUI(node.dataset.id,node.dataset.extra);break;
  case 'stepField':stepField(node.dataset.id,Number(node.dataset.extra),Number(node.dataset.min),Number(node.dataset.max));break;
  case 'syncSheet':syncSheet(node.dataset.id);break;
  case 'toggleSheetCondition':toggleSheetCondition(node.dataset.id);break;
  case 'toggleSheetStatus':toggleSheetStatus(node.dataset.id);break;
  case 'triggerTrapUI':triggerTrapUI(node.dataset.id);break;
  case 'waiveCountertimeUI':waiveCountertimeUI(node.dataset.id);break;
 }
}
