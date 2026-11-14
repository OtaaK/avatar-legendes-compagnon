// All entry points that mutate the combat are protected, including undo and phase changes.
for(const name of ['demo','add','setGeneCombatChoice','setApproach','setRoll','prepare','approve','reject','back','releaseTrapped','step','includeSheet','changeEngagement','disengageOne','clearAllEngagements','triggerTrapUI','renameSceneUI','editSceneNoteUI','removeSceneNoteUI','addSceneNoteUI','addTemporaryEffectUI','editTemporaryEffectUI','removeTemporaryEffectUI','newSceneUI','resolveReedBetUI','waiveCountertimeUI','revealCountertimeUI','earthLavaUI','earthLavaFractureUI','spendEarthArmorUI','resolveEarthArmorHitUI','earthShieldUI','earthSeismicInterruptUI','earthMudStrikeUI']){
 const action=({demo,add,setGeneCombatChoice,setApproach,setRoll,prepare,approve,reject,back,releaseTrapped,step,includeSheet,changeEngagement,disengageOne,clearAllEngagements,triggerTrapUI,renameSceneUI,editSceneNoteUI,removeSceneNoteUI,addSceneNoteUI,addTemporaryEffectUI,editTemporaryEffectUI,removeTemporaryEffectUI,newSceneUI,resolveReedBetUI,waiveCountertimeUI,revealCountertimeUI,earthLavaUI,earthLavaFractureUI,spendEarthArmorUI,resolveEarthArmorHitUI,earthShieldUI,earthSeismicInterruptUI,earthMudStrikeUI})[name];
 const protectedAction=(...args)=>{try{return commitCombatMutation(()=>action(...args))}catch(err){alert(err.message)}};
 switch(name){
  case 'demo':demo=protectedAction;break;
  case 'add':add=protectedAction;break;
  case 'setGeneCombatChoice':setGeneCombatChoice=protectedAction;break;
  case 'setApproach':setApproach=protectedAction;break;
  case 'setRoll':setRoll=protectedAction;break;
  case 'prepare':prepare=protectedAction;break;
  case 'approve':approve=protectedAction;break;
  case 'reject':reject=protectedAction;break;
  case 'back':back=protectedAction;break;
  case 'releaseTrapped':releaseTrapped=protectedAction;break;
  case 'step':step=protectedAction;break;
  case 'includeSheet':includeSheet=protectedAction;break;
  case 'changeEngagement':changeEngagement=protectedAction;break;
  case 'disengageOne':disengageOne=protectedAction;break;
  case 'clearAllEngagements':clearAllEngagements=protectedAction;break;
  case 'triggerTrapUI':triggerTrapUI=protectedAction;break;
  case 'renameSceneUI':renameSceneUI=protectedAction;break;
  case 'editSceneNoteUI':editSceneNoteUI=protectedAction;break;
  case 'removeSceneNoteUI':removeSceneNoteUI=protectedAction;break;
  case 'addSceneNoteUI':addSceneNoteUI=protectedAction;break;
  case 'addTemporaryEffectUI':addTemporaryEffectUI=protectedAction;break;
  case 'editTemporaryEffectUI':editTemporaryEffectUI=protectedAction;break;
  case 'removeTemporaryEffectUI':removeTemporaryEffectUI=protectedAction;break;
  case 'newSceneUI':newSceneUI=protectedAction;break;
  case 'resolveReedBetUI':resolveReedBetUI=protectedAction;break;
  case 'waiveCountertimeUI':waiveCountertimeUI=protectedAction;break;
  case 'revealCountertimeUI':revealCountertimeUI=protectedAction;break;
  case 'earthLavaUI':earthLavaUI=protectedAction;break;
  case 'earthLavaFractureUI':earthLavaFractureUI=protectedAction;break;
  case 'spendEarthArmorUI':spendEarthArmorUI=protectedAction;break;
  case 'resolveEarthArmorHitUI':resolveEarthArmorHitUI=protectedAction;break;
  case 'earthShieldUI':earthShieldUI=protectedAction;break;
  case 'earthSeismicInterruptUI':earthSeismicInterruptUI=protectedAction;break;
  case 'earthMudStrikeUI':earthMudStrikeUI=protectedAction;break;
 }
}
