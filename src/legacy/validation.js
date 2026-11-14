function validateCombat(raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('Combat absent ou invalide');
 if(!Number.isInteger(raw.round)||raw.round<1||raw.round>100000||!Number.isInteger(raw.seq)||raw.seq<1)throw Error('Numéro de passe ou séquence invalide');
 if(raw.scene!==undefined&&(!Number.isInteger(raw.scene)||raw.scene<1||raw.scene>100000))throw Error('Numéro de scène invalide');
 if(!['declaration','defendre','attaquer','esquiver','fin'].includes(raw.phase))throw Error('Phase inconnue');
 for(const k of ['fighters','actions','proposals','history','snapshots','notes'])if(!Array.isArray(raw[k]))throw Error('Champ combat invalide : '+k);
 const ids=new Set();
 for(const f of raw.fighters){
  if(!f||typeof f!=='object'||typeof f.id!=='string'||!/^p-\d+$/.test(f.id)||ids.has(f.id))throw Error('Identifiant de combattant invalide ou dupliqué');
  ids.add(f.id);
  if(typeof f.name!=='string'||!f.name.trim()||f.name.length>100||!['PJ','PNJ'].includes(f.kind))throw Error('Combattant invalide');
  if(!Number.isInteger(f.fatigue)||f.fatigue<0||f.fatigue>5||!Number.isInteger(f.balance)||f.balance< -3||f.balance>3)throw Error('Ressources de combattant invalides');
  if(!Array.isArray(f.conditions)||f.conditions.some(x=>!Roster.CONDITIONS.includes(x))||!Array.isArray(f.statuses)||f.statuses.some(x=>!CombatCore.STATUS.includes(x)))throw Error('États ou statuts de combattant invalides');
  for(const k of ['blocked','reactions','bonuses'])if(!Array.isArray(f[k]))throw Error('Données de combattant manquantes : '+k);
  if(f.approach!==null&&!CombatCore.APPROACHES.includes(f.approach))throw Error('Approche invalide');
  if(f.roll!==null&&!['6-','7-9','10+'].includes(f.roll))throw Error('Jet invalide');
  if(f.equipmentDisabled!==undefined&&typeof f.equipmentDisabled!=='boolean')throw Error('État de l’équipement invalide');
  if(f.materials!==undefined&&(!Number.isInteger(f.materials)||f.materials<0))throw Error('Réserve de matériels invalide');
  if(f.characterId!==undefined&&(typeof f.characterId!=='string'||!/^[A-Za-z0-9][A-Za-z0-9_-]{0,119}(?![\s\S])/.test(f.characterId)))throw Error('Lien de fiche invalide');
 }
 // Les références utilisées dès le premier affichage doivent être valides avant import.
 // Absence et null restent compatibles avec les anciens champs optionnels.
 if(raw.engagements!==undefined&&raw.engagements!==null){
  if(!Array.isArray(raw.engagements))throw Error('Engagements invalides : liste attendue');
  for(const pair of raw.engagements)if(!Array.isArray(pair)||pair.length!==2||pair[0]===pair[1]||!ids.has(pair[0])||!ids.has(pair[1]))throw Error('Engagement invalide : deux combattants distincts existants sont requis');
 }
 if(raw.traps!==undefined&&raw.traps!==null){
  if(!Array.isArray(raw.traps))throw Error('Pièges invalides : liste attendue');
  const trapIds=new Set();
  for(const trap of raw.traps){
   if(!trap||typeof trap!=='object'||typeof trap.id!=='string'||!/^[A-Za-z0-9][A-Za-z0-9_-]{0,119}(?![\s\S])/.test(trap.id)||trapIds.has(trap.id)||!ids.has(trap.ownerId)||typeof trap.zone!=='string'||!trap.zone.trim()||trap.zone.length>120||(trap.round!==undefined&&(!Number.isInteger(trap.round)||trap.round<1||trap.round>raw.round)))throw Error('Piège invalide : identifiant, propriétaire, zone ou passe incohérents');
   trapIds.add(trap.id);
  }
 }
 for(const a of raw.actions){if(!a||typeof a!=='object'||!ids.has(a.sourceId)||!Number.isInteger(a.round))throw Error('Action invalide');if(a.targetId!==undefined&&a.targetId!==null&&!ids.has(a.targetId))throw Error('Cible d’action inconnue')}
 for(const e of raw.proposals){if(!e||typeof e!=='object'||!ids.has(e.targetId)||(typeof e.id!=='string'||!/^[A-Za-z0-9][A-Za-z0-9_-]{0,119}(?![\s\S])/.test(e.id)))throw Error('Proposition invalide')}
 for(const h of raw.history){if(!h||!Number.isInteger(h.round)||!Array.isArray(h.events))throw Error('Historique invalide')}
 if(raw.temporaryEffects!==undefined){
  if(!Array.isArray(raw.temporaryEffects)||raw.temporaryEffects.length>10000)throw Error('Effets temporaires invalides');
  const tempIds=new Set();
  for(const e of raw.temporaryEffects){
   if(!e||typeof e!=='object'||typeof e.id!=='string'||!/^temp-\d+$/.test(e.id)||tempIds.has(e.id)||!ids.has(e.targetId)||typeof e.label!=='string'||!e.label.trim()||e.label.length>120||!['round','scene','manual'].includes(e.duration)||!Number.isInteger(e.createdRound)||e.createdRound<1||e.createdRound>raw.round||!Number.isInteger(e.createdScene)||e.createdScene<1||e.createdScene>(raw.scene||1)||(e.originType!==undefined&&!['mj','technique','personnage'].includes(e.originType))||(e.originLabel!==undefined&&(typeof e.originLabel!=='string'||e.originLabel.length>120))||(e.originSourceId!==undefined&&e.originSourceId!==null&&(!ids.has(e.originSourceId)||!['personnage','technique'].includes(e.originType)))||(e.originType==='personnage'&&!ids.has(e.originSourceId))||(e.originActionId!==undefined&&(typeof e.originActionId!=='string'||!e.originActionId.trim()||e.originType!=='technique')))throw Error('Entrée d’effet temporaire invalide');
   if(e.expiresAfterRound!==undefined&&(!Number.isInteger(e.expiresAfterRound)||e.expiresAfterRound<e.createdRound||e.expiresAfterRound>raw.round+10000||e.duration!=='round'))throw Error('Expiration d’effet temporaire invalide');
   if(e.reedPrediction!==undefined&&(!['defendre','attaquer','esquiver'].includes(e.reedPrediction)||!ids.has(e.reedTargetId)||typeof e.reedResolved!=='boolean'||e.originLabel!=='Souple comme un roseau'))throw Error('Pari Souple comme un roseau invalide');
   tempIds.add(e.id);
  }
 }
 if(raw.sceneJournal!==undefined){
  if(!Array.isArray(raw.sceneJournal)||raw.sceneJournal.length>100000)throw Error('Journal narratif invalide');
  const noteIds=new Set();
  for(const n of raw.sceneJournal){
   if(!n||typeof n!=='object'||typeof n.id!=='string'||!/^scene-note-\d+$/.test(n.id)||noteIds.has(n.id)||!Number.isInteger(n.scene)||n.scene<1||n.scene>(raw.scene||1)||!Number.isInteger(n.round)||n.round<1||n.round>raw.round||typeof n.title!=='string'||n.title.length>120||typeof n.text!=='string'||!n.text.trim()||n.text.length>1000)throw Error('Entrée de journal narratif invalide');
   noteIds.add(n.id);
  }
 }
 return raw;
}
function validateBackupLinks(library,combat){
 const known=new Set(library.characters.map(c=>c.id));
 for(const f of combat.fighters)if(f.characterId&&!known.has(f.characterId))throw Error('Combat lié à une fiche absente : '+f.characterId);
}
