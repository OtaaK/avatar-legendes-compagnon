// Extrait de a9079fa, app/simulateur.html. Voir extraction.json.
import { npcResourceProfile, resourceLimits, validateResourceValues, fatigueLimit, resourceConditionNames, balanceValue } from './resources.js';
const APPROACHES=['defendre','attaquer','esquiver'];
const STATUS=['en_danger','gene','piege','etourdi','renforce','avantage','pret','confiant'];
const clone=x=>JSON.parse(JSON.stringify(x));
const uid=(prefix,n)=>`${prefix}-${n}`;
function createCombat(){
 return {round:1,scene:1,sceneTitle:'',sceneJournal:[],temporaryEffects:[],phase:'declaration',fighters:[],engagements:[],actions:[],proposals:[],history:[],snapshots:[],seq:1,notes:[],traps:[]};
}
function addFighter(s,name,kind='PJ'){
 const id=uid('p',s.seq++);
 s.fighters.push({id,name,kind,fatigue:0,conditions:[],balance:0,statuses:[],approach:null,roll:null,blocked:[],reactions:[],bonuses:[],materials:0});
 return id;
}
// Retrait administratif : ne résout aucun effet de jeu à la place du MJ.
function fighterRemovalBlock(s,id){
 const f=fighter(s,id);
 if(s.phase!=='declaration')return 'Retirer un combattant avant la révélation des approches.';
 if(s.actions.length||s.proposals.length)return 'Valider ou annuler les actions en attente avant le retrait.';
 const mentions=value=>{const queue=[value],seen=new Set();while(queue.length){const item=queue.pop();if(item===id)return true;if(!item||typeof item!=='object'||seen.has(item))continue;seen.add(item);for(const value of Object.values(item))queue.push(value);}return false;};
 const ignored=new Set(['round','scene','sceneTitle','sceneJournal','phase','fighters','engagements','actions','proposals','history','snapshots','seq','notes']);
 for(const [key,value] of Object.entries(s))if(!ignored.has(key)&&mentions(value))return 'Résoudre ou retirer explicitement les effets et pièges liés à ce combattant avant son retrait.';
 if(['reactions','bonuses','roundStatuses','roundCosts'].some(key=>Array.isArray(f[key])&&f[key].length))return 'Ce combattant porte encore une réaction ou un effet actif ; le résoudre avant son retrait.';
 const identity=new Set(['id','name','kind','characterId','stats','techniques','npcResources','principles','conditions','statuses']);
 for(const other of s.fighters)for(const [key,value] of Object.entries(other))if(!identity.has(key)&&mentions(value))return 'Une donnée mécanique référence encore ce combattant ; la résoudre avant son retrait.';
 return '';
}
function removeFighter(s,id){
 const reason=fighterRemovalBlock(s,id);if(reason)throw Error(reason);
 const removed=fighter(s,id),before=clone({...s,snapshots:[]}),next=clone(s);
 next.fighters=next.fighters.filter(f=>f.id!==id);next.engagements=(next.engagements||[]).filter(pair=>!pair.includes(id));
 next.snapshots.push(before);next.history.push({round:s.round,phase:s.phase,events:[{kind:'fighter_remove',sourceId:null,targetId:null,removedFighterId:id,detail:removed.name,reason:'Retrait du combat confirmé ; fiche permanente conservée'}]});
 Object.assign(s,next);return true;
}

function fighter(s,id){const f=s.fighters.find(x=>x.id===id);if(!f)throw Error('Combattant inconnu');return f;}
function engagementKey(a,b){return [a,b].sort().join('|');}
function isEngaged(s,a,b){return a!==b&&(s.engagements||[]).some(pair=>engagementKey(pair[0],pair[1])===engagementKey(a,b));}
// V2.10 : avantage conditionnel des entraves, recalculé à chaque changement d'engagement.
function syncEarthMetalAdvantage(s){
 const effects=(s.temporaryEffects||[]).filter(e=>e.originLabel==='Entraves de métal');
 for(const caster of s.fighters){
  const own=effects.filter(e=>e.originSourceId===caster.id);
  const active=own.some(e=>fighter(s,e.targetId).statuses.includes('gene')&&isEngaged(s,caster.id,e.targetId));
  const granted=own.some(e=>e.metalGrantedAdvantage===true);
  if(active){
   if(!caster.statuses.includes('avantage'))caster.statuses.push('avantage');
   // Une nouvelle entrave hérite de la provenance métallique déjà active.
   if(!own.some(e=>e.metalExternalAdvantage===true))for(const e of own)e.metalGrantedAdvantage=true;
  }else if(granted){
   const independent=own.some(e=>e.metalExternalAdvantage===true)||
    (s.temporaryEffects||[]).some(e=>e.targetId===caster.id&&(e.originLabel==='Étoile de lave'||(e.originLabel==='Armure de terre'&&Number(e.armorPoints)>0)))||
    (caster.roundStatuses||[]).some(e=>e.status==='avantage'&&e.expiresAfterRound>=s.round);
   if(!independent){caster.statuses=caster.statuses.filter(x=>x!=='avantage');if(caster.statusAppliedRound)delete caster.statusAppliedRound.avantage;}
   for(const e of own)e.metalGrantedAdvantage=false;
  }
 }
}
function setEngagement(s,a,b,engaged){
 const transactionRollback=clone(s);
 try{
 fighter(s,a);fighter(s,b);if(a===b)throw Error('Engagement : deux combattants distincts requis');
 if(s.proposals.length)throw Error('Engagement : valider les propositions avant de modifier le terrain');
 // Une confirmation identique ne doit pas polluer l'historique ni l'annulation.
 const current=isEngaged(s,a,b);
 if(current===Boolean(engaged))return current;
 const before=clone({...s,snapshots:[]});
 s.engagements=(s.engagements||[]).filter(pair=>engagementKey(pair[0],pair[1])!==engagementKey(a,b));
 if(engaged)s.engagements.push([a,b]);
 syncEarthMetalAdvantage(s);
 s.snapshots.push(before);s.history.push({round:s.round,phase:s.phase,events:[{kind:engaged?'engage':'disengage',sourceId:a,targetId:b,reason:'Position confirmée par le MJ'}]});
 return isEngaged(s,a,b);
 }catch(err){for(const key of Object.keys(s))if(!Object.prototype.hasOwnProperty.call(transactionRollback,key))delete s[key];Object.assign(s,transactionRollback);throw err;}
}
// Remise à zéro du terrain : une seule transaction, annulable par le MJ.
function clearEngagements(s){
 const transactionRollback=clone(s);
 try{
 if(s.proposals.length)throw Error('Engagements : valider les propositions avant de réinitialiser le terrain');
 if(!(s.engagements||[]).length)return false;
 const before=clone({...s,snapshots:[]});
 const previous=s.engagements.map(pair=>[...pair]);
 s.engagements=[];
 syncEarthMetalAdvantage(s);
 s.snapshots.push(before);
 s.history.push({round:s.round,phase:s.phase,events:previous.map(pair=>({kind:'disengage',sourceId:pair[0],targetId:pair[1],reason:'Réinitialisation du terrain confirmée par le MJ'}))});
 return true;
 }catch(err){for(const key of Object.keys(s))if(!Object.prototype.hasOwnProperty.call(transactionRollback,key))delete s[key];Object.assign(s,transactionRollback);throw err;}
}
// V0.80 : rompre tous les engagements d'un seul combattant, transaction atomique.
function disengageFighter(s,id){
 const transactionRollback=clone(s);
 try{
 fighter(s,id);
 if(s.proposals.length)throw Error('Engagements : valider les propositions avant de déplacer un combattant');
 const links=(s.engagements||[]).filter(pair=>pair.includes(id));
 if(!links.length)return false;
 const before=clone({...s,snapshots:[]});
 s.engagements=s.engagements.filter(pair=>!pair.includes(id));
 syncEarthMetalAdvantage(s);
 s.snapshots.push(before);
 s.history.push({round:s.round,phase:s.phase,events:links.map(pair=>({kind:'disengage',sourceId:id,targetId:pair[0]===id?pair[1]:pair[0],reason:'Déplacement du combattant confirmé par le MJ'}))});
 return true;
 }catch(err){for(const key of Object.keys(s))if(!Object.prototype.hasOwnProperty.call(transactionRollback,key))delete s[key];Object.assign(s,transactionRollback);throw err;}
}
function declare(s,id,approach,roll='7-9'){
 if(s.phase!=='declaration')throw Error('Déclaration close');
 const f=fighter(s,id);
 // V1.49 : une approche déjà dévoilée par À contretemps ne peut plus être modifiée.
 const countertimes=(s.temporaryEffects||[]).filter(e=>e.originLabel==='À contretemps'&&e.createdRound+1===s.round);
 if(countertimes.some(e=>e.countertimeResolved&&!e.countertimeWaived&&e.countertimeOpponentId===id))throw Error('À contretemps : approche déjà révélée, modification interdite');
 if(countertimes.some(e=>!e.countertimeResolved&&e.targetId===id))throw Error('À contretemps : le MJ doit révéler l’approche adverse avant le choix du bénéficiaire');
 if(!APPROACHES.includes(approach))throw Error('Approche inconnue');
 if(f.blocked.includes(approach))throw Error('Approche interdite cette passe');
 if(f.statuses.includes('etourdi'))throw Error('Étourdi : impossible de déclarer une action tant que le statut persiste (MJ : vérifier la fiction).');
 if(f.statuses.includes('piege'))throw Error('Piégé : se libérer ou obtenir une aide avant de déclarer une action physique.');
 f.approach=approach;f.roll=roll;
}
// V1.38 : divulgation anticipée à contretemps, sans changer les autres approches.
function revealCountertime(s,id,confirmed){
 if(s.phase!=='declaration'||s.proposals.length||s.actions.length)throw Error('À contretemps : révélation uniquement pendant les déclarations');
 if(confirmed!==true)throw Error('À contretemps : confirmation MJ requise');
 const effect=(s.temporaryEffects||[]).find(e=>e.id===id&&e.originLabel==='À contretemps'&&e.countertimeOpponentId);
 if(!effect||effect.countertimeResolved||effect.createdRound+1!==s.round)throw Error('À contretemps : effet absent, déjà utilisé ou hors délai');
 const caster=fighter(s,effect.targetId),opponent=fighter(s,effect.countertimeOpponentId);
 if(caster.approach)throw Error('À contretemps : le bénéficiaire doit choisir son approche après la révélation');
 if(!APPROACHES.includes(opponent.approach))throw Error('À contretemps : l’adversaire doit déclarer son approche en premier');
 const before=clone({...s,snapshots:[]});
 effect.countertimeResolved=true;
 s.snapshots.push(before);
 s.history.push({round:s.round,phase:s.phase,events:[{kind:'note',targetId:caster.id,detail:opponent.name+' : '+opponent.approach,reason:'À contretemps : approche révélée avant le choix du bénéficiaire (MJ)'}]});
 return opponent.approach;
}
// V1.49 : arbitrage explicite lorsque l’adversaire ne peut pas déclarer.
// Ceci n’est PAS une révélation fictive de son approche : le MJ renonce à l’effet différé.
function waiveCountertime(s,id,confirmed){
 if(s.phase!=='declaration'||s.proposals.length||s.actions.length)throw Error('À contretemps : arbitrage uniquement pendant les déclarations');
 if(confirmed!==true)throw Error('À contretemps : confirmation MJ requise');
 const effect=(s.temporaryEffects||[]).find(e=>e.id===id&&e.originLabel==='À contretemps'&&e.countertimeOpponentId);
 if(!effect||effect.countertimeResolved||effect.createdRound+1!==s.round)throw Error('À contretemps : effet absent, déjà résolu ou hors délai');
 const caster=fighter(s,effect.targetId),opponent=fighter(s,effect.countertimeOpponentId);
 if(caster.approach)throw Error('À contretemps : arbitrer avant le choix du bénéficiaire');
 if(opponent.approach)throw Error('À contretemps : une approche est déclarée ; utiliser la révélation normale');
 if(!opponent.statuses.includes('etourdi')&&!opponent.statuses.includes('piege'))throw Error('À contretemps : arbitrage réservé à un adversaire Étourdi ou Piégé');
 const before=clone({...s,snapshots:[]});
 effect.countertimeResolved=true;effect.countertimeWaived=true;
 s.snapshots.push(before);
 s.history.push({round:s.round,phase:s.phase,events:[{kind:'note',targetId:caster.id,detail:opponent.name+' ne peut pas déclarer (Étourdi/Piégé)',reason:'À contretemps : effet non appliqué sur décision explicite du MJ, sans approche inventée'}]});
 return true;
}
function reveal(s){
 if(s.phase!=='declaration')throw Error('Déjà révélé');
 const pendingCountertime=(s.temporaryEffects||[]).find(e=>e.originLabel==='À contretemps'&&e.createdRound+1===s.round&&!e.countertimeResolved);
 if(pendingCountertime)throw Error('À contretemps : le MJ doit révéler l’approche adverse avant de clore les déclarations');
 if(s.fighters.some(f=>!f.approach&&!f.statuses.includes('etourdi')&&!f.statuses.includes('piege')))throw Error('Approches manquantes');
 // V2.32 : prévalider TOUS les paiements Gêné avant de modifier un seul combattant.
 // Sinon une fatigue maximale rencontrée en fin de liste laissait les précédents
 // payer et leurs statuts actifs se révéler malgré l'échec de la déclaration.
 for(const f of s.fighters){
  if(f.statuses.includes('gene')&&f.geneChoice==='fatigue'&&f.fatigue>=fatigueLimit(f))
   throw Error(f.name+' : impossible de payer Gêné avec la fatigue au maximum ; choisir le malus.');
 }
 for(const f of s.fighters){
  f.activeStatuses=[...f.statuses];
  if(f.activeStatuses.includes('gene')&&f.geneChoice!=='fatigue')f.geneChoice='malus';
  if(f.activeStatuses.includes('gene')&&f.geneChoice==='fatigue')f.fatigue++;
 }
 s.phase='defendre';
}
function allowance(f){
 let n=f.kind==='PNJ'?Math.max(0,1+f.balance):f.roll==='10+'?2:1;
 if((f.activeStatuses||[]).includes('gene')&&f.geneChoice!=='fatigue'&&f.kind==='PNJ')n=Math.max(0,n-1);
 if((f.activeStatuses||[]).includes('avantage'))n++;
 // Serrer les dents : une technique supplémentaire par attaque subie
 // pendant la passe précédente, même sur un jet de posture raté.
 n+=(f.endureAllowance||0);
 return n;
}
function setGeneChoice(s,id,choice){
 if(s.phase!=='declaration')throw Error('Choix Gêné uniquement avant la révélation');
 if(!['fatigue','malus'].includes(choice))throw Error('Choix Gêné inconnu');
 const f=fighter(s,id);
 if(!f.statuses.includes('gene'))throw Error('Ce combattant n’est pas Gêné');
 f.geneChoice=choice;
}
function escapeTrap(s,id,fatigue,conditions,fictionApproved=false){
 if(s.phase!=='fin'&&s.phase!=='declaration')throw Error('Libération entre deux passes uniquement');
 const f=fighter(s,id);
 if(!f.statuses.includes('piege'))throw Error('Ce combattant n’est pas Piégé');
 if(!fictionApproved)throw Error('Le MJ doit confirmer la méthode de libération');
 if(!Number.isInteger(fatigue)||fatigue<0||!Array.isArray(conditions)||fatigue+conditions.length!==3)throw Error('Coût de libération : exactement 3 cases de fatigue et/ou états');
 if(f.fatigue+fatigue>fatigueLimit(f))throw Error('Fatigue insuffisante : choisir une autre combinaison');
 if(conditions.some(c=>!resourceConditionNames(f).includes(c)||f.conditions.includes(c))||new Set(conditions).size!==conditions.length)throw Error('États de libération invalides ou déjà cochés');
 // Aucune libération ne doit effacer une proposition MJ encore en attente.
 if(s.proposals.length)throw Error('Libération de Piégé : résoudre les propositions en attente');
 // Une erreur tardive (journal, snapshot, état corrompu) restaure TOUT le combat,
 // y compris les points d'annulation précédents.
 const rollback=clone(s);
 const before=clone({...s,snapshots:[]});
 try{
  f.fatigue+=fatigue;f.conditions.push(...conditions);f.statuses=f.statuses.filter(x=>x!=='piege');
  s.notes.push(f.name+' libéré de Piégé : '+fatigue+' fatigue, '+conditions.length+' états (MJ).');
  s.snapshots.push(before);
  s.history.push({round:s.round,phase:s.phase,events:[{kind:'trap_escape',targetId:id,amount:fatigue,detail:conditions.join(', ')||'Fatigue seule',reason:'Libération de Piégé : méthode et coût validés par le MJ'}]});
 }catch(err){for(const key of Object.keys(s))if(!Object.prototype.hasOwnProperty.call(rollback,key))delete s[key];Object.assign(s,rollback);throw err;}
}
// V1.33 : révélation contrôlée du pari. Les approches doivent être verrouillées.
// La prédiction n'est jamais publiée dans la liste des effets temporaires.
function resolveReedBet(s,id,confirmed){
 if(s.phase!=='defendre')throw Error('Souple comme un roseau : résoudre au début de Défendre et prendre à revers, après la révélation');
 if(s.actions.some(a=>a.round===s.round))throw Error('Souple comme un roseau : résolution trop tardive, des techniques sont déjà engagées');
 if(s.proposals.length)throw Error('Souple comme un roseau : propositions en attente');
 if(confirmed!==true)throw Error('Souple comme un roseau : validation MJ requise');
 const bet=(s.temporaryEffects||[]).find(e=>e.id===id&&e.originLabel==='Souple comme un roseau'&&e.reedPrediction);
 if(!bet||bet.reedResolved||bet.createdRound+1!==s.round)throw Error('Souple comme un roseau : pari absent, déjà résolu ou hors délai');
 const caster=fighter(s,bet.targetId),opponent=fighter(s,bet.reedTargetId);
 if(!APPROACHES.includes(opponent.approach))throw Error('Souple comme un roseau : approche adverse manquante');
 const before=clone({...s,snapshots:[]});
 const success=opponent.approach===bet.reedPrediction;
 bet.reedResolved=true;
 if(success){
  if(!caster.activeStatuses.includes('avantage'))caster.activeStatuses.push('avantage');
  // Interdiction limitée à la passe en cours, sans modifier le statut permanent.
  (s.reedProtections||(s.reedProtections=[])).push({casterId:caster.id,opponentId:opponent.id,round:s.round});
 }else{
  // Changer d'approche demeure un choix du joueur, avant toute technique.
  caster.reedMayChangeApproach=true;
 }
 s.snapshots.push(before);
 s.history.push({round:s.round,phase:s.phase,events:[{kind:'note',targetId:caster.id,detail:success?'Prédiction correcte : Avantagé et protection ciblée':'Prédiction incorrecte : changement d’approche possible',reason:'Souple comme un roseau : résolution validée MJ'}]});
 return success;
}
function changeReedApproach(s,casterId,approach){
 const caster=fighter(s,casterId);
 if(!caster.reedMayChangeApproach||!APPROACHES.includes(approach)||caster.blocked.includes(approach))throw Error('Souple comme un roseau : changement non autorisé');
 if(s.actions.some(a=>a.round===s.round&&a.sourceId===casterId))throw Error('Souple comme un roseau : techniques déjà engagées');
 if(s.phase!=='defendre')throw Error('Souple comme un roseau : changement uniquement avant la résolution');
 const before=clone({...s,snapshots:[]});
 caster.approach=approach;caster.reedMayChangeApproach=false;
 s.snapshots.push(before);
 s.history.push({round:s.round,phase:s.phase,events:[{kind:'note',targetId:casterId,detail:approach,reason:'Souple comme un roseau : changement d’approche MJ'}]});
}
function requiredFighterStatuses(s,id){
 const effects=s.temporaryEffects||[],required=[];
 if(effects.some(e=>e.targetId===id&&['Entraves de métal','Bouclier de roche'].includes(e.originLabel)))required.push('gene');
 if(earthPersistentAdvantage(s,id))required.push('avantage');
 return required;
}
function updateFighter(s,id,patch){
 const rollback=clone(s);
 try{
  if(s.phase!=='declaration'||s.actions.length||s.proposals.length)throw Error('Modifier le combattant avant la révélation des approches, sans action en attente.');
  const f=fighter(s,id),allowed=['name','fatigue','balance','materials','conditions','statuses'];
  if(!patch||typeof patch!=='object'||Array.isArray(patch)||Object.keys(patch).some(k=>!allowed.includes(k)))throw Error('Champ de combattant non modifiable.');
  const next={...f,...clone(patch)};
  if(typeof next.name!=='string'||!next.name.trim()||next.name.trim().length>100)throw Error('Nom requis (100 caractères maximum).');
  next.name=next.name.trim();
  if(!Number.isInteger(next.fatigue)||next.fatigue<0||next.fatigue>fatigueLimit(next))throw Error('Fatigue invalide (0 à 5).');
  if(!Number.isInteger(next.balance)||next.balance<resourceLimits(next).balanceMin||next.balance>resourceLimits(next).balanceMax)throw Error('Équilibre invalide (−3 à +3).');
  const materials=next.materials??0;
  if(!Number.isInteger(materials)||materials<0)throw Error('Matériels invalides.');
  if(f.equipmentDisabled&&materials>(f.materials||0))throw Error('Équipement hors service : aucun matériel gagné.');
  const conditions=resourceConditionNames(next);
  if(!Array.isArray(next.conditions)||new Set(next.conditions).size!==next.conditions.length||next.conditions.some(x=>!conditions.includes(x)))throw Error('États invalides.');
  if(!Array.isArray(next.statuses)||new Set(next.statuses).size!==next.statuses.length||next.statuses.some(x=>!STATUS.includes(x)))throw Error('Statuts invalides.');
  if(requiredFighterStatuses(s,id).some(status=>!next.statuses.includes(status)))throw Error('Ce statut est maintenu par un effet actif : utiliser la commande de cet effet.');
  if(allowed.every(k=>JSON.stringify(next[k])===JSON.stringify(f[k])))return false;
  const before=clone({...s,snapshots:[]}),statusesChanged=JSON.stringify(f.statuses)!==JSON.stringify(next.statuses);
  for(const key of Object.keys(patch))f[key]=clone(next[key]);
  if(statusesChanged){f.approach=null;f.roll=null;f.activeStatuses=[];}
  f.roundStatuses=(f.roundStatuses||[]).filter(e=>f.statuses.includes(e.status));
  f.statusAppliedRound=f.statusAppliedRound||{};
  for(const status of Object.keys(f.statusAppliedRound))if(!f.statuses.includes(status))delete f.statusAppliedRound[status];
  for(const status of f.statuses)if(!rollback.fighters.find(x=>x.id===id).statuses.includes(status))f.statusAppliedRound[status]=s.round;
  syncEarthMetalAdvantage(s);
  s.snapshots.push(before);s.history.push({round:s.round,phase:s.phase,events:[{kind:'fighter_edit',targetId:id,detail:f.name,reason:'Modification manuelle du combattant avant la passe'}]});
  return true;
 }catch(error){for(const key of Object.keys(s))if(!Object.prototype.hasOwnProperty.call(rollback,key))delete s[key];Object.assign(s,rollback);throw error;}
}
function queueTechnique(s,sourceId,name,approach,targetId,options={}){
 const f=fighter(s,sourceId);fighter(s,targetId);
 if((f.bonuses||[]).some(b=>b.type==='disarmed_technique'&&b.name===name&&b.scene===(s.scene||1)))throw Error('Désarmement : technique interdite jusqu’à la fin de la rencontre');
 if((s.reedProtections||[]).some(p=>p.round===s.round&&p.opponentId===sourceId&&p.casterId===targetId))throw Error('Souple comme un roseau : cible protégée contre cet adversaire');
 if(s.phase!==approach||f.approach!==approach)throw Error('Approche non active');
 const own=s.actions.filter(a=>a.sourceId===sourceId&&a.round===s.round&&!a.extraTechnique);
 if(own.length>=allowance(f))throw Error('Quota de techniques atteint');
 if((f.activeStatuses||[]).includes('avantage')&&own.length>=allowance(f)-1&&options.catalogEntry&&f.kind==='PJ'){const level=options.catalogEntry.famille==='base'?'base':(f.techniques||[]).find(t=>t.name===name)?.mastery;if(!['base','maitrisee'].includes(level))throw Error('Technique supplémentaire Avantagé : base ou maîtrisée uniquement');}
 if(own.some(a=>a.name===name))throw Error('Technique déjà utilisée');
 if(f.kind==='PJ'&&f.roll==='6-'&&!options.balanceCostApproved)throw Error('Échec : décentrer équilibre requis');
 const entry=options.catalogEntry;
 if(entry){
  if(entry.approche!==({defendre:'Défendre et prendre à revers',attaquer:'Avancer et attaquer',esquiver:'Esquiver et analyser'})[approach])throw Error('Approche incompatible');
  if(f.kind==='PJ'){
   if(entry.accessible_pj===false)throw Error('Technique réservée aux PNJ');
   const level=entry.famille==='base'?'base':(f.techniques||[]).find(t=>t.name===name)?.mastery;
   if(!level)throw Error('Technique non apprise');
   if(f.roll==='6-'&&level!=='base')throw Error('Échec : technique de base uniquement');
   if(f.roll==='7-9'&&!['base','maitrisee'].includes(level))throw Error('Sur 7–9 : technique de base ou maîtrisée');
   if(f.roll==='10+'){
    const other=own[0];
    if(other&&(!['base','maitrisee'].includes(level)||!['base','maitrisee'].includes(other.options?.techniqueLevel)))throw Error('Deux techniques : de base ou maîtrisées');
    if(!other&&['acquise','pratiquee'].includes(level)&&options.mode!=='single')throw Error('Technique avancée non maîtrisée : choisir une seule technique');
    if(other&&other.options?.mode==='single')throw Error('Une seule technique choisie');
   }
   options.techniqueLevel=level;
  }
 }
 const id=uid('a',s.seq++);
 const a={id,round:s.round,sourceId,targetId,name,approach,options};
 s.actions.push(a);
 return a;
}
const EARTH_TECHNIQUES=new Set(['Armure de terre','Bouclier de roche','Boue gluante','Colonne de pierre','Détection du pas lourd','Enfouissement','Entraves de métal','Escalier de poussière','Étoile de lave','Gantelet de terre','Mords la poussière','Mouvements tectoniques','Projection tellurique']);
function hostileEvent(e){return e.sourceId!==e.targetId&&e.fatigueType!=='cost';}
function earthFatigueCost(action,e){return !!action&&e.kind==='fatigue'&&EARTH_TECHNIQUES.has(action.name)&&(e.targetId===action.sourceId||action.name==='Escalier de poussière'||e.reason==='Gantelet de terre : résistance au choc');}
function event(s,action,kind,targetId,amount=0,detail='',reason=''){
 const e={id:uid('e',s.seq++),actionId:action.id,sourceId:action.sourceId,targetId,kind,amount,detail,reason,round:s.round};
 if(earthFatigueCost(action,e))e.fatigueType='cost';
 return e;
}
const DISARMABLE_TECHNIQUES=["Acharnement", "Assaut généralisé", "Aveuglé par la science", "Bloquer le chi", "Boulet de canon", "Boum!", "Bricolage", "Charge", "Clouer une mouche contre un tronc d’arbre", "Colonne de pierre", "Cône d’air", "Disque de feu", "Déferlement", "Encerclement", "Enfouissement", "Estocade précise", "Force débridée", "Frappe dévastatrice", "Frapper un point faible", "Gantelet de terre", "Immobilisation", "Lame de feu", "Marionnette de sang", "Menottes aquatiques", "Poignards de feu", "Prison de glace", "Puissance maximale", "Rayon explosif", "Retourner la situation", "Sang gelé", "Serpent d’eau", "Souffle de feu", "Souffle du vent", "Tirs nourris", "Tourbillon de flammes", "Trait de foudre", "Électrochoc"];
function propose(s,action){
 // Une copie obsolète de l'action ne doit pas contourner une annulation validée.
 const recordedAction=(s.actions||[]).find(a=>a.id===action.id);
 if(action.cancelledBySeismic||(recordedAction&&recordedAction.cancelledBySeismic))throw Error('Détection du pas lourd : technique ennemie annulée, résolution interdite');
 // V1.81 : une seule étoile de lave active par maître de la Terre.
 // Évite une double facturation et deux entretiens indépendants pour le même effet.
 if(action.name==='Étoile de lave'&&(s.temporaryEffects||[]).some(e=>e.originLabel==='Étoile de lave'&&e.targetId===action.sourceId))
  throw Error('Étoile de lave : une étoile est déjà active pour ce combattant');
 const o=action.options, t=action.targetId, events=[];
 if(o.catalogEntry&&fighter(s,action.sourceId).kind==='PJ'){
  if(o.techniqueLevel==='acquise'&&fighter(s,action.sourceId).roll==='10+')events.push(event(s,action,'fatigue',action.sourceId,1,'','Coût posture 10+ : technique acquise'));
  if(fighter(s,action.sourceId).roll==='6-'&&[-1,1].includes(o.balanceDirection))events.push(event(s,action,'balance',action.sourceId,o.balanceDirection,'','Coût posture 6− : décentrage confirmé MJ'));
 }
 if(action.name==='Frapper'){
   if(action.sourceId===t)throw Error('Frapper nécessite une cible');
   if(o.forceStrike){
    if(!['fatigue','condition'].includes(o.choice))throw Error('Frapper avec effort : choisir fatigue ou état, pas équilibre');
    events.push(event(s,action,'fatigue',action.sourceId,1,'','Coût du coup renforcé (p. 159)'));
   }
   if(o.choice==='fatigue')events.push(event(s,action,'fatigue',t,2,'',o.forceStrike?'Choix imposé par l’attaquant':'Choix de la cible'));
   else if(o.choice==='condition'&&o.condition)events.push(event(s,action,'condition',t,0,o.condition,o.forceStrike?'Choix imposé par l’attaquant':'Choix de la cible'));
   else if(o.choice==='balance'&&!o.forceStrike&&[-1,1].includes(o.direction))events.push(event(s,action,'balance',t,o.direction,'','Choix de la cible ; direction validée MJ'));
   else throw Error('Choix de la cible nécessaire');
 }else if(action.name==='Presser l’adversaire'){
   if(!APPROACHES.includes(o.blocked))throw Error('Approche à bloquer requise');
   events.push(event(s,action,'block_next',t,0,o.blocked,'Prochaine passe'));
 }else if(action.name==='Riposter'){
   events.push(event(s,action,'arm_riposte',action.sourceId));
 }else if(action.name==='Protection'){
   if(t===action.sourceId)throw Error('Protection : choisir un allié');
   events.push(event(s,action,'arm_protection',action.sourceId,0,t));
 }else if(action.name==='Gantelet de glace'){
   events.push(event(s,action,'status_add',action.sourceId,0,'pret','Gantelet de glace : Prêt'));
   events.push(event(s,action,'arm_ice_gauntlet',action.sourceId,0,'','Gantelet de glace : prochaine attaque +1 fatigue'));
 }else if(action.name==='Glissade'){
   // V0.74 : les ennemis à portée sont confirmés par le MJ ; la nouvelle
   // configuration des engagements reste narrative, sans positions inventées.
   if(!Array.isArray(o.glissadeEnemies)||!o.glissadeEnemies.length)throw Error('Glissade : désigner au moins un ennemi à portée (MJ)');
   if(new Set(o.glissadeEnemies).size!==o.glissadeEnemies.length)throw Error('Glissade : cible répétée');
   const resisting=o.glissadeResisting||[];
   if(!Array.isArray(resisting)||new Set(resisting).size!==resisting.length||resisting.some(id=>!o.glissadeEnemies.includes(id)))throw Error('Glissade : choix de résistance invalide');
   for(const id of o.glissadeEnemies){
    if(id===action.sourceId)throw Error('Glissade : le lanceur ne peut pas être son propre ennemi');
    fighter(s,id);
   }
   events.push(event(s,action,'fatigue',action.sourceId,-1,'','Glissade : effacer 1 fatigue supplémentaire'));
   for(const id of resisting){
    events.push(event(s,action,'fatigue',id,1,'','Glissade : résistance au repositionnement'));
    events.push(event(s,action,'status_add',id,0,'gene','Glissade : résiste et devient Gêné'));
   }
   // V0.80 : repositionner un ennemi rompt TOUS ses engagements antérieurs,
   // y compris ceux avec des tiers. La résistance conserve tous ses liens.
   // Chaque lien n'est proposé qu'une fois si deux ennemis sont déplacés.
   // Le MJ confirme ensuite les nouvelles paires, sans distance inventée.
   // V0.80 : le MJ peut annoncer les nouveaux engagements dans la même résolution.
   // Les liens qui ne concernent aucun ennemi déplacé sont hors du périmètre.
   const displaced=new Set(o.glissadeEnemies.filter(id=>!resisting.includes(id)));
   const newPairs=o.glissadeNewEngagements||[];
   if(!Array.isArray(newPairs))throw Error('Glissade : nouveaux engagements invalides');
   const newKeys=new Set();
   for(const pair of newPairs){
    if(!Array.isArray(pair)||pair.length!==2||typeof pair[0]!=='string'||typeof pair[1]!=='string'||pair[0]===pair[1])throw Error('Glissade : paire invalide');
    fighter(s,pair[0]);fighter(s,pair[1]);
    if(!displaced.has(pair[0])&&!displaced.has(pair[1]))throw Error('Glissade : paire sans ennemi déplacé');
    const key=engagementKey(pair[0],pair[1]);
    if(newKeys.has(key))throw Error('Glissade : nouvel engagement répété');
    newKeys.add(key);
   }
   const links=new Set();
   for(const pair of s.engagements||[]){
    if(!displaced.has(pair[0])&&!displaced.has(pair[1]))continue;
    const key=engagementKey(pair[0],pair[1]);
    if(links.has(key))continue;
    links.add(key);
    if(newKeys.has(key))continue; // V0.80 : un lien conservé n'est jamais rompu puis recréé.
    events.push(event(s,action,'disengage',pair[1],0,'','Glissade : repositionnement confirmé, engagement rompu'));
    // event() attribue sourceId au lanceur ; mémoriser le premier membre
    // de la paire pour rompre exactement le lien concerné.
    events[events.length-1].sourceId=pair[0];
   }
   // Une proposition d'engagement reste distincte et soumise au MJ.
   for(const pair of newPairs){
    if(links.has(engagementKey(pair[0],pair[1])))continue; // V0.80 : aucune proposition redondante.
    const e=event(s,action,'engage',pair[1],0,'','Glissade : nouvel engagement confirmé par le MJ');
    e.sourceId=pair[0];events.push(e);
   }
 }else if(action.name==='Plaque de givre'){
   if(action.sourceId===t)throw Error('Plaque de givre : choisir un adversaire distinct');
   if(o.iceConfirmed!==true)throw Error('Plaque de givre : confirmer que la cible se tient sur la glace (MJ)');
   events.push(event(s,action,'status_add',t,0,'gene','Plaque de givre : Gêné tant que la cible reste sur la glace (suivi MJ)'));
   events.push(event(s,action,'status_add',action.sourceId,0,'pret','Plaque de givre : Prêt à engager la cible'));
 }else if(action.name==='Fouet d’eau'){
   if(action.sourceId===t)throw Error('Fouet d’eau : adversaire distinct requis');
   if(o.choice!=='fatigue'&&o.choice!=='condition')throw Error('Fouet d’eau : la cible choisit 2 fatigues ou un état');
   if(o.choice==='condition'&&!resourceConditionNames(fighter(s,t)).includes(o.condition))throw Error('Fouet d’eau : état invalide');
   events.push(event(s,action,'fatigue',action.sourceId,1,'','Coût Fouet d’eau (p. 288)'));
   if(o.choice==='fatigue')events.push(event(s,action,'fatigue',t,2,'','Choix de la cible'));
   else events.push(event(s,action,'condition',t,0,o.condition,'Choix de la cible'));
 }else if(action.name==='Aveuglé par la science'){
   // Livre p. 293 : 1 à 3 fatigues investies dans les gadgets.
   // La cible subit toujours 1 fatigue et Gêné ; le deuxième palier
   // ajoute Piégé OU Étourdi, le troisième les deux.
   if(action.sourceId===t)throw Error('Aveuglé par la science : adversaire distinct requis');
   fighter(s,t);
   if(!Number.isInteger(o.scienceFatigue)||o.scienceFatigue<1||o.scienceFatigue>3)throw Error('Aveuglé par la science : choisir 1 à 3 fatigues');
   if(o.scienceFatigue===2&&!['piege','etourdi'].includes(o.scienceExtra))throw Error('Aveuglé par la science : choisir Piégé ou Étourdi');
   events.push(event(s,action,'fatigue',action.sourceId,o.scienceFatigue,'','Aveuglé par la science : coût des gadgets'));
   events.push(event(s,action,'fatigue',t,1,'','Aveuglé par la science : cible'));
   events.push(event(s,action,'status_add',t,0,'gene','Aveuglé par la science : Gêné'));
   if(o.scienceFatigue===2)events.push(event(s,action,'status_add',t,0,o.scienceExtra,'Aveuglé par la science : statut supplémentaire'));
   if(o.scienceFatigue===3){
    events.push(event(s,action,'status_add',t,0,'piege','Aveuglé par la science : Piégé'));
    events.push(event(s,action,'status_add',t,0,'etourdi','Aveuglé par la science : Étourdi'));
   }
 }else if(action.name==='Meilleur, plus rapide, plus fort'){
   // Technologie, p. 293 : le MJ confirme le déplacement sans opposition.
   // Aucune coordonnée ni durée de maintien n'est déduite automatiquement.
   if(o.positionUnopposed!==true)throw Error('Meilleur, plus rapide, plus fort : confirmer le déplacement sans opposition (MJ)');
   if(typeof o.positionDescription!=='string'||!o.positionDescription.trim()||o.positionDescription.trim().length>160)throw Error('Meilleur, plus rapide, plus fort : décrire la position (160 caractères maximum)');
   if(!['none','reinforced','secure'].includes(o.positionBonus))throw Error('Meilleur, plus rapide, plus fort : option supplémentaire invalide');
   events.push(event(s,action,'fatigue',action.sourceId,o.positionBonus==='none'?1:2,'','Meilleur, plus rapide, plus fort : coût du repositionnement'));
   events.push(event(s,action,'note',action.sourceId,0,'','Meilleur, plus rapide, plus fort : position atteinte sans opposition — '+o.positionDescription.trim()+' (MJ : vérifier le maintien)'));
   if(o.positionBonus==='reinforced')events.push(event(s,action,'status_add',action.sourceId,0,'renforce','Meilleur, plus rapide, plus fort : Renforcé tant que la position est tenue (suivi MJ)'));
   if(o.positionBonus==='secure')events.push(event(s,action,'note',action.sourceId,0,'','Meilleur, plus rapide, plus fort : zone dangereuse sécurisée — '+o.positionDescription.trim()+' (suivi MJ)'));
 }else if(action.name==='Puissance maximale'){
   // Technologie p. 293 : 2 fatigues + réserve entière, bonus +2 dès 3 matériels.
   const stored=fighter(s,action.sourceId).materials||0;
   if(action.sourceId===t)throw Error('Puissance maximale : choisir un adversaire');
   fighter(s,t);
   if(fighter(s,action.sourceId).equipmentDisabled)throw Error('Puissance maximale : équipement déjà hors service pour cette scène');
   events.push(event(s,action,'status_add',action.sourceId,0,'gene','Puissance maximale : devient Gêné'));
   events.push(event(s,action,'fatigue',t,2+stored+(stored>=3?2:0),'','Puissance maximale : décharge intégrale'));
   if(stored)events.push(event(s,action,'materials_spend',action.sourceId,stored,'','Puissance maximale : dépense tous les matériels'));
   events.push(event(s,action,'equipment_disable',action.sourceId,0,'','Puissance maximale : plus de gain de matériel avant la fin de la scène'));
 }else if(action.name==='Maintenance'){
   // Technologie p. 293 : payer 1 fatigue, effacer un état coché, réserver 3 matériels.
   if(!resourceConditionNames(fighter(s,action.sourceId)).includes(o.maintenanceCondition))throw Error('Maintenance : choisir un état valide');
   if(!fighter(s,action.sourceId).conditions.includes(o.maintenanceCondition))throw Error('Maintenance : cet état n’est pas coché');
   events.push(event(s,action,'fatigue',action.sourceId,1,'','Maintenance : coût de réparation'));
   events.push(event(s,action,'condition_remove',action.sourceId,0,o.maintenanceCondition,'Maintenance : état effacé'));
   events.push(event(s,action,'materials_add',action.sourceId,3,'','Maintenance : trois matériels réservés'));
 }else if(action.name==='Collecter du matériel'){
   // p. 293 : réserver trois matériels et devenir Prêt.
   events.push(event(s,action,'materials_add',action.sourceId,3,'','Collecter du matériel : trois matériels réservés'));
   events.push(event(s,action,'status_add',action.sourceId,0,'pret','Collecter du matériel : devient Prêt'));
 }else if(action.name==='Pose de pièges'){
   // p. 293 : le prochain adversaire entrant dans la zone subit un état et un décentrage.
   if(typeof o.trapZone!=='string'||!o.trapZone.trim()||o.trapZone.trim().length>120)throw Error('Pose de pièges : décrire la zone (120 caractères maximum)');
   events.push(event(s,action,'fatigue',action.sourceId,1,'','Pose de pièges : coût de préparation'));
   events.push(event(s,action,'arm_trap',action.sourceId,0,o.trapZone.trim(),'Pose de pièges : piège armé dans la zone'));
 }else if(action.name==='Électrochoc'){
   // Règle p. 293 : cible à portée confirmée par le MJ, 1 fatigue.
   if(o.shockInRange!==true)throw Error('Électrochoc : portée à confirmer par le MJ');
   if(!['person','object'].includes(o.shockTargetType))throw Error('Électrochoc : préciser personne ou objet');
   if(o.shockTargetType==='person'&&action.sourceId===t)throw Error('Électrochoc : cible distincte requise');
   if(o.shockTargetType==='object'&&(typeof o.shockObjectName!=='string'||!o.shockObjectName.trim()||o.shockObjectName.trim().length>100))throw Error('Électrochoc : nom de l’objet requis (100 caractères maximum)');
   fighter(s,t);
   if(o.shockTargetType==='person'&&![-1,1].includes(o.shockDirection))throw Error('Électrochoc : direction du décentrage requise');
   if(o.shockTargetType==='person'&&typeof o.shockMetal!=='boolean')throw Error('Électrochoc : confirmer la technologie ou le métal');
   events.push(event(s,action,'fatigue',action.sourceId,1,'','Électrochoc : coût'));
   if(o.shockTargetType==='person'){
    events.push(event(s,action,'balance',t,o.shockDirection,'','Électrochoc : décentrage de la cible'));
    if(o.shockMetal)events.push(event(s,action,'status_add',t,0,'etourdi','Électrochoc : cible technologique ou couverte de métal'));
   }else{
    events.push(event(s,action,'note',action.sourceId,0,'','Électrochoc : '+o.shockObjectName.trim()+' — objet ralenti ou arrêté momentanément (durée arbitrée par le MJ)'));
   }
 }else if(action.name==='Charge'){
   if(action.sourceId===t)throw Error('Charge : cible requise');
   events.push(event(s,action,'fatigue',action.sourceId,1,'','Coût Charge'));
   if(o.choice==='fatigue')events.push(event(s,action,'fatigue',t,2,'','Choix de la cible'));
   else if(o.choice==='condition'&&o.condition)events.push(event(s,action,'condition',t,0,o.condition,'Choix de la cible'));
   else throw Error('Choix requis');
   events.push(event(s,action,'status_add',action.sourceId,0,'avantage','Prochaine passe'));
   if(!isEngaged(s,action.sourceId,t))events.push(event(s,action,'engage',t,0,'','Charge : engagement de la cible distante'));
 }else if(action.name==='Observation rapide'){
   if(!o.answerConfirmed)throw Error('Réponse MJ requise');
   events.push(event(s,action,'status_add',action.sourceId,0,'pret'));
   if(o.shareWithId){if(o.shareWithId===action.sourceId)throw Error('Observation rapide : partager avec un allié distinct');fighter(s,o.shareWithId);events.push(event(s,action,'status_add',o.shareWithId,0,'pret'))}
 }else if(action.name==='Fort comme un chêne'){
   events.push(event(s,action,'status_add',action.sourceId,0,'pret'));
   events.push(event(s,action,'arm_status_guard',action.sourceId));
 }else if(action.name==='Se mettre à l’abri'){
   events.push(event(s,action,'arm_cover',action.sourceId));
 }else if(action.name==='Serrer les dents'){
   events.push(event(s,action,'arm_endure',action.sourceId));
 }else if(action.name==='Trouver la faille'){
   if(t===action.sourceId)throw Error('Trouver la faille : adversaire distinct requis');
   if(o.extraShift&&!o.principleKnown)throw Error('Trouver la faille : principe connu requis pour le second décalage');
   const mark=event(s,action,'arm_weakness',action.sourceId,0,t);
   mark.weaknessDirection=o.direction===-1?-1:1;
   mark.weaknessExtra=!!o.extraShift;
   mark.weaknessPrincipleKnown=!!o.principleKnown;
   events.push(mark);
 }else if(action.name==='Frappe dévastatrice'){
   if(action.sourceId===t)throw Error('Frappe dévastatrice : adversaire distinct requis');
   events.push(event(s,action,'fatigue',action.sourceId,1,'','Coût'));
   if(o.choice==='fatigue')events.push(event(s,action,'fatigue',t,2));
   else if(o.choice==='condition'&&o.condition)events.push(event(s,action,'condition',t,0,o.condition));
   else throw Error('Choix requis');
   events.push(event(s,action,'note',t,0,'','Déplacement forcé ou résistance pour 2 fatigues : arbitrage MJ'));
 }else if(action.name==='Frapper un point faible'){
   if(t===action.sourceId)throw Error('Frapper un point faible : adversaire distinct requis');
   const victim=fighter(s,t);
   if(!victim.statuses.includes('gene'))throw Error('Frapper un point faible : la cible doit être Gênée');
   if(!isEngaged(s,action.sourceId,t))throw Error('Frapper un point faible : la cible doit être engagée (panneau Engagements du MJ)');
   events.push(event(s,action,'fatigue',action.sourceId,1,'','Coût Frapper un point faible'));
   events.push(event(s,action,'fatigue',t,victim.conditions.length,'','Nombre d’états cochés sur la cible (p. 286)'));
 }else if(action.name==='Acharnement'){
   if(t===action.sourceId)throw Error('Acharnement : adversaire distinct requis');
   events.push(event(s,action,'fatigue',action.sourceId,1,'','Coût'));
   if(fighter(s,t).statuses.includes('etourdi'))events.push(event(s,action,'fatigue',t,5));
   else if(fighter(s,t).statuses.includes('gene'))events.push(event(s,action,'status_add',t,0,'etourdi'));
   else events.push(event(s,action,'status_add',t,0,'gene'));
 }else if(action.name==='Armure de terre'){
   // Terre p.289 : réserve de 3 ; les dépenses réactives sont arbitrées par le MJ.
   if(o.earthArmorConfirmed!==true)throw Error('Armure de terre : matériau disponible et activation confirmés par le MJ');
   if((s.temporaryEffects||[]).some(e=>e.originLabel==='Armure de terre'&&e.targetId===action.sourceId&&Number(e.armorPoints)>0))throw Error('Armure de terre : réserve déjà active ; épuiser ou révoquer l’armure avant de la réactiver');
   events.push(event(s,action,'status_add',action.sourceId,0,'avantage','Armure de terre : Avantagé tant que la réserve contient des points'));
   events.push(event(s,action,'note',action.sourceId,0,'','Armure de terre : réserve initiale de 3 points (suivi dans les effets temporaires). Dépenser 1 point pour annuler 1 état OU 2 fatigue infligés. Lors de CHAQUE attaque qui infligerait fatigue ou état, dépenser au moins 1 point. À réserve vide, retirer Avantagé. Aucun coût de fatigue à la création ; ne pas appliquer deux fois les dégâts annulés.'));
 }else if(action.name==='Bouclier de roche'){
   // Terre p.289 : activation et Gêné automatiques ; blocage par passe et consommation du bouclier arbitrés par le MJ.
   if(o.earthShieldConfirmed!==true)throw Error('Bouclier de roche : emplacement fixe et bénéficiaire confirmés par le MJ');
   const protectedId=o.earthShieldProtectedId||action.sourceId;
   fighter(s,protectedId);
   events.push(event(s,action,'fatigue',action.sourceId,1,'','Bouclier de roche : invocation'));
   events.push(event(s,action,'status_add',protectedId,0,'gene','Bouclier de roche : déplacements limités du personnage protégé'));
   events.push(event(s,action,'note',protectedId,0,'','Bouclier de roche : emplacement fixe ; bloque la première attaque de CHAQUE passe contre le personnage protégé. Le MJ suit le blocage, la révocation et le retrait de Gêné. Si le matériau sert à une technique de Terre, réduire son coût de 1 fatigue et faire disparaître le bouclier (arbitrage MJ).'));
 }else if(action.name==='Détection du pas lourd'){
   // Terre p.289 : sens sismique obligatoire ; interruption ultérieure sous arbitrage MJ.
   if(o.earthSeismicConfirmed!==true)throw Error('Détection du pas lourd : sens sismique et situation confirmés par le MJ');
   events.push(event(s,action,'status_add',action.sourceId,0,'pret','Détection du pas lourd : devient Prêt'));
   events.push(event(s,action,'note',action.sourceId,0,'','Détection du pas lourd : durant cette passe, peut effacer Prêt et cocher 1 fatigue pour interrompre une technique ennemie ; adversaire choisit 3 fatigues ou annulation. Résolution manuelle MJ, aucune interruption automatique.'));
 }else if(action.name==='Étoile de lave'){
   // Terre p.289 : activation persistante, entretien et extinction pilotés par le MJ.
   if(o.earthLavaConfirmed!==true)throw Error('Étoile de lave : maîtrise de la lave et étoile active confirmées par le MJ');
   events.push(event(s,action,'fatigue',action.sourceId,1,'','Étoile de lave : coût initial'));
   events.push(event(s,action,'status_add',action.sourceId,0,'avantage','Étoile de lave : Avantagé tant que l’étoile est active (suivi MJ)'));
   events.push(event(s,action,'note',action.sourceId,0,'','Étoile de lave : trancher ou détruire le décor lors des attaques comme Fracasser sans coût additionnel ; payer 1 fatigue en fin de chaque passe pour maintenir l’étoile. Entretien et extinction disponibles dans les effets temporaires (validation MJ).'));
 }else if(action.name==='Boue gluante'){
   // Terre p.289 : les ennemis engagés ayant ciblé le lanceur durant cette passe deviennent Gênés.
   // L'historique des attaques ne couvre pas tous les cas narratifs : liste exhaustive confirmée par le MJ.
   if(o.earthMudConfirmed!==true)throw Error('Boue gluante : confirmer les assaillants et engagements (MJ)');
   const attackers=o.earthMudAttackers;
   if(!Array.isArray(attackers)||new Set(attackers).size!==attackers.length||attackers.includes(action.sourceId))throw Error('Boue gluante : liste des assaillants invalide');
   for(const id of attackers){
    fighter(s,id);
    if(!isEngaged(s,action.sourceId,id))throw Error('Boue gluante : assaillant non engagé');
    events.push(event(s,action,'status_add',id,0,'gene','Boue gluante : assaillant enlisé'));
   }
   events.push(event(s,action,'note',action.sourceId,0,'','Boue gluante : à la prochaine passe, Frapper chaque adversaire enlisé en plus des techniques normales, quelle que soit l’approche (suivi et résolution MJ)'));
 }else if(action.name==='Entraves de métal'){
   // Terre p.289 : gêne persistante, retirée uniquement par maîtrise du métal ou fin du combat.
   if(t===action.sourceId)throw Error('Entraves de métal : adversaire distinct requis');
   if(o.earthMetalConfirmed!==true)throw Error('Entraves de métal : le MJ doit confirmer la maîtrise du métal et la cible');
   fighter(s,t);
   events.push(event(s,action,'status_add',t,0,'gene','Entraves de métal : cible Gênée (levée seulement par maîtrise du métal ou fin du combat)'));
   if(isEngaged(s,action.sourceId,t))events.push(event(s,action,'status_add',action.sourceId,0,'avantage','Entraves de métal : Avantagé tant que cible Gênée et engagée (suivi MJ)'));
   events.push(event(s,action,'note',action.sourceId,0,'','Entraves de métal : MJ, surveiller la durée du statut Gêné et retirer Avantagé dès que engagement ou gêne cesse ; ne pas effacer Gêné par une guérison ordinaire'));
 }else if(action.name==='Escalier de poussière'){
   // Terre p.289 : position haute, Avantagé et Prêt ; adversaire engagé peut payer 2 fatigue pour annuler.
   if(o.earthStairsConfirmed!==true)throw Error('Escalier de poussière : le MJ doit confirmer la position surélevée');
   if(o.earthStairsBlocker){
    if(o.earthStairsBlocker===action.sourceId||!isEngaged(s,action.sourceId,o.earthStairsBlocker))throw Error('Escalier de poussière : bloqueur engagé distinct requis');
    fighter(s,o.earthStairsBlocker);
    events.push(event(s,action,'fatigue',o.earthStairsBlocker,2,'','Escalier de poussière : adversaire engagé annule les statuts (2 fatigues)'));
   }else{
    events.push(event(s,action,'status_add',action.sourceId,0,'avantage','Escalier de poussière : Avantagé'));
    events.push(event(s,action,'status_add',action.sourceId,0,'pret','Escalier de poussière : Prêt'));
   }
   events.push(event(s,action,'note',action.sourceId,0,'','Escalier de poussière : position surélevée et maintien narratifs, MJ confirme le placement'));
 }else if(action.name==='Enfouissement'){
   if(t===action.sourceId)throw Error('Enfouissement : adversaire distinct requis');
   events.push(event(s,action,'fatigue',action.sourceId,2,'','Enfouissement : coût'));
   events.push(event(s,action,'status_add',t,0,'piege','Enfouissement : cible Piégée'));
 }else if(action.name==='Jet de flammes'){
   if(t===action.sourceId)throw Error('Jet de flammes : adversaire distinct requis');
   const cost=Number(o.fireCost);
   if(![1,3,5].includes(cost))throw Error('Jet de flammes : choisir 1, 3 ou 5 fatigues');
   events.push(event(s,action,'fatigue',action.sourceId,cost,'','Jet de flammes : coût'));
   if(cost>=5)events.push(event(s,action,'status_add',t,0,'piege','Jet de flammes : Piégé'));
   if(cost>=3)events.push(event(s,action,'status_add',t,0,'en_danger','Jet de flammes : En danger'));
   events.push(event(s,action,'status_add',t,0,'gene','Jet de flammes : Gêné'));
 }else if(action.name==='Gantelet de terre'){
   if(t===action.sourceId)throw Error('Gantelet de terre : adversaire distinct requis');
   if(!['fatigue','condition'].includes(o.choice))throw Error('Gantelet de terre : choix de la cible requis');
   events.push(event(s,action,'fatigue',action.sourceId,1,'','Gantelet de terre : coût'));
   if(o.choice==='fatigue')events.push(event(s,action,'fatigue',t,2,'','Gantelet de terre : cible'));
   else {
    if(!resourceConditionNames(fighter(s,t)).includes(o.condition))throw Error('Gantelet de terre : état invalide');
    events.push(event(s,action,'condition',t,0,o.condition,'Gantelet de terre : cible'));
   }
   // V1.81 : option de projection avec choix explicite de résistance par la cible.
   // La résistance coûte 1 fatigue supplémentaire et empêche le désengagement.
   const projection=o.earthGauntletProjection===undefined?'none':o.earthGauntletProjection;
   if(!['none','project','resist'].includes(projection))throw Error('Gantelet de terre : décision de projection invalide');
   if(projection==='none')events.push(event(s,action,'note',t,0,'','Gantelet de terre : aucune projection choisie par le MJ'));
   if(projection!=='none'){
    if(!isEngaged(s,action.sourceId,t))throw Error('Gantelet de terre : projection réservée à un adversaire engagé');
    if(projection==='resist'){
     events.push(event(s,action,'fatigue',t,1,'','Gantelet de terre : résistance au choc'));
     events.push(event(s,action,'note',t,0,'','Gantelet de terre : la cible résiste à la projection, engagement conservé'));
    }else{
     events.push(event(s,action,'disengage',t,0,'','Gantelet de terre : projection de la cible, désengagement'));
     events.push(event(s,action,'note',t,0,'','Gantelet de terre : cible projetée au loin'));
    }
   }
 }else if(action.name==='Disque de feu'){
   if(t===action.sourceId)throw Error('Disque de feu : adversaire distinct requis');
   if(!['conditions','esquive'].includes(o.fireChoice))throw Error('Disque de feu : choix de la cible requis');
   events.push(event(s,action,'fatigue',action.sourceId,1,'','Disque de feu : coût'));
   if(o.fireChoice==='esquive'){
    events.push(event(s,action,'fatigue',t,1,'','Disque de feu : esquive'));
    events.push(event(s,action,'note',t,0,'','Disque de feu : incendie environnant et statuts éventuels à arbitrer par le MJ'));
   }else{
    const selected=o.fireConditions;
    if(!Array.isArray(selected)||selected.length!==2||new Set(selected).size!==2||selected.some(c=>!resourceConditionNames(fighter(s,t)).includes(c)))throw Error('Disque de feu : choisir deux états distincts');
    for(const c of selected)events.push(event(s,action,'condition',t,0,c,'Disque de feu : deux états'));
   }
 }else if(action.name==='Cône d’air'){
   if(t===action.sourceId)throw Error('Cône d’air : cible distincte requise');
   fighter(s,t);
   if(o.airConeInRange!==true)throw Error('Cône d’air : confirmer la portée et les alliés participants (MJ)');
   const allies=o.airConeAllies;
   if(!Array.isArray(allies)||!allies.length||new Set(allies).size!==allies.length)throw Error('Cône d’air : sélectionner au moins un allié distinct');
   for(const id of allies){if(id===action.sourceId||id===t)throw Error('Cône d’air : allié invalide');fighter(s,id)}
   events.push(event(s,action,'fatigue',action.sourceId,1,'','Cône d’air : coût'));
   for(const id of allies)events.push(event(s,action,'fatigue',id,1,'','Cône d’air : participation alliée'));
   events.push(event(s,action,'fatigue',t,2*allies.length,'','Cône d’air : projectiles'));
 }else if(action.name==='Onde de choc'){
   if(o.airShockZoneConfirmed!==true)throw Error('Onde de choc : confirmer tous les personnages présents dans la zone (MJ)');
   const affected=o.airShockTargets, resisting=o.airShockResisting||[];
   if(!Array.isArray(affected)||!affected.length||new Set(affected).size!==affected.length||affected.includes(action.sourceId))throw Error('Onde de choc : sélectionner tous les autres personnages de la zone');
   if(!Array.isArray(resisting)||new Set(resisting).size!==resisting.length||resisting.some(id=>!affected.includes(id)))throw Error('Onde de choc : résistances invalides');
   for(const id of affected)fighter(s,id);
   events.push(event(s,action,'fatigue',action.sourceId,2,'','Onde de choc : coût'));
   for(const id of affected){
    if(resisting.includes(id))events.push(event(s,action,'fatigue',id,4,'','Onde de choc : résistance'));
    else events.push(event(s,action,'status_add',id,0,'etourdi','Onde de choc : Étourdi'));
    // Les engagements sont rompus entre tous les personnages touchés, y compris avec le lanceur.
    // Émettre chaque paire une seule fois et conserver ses deux véritables extrémités.
    for(const pair of (s.engagements||[]).filter(pair=>pair.includes(id))){
     const other=pair[0]===id?pair[1]:pair[0];
     if(affected.includes(other)&&affected.indexOf(other)<affected.indexOf(id))continue;
     const e=event(s,action,'disengage',other,0,'','Onde de choc : désengagement');
     e.sourceId=id;events.push(e);
    }
    events.push(event(s,action,'note',id,0,'','Onde de choc : repoussé en arrière ; placement à arbitrer par le MJ'));
   }
 }else if(action.name==='À contretemps'){
   if(o.countertimeConfirmed!==true)throw Error('À contretemps : engagement et choix de l’adversaire confirmés par le MJ');
   if(action.sourceId===t||!isEngaged(s,action.sourceId,t))throw Error('À contretemps : adversaire engagé distinct requis');
   events.push(event(s,action,'fatigue',action.sourceId,1,'','À contretemps : coût de 1 fatigue'));
   events.push(event(s,action,'status_add',action.sourceId,0,'pret','À contretemps : devient Prêt'));
   events.push(event(s,action,'note',action.sourceId,0,'','À contretemps : révélation anticipée à la prochaine passe (MJ)'));
 }else if(action.name==='Contre-attaque'){
   // Armes p. 292 : Frapper renforcé, sans coût de fatigue supplémentaire.
   if(t===action.sourceId)throw Error('Contre-attaque : adversaire distinct requis');
   if(!isEngaged(s,action.sourceId,t))throw Error('Contre-attaque : adversaire engagé requis');
   if(fighter(s,t).approach!=='attaquer')throw Error('Contre-attaque : la cible doit avoir choisi Avancer et attaquer');
   const actor=fighter(s,action.sourceId);
   if([...(actor.activeStatuses||[]),...(actor.statuses||[])].some(x=>['en_danger','gene','piege','etourdi'].includes(x))||actor.conditions.length)throw Error('Contre-attaque : impossible avec un statut négatif ou un état coché');
   if(o.weaponCounterConfirmed!==true)throw Error('Contre-attaque : confirmation MJ de l’approche et de l’engagement requise');
   if(o.choice==='fatigue')events.push(event(s,action,'fatigue',t,2,'','Contre-attaque : Frapper renforcé, 2 fatigues imposées'));
   else if(o.choice==='condition'&&resourceConditionNames(fighter(s,t)).includes(o.condition))events.push(event(s,action,'condition',t,0,o.condition,'Contre-attaque : Frapper renforcé, état imposé'));
   else throw Error('Contre-attaque : imposer 2 fatigues ou un état, jamais un décalage');
 }else if(action.name==='Désarmement'){
   if(t===action.sourceId)throw Error('Désarmement : adversaire distinct requis');
   if(o.weaponDisarmConfirmed!==true)throw Error('Désarmement : le MJ doit confirmer la technique avancée possédée par la cible');
   const entry=DISARMABLE_TECHNIQUES.includes(o.weaponDisarmTechnique)?{nom:o.weaponDisarmTechnique}:null;
   if(!entry)throw Error('Désarmement : technique avancée Avancer et attaquer invalide');
   if(!(fighter(s,t).techniques||[]).some(x=>x.name===entry.nom))throw Error('Désarmement : la cible ne possède pas cette technique');
   if((fighter(s,t).bonuses||[]).some(b=>b.type==='disarmed_technique'&&b.name===entry.nom&&b.scene===(s.scene||1)))throw Error('Désarmement : technique déjà interdite');
   events.push(event(s,action,'fatigue',action.sourceId,2,'','Désarmement : coût de 2 fatigues'));
   events.push(event(s,action,'disarm_technique',t,0,entry.nom,'Désarmement : technique interdite pour la rencontre'));
 }else if(action.name==='Feinte'){
   // Armes p.292 : les assaillants de la passe sont confirmés par le MJ.
   if(o.weaponFeintConfirmed!==true)throw Error('Feinte : le MJ doit confirmer les attaques reçues durant cette passe');
   if(!Array.isArray(o.weaponFeintAttackers)||!o.weaponFeintAttackers.length)throw Error('Feinte : au moins un assaillant requis');
   if(!o.weaponFeintConditions||typeof o.weaponFeintConditions!=='object')throw Error('Feinte : choisir un état par assaillant');
   const unique=[...new Set(o.weaponFeintAttackers)];
   if(unique.length!==o.weaponFeintAttackers.length)throw Error('Feinte : assaillants en double');
   for(const id of unique){
    if(id===action.sourceId)throw Error('Feinte : le lanceur ne peut pas être son propre assaillant');
    fighter(s,id);
    if(!resourceConditionNames(fighter(s,id)).includes(o.weaponFeintConditions[id]))throw Error('Feinte : état invalide pour un assaillant');
   }
   events.push(event(s,action,'fatigue',action.sourceId,1,'','Feinte : coût'));
   for(const id of unique)events.push(event(s,action,'condition',id,0,o.weaponFeintConditions[id],'Feinte : état infligé à un assaillant'));
 }else if(action.name==='Estocade précise'){
   if(t===action.sourceId)throw Error('Estocade précise : adversaire distinct requis');
   fighter(s,t);
   if(o.weaponPiercingConfirmed!==true)throw Error('Estocade précise : le MJ doit confirmer une arme perforante ou d’estoc');
   if(o.weaponMoveExtra!==true&&o.weaponMoveExtra!==false)throw Error('Estocade précise : préciser le choix de déplacement');
   events.push(event(s,action,'fatigue',action.sourceId,1,'','Estocade précise : coût initial'));
   events.push(event(s,action,'fatigue',t,2,'','Estocade précise : impact'));
   events.push(event(s,action,'status_add',t,0,'gene','Estocade précise : cible Gênée'));
   if(o.weaponMoveExtra){
    if(o.weaponMoveConfirmed!==true)throw Error('Estocade précise : confirmer une position à portée avec le MJ');
    events.push(event(s,action,'fatigue',action.sourceId,1,'','Estocade précise : coût du déplacement tenté'));
    if(o.weaponMoveBlocked){
     if(!o.weaponBlockerId||o.weaponBlockerId===action.sourceId||!(s.engagements||[]).some(pair=>pair.includes(action.sourceId)&&pair.includes(o.weaponBlockerId)))throw Error('Estocade précise : le bloqueur doit être engagé avec le lanceur');
     fighter(s,o.weaponBlockerId);
     events.push(event(s,action,'fatigue',o.weaponBlockerId,1,'','Estocade précise : blocage du déplacement'));
     events.push(event(s,action,'note',action.sourceId,0,'','Estocade précise : déplacement bloqué ; arbitrage du MJ'));
    }else events.push(event(s,action,'note',action.sourceId,0,'','Estocade précise : déplacement vers une nouvelle position à portée, à reporter par le MJ'));
   }
 }else if(action.name==='Clouer une mouche contre un tronc d’arbre'){
   if(t===action.sourceId)throw Error('Clouer une mouche contre un tronc d’arbre : adversaire distinct requis');
   fighter(s,t);
   if(o.weaponArrowsConfirmed!==true)throw Error('Clouer une mouche contre un tronc d’arbre : confirmer le tir de flèches avec le MJ');
   if(![1,3].includes(o.weaponArrowCost))throw Error('Clouer une mouche contre un tronc d’arbre : coût de 1 ou 3 fatigues requis');
   events.push(event(s,action,'fatigue',action.sourceId,o.weaponArrowCost,'','Clouer une mouche contre un tronc d’arbre : coût'));
   events.push(event(s,action,'status_add',t,0,'gene','Clouer une mouche contre un tronc d’arbre : Gêné'));
   if(o.weaponArrowCost===3)events.push(event(s,action,'status_add',t,0,'piege','Clouer une mouche contre un tronc d’arbre : Piégé'));
 }else if(action.name==='Position surélevée'){
   if(o.weaponHighGroundConfirmed!==true)throw Error('Position surélevée : confirmer une position surélevée avec le MJ');
   events.push(event(s,action,'fatigue',action.sourceId,1,'','Position surélevée : coût'));
   events.push(event(s,action,'status_add',action.sourceId,0,'avantage','Position surélevée : Avantagé'));
   events.push(event(s,action,'note',action.sourceId,0,'','Position surélevée : ignorer douleur et statuts négatifs infligés par les attaques ciblant le lanceur durant cette passe ; application et fin à arbitrer par le MJ'));
 }else if(action.name==='Souple comme un roseau'){
   // Annexe A p.291 : pari secret sur l'approche de la prochaine passe.
   // Le résultat et le changement éventuel d'approche nécessitent l'arbitrage du MJ.
   if(action.sourceId===action.targetId)throw Error('Souple comme un roseau : adversaire distinct requis');
   if(!APPROACHES.includes(o.airReedPrediction))throw Error('Souple comme un roseau : choisir une approche valide');
   if(o.airReedConfirmed!==true)throw Error('Souple comme un roseau : confirmation du MJ requise');
   events.push(event(s,action,'fatigue',action.sourceId,2,'','Souple comme un roseau : coût de 2 fatigues'));
   events.push(event(s,action,'note',action.sourceId,0,'','Souple comme un roseau : pari enregistré pour la prochaine passe, révélation et résolution par le MJ'));
 }else if(action.name==='Amortir le poing rageur'){
   // Annexe A p.291 : la nature physique et vigoureuse de l'attaque est décidée par le MJ.
   if(o.airCushionArmorConfirmed!==true)throw Error('Amortir le poing rageur : confirmer la protection avec le MJ');
   events.push(event(s,action,'fatigue',action.sourceId,2,'','Amortir le poing rageur : cocher 2 fatigue'));
   events.push(event(s,action,'status_add',action.sourceId,0,'avantage','Amortir le poing rageur : Avantagé'));
   events.push(event(s,action,'note',action.sourceId,0,'','Amortir le poing rageur : immunité aux attaques physiques puissantes, vigoureuses et projections jusqu’à la fin de la prochaine passe ; identification des attaques et expiration à arbitrer par le MJ'));
 }else if(action.name==='Oscillations du vent'){
   if(o.airOscConfirmed!==true)throw Error('Oscillations du vent : confirmer les approches ennemies avec le MJ');
   const enemies=(s.engagements||[]).filter(pair=>pair.includes(action.sourceId)).map(pair=>pair[0]===action.sourceId?pair[1]:pair[0]);
   const attackers=enemies.filter(id=>fighter(s,id).approach==='attaquer');
   if(!attackers.length)throw Error('Oscillations du vent : aucun ennemi engagé ayant choisi Avancer et attaquer');
   events.push(event(s,action,'fatigue',action.sourceId,-attackers.length,'','Oscillations du vent : effacer 1 fatigue par ennemi admissible'));
   events.push(event(s,action,'wind_credit',action.sourceId,attackers.length,'','Oscillations du vent : points réservés pour la prochaine passe'));
 }else if(action.name==='Vague d’air'){
   if(o.airWaveConfirmed!==true)throw Error('Vague d’air : confirmer les circonstances avec le MJ');
   if(o.airWaveMode==='block'){
    events.push(event(s,action,'fatigue',action.sourceId,1,'','Vague d’air : coût de la parade'));
    events.push(event(s,action,'note',action.sourceId,0,'','Vague d’air : bloquer ou dévier une attaque ennemie ; attaque et portée confirmées par le MJ'));
   }else if(o.airWaveMode==='blast'){
    const targets=o.airWaveTargets;
    if(!Array.isArray(targets)||targets.length<1||targets.length>3||new Set(targets).size!==targets.length||targets.includes(action.sourceId))throw Error('Vague d’air : sélectionner 1 à 3 ennemis distincts');
    for(const id of targets){fighter(s,id);events.push(event(s,action,'fatigue',id,2,'','Vague d’air : rafale de fin de passe'))}
    events.push(event(s,action,'note',action.sourceId,0,'','Vague d’air : rafale uniquement en fin de passe et sans attaque ennemie ; MJ confirme les conditions'));
   }else throw Error('Vague d’air : mode invalide');
 }else if(action.name==='Sphère d’air'){
   if(o.airSphereConfirmed!==true)throw Error('Sphère d’air : confirmer que la sphère est maintenue');
   events.push(event(s,action,'status_add',action.sourceId,0,'avantage','Sphère d’air : Avantagé sur la sphère'));
   events.push(event(s,action,'note',action.sourceId,0,'','Sphère d’air : protection conditionnelle ; le MJ peut sacrifier la sphère pour éviter fatigue ou état d’une attaque, retirer alors Avantagé manuellement'));
 }else if(action.name==='Coussin d’air'){
   // Annexe A p.291 : une attaque subie pendant cette passe et un allié à portée,
   // tous deux confirmés par le MJ ; aucun placement fictif n'est inféré.
   if(t===action.sourceId)throw Error('Coussin d’air : choisir un allié distinct');
   const ally=fighter(s,t);
   if(o.airCushionConfirmed!==true)throw Error('Coussin d’air : confirmer attaque subie et portée de l’allié');
   const choice=o.airCushionChoice;
   if(!['fatigue','condition','status'].includes(choice))throw Error('Coussin d’air : choisir un effet à effacer');
   if(choice==='fatigue'&&ally.fatigue<1)throw Error('Coussin d’air : aucune fatigue à effacer');
   if(choice==='condition'&&!ally.conditions.includes(o.airCushionCondition))throw Error('Coussin d’air : état non coché');
   if(choice==='status'&&!ally.statuses.includes(o.airCushionStatus))throw Error('Coussin d’air : statut absent');
   events.push(event(s,action,'fatigue',action.sourceId,1,'','Coussin d’air : coût'));
   if(choice==='fatigue')events.push(event(s,action,'fatigue',t,-Math.min(2,ally.fatigue),'','Coussin d’air : fatigue effacée'));
   if(choice==='condition')events.push(event(s,action,'condition_remove',t,0,o.airCushionCondition,'Coussin d’air : état effacé'));
   if(choice==='status')events.push(event(s,action,'status_remove',t,0,o.airCushionStatus,'Coussin d’air : statut effacé'));
 }else if(action.name==='Boulet de canon'){
   // Annexe A p.291 : cible non engagée avec le lanceur, coût 1 fatigue,
   // rupture des engagements précédents, engagement de la cible et 1 état.
   if(t===action.sourceId)throw Error('Boulet de canon : adversaire distinct requis');
   fighter(s,t);
   if(isEngaged(s,action.sourceId,t))throw Error('Boulet de canon : cible déjà engagée avec le lanceur');
   if(!resourceConditionNames(fighter(s,t)).includes(o.condition))throw Error('Boulet de canon : choisir un état valide');
   events.push(event(s,action,'fatigue',action.sourceId,1,'','Boulet de canon : coût'));
   for(const pair of (s.engagements||[]).filter(pair=>pair.includes(action.sourceId))){
    const other=pair[0]===action.sourceId?pair[1]:pair[0];
    events.push(event(s,action,'disengage',other,0,'','Boulet de canon : ancien engagement rompu'));
   }
   events.push(event(s,action,'engage',t,0,'','Boulet de canon : nouvel engagement'));
   events.push(event(s,action,'condition',t,0,o.condition,'Boulet de canon : état infligé'));
 }else if(action.name==='Aspiration'){
   // Annexe A p.291 : objet narratif ; résistance volontaire de 2 fatigues.
   const objectName=String(o.airObject||'').trim();
   if(!objectName||objectName.length>120)throw Error('Aspiration : préciser le petit objet');
   if(!['none','resist'].includes(o.airResistance))throw Error('Aspiration : préciser si un personnage résiste');
   if(o.airResistance==='resist'){
    if(t===action.sourceId)throw Error('Aspiration : personnage résistant distinct requis');
    fighter(s,t);
    events.push(event(s,action,'fatigue',t,2,'','Aspiration : résistance de l’objet '+objectName));
    events.push(event(s,action,'note',t,0,'','Aspiration : '+objectName+' retenu ou bloqué par le personnage résistant (MJ)'));
   }else{
    events.push(event(s,action,'note',action.sourceId,0,'','Aspiration : '+objectName+' arrive entre les mains du lanceur (MJ)'));
   }
 }else if(action.name==='Vélocité du vent'){
   // La sortie de scène n'est pas automatique : opposition éventuelle en fin de passe.
   events.push(event(s,action,'fatigue',action.sourceId,1,'','Vélocité du vent : coût'));
   const links=(s.engagements||[]).filter(pair=>pair.includes(action.sourceId));
   for(const pair of links){
    const other=pair[0]===action.sourceId?pair[1]:pair[0];
    events.push(event(s,action,'disengage',other,0,'','Vélocité du vent : désengagement'));
   }
   events.push(event(s,action,'note',action.sourceId,0,'','Vélocité du vent : retraite vers la sortie ; quitter la scène seulement si aucun adversaire ne réengage ou bloque avant la fin de la passe (MJ)'));
 }else if(action.name==='Tourbillon miniature'){
   // Annexe A p.291 : 3 fatigues, cible Gênée et Étourdie.
   if(t===action.sourceId)throw Error('Tourbillon miniature : adversaire distinct requis');
   fighter(s,t);
   events.push(event(s,action,'fatigue',action.sourceId,3,'','Tourbillon miniature : coût'));
   events.push(event(s,action,'status_add',t,0,'gene','Tourbillon miniature : Gêné'));
   events.push(event(s,action,'status_add',t,0,'etourdi','Tourbillon miniature : Étourdi'));
 }else if(action.name==='Souffle du vent'){
   // Annexe A p.291 : la cible évite Étourdi en cochant 4 fatigues.
   if(t===action.sourceId)throw Error('Souffle du vent : adversaire distinct requis');
   fighter(s,t);
   if(!['fatigue','etourdi'].includes(o.windChoice))throw Error('Souffle du vent : choix de la cible requis');
   if(o.windChoice==='fatigue')events.push(event(s,action,'fatigue',t,4,'','Souffle du vent : résistance de la cible'));
   else events.push(event(s,action,'status_add',t,0,'etourdi','Souffle du vent : cible Étourdie'));
   events.push(event(s,action,'note',t,0,'','Souffle du vent : renversement de la cible, position à arbitrer par le MJ'));
 }else if(action.name==='Mouvements tectoniques'){
   // Le MJ désigne explicitement les adversaires concernés, sans inférer une zone.
   if(!Array.isArray(o.tectonicTargets)||!o.tectonicTargets.length||new Set(o.tectonicTargets).size!==o.tectonicTargets.length)throw Error('Mouvements tectoniques : désigner des adversaires distincts');
   if(o.tectonicZone)events.push(event(s,action,'fatigue',action.sourceId,1,'','Mouvements tectoniques : zone ciblée'));
   else if(o.tectonicTargets.length!==1)throw Error('Mouvements tectoniques : une cible unique hors zone');
   for(const id of o.tectonicTargets){
    if(id===action.sourceId)throw Error('Mouvements tectoniques : le lanceur ne peut être ciblé');
    const victim=fighter(s,id);
    if([...(victim.statuses||[]),...(victim.activeStatuses||[])].includes('gene'))events.push(event(s,action,'status_add',id,0,'etourdi','Mouvements tectoniques : déjà Gêné'));
    else events.push({...event(s,action,'status_round',id,0,'gene','Mouvements tectoniques : Gêné pendant la prochaine passe'),expiresAfterRound:s.round+1});
   }
 }else if(action.name==='Mords la poussière'){
   // Annexe A p.289 : gêne immédiate et interdiction de défendre à la passe suivante.
   if(t===action.sourceId)throw Error('Mords la poussière : adversaire distinct requis');
   events.push(event(s,action,'status_add',t,0,'gene','Mords la poussière : cible Gênée'));
   events.push(event(s,action,'block_next',t,0,'defendre','Mords la poussière : prochaine passe'));
 }else if(action.name==='Arc de foudre'){
   // Annexe A p.290 : ennemi engagé qui a attaqué pendant cette passe.
   if(t===action.sourceId||!isEngaged(s,action.sourceId,t))throw Error('Arc de foudre : adversaire engagé distinct requis');
   if(!s.actions.some(a=>a.sourceId===t&&a.round===s.round&&a.approach==='attaquer'))throw Error('Arc de foudre : la cible doit avoir utilisé une technique Avancer et attaquer durant cette passe');
   const victim=fighter(s,t);
   if(!resourceConditionNames(fighter(s,t)).includes(o.condition)||victim.conditions.includes(o.condition))throw Error('Arc de foudre : choisir un état libre pour la cible');
   events.push(event(s,action,'fatigue',action.sourceId,1,'','Arc de foudre : coût'));
   events.push(event(s,action,'condition',t,0,o.condition,'Arc de foudre : état'));
   if(victim.conditions.length>=2)events.push(event(s,action,'status_add',t,0,'etourdi','Arc de foudre : déjà deux états'));
 }else if(action.name==='Colonne de pierre'){
   // Annexe A, p. 289 : progression Gêné → Piégé → En danger.
   // Évaluer l'état de la cible à la déclaration ; le MJ valide l'effet.
   if(t===action.sourceId)throw Error('Colonne de pierre : choisir un adversaire distinct');
   const victim=fighter(s,t);
   const present=[...(victim.statuses||[]),...(victim.activeStatuses||[])];
   const nextStatus=present.includes('piege')?'en_danger':present.includes('gene')?'piege':'gene';
   events.push(event(s,action,'status_add',t,0,nextStatus,'Colonne de pierre : progression selon le statut initial'));
 }else if(action.name==='Projection tellurique'){
   // Annexe A, p. 289 : coût et statut explicites. Le désengagement aérien
   // dépend des adversaires capables de suivre : décision narrative du MJ.
   events.push(event(s,action,'fatigue',action.sourceId,1,'','Projection tellurique : coût'));
   events.push(event(s,action,'status_add',action.sourceId,0,'avantage','Projection tellurique : devient Avantagé'));
   // La sélection est une décision explicite du MJ : aucune aptitude de vol n'est inférée.
   const unable=o.earthAirUnableTargets===undefined?[]:o.earthAirUnableTargets;
   if(!Array.isArray(unable)||new Set(unable).size!==unable.length)throw Error('Projection tellurique : sélectionner explicitement les adversaires incapables de suivre');
   for(const id of unable){
    if(id===action.sourceId||!s.fighters.some(f=>f.id===id)||!isEngaged(s,action.sourceId,id))throw Error('Projection tellurique : adversaire non engagé ou invalide');
    events.push(event(s,action,'disengage',id,0,'','Projection tellurique : adversaire incapable de suivre dans les airs (MJ)'));
   }
   events.push(event(s,action,'note',action.sourceId,0,'','Projection tellurique : retour au milieu de l’affrontement à la fin de la passe (MJ)'));
 }else if(action.name==='Dérobade'){
   if(!o.condition||!fighter(s,action.sourceId).conditions.includes(o.condition))throw Error('Dérobade : choisir un état actuellement coché');
   events.push(event(s,action,'fatigue',action.sourceId,1,'','Coût'));
   events.push(event(s,action,'condition_remove',action.sourceId,0,o.condition));
   events.push(event(s,action,'status_add',action.sourceId,0,'avantage'));
 }else{
   events.push(event(s,action,'note',t,0,action.name,'Technique à arbitrer par le MJ : aucun effet automatique'));
 }
 // Oscillations du vent : points réservés utilisables uniquement pendant
 // Avancer et attaquer à la passe immédiatement suivante, pour les coûts propres.
 const windSpend=Number(o.windSpend||0);
 if(!Number.isInteger(windSpend)||windSpend<0)throw Error('Oscillations du vent : nombre de points invalide');
 if(windSpend){
  const f=fighter(s,action.sourceId),reserve=f.windReserve;
  if(action.approach!=='attaquer'||!reserve||reserve.usableRound!==s.round||windSpend>reserve.points)throw Error('Oscillations du vent : points non disponibles pour cette approche');
  const own=events.filter(e=>e.kind==='fatigue'&&e.targetId===action.sourceId&&e.amount>0);
  if(windSpend>own.reduce((n,e)=>n+e.amount,0))throw Error('Oscillations du vent : dépense supérieure au coût');
  let left=windSpend;
  for(const e of own){const n=Math.min(left,e.amount);e.amount-=n;left-=n;}
  events.push(event(s,action,'wind_spend',action.sourceId,windSpend,'','Oscillations du vent : points dépensés à la place de fatigue'));
 }
 // V0.95 : la Technologie peut substituer un matériel à une fatigue personnelle.
 // Une substitution est un effet unique (et non deux décisions MJ indépendantes).
 const spend=o.materialsInsteadOfFatigue??0;
 if(!Number.isInteger(spend)||spend<0)throw Error('Substitution : quantité de matériels invalide');
 const technology=!!o.catalogEntry&&o.catalogEntry.famille==='technologie';
 const basicTech=!!o.catalogEntry&&o.catalogEntry.famille==='base'&&o.technologyBasicConfirmed===true;
 if(spend&&!(technology||basicTech))throw Error('Substitution réservée aux techniques technologiques ou de base utilisant la Technologie');
 const ownFatigue=events.filter(e=>e.kind==='fatigue'&&e.targetId===action.sourceId&&e.amount>0);
 const total=ownFatigue.reduce((n,e)=>n+e.amount,0);
 if(spend>total)throw Error('Substitution : plus de matériels que de fatigue à payer');
 if(spend>(fighter(s,action.sourceId).materials||0))throw Error('Substitution : réserve de matériels insuffisante');
 let remaining=spend;
 for(const e of ownFatigue){
  const n=Math.min(remaining,e.amount);
  if(!n)continue;
  e.amount-=n;
  events.push(event(s,action,'materials_spend',action.sourceId,n,'','Matériels dépensés à la place de fatigue : '+e.reason));
  remaining-=n;
 }
 const finalEvents=events.filter(e=>e.kind!=='fatigue'||e.amount!==0);
 s.proposals.push(...finalEvents);
 return finalEvents;
}
function manual(s,sourceId,targetId,kind,amount=0,detail='',reason='Arbitrage MJ'){
 const source=fighter(s,sourceId);fighter(s,targetId);
 if(!APPROACHES.includes(s.phase)||source.approach!==s.phase)throw Error('Approche non active');
 const a={id:uid('mj',s.seq++),sourceId,targetId,name:'Arbitrage MJ'};
 const e=event(s,a,kind,targetId,amount,detail,reason);
 s.proposals.push(e);return e;
}
function apply(s,e){
 const t=fighter(s,e.targetId);
 if(e.kind==='fatigue'){
  const next=t.fatigue+e.amount;
  if(e.fatigueType==='cost'&&next>fatigueLimit(t))throw Error(t.name+' : fatigue insuffisante pour ce coût volontaire (p. 100)');
  if(next>fatigueLimit(t)){
   const overflow=next-fatigueLimit(t);
   const available=resourceConditionNames(t).filter(c=>!t.conditions.includes(c));
   if(available.length<overflow)throw Error(t.name+' : fatigue excessive, mise hors de combat à arbitrer par le MJ.');
   if(!Array.isArray(e.overflowConditions)||e.overflowConditions.length!==overflow||new Set(e.overflowConditions).size!==overflow||e.overflowConditions.some(c=>!available.includes(c)))throw Error(t.name+' : '+overflow+' état(s) à choisir pour reporter la fatigue excédentaire (règle p. 100).');
   t.conditions.push(...e.overflowConditions);
  }
  t.fatigue=Math.max(0,Math.min(fatigueLimit(t),next));
 }
 else if(e.kind==='wind_credit'){
  t.windReserve={points:e.amount,usableRound:s.round+1};
 }
 else if(e.kind==='wind_spend'){
  if(!t.windReserve||t.windReserve.usableRound!==s.round||t.approach!=='attaquer'||t.windReserve.points<e.amount)throw Error('Oscillations du vent : réserve indisponible');
  t.windReserve.points-=e.amount;
 }
 else if(e.kind==='materials_spend'){
  if(!Number.isInteger(e.amount)||e.amount<1||!Number.isInteger(t.materials)||t.materials<e.amount)throw Error('Substitution : matériels insuffisants au moment de la validation');
  t.materials-=e.amount;
 }
 else if(e.kind==='equipment_disable'){
  t.equipmentDisabled=true;
 }
 else if(e.kind==='materials_add'){
  if(!Number.isInteger(e.amount)||e.amount<0)throw Error('Matériel : quantité invalide');
  if(t.equipmentDisabled)throw Error('Puissance maximale : équipement hors service, aucun matériel gagné pendant cette scène');
  t.materials=(Number.isInteger(t.materials)?t.materials:0)+e.amount;
 }
 else if(e.kind==='balance')t.balance=balanceValue(t,t.balance+e.amount,true);
 else if(e.kind==='condition'){if(npcResourceProfile(t)&&!resourceConditionNames(t).includes(e.detail))throw Error('État absent du profil PNJ : choix du MJ requis.');if(!t.conditions.includes(e.detail))t.conditions.push(e.detail);}
 else if(e.kind==='condition_remove')t.conditions=t.conditions.filter(x=>x!==e.detail);
 else if(e.kind==='status_add'){
  // Une application indépendante pendant un statut temporaire doit survivre à son expiration.
  // La provenance est enregistrée même si le statut est déjà visible.
  // Une source persistante de Terre n'est pas un statut permanent indépendant.
  // La déclarer « external » empêcherait l'expiration normale du statut de passe
  // après disparition de la dernière protection / entrave.
  const persistentEarthSource=['Entraves de métal :','Bouclier de roche :','Armure de terre :','Étoile de lave :'].some(prefix=>String(e.reason||'').startsWith(prefix));
  if(!persistentEarthSource)for(const source of (t.roundStatuses||[]).filter(x=>x.status===e.detail))
   source.external=true;
  if(e.detail==='gene'&&!String(e.reason||'').startsWith('Entraves de métal :'))for(const metal of (s.temporaryEffects||[]).filter(x=>x.originLabel==='Entraves de métal'&&x.targetId===t.id))metal.metalExternalGene=true;
  if(e.detail==='avantage'&&!persistentEarthSource)for(const metal of (s.temporaryEffects||[]).filter(x=>x.originLabel==='Entraves de métal'&&x.originSourceId===t.id))metal.metalExternalAdvantage=true;
  if(e.detail==='avantage'&&!persistentEarthSource){
   // Une source indépendante d'Avantagé est apparue pendant l'armure.
   for(const armor of (s.temporaryEffects||[]))if(armor.targetId===t.id&&armor.originLabel==='Armure de terre')armor.armorExternalAdvantage=true;
  }
  if(!t.statuses.includes(e.detail)){t.statuses.push(e.detail);t.statusAppliedRound=t.statusAppliedRound||{};t.statusAppliedRound[e.detail]=s.round;}
 }
 else if(e.kind==='status_round'){
  // V2.10 : une nouvelle source temporaire prolonge la durée déjà temporaire.
  // Un statut indépendant préexistant ne devient jamais temporaire par accident.
  t.roundStatuses=t.roundStatuses||[];
  const expiresAfterRound=Number.isInteger(e.expiresAfterRound)?e.expiresAfterRound:s.round;
  const existing=t.roundStatuses.filter(x=>x.status===e.detail);
  if(existing.length){
   for(const entry of existing)entry.expiresAfterRound=Math.max(entry.expiresAfterRound,expiresAfterRound);
   if(!t.statuses.includes(e.detail))t.statuses.push(e.detail);
  }else if(!t.statuses.includes(e.detail)){
   t.statuses.push(e.detail);
   t.statusAppliedRound=t.statusAppliedRound||{};t.statusAppliedRound[e.detail]=s.round;
   t.roundStatuses.push({status:e.detail,expiresAfterRound});
  }
 }
 else if(e.kind==='status_remove'){
  if(e.detail==='gene'&&(s.temporaryEffects||[]).some(x=>x.originLabel==='Entraves de métal'&&x.targetId===t.id))throw Error('Entraves de métal : Gêné ne peut être retiré sans libération des entraves');
  t.statuses=t.statuses.filter(x=>x!==e.detail);
  t.roundStatuses=(t.roundStatuses||[]).filter(x=>x.status!==e.detail);
 }
 else if(e.kind==='engage'){if(e.sourceId===e.targetId)throw Error('Engagement réflexif interdit');fighter(s,e.sourceId);if(!isEngaged(s,e.sourceId,e.targetId))s.engagements.push([e.sourceId,e.targetId]);}
 else if(e.kind==='disengage')s.engagements=(s.engagements||[]).filter(pair=>engagementKey(pair[0],pair[1])!==engagementKey(e.sourceId,e.targetId));
 else if(e.kind==='block_next')t.bonuses.push({type:'blocked',approach:e.detail,round:s.round+1});
 else if(e.kind==='arm_status_guard')t.reactions.push({type:'status_guard',round:s.round});
 else if(e.kind==='arm_cover')t.reactions.push({type:'cover',round:s.round,used:false});
 else if(e.kind==='cover_used'){const cover=t.reactions.find(r=>r.type==='cover'&&r.round===s.round&&!r.used);if(cover)cover.used=true;else t.reactions.push({type:'cover',round:s.round,used:true});s.notes.push(e.reason);}
 else if(e.kind==='arm_endure')t.reactions.push({type:'endure',round:s.round,hits:0});
 else if(e.kind==='endure_gain')t.bonuses.push({type:'endure_extra',round:s.round+1,count:e.amount});
 else if(e.kind==='arm_ice_gauntlet')t.bonuses.push({type:'ice_gauntlet',round:Number.MAX_SAFE_INTEGER});
 else if(e.kind==='ice_gauntlet_used'){const i=t.bonuses.findIndex(b=>b.type==='ice_gauntlet');if(i>=0)t.bonuses.splice(i,1);}
 else if(e.kind==='arm_weakness')t.bonuses.push({type:'weakness',targetId:e.detail,round:s.round,direction:e.weaknessDirection===-1?-1:1,extra:!!e.weaknessExtra&&!!e.weaknessPrincipleKnown});
 else if(e.kind==='weakness_used'){const i=t.bonuses.findIndex(b=>b.type==='weakness'&&b.targetId===e.detail);if(i>=0)t.bonuses.splice(i,1);}
 else if(e.kind==='disarm_technique'){
  if(!DISARMABLE_TECHNIQUES.includes(e.detail))throw Error('Désarmement : technique invalide');
  t.bonuses.push({type:'disarmed_technique',name:e.detail,scene:s.scene||1,round:Number.MAX_SAFE_INTEGER});
 }
 else if(e.kind==='arm_riposte')t.reactions.push({type:'riposte',round:s.round});
 else if(e.kind==='arm_protection')t.reactions.push({type:'protection',allyId:e.detail,round:s.round,used:false,targeted:false});
 else if(e.kind==='protection_used'){const r=t.reactions.find(r=>r.type==='protection'&&r.allyId===e.detail&&r.round===s.round&&!r.used);if(r)r.used=true;}
 else if(e.kind==='arm_trap'){
  s.traps=s.traps||[];
  s.traps.push({id:'trap-'+e.id,ownerId:e.sourceId,zone:e.detail,round:s.round});
 }
 else if(e.kind==='note')s.notes.push(e.reason||e.detail);
 else throw Error('Effet inconnu : '+e.kind);
}
function commit(s,decisions={},preview=false){
 const rollback=clone(s);
 try{return commitEffects(s,decisions,preview);}
 catch(err){for(const key of Object.keys(s))if(!Object.prototype.hasOwnProperty.call(rollback,key))delete s[key];Object.assign(s,rollback);throw err;}
}
function commitEffects(s,decisions={},preview=false){
 if(!s.proposals.length)throw Error('Aucune proposition');
 // V1.81 : une proposition préparée ne doit pas contourner une interruption ultérieure.
 if(s.proposals.some(e=>s.actions.some(a=>a.id===e.actionId&&a.cancelledBySeismic)))throw Error('Détection du pas lourd : proposition de technique annulée interdite');
 // V0.81 : les modifications de terrain d'une même Glissade forment un
 // changement de configuration indivisible. Une approbation partielle peut
 // laisser un graphe incohérent (ancienne et nouvelle position à la fois).
 // Les coûts et états restent des décisions distinctes du MJ.
 const terrainByAction=new Map();
 for(const e of s.proposals){
  if(!['engage','disengage'].includes(e.kind)||!String(e.reason||'').startsWith('Glissade :'))continue;
  if(!terrainByAction.has(e.actionId))terrainByAction.set(e.actionId,[]);
  terrainByAction.get(e.actionId).push(e);
 }
 for(const terrain of terrainByAction.values()){
  if(terrain.length<2)continue;
  const selected=terrain.filter(e=>decisions[e.id]!==false).length;
  if(selected!==0&&selected!==terrain.length)throw Error('Glissade : valider ou refuser ensemble tous les changements d’engagement de cette technique');
 }
 // Les coûts et conséquences de ces techniques constituent une décision unique.
 for(const action of s.actions.filter(a=>['Enfouissement','Jet de flammes','Gantelet de terre','Disque de feu','Mords la poussière','Arc de foudre','Mouvements tectoniques','Tourbillon miniature','Souffle du vent','Aspiration','Vélocité du vent','Boulet de canon','Coussin d’air','Cône d’air','Onde de choc','Vague d’air','Sphère d’air','Oscillations du vent','Amortir le poing rageur','Souple comme un roseau','À contretemps','Feinte','Estocade précise','Clouer une mouche contre un tronc d’arbre','Position surélevée','Désarmement','Contre-attaque','Entraves de métal','Escalier de poussière','Boue gluante','Détection du pas lourd','Étoile de lave','Bouclier de roche','Armure de terre'].includes(a.name))){
  const bundle=s.proposals.filter(e=>e.actionId===action.id&&String(e.reason||'').startsWith(action.name+' :'));
  const accepted=bundle.filter(e=>decisions[e.id]!==false).length;
  if(accepted&&accepted!==bundle.length)throw Error(action.name+' : accepter ou refuser tous les effets ensemble');
 }
 // Les points Oscillations remplacent un coût : impossible de valider
 // une attaque gratuite en refusant séparément la consommation de points.
 for(const spendEvent of s.proposals.filter(e=>e.kind==='wind_spend')){
  const bundle=s.proposals.filter(e=>e.actionId===spendEvent.actionId);
  const accepted=bundle.filter(e=>decisions[e.id]!==false).length;
  if(accepted&&accepted!==bundle.length)throw Error('Oscillations du vent : valider ou refuser ensemble la dépense et les effets');
 }
 // Projection tellurique : ne pas accorder Avantagé sans son coût,
 // ni créer de retour au sol si la technique est refusée.
 for(const actionId of new Set(s.actions.filter(a=>a.name==='Projection tellurique').map(a=>a.id))){
  const bundle=s.proposals.filter(e=>e.actionId===actionId&&String(e.reason||'').startsWith('Projection tellurique :'));
  const accepted=bundle.filter(e=>decisions[e.id]!==false).length;
  if(accepted&&accepted!==bundle.length)throw Error('Projection tellurique : valider ou refuser ensemble le coût, le statut et le repère narratif');
 }
 for(const actionId of new Set(s.actions.filter(a=>a.name==='Puissance maximale').map(a=>a.id))){
  const bundle=s.proposals.filter(e=>e.actionId===actionId);
  const accepted=bundle.filter(e=>decisions[e.id]!==false).length;
  if(accepted&&accepted!==bundle.length)throw Error('Puissance maximale : accepter ou refuser tous les effets ensemble');
 }
 // V2.10 : Escalier de poussière est un choix exclusif et atomique.
 // Le MJ ne peut pas conserver Avantagé sans Prêt, ni annuler la position sans payer la totalité.
 for(const action of s.actions.filter(a=>a.name==='Escalier de poussière')){
  const bundle=s.proposals.filter(e=>e.actionId===action.id&&String(e.reason||'').startsWith('Escalier de poussière :'));
  const accepted=bundle.filter(e=>decisions[e.id]!==false).length;
  if(accepted&&accepted!==bundle.length)throw Error('Escalier de poussière : accepter ou refuser tous les effets ensemble');
  if(!accepted)continue;
  const blocker=action.options&&action.options.earthStairsBlocker;
  if(blocker){
   if(bundle.some(e=>e.kind==='status_add'&&['avantage','pret'].includes(e.detail)))throw Error('Escalier de poussière : résistance incompatible avec les statuts de hauteur');
  }else if(!bundle.some(e=>e.kind==='status_add'&&e.detail==='avantage')||!bundle.some(e=>e.kind==='status_add'&&e.detail==='pret'))throw Error('Escalier de poussière : Avantagé et Prêt sont indissociables');
 }
 // V1.81 : Escalier de poussière. Un adversaire ne peut payer 2 fatigues
 // pour annuler la position haute que s'il est ENCORE engagé à la validation.
 // Le refus complet de la technique reste autorisé.
 for(const action of s.actions.filter(a=>a.name==='Escalier de poussière'&&a.options&&a.options.earthStairsBlocker)){
  const bundle=s.proposals.filter(e=>e.actionId===action.id&&String(e.reason||'').startsWith('Escalier de poussière :'));
  if(!bundle.some(e=>decisions[e.id]!==false))continue;
  const blocker=action.options.earthStairsBlocker;
  if(blocker===action.sourceId||!isEngaged(s,action.sourceId,blocker))throw Error('Escalier de poussière : adversaire désengagé avant validation ; refuser et reproposer');
  if(!bundle.some(e=>e.kind==='fatigue'&&e.targetId===blocker&&e.amount===2))throw Error('Escalier de poussière : coût de résistance manquant');
 }
 // V1.49 : les conditions de Contre-attaque doivent encore être vraies au moment
 // de l'approbation. Un changement d'approche ou d'engagement entre proposition
 // et validation ne peut pas produire une riposte illégale.
 for(const action of s.actions.filter(a=>a.name==='Contre-attaque')){
  const bundle=s.proposals.filter(e=>e.actionId===action.id&&String(e.reason||'').startsWith('Contre-attaque :'));
  if(!bundle.some(e=>decisions[e.id]!==false))continue; // Refus total toujours possible.
  const actor=fighter(s,action.sourceId),target=fighter(s,action.targetId);
  if(action.sourceId===action.targetId||!isEngaged(s,action.sourceId,action.targetId)||target.approach!=='attaquer')throw Error('Contre-attaque : engagement ou approche adverse modifié avant validation ; refuser et reproposer');
  if([...(actor.activeStatuses||[]),...(actor.statuses||[])].some(x=>['en_danger','gene','piege','etourdi'].includes(x))||(actor.conditions||[]).length)throw Error('Contre-attaque : statut négatif ou état coché avant validation ; refuser et reproposer');
 }
 // V2.10 : la progression de Colonne de pierre et Mouvements tectoniques
 // dépend du statut de la cible au moment de la validation, pas seulement
 // lors de la préparation. Un changement intermédiaire impose de reproposer.
 for(const action of s.actions.filter(a=>['Colonne de pierre','Mouvements tectoniques'].includes(a.name))){
  const proposed=s.proposals.filter(e=>e.actionId===action.id&&e.kind==='status_add'&&String(e.reason||'').startsWith(action.name+' :'));
  const tectonic=s.proposals.filter(e=>e.actionId===action.id&&e.kind==='status_round'&&String(e.reason||'').startsWith(action.name+' :'));
  const relevant=[...proposed,...tectonic];
  if(!relevant.some(e=>decisions[e.id]!==false))continue;
  for(const e of relevant){
   if(decisions[e.id]===false)continue;
   const target=fighter(s,e.targetId);
   const statuses=new Set([...(target.statuses||[]),...(target.activeStatuses||[])]);
   if(action.name==='Colonne de pierre'){
    const expected=statuses.has('piege')?'en_danger':statuses.has('gene')?'piege':'gene';
    if(e.detail!==expected)throw Error('Colonne de pierre : statut de la cible modifié avant validation ; refuser et reproposer');
   }else{
    const expected=statuses.has('gene')?'etourdi':'gene';
    if(e.detail!==expected)throw Error('Mouvements tectoniques : statut de la cible modifié avant validation ; refuser et reproposer');
   }
  }
 }
 // V2.10 : validation différée des décisions de projection et de zone.
 // Une cible ne doit pas être projetée sur la base d'un engagement disparu,
 // et une cible de zone ne doit pas devenir alliée par changement de camp.
 for(const action of s.actions.filter(a=>['Gantelet de terre','Projection tellurique','Mouvements tectoniques','Mords la poussière'].includes(a.name))){
  const bundle=s.proposals.filter(e=>e.actionId===action.id&&String(e.reason||'').startsWith(action.name+' :'));
  const accepted=bundle.filter(e=>decisions[e.id]!==false);
  if(!accepted.length)continue;
  if(action.name==='Gantelet de terre'){
   const projection=action.options?.earthGauntletProjection||'none';
   if(projection!=='none'&&!isEngaged(s,action.sourceId,action.targetId))throw Error('Gantelet de terre : engagement modifié avant validation ; refuser et reproposer');
   if(projection==='resist'&&!bundle.some(e=>e.kind==='fatigue'&&e.targetId===action.targetId&&e.amount===1&&String(e.reason||'').includes('résistance au choc')))throw Error('Gantelet de terre : résistance sans coût');
   if(projection==='project'&&!bundle.some(e=>e.kind==='disengage'))throw Error('Gantelet de terre : projection sans désengagement');
  }
  if(action.name==='Projection tellurique'){
   for(const e of bundle.filter(e=>e.kind==='disengage'))if(!isEngaged(s,e.sourceId,e.targetId))throw Error('Projection tellurique : engagement modifié avant validation ; refuser et reproposer');
  }
  if(action.name==='Mouvements tectoniques'){
   const targets=action.options?.tectonicTargets||[];
   if(targets.length!==new Set(targets).size||targets.some(id=>id===action.sourceId||!s.fighters.some(f=>f.id===id)))throw Error('Mouvements tectoniques : cibles modifiées avant validation');
   if(!action.options?.tectonicZone&&targets.length!==1)throw Error('Mouvements tectoniques : cible unique requise');
  }
  if(action.name==='Mords la poussière'){
   const blocks=bundle.filter(e=>e.kind==='block_next'&&e.detail==='defendre');
   if(blocks.length!==1)throw Error('Mords la poussière : interdiction de défense manquante');
  }
 }
 // V2.10 : vérifier l'intégrité des effets de Terre différés avant toute mutation.
 // Une proposition altérée ou devenue incohérente ne doit pas contourner le coût
 // ou appliquer des conséquences à d'autres cibles que celles choisies par le MJ.
 for(const action of s.actions.filter(a=>['Gantelet de terre','Mouvements tectoniques','Colonne de pierre','Enfouissement','Mords la poussière'].includes(a.name))){
  const bundle=s.proposals.filter(e=>e.actionId===action.id&&String(e.reason||'').startsWith(action.name+' :'));
  if(!bundle.some(e=>decisions[e.id]!==false))continue;
  const has=(kind,target,detail)=>bundle.some(e=>e.kind===kind&&e.targetId===target&&(detail===undefined||e.detail===detail));
  const count=(kind)=>bundle.filter(e=>e.kind===kind).length;
  if(action.name==='Gantelet de terre'){
   const o=action.options||{},choice=o.choice;
   if(count('fatigue')!==(choice==='fatigue'?2:1)+(o.earthGauntletProjection==='resist'?1:0)||
    bundle.filter(e=>e.kind==='fatigue'&&e.targetId===action.sourceId&&e.amount===1&&String(e.reason||'').includes('coût')).length!==1||
    (choice==='fatigue'?bundle.filter(e=>e.kind==='fatigue'&&e.targetId===action.targetId&&e.amount===2&&String(e.reason||'').includes('cible')).length!==1:
     bundle.filter(e=>e.kind==='condition'&&e.targetId===action.targetId&&e.detail===o.condition).length!==1))
    throw Error('Gantelet de terre : coût ou conséquence manquant ; refuser et reproposer');
   if(bundle.filter(e=>e.kind==='condition').length!==(choice==='condition'?1:0)||
    bundle.some(e=>['status_add','status_round','status_remove'].includes(e.kind)))
    throw Error('Gantelet de terre : effet supplémentaire non autorisé');
   if(o.earthGauntletProjection==='resist'&&(!bundle.some(e=>e.kind==='fatigue'&&e.targetId===action.targetId&&e.amount===1)||count('fatigue')!==(choice==='fatigue'?3:2)))
    throw Error('Gantelet de terre : résistance au choc incohérente');
   if(o.earthGauntletProjection==='project'&&(!has('disengage',action.targetId)||count('disengage')!==1))
    throw Error('Gantelet de terre : désengagement de projection incohérent');
  }
  if(action.name==='Mouvements tectoniques'){
   const targets=action.options?.tectonicTargets||[];
   const impacts=bundle.filter(e=>['status_add','status_round'].includes(e.kind));
   if(impacts.length!==targets.length||impacts.some(e=>!targets.includes(e.targetId))||
    new Set(impacts.map(e=>e.targetId)).size!==targets.length||
    (action.options?.tectonicZone?!bundle.some(e=>e.kind==='fatigue'&&e.targetId===action.sourceId&&e.amount===1):bundle.some(e=>e.kind==='fatigue')))
    throw Error('Mouvements tectoniques : cibles ou coût de zone incohérents');
  }
  if(action.name==='Colonne de pierre'&&(count('status_add')!==1||!has('status_add',action.targetId)))
   throw Error('Colonne de pierre : progression de la cible incohérente');
  if(action.name==='Enfouissement'&&(
   bundle.filter(e=>e.kind==='fatigue'&&e.targetId===action.sourceId&&e.amount===2).length!==1||
   bundle.filter(e=>e.kind==='status_add'&&e.targetId===action.targetId&&e.detail==='piege').length!==1||
   bundle.filter(e=>['fatigue','status_add'].includes(e.kind)).length!==2))
   throw Error('Enfouissement : coût et statut Piégé indissociables ; refuser et reproposer');
  if(action.name==='Mords la poussière'&&(!has('status_add',action.targetId,'gene')||!has('block_next',action.targetId,'defendre')))
   throw Error('Mords la poussière : Gêné et interdiction de défendre indissociables');
 }
 // V2.10 : l'activation d'Armure de terre est indivisible : le statut
 // Avantagé et la note de réserve doivent être acceptés ou refusés ensemble.
 // Sans cela, le MJ pouvait approuver la note seule ou créer la réserve sans
 // valider l'ensemble des effets de la technique.
 for(const action of s.actions.filter(a=>a.name==='Armure de terre')){
  const bundle=s.proposals.filter(e=>e.actionId===action.id&&String(e.reason||'').startsWith('Armure de terre :'));
  if(!bundle.length)continue;
  const accepted=bundle.filter(e=>decisions[e.id]!==false).length;
  if(accepted&&accepted!==bundle.length)throw Error('Armure de terre : valider ou refuser ensemble le statut et la réserve');
 }
 // V2.10 : Armure de terre ne peut pas renouveler artificiellement sa réserve
 // par une deuxième activation, même si deux actions ont été proposées ensemble.
 // Refuser entièrement une activation reste possible sans bloquer la validation.
 const armorActivations=new Set();
 for(const action of s.actions.filter(a=>a.name==='Armure de terre')){
  const bundle=s.proposals.filter(e=>e.actionId===action.id&&String(e.reason||'').startsWith('Armure de terre :'));
  if(!bundle.some(e=>decisions[e.id]!==false))continue;
  if(armorActivations.has(action.sourceId)||(s.temporaryEffects||[]).some(e=>e.originLabel==='Armure de terre'&&e.targetId===action.sourceId&&Number(e.armorPoints)>0))
   throw Error('Armure de terre : une armure avec réserve est déjà active pour ce combattant');
  armorActivations.add(action.sourceId);
 }
 // V1.81 : empêcher deux activations simultanées avant toute mutation.
 // Le MJ peut refuser intégralement l'une des deux propositions.
 const lavaActivations=new Set();
 for(const action of s.actions.filter(a=>a.name==='Étoile de lave')){
  const accepted=s.proposals.some(e=>e.actionId===action.id&&e.kind==='fatigue'&&String(e.reason||'').startsWith('Étoile de lave : coût initial')&&decisions[e.id]!==false);
  if(!accepted)continue;
  if(lavaActivations.has(action.sourceId)||(s.temporaryEffects||[]).some(e=>e.originLabel==='Étoile de lave'&&e.targetId===action.sourceId))
   throw Error('Étoile de lave : une étoile est déjà active pour ce combattant');
  lavaActivations.add(action.sourceId);
 }
 // Requalifier aussi les propositions d'une sauvegarde antérieure à V2.33.
 const approved=s.proposals.filter(e=>decisions[e.id]!==false).map(e=>earthFatigueCost(s.actions.find(a=>a.id===e.actionId),e)?{...e,fatigueType:'cost'}:e);
 // V1.59 : consommation d'un Bouclier de roche dans la MÊME transaction que
 // le coût d'une technique de Terre. Le bouclier n'est jamais consommé si
 // la technique est refusée ou si la validation échoue.
 const shieldDiscounts=[];
 const earthNames=new Set(['Armure de terre','Bouclier de roche','Boue gluante','Colonne de pierre','Détection du pas lourd','Enfouissement','Entraves de métal','Escalier de poussière','Étoile de lave','Gantelet de terre','Mords la poussière','Mouvements tectoniques','Projection tellurique']);
 const reservedShields=new Set();
 for(const action of s.actions){
  const shieldId=action.options&&action.options.earthShieldDiscountId;
  if(!shieldId)continue;
  if(!earthNames.has(action.name))throw Error('Bouclier de roche : réduction réservée aux techniques de Terre');
  const sh=(s.temporaryEffects||[]).find(e=>e.id===shieldId&&e.originLabel==='Bouclier de roche');
  if(!sh||sh.originSourceId!==action.sourceId||reservedShields.has(shieldId))throw Error('Bouclier de roche : bouclier absent, non possédé ou déjà réservé');
  const costs=approved.filter(e=>e.actionId===action.id&&e.kind==='fatigue'&&e.sourceId===action.sourceId&&e.targetId===action.sourceId&&Number(e.amount)>0);
  const allCosts=s.proposals.filter(e=>e.actionId===action.id&&e.kind==='fatigue'&&e.sourceId===action.sourceId&&e.targetId===action.sourceId&&Number(e.amount)>0);
  if(!allCosts.length)throw Error('Bouclier de roche : cette technique ne coûte aucune fatigue');
  if(!costs.length){if(approved.some(e=>e.actionId===action.id))throw Error('Bouclier de roche : coût refusé mais autres effets acceptés');continue;}
  if(costs.length!==allCosts.length)throw Error('Bouclier de roche : valider tous les coûts avant réduction');
  reservedShields.add(shieldId);
  shieldDiscounts.push({id:shieldId,actionId:action.id,costEventId:costs[0].id,sourceId:action.sourceId,targetId:sh.targetId});
 }

 // V0.72 : Gantelet de glace. Préparer le bonus avant Protection et les abris,
 // afin que la fatigue supplémentaire appartienne à la même attaque.
 // Consommation à la première attaque exécutée, même si elle est interceptée.
 const iceMarks=new Map(s.fighters.map(f=>[f.id,f.bonuses.filter(b=>b.type==='ice_gauntlet').length]));
 const iceSpentActions=new Set();
 const iceNegative=new Set(['en_danger','gene','piege','etourdi']);
 for(let i=0;i<approved.length;i++){
  const e=approved[i];
  if(e.kind==='arm_ice_gauntlet'){
   iceMarks.set(e.targetId,(iceMarks.get(e.targetId)||0)+1);
   continue;
  }
  if(!hostileEvent(e)||!['fatigue','condition','balance','status_add'].includes(e.kind))continue;
  if(e.kind==='status_add'&&!iceNegative.has(e.detail))continue;
  if(iceSpentActions.has(e.actionId)||!(iceMarks.get(e.sourceId)>0))continue;
  iceSpentActions.add(e.actionId);
  iceMarks.set(e.sourceId,iceMarks.get(e.sourceId)-1);
  const extra={...e,id:uid('e',s.seq++),kind:'fatigue',amount:1,detail:'',reason:'Gantelet de glace : +1 fatigue sur la prochaine attaque'};
  const spent={...e,id:uid('e',s.seq++),kind:'ice_gauntlet_used',targetId:e.sourceId,amount:0,detail:'',reason:'Gantelet de glace : bonus consommé'};
  approved.splice(i+1,0,extra,spent);
  i+=2;
 }

 // Snapshot unique avant toute mutation, y compris réactions et historique.
 const before=clone({...s,snapshots:[]});
 const derived=[],intercepted=new Set();
 // V0.56 : une interception porte sur l'attaque entière, pas sur un seul
 // événement. Aucune réaction n'est modifiée avant la validation atomique.
 const interceptedAttacks=new Set(),reservedProtectors=new Set();
 const attackEffects=new Set(['fatigue','condition','balance','status_add','disengage']);
 const protectableStatuses=new Set(['en_danger','gene','piege','etourdi']);
 // V0.65 : Protection ne dépense pas sa fatigue pour une attaque qui
 // n'apporte aucun effet hostile. Examiner tous les effets du groupe,
 // y compris quand le premier est sans conséquence.
 const protectionGroups=new Map();
 for(const e of approved){
  const key=e.actionId+'|'+e.targetId;
  if(!protectionGroups.has(key))protectionGroups.set(key,[]);
  protectionGroups.get(key).push(e);
 }
 const meaningfulProtectionAttack=(key,targetId)=>{
  const victim=fighter(s,targetId);
  let balance=victim.balance;
  const conditions=new Set(victim.conditions);
  const statuses=new Set(victim.statuses);
  for(const e of protectionGroups.get(key)||[]){
   if(!hostileEvent(e))continue;
   if(e.kind==='fatigue'&&Number(e.amount)>0)return true;
   if(e.kind==='condition'&&e.detail&&!conditions.has(e.detail))return true;
   if(e.kind==='status_add'&&protectableStatuses.has(e.detail)&&!statuses.has(e.detail))return true;
   if(e.kind==='balance'){
    const next=balanceValue(victim,balance+Number(e.amount));
    if(next!==balance)return true;
    balance=next;
   }
  }
  return false;
 };
 for(const e of approved){
  if(!attackEffects.has(e.kind)||!hostileEvent(e)||(e.kind==='status_add'&&!protectableStatuses.has(e.detail)))continue;
  const key=e.actionId+'|'+e.targetId;
  if(interceptedAttacks.has(key)||!meaningfulProtectionAttack(key,e.targetId))continue;
  const victim=fighter(s,e.targetId);
  // V0.66 : le MJ peut désigner explicitement le protecteur. En l'absence
  // de choix, conserver le comportement historique (premier disponible).
  // Un choix explicite indisponible ne doit jamais être remplacé en silence.
  const eligible=s.fighters.filter(f=>!reservedProtectors.has(f.id)&&f.id!==e.sourceId&&f.reactions.some(r=>r.type==='protection'&&r.allyId===victim.id&&r.round===s.round&&!r.used));
  // V0.67 : une décision peut être portée par n'importe quel effet
  // approuvé de la même attaque. La première décision explicite dans
  // l'ordre des événements prévaut ; les décisions contradictoires ne
  // provoquent jamais deux interceptions.
  const group=protectionGroups.get(key)||[];
  const selected=group.find(x=>decisions['intercept:'+x.id]===true);
  if(!selected)continue;
  const chosen=decisions['protector:'+selected.id];
  const defender=chosen===undefined?eligible[0]:eligible.find(f=>f.id===chosen);
  if(defender){
   reservedProtectors.add(defender.id);interceptedAttacks.add(key);
   derived.push({...e,id:uid('e',s.seq++),sourceId:defender.id,targetId:defender.id,kind:'fatigue',amount:1,detail:'',reason:'Coût Protection',actionId:'reaction'});
   derived.push({...e,id:uid('e',s.seq++),sourceId:defender.id,targetId:defender.id,kind:'protection_used',amount:0,detail:victim.id,reason:'Interception de l’attaque',actionId:'reaction'});
   continue;
  }
 }
 for(const e of approved)if(interceptedAttacks.has(e.actionId+'|'+e.targetId)&&attackEffects.has(e.kind)&&(e.kind!=='status_add'||protectableStatuses.has(e.detail)))intercepted.add(e.id);
 // Fort comme un chêne (p. 286) : immunité aux statuts négatifs pendant
 // cette passe, y compris si la garde est activée dans la même validation.
 // Les états cochés et la fatigue ne sont PAS des statuts : ils passent.
 const negativeStatuses=new Set(['en_danger','gene','piege','etourdi']);
 const guarded=new Set(s.fighters.filter(f=>f.reactions.some(r=>r.type==='status_guard'&&r.round===s.round)).map(f=>f.id));
 for(const e of approved)if(e.kind==='arm_status_guard')guarded.add(e.targetId);
 // Se mettre à l’abri (p. 286) : première attaque hostile réussie
 // absorbée intégralement, même si elle comporte plusieurs effets.
 // Une attaque est identifiée par son actionId ; le MJ confirme la réussite
 // en proposant ses effets. Les effets narratifs sans événement restent au MJ.
 const attackKinds=new Set(['fatigue','condition','balance','status_add','disengage']);
 const coverByTarget=new Map();
 for(const f of s.fighters){
  if(f.reactions.some(r=>r.type==='cover'&&r.round===s.round&&!r.used))coverByTarget.set(f.id,true);
 }
 for(const e of approved)if(e.kind==='arm_cover')coverByTarget.set(e.targetId,true);
 // V0.60 : ne consommer l'abri que si une attaque produit au moins
 // un effet hostile réel. L'évaluation est cumulative, cible par cible.
 // Une attaque à plusieurs effets est traitée comme un tout, même si
 // son premier effet est nul. Les statuts bloqués par Fort comme un chêne
 // ne sont pas des attaques réussies contre l'abri.
 // V1.59 : le bouclier absorbe automatiquement la première attaque hostile
 // réellement applicable de la passe, en groupant tous les effets de l'attaque.
 // Les protections déjà interceptées ne consomment pas le bouclier.
 const shieldAbsorbed=new Set(),shieldSpent=new Set();
 const shieldShadow=new Map(s.fighters.map(f=>[f.id,{kind:f.kind,npcResources:f.npcResources,fatigue:f.fatigue,balance:f.balance,conditions:new Set(f.conditions),statuses:new Set(f.statuses)}]));
 const shieldGroups=new Map();
 for(const e of approved){const key=e.actionId+'|'+e.targetId;if(!shieldGroups.has(key))shieldGroups.set(key,[]);shieldGroups.get(key).push(e);}
 for(const [key,events] of shieldGroups){
  const targetId=events[0].targetId,shadow=shieldShadow.get(targetId);if(!shadow)continue;
  const available=(s.temporaryEffects||[]).find(x=>x.originLabel==='Bouclier de roche'&&x.targetId===targetId&&x.shieldBlockedRound!==s.round&&!shieldSpent.has(x.id));
  let hostile=false;
  const trial={kind:shadow.kind,npcResources:shadow.npcResources,fatigue:shadow.fatigue,balance:shadow.balance,conditions:new Set(shadow.conditions),statuses:new Set(shadow.statuses)};
  for(const e of events){
   if(intercepted.has(e.id)||interceptedAttacks.has(key))continue;
   if(e.kind==='status_add'&&negativeStatuses.has(e.detail)&&hostileEvent(e)&&guarded.has(e.targetId))continue;
   if(!hostileEvent(e))continue;
   if(e.kind==='fatigue'&&Number(e.amount)>0){hostile=true;trial.fatigue=Math.min(fatigueLimit(trial),trial.fatigue+Number(e.amount));}
   else if(e.kind==='condition'&&e.detail&&!trial.conditions.has(e.detail)){hostile=true;trial.conditions.add(e.detail);}
   else if(e.kind==='balance'){const next=balanceValue(trial,trial.balance+Number(e.amount));if(next!==trial.balance)hostile=true;trial.balance=next;}
   else if(e.kind==='status_add'&&negativeStatuses.has(e.detail)&&!trial.statuses.has(e.detail)){hostile=true;trial.statuses.add(e.detail);}
  }
  if(hostile&&available){shieldAbsorbed.add(key);shieldSpent.add(available.id);}
  else if(hostile)Object.assign(shadow,trial);
 }
 const absorbedActions=new Set(),coveredTargets=new Set();
 const coverShadow=new Map(s.fighters.map(f=>[f.id,{
  kind:f.kind,npcResources:f.npcResources,fatigue:f.fatigue,balance:f.balance,conditions:new Set(f.conditions),statuses:new Set(f.statuses)
 }]));
 // V0.61 : traiter les attaques par groupes (actionId, cible) dans l'ordre
 // de leur première apparition. Une attaque absorbée ne doit JAMAIS
 // modifier l'état intermédiaire utilisé pour juger les suivantes.
 const coverGroups=new Map();
 for(const e of approved){
  const key=e.actionId+'|'+e.targetId;
  if(!coverGroups.has(key))coverGroups.set(key,[]);
  coverGroups.get(key).push(e);
 }
 const shadowEffect=(e,v)=>{
  let changed=false;
  if(e.kind==='fatigue'){
   const next=Math.max(0,Math.min(fatigueLimit(v),v.fatigue+Number(e.amount)));
   changed=Number(e.amount)>0;v.fatigue=next;
  }else if(e.kind==='balance'){
   const next=balanceValue(v,v.balance+Number(e.amount));
   changed=next!==v.balance;v.balance=next;
  }else if(e.kind==='condition'){
   changed=!!e.detail&&!v.conditions.has(e.detail);if(e.detail)v.conditions.add(e.detail);
  }else if(e.kind==='condition_remove')v.conditions.delete(e.detail);
  else if(e.kind==='status_add'){
   changed=!!e.detail&&!v.statuses.has(e.detail);if(e.detail)v.statuses.add(e.detail);
  }else if(e.kind==='status_remove')v.statuses.delete(e.detail);
  return changed;
 };
 for(const [key,events] of coverGroups){
  const targetId=events[0].targetId;
  const current=coverShadow.get(targetId);if(!current)continue;
  const trial={fatigue:current.fatigue,balance:current.balance,
   conditions:new Set(current.conditions),statuses:new Set(current.statuses)};
  let hostileChange=false;
  for(const e of events){
   if(intercepted.has(e.id)||interceptedAttacks.has(key)||shieldAbsorbed.has(key))continue;
   if(e.kind==='status_add'&&negativeStatuses.has(e.detail)&&hostileEvent(e)&&guarded.has(e.targetId))continue;
   const changed=shadowEffect(e,trial);
   if(hostileEvent(e)&&attackKinds.has(e.kind)&&(e.kind!=='status_add'||negativeStatuses.has(e.detail))&&changed)hostileChange=true;
  }
  if(hostileChange&&coverByTarget.has(targetId)&&!coveredTargets.has(targetId)){
   absorbedActions.add(key);coveredTargets.add(targetId);
   // Les effets hostiles absorbés n'ont pas lieu. Conserver seulement les
   // éventuels effets non hostiles du groupe pour la suite de la validation.
   for(const e of events){
    if(!hostileEvent(e)||!attackKinds.has(e.kind)||(e.kind==='status_add'&&!negativeStatuses.has(e.detail))){
     shadowEffect(e,current);
    }
   }
  }else Object.assign(current,trial);
 }
 // V0.57 : Riposter se déclenche seulement sur une attaque qui atteint
 // effectivement le personnage, après interception et absorption par l'abri.
 // Une attaque à effets multiples ne déclenche qu'une riposte par cible.
 // V0.62 : la couverture examine les attaques par groupe complet. Appliquer
 // également les événements dans ce même ordre canonique : sans cela des
 // effets entrelacés A1, B1, A2 seraient évalués A1+A2 puis B1 pour l'abri,
 // mais appliqués A1, B1, A2, causant des écarts de résolution et de riposte.
 // L'ordre des groupes suit leur première apparition, l'ordre interne est stable.
 const orderedApproved=Array.from(coverGroups.values()).flat();
 const effective=orderedApproved.filter(e=>!(shieldAbsorbed.has(e.actionId+'|'+e.targetId)&&attackKinds.has(e.kind)&&hostileEvent(e)&&(e.kind!=='status_add'||negativeStatuses.has(e.detail)))&&!intercepted.has(e.id)&&!(e.kind==='status_add'&&negativeStatuses.has(e.detail)&&hostileEvent(e)&&guarded.has(e.targetId))&&!(absorbedActions.has(e.actionId+'|'+e.targetId)&&attackKinds.has(e.kind)&&hostileEvent(e)&&(e.kind!=='status_add'||negativeStatuses.has(e.detail))));
 // V2.10 : allocation par attaque complète, fatigue ET états confondus.
 // Chaque attaque consomme au moins un point, jamais un point obligatoire par effet.
 const armorRemaining=new Map((s.temporaryEffects||[]).filter(x=>x.originLabel==='Armure de terre'&&Number(x.armorPoints)>0).map(x=>[x.targetId,{id:x.id,points:x.armorPoints}]));
 const armorSpent=new Map();
 const armorReject=message=>{s.seq=before.seq;throw Error(message);};
 const armorChoiceIds=Object.keys(decisions).filter(k=>k.startsWith('armor:'));
 const armorEligibleIds=new Set(effective.filter(e=>hostileEvent(e)&&armorRemaining.has(e.targetId)&&((e.kind==='fatigue'&&Number(e.amount)>0)||(e.kind==='condition'&&e.detail))).map(e=>'armor:'+e.id));
 for(const key of armorChoiceIds)if(!armorEligibleIds.has(key))armorReject('Armure de terre : choix périmé ('+key+')');
 const armorConditionShadow=new Map(s.fighters.map(f=>[f.id,new Set(f.conditions||[])]));
 const armorAbsorbedConditions=new Map(); // Par attaque et cible, jamais global par combattant.
 const armorGroups=new Map();
 for(const e of effective){
  if(!hostileEvent(e)||!armorRemaining.has(e.targetId))continue;
  if(e.kind!=='fatigue'&&e.kind!=='condition')continue;
  const key=e.actionId+'|'+e.targetId;
  if(!armorGroups.has(key))armorGroups.set(key,{events:[],fatigue:0,conditions:[]});
  const g=armorGroups.get(key);g.events.push(e);
  if(e.kind==='fatigue'&&Number(e.amount)>0)g.fatigue+=Number(e.amount);
  if(e.kind==='condition'&&e.detail&&!g.conditions.some(c=>c.detail===e.detail))g.conditions.push(e);
 }
 const armorGroupProcessed=new Set(),armorUsedChoiceIds=new Set(),armoredEffective=[];
 const armorEventReplacements=new Map();
 for(const e of effective){
  const key=e.actionId+'|'+e.targetId,group=armorGroups.get(key),reserve=armorRemaining.get(e.targetId);
  if(group&&!armorGroupProcessed.has(key)){
   armorGroupProcessed.add(key);
   const shadow=armorConditionShadow.get(e.targetId);
   const conditions=group.conditions.filter(c=>!shadow.has(c.detail));
   for(const duplicate of group.events.filter(x=>x.kind==='condition'&&x.detail)){
    if(conditions.some(c=>c.detail===duplicate.detail&&c.id!==duplicate.id)&&decisions['armor:'+duplicate.id]!==undefined)armorReject('Armure de terre : choix inutile sur un état déjà absorbé');
   }
   const firstFatigue=group.events.find(x=>x.kind==='fatigue'&&Number(x.amount)>0);
   const firstCondition=conditions[0];
   const available=reserve.points;
   if(available>0&&(group.fatigue>0||conditions.length)){
    const fatigueKey=firstFatigue?'armor:'+firstFatigue.id:null;
    const conditionKeys=conditions.map(c=>'armor:'+c.id);
    const explicit=group.events.some(x=>decisions['armor:'+x.id]!==undefined);
    // Par défaut, protéger la fatigue en premier ; sinon absorber le premier état.
    const fatiguePoints=fatigueKey?(decisions[fatigueKey]===undefined?(explicit?0:1):Number(decisions[fatigueKey])):0;
    if(!Number.isInteger(fatiguePoints)||fatiguePoints<0||fatiguePoints>Math.min(available,Math.ceil(group.fatigue/2)))armorReject('Armure de terre : allocation de fatigue invalide');
    let conditionPoints=0;
    for(let i=0;i<conditions.length;i++){
     const c=conditions[i],choice=decisions['armor:'+c.id];
     const spend=choice===undefined?(!explicit&&!firstFatigue&&i===0?1:0):Number(choice);
     if(!Number.isInteger(spend)||spend<0||spend>1)armorReject('Armure de terre : allocation d’état invalide');
     if(choice!==undefined)armorUsedChoiceIds.add('armor:'+c.id);
     if(spend){armorEventReplacements.set(c.id,{kind:'note',amount:0,detail:'',reason:c.reason+' — état absorbé par Armure de terre'});(armorAbsorbedConditions.get(key)||armorAbsorbedConditions.set(key,new Set()).get(key)).add(c.detail);conditionPoints++;}
    }
    if(fatigueKey&&decisions[fatigueKey]!==undefined)armorUsedChoiceIds.add(fatigueKey);
    const spent=fatiguePoints+conditionPoints;
    if(spent<1||spent>available)armorReject('Armure de terre : dépenser entre 1 et '+available+' point(s) par attaque');
    if(firstFatigue){armorEventReplacements.set(firstFatigue.id,{amount:Math.max(0,group.fatigue-2*fatiguePoints),reason:firstFatigue.reason+' — Armure de terre : '+fatiguePoints+' point(s) sur fatigue'});for(const fragment of group.events.filter(x=>x.kind==='fatigue'&&x.id!==firstFatigue.id))armorEventReplacements.set(fragment.id,{amount:0});}
    reserve.points-=spent;armorSpent.set(reserve.id,(armorSpent.get(reserve.id)||0)+spent);
    armorEventReplacements.set(e.id,{...(armorEventReplacements.get(e.id)||{}),armorSpendNote:spent});
   }
  }
  if(e.kind==='condition'&&armorAbsorbedConditions.get(key)?.has(e.detail)&&!armorEventReplacements.has(e.id))armorEventReplacements.set(e.id,{kind:'note',amount:0,detail:'',reason:e.reason+' — état déjà absorbé par Armure de terre'});
  const replacement=armorEventReplacements.get(e.id)||{};
  const {armorSpendNote,...patch}=replacement;
  armoredEffective.push({...e,...patch});
  if(e.kind==='condition'&&patch.kind!=='note'&&e.detail)armorConditionShadow.get(e.targetId)?.add(e.detail);
  if(e.kind==='condition_remove'&&e.detail)armorConditionShadow.get(e.targetId)?.delete(e.detail);
  if(armorSpendNote)armoredEffective.push({...e,id:uid('e',s.seq++),kind:'note',amount:0,detail:'',reason:'Armure de terre : '+armorSpendNote+' point(s) de réserve dépensé(s) automatiquement',actionId:'armor'});
 }
 for(const key of armorChoiceIds)if(!armorUsedChoiceIds.has(key))armorReject('Armure de terre : choix non applicable ('+key+')');
 effective.splice(0,effective.length,...armoredEffective);
 const ripostedAttacks=new Set();
 // V0.59 : calcul cumulatif sur un état intermédiaire, dans l’ordre
 // effectif de résolution. Une seconde attaque qui réapplique un état
 // déjà reçu dans cette validation ne provoque pas une nouvelle riposte.
 // La simulation de déclenchement ne modifie jamais l’état réel.
 const riposteShadow=new Map(s.fighters.map(f=>[f.id,{
  kind:f.kind,npcResources:f.npcResources,fatigue:f.fatigue,balance:f.balance,conditions:new Set(f.conditions)
 }]));
 const riposteEligible=(e,victim)=>{
  if(e.kind==='fatigue')return Number(e.amount)>0;
  if(e.kind==='condition')return !!e.detail&&!victim.conditions.has(e.detail);
  if(e.kind==='balance')return Number(e.amount)!==0&&balanceValue(victim,victim.balance+Number(e.amount))!==victim.balance;
  return false;
 };
 const updateRiposteShadow=(e,victim)=>{
  if(e.kind==='fatigue')victim.fatigue=Math.max(0,Math.min(fatigueLimit(victim),victim.fatigue+Number(e.amount)));
  else if(e.kind==='condition')victim.conditions.add(e.detail);
  else if(e.kind==='condition_remove')victim.conditions.delete(e.detail);
  else if(e.kind==='balance')victim.balance=balanceValue(victim,victim.balance+Number(e.amount));
 };
 for(const e of effective){
  const victim=riposteShadow.get(e.targetId);
  if(!victim)continue;
  const hostile=attackEffects.has(e.kind)&&hostileEvent(e);
  const key=e.actionId+'|'+e.targetId;
  const triggers=hostile&&!ripostedAttacks.has(key)&&riposteEligible(e,victim);
  // Inclure également les effets non hostiles dans l’état intermédiaire.
  updateRiposteShadow(e,victim);
  if(!triggers)continue;
  const target=fighter(s,e.targetId);
  if(target.reactions.some(r=>r.type==='riposte'&&r.round===s.round)){
   derived.push({...e,id:uid('e',s.seq++),sourceId:target.id,targetId:e.sourceId,kind:'fatigue',amount:1,detail:'',reason:'Riposter',actionId:'reaction'});
   ripostedAttacks.add(key);
  }
 }
 // V0.64 : Trouver la faille se déclenche au premier effet réel de
 // fatigue ou d'état infligé à la cible désignée. Un marquage est consommé
 // une fois, même pour une attaque à plusieurs effets. Les attaques
 // interceptées/absorbées ne figurent pas dans effective.
 const weaknessShadow=new Map(s.fighters.map(f=>[f.id,{kind:f.kind,npcResources:f.npcResources,fatigue:f.fatigue,balance:f.balance,conditions:new Set(f.conditions)}]));
 const weaknessMarks=new Map(s.fighters.map(f=>[f.id,f.bonuses.filter(b=>b.type==='weakness').map(b=>({...b}))]));
 for(const e of effective){
  if(e.kind==='arm_weakness'){
   if(!weaknessMarks.has(e.targetId))weaknessMarks.set(e.targetId,[]);
   weaknessMarks.get(e.targetId).push({targetId:e.detail,direction:e.weaknessDirection===-1?-1:1,extra:!!e.weaknessExtra&&!!e.weaknessPrincipleKnown});
   continue;
  }
  const v=weaknessShadow.get(e.targetId);
  if(!v)continue;
  const hit=hostileEvent(e)&&(e.kind==='fatigue'||e.kind==='condition')&&riposteEligible(e,v);
  updateRiposteShadow(e,v);
  if(!hit)continue;
  const marks=weaknessMarks.get(e.sourceId)||[];
  const i=marks.findIndex(b=>b.targetId===e.targetId);
  if(i<0)continue;
  const mark=marks.splice(i,1)[0],dir=mark.direction===-1?-1:1;
  derived.push({...e,id:uid('e',s.seq++),actionId:'weakness',sourceId:e.sourceId,targetId:e.sourceId,kind:'weakness_used',amount:0,detail:e.targetId,reason:'Trouver la faille : marque consommée'});
  derived.push({...e,id:uid('e',s.seq++),actionId:'weakness',kind:'balance',amount:dir,detail:'',reason:'Trouver la faille : décalage supplémentaire'});
  if(mark.extra){
   derived.push({...e,id:uid('e',s.seq++),actionId:'weakness',targetId:e.sourceId,kind:'fatigue',amount:1,detail:'',reason:'Trouver la faille : coût du deuxième décalage'});
   derived.push({...e,id:uid('e',s.seq++),actionId:'weakness',kind:'balance',amount:dir,detail:'',reason:'Trouver la faille : deuxième décalage'});
  }
 }
 // V0.63 : Serrer les dents compte les attaques qui ont effectivement
 // infligé fatigue, état ou décalage d'équilibre, et non chaque événement.
 // L'état intermédiaire évite de compter un état déjà coché ou une jauge
 // d'équilibre bloquée. Le bonus s'applique à la prochaine passe.
 const endured=new Map(),endureSeen=new Set();
 const endureShadow=new Map(s.fighters.map(f=>[f.id,{kind:f.kind,npcResources:f.npcResources,fatigue:f.fatigue,balance:f.balance,conditions:new Set(f.conditions)}]));
 for(const e of effective){
  const v=endureShadow.get(e.targetId);if(!v)continue;
  const hostile=attackEffects.has(e.kind)&&hostileEvent(e);
  const changed=hostile&&riposteEligible(e,v);
  updateRiposteShadow(e,v);
  const key=e.actionId+'|'+e.targetId;
  if(changed&&!endureSeen.has(key)){
   const target=fighter(s,e.targetId);
   if(target.reactions.some(r=>r.type==='endure'&&r.round===s.round)){
    endureSeen.add(key);endured.set(target.id,(endured.get(target.id)||0)+1);
   }
  }
 }
 for(const [id,count] of endured){
  effective.push({id:uid('e',s.seq++),actionId:'endure',sourceId:id,targetId:id,kind:'endure_gain',amount:count,detail:'',reason:'Serrer les dents : techniques supplémentaires à la prochaine passe',round:s.round});
 }
 effective.push(...derived);
 for(const id of coveredTargets){
  effective.push({id:uid('e',s.seq++),actionId:'cover',sourceId:id,targetId:id,kind:'cover_used',amount:0,detail:'',reason:'Abri endommagé ou détruit : première attaque absorbée (MJ précise la fiction)',round:s.round});
 }
 for(const id of shieldSpent){
  const sh=(s.temporaryEffects||[]).find(x=>x.id===id);
  if(sh)effective.push({id:uid('e',s.seq++),actionId:'shield',sourceId:sh.originSourceId,targetId:sh.targetId,kind:'note',amount:0,detail:'',reason:'Bouclier de roche : première attaque de la passe bloquée automatiquement',round:s.round});
 }
 // La remise est appliquée au coût réellement effectif, sans toucher aux
 // propositions originales (prévisualisation pure, aucun effet secondaire).
 for(const d of shieldDiscounts){
  const cost=effective.find(e=>e.id===d.costEventId);
  if(!cost)throw Error('Bouclier de roche : coût introuvable après résolution');
  // Ne jamais modifier une proposition originale via une référence partagée.
  effective[effective.indexOf(cost)]={...cost,amount:Math.max(0,cost.amount-1)};
  effective.push({id:uid('e',s.seq++),actionId:d.actionId,sourceId:d.sourceId,targetId:d.targetId,kind:'note',amount:0,detail:'',reason:'Bouclier de roche : consommé pour réduire de 1 fatigue le coût de la technique de Terre',round:s.round});
 }
 if(preview)return effective;
 for(const e of effective)if(Object.prototype.hasOwnProperty.call(decisions,'overflow:'+e.id))e.overflowConditions=decisions['overflow:'+e.id];
 // Prévalidation atomique : un même état ne peut pas absorber deux fatigues
 // excédentaires dans une même validation, même si les effets sont simultanés.
 const simulated=clone(s);
 // Une attaque approuvée visant l'allié empêche le bonus de Protection,
 // même si le protecteur l'intercepte ensuite. Aucun marquage en prévisualisation.
 for(const e of approved){
  if(!['fatigue','condition','balance'].includes(e.kind)||!hostileEvent(e))continue;
  for(const defender of simulated.fighters)for(const r of defender.reactions){
   if(r.type==='protection'&&r.round===simulated.round&&r.allyId===e.targetId&&defender.id!==e.sourceId)r.targeted=true;
  }
 }
 try{effective.forEach(e=>apply(simulated,e));}
 catch(err){Object.assign(s,before);throw err}
 // Tous les effets sont validés : appliquer l'état simulé d'un seul coup.
 simulated.fighters.forEach((f,i)=>Object.assign(s.fighters[i],f));
 s.engagements=simulated.engagements;
 s.traps=simulated.traps||[];
 s.notes=simulated.notes;
 // Répercuter les dépenses automatiques seulement après validation
 // atomique de tous les événements (aucune réserve consommée si échec).
 for(const [armorId,points] of armorSpent){
  const armor=(s.temporaryEffects||[]).find(x=>x.id===armorId);
  if(!armor||armor.armorPoints<points){Object.assign(s,before);throw Error('Armure de terre : réserve devenue insuffisante');}
  armor.armorPoints-=points;
  armor.label='Armure de terre : '+armor.armorPoints+' / 3 points';
  if(armor.armorPoints===0){s.temporaryEffects=s.temporaryEffects.filter(x=>x.id!==armorId);releaseEarthArmorAdvantage(s,armor);}
 }
 // V1.81 : provenance indépendante de Gêné. Une nouvelle source validée
 // pendant le bouclier doit survivre à sa consommation ou révocation.
 // Ne compter que les effets réellement appliqués (pas les attaques bloquées).
 for(const e of effective)if((e.kind==='status_add'||e.kind==='status_round')&&e.detail==='gene'&&!String(e.reason||'').startsWith('Bouclier de roche :')){
  for(const shield of (s.temporaryEffects||[]))if(shield.originLabel==='Bouclier de roche'&&shield.targetId===e.targetId)shield.shieldExternalGene=true;
 }
 for(const e of effective)if(e.kind==='status_add'&&e.detail==='avantage'&&!persistentEarthStatus(e))for(const armor of (s.temporaryEffects||[]))if(armor.targetId===e.targetId&&armor.originLabel==='Armure de terre')armor.armorExternalAdvantage=true;
 // Marquage uniquement après validation atomique des effets.
 for(const id of shieldSpent){const sh=(s.temporaryEffects||[]).find(x=>x.id===id);if(sh){sh.shieldBlockedRound=s.round;sh.label='Bouclier de roche : première attaque bloquée (passe '+s.round+')';}}
 // Consommation différée : seulement APRÈS l'application atomique des coûts.
 for(const d of shieldDiscounts){
  const sh=(s.temporaryEffects||[]).find(e=>e.id===d.id);
  if(!sh){Object.assign(s,before);throw Error('Bouclier de roche : bouclier disparu durant la validation');}
  s.temporaryEffects=s.temporaryEffects.filter(e=>e.id!==d.id);
  const remaining=s.temporaryEffects.filter(e=>e.originLabel==='Bouclier de roche'&&e.targetId===d.targetId);
  if(sh.shieldGrantedGene&&remaining.length)remaining[0].shieldGrantedGene=true;
  if(sh.shieldExternalGene&&remaining.length)remaining[0].shieldExternalGene=true;
  if(sh.shieldGrantedGene&&!remaining.length&&!sh.shieldExternalGene&&!((fighter(s,d.targetId).roundStatuses||[]).some(x=>x.status==='gene'&&x.expiresAfterRound>=s.round))&&!s.temporaryEffects.some(x=>x.originLabel==='Entraves de métal'&&x.targetId===d.targetId)&&!effective.some(e=>e.kind==='status_add'&&e.detail==='gene'&&e.targetId===d.targetId&&s.actions.some(a=>a.id===e.actionId&&a.name==='Entraves de métal'))){
   const target=fighter(s,d.targetId);
   target.statuses=target.statuses.filter(x=>x!=='gene');
   if(target.statusAppliedRound)delete target.statusAppliedRound.gene;
  }
 }
 // V1.59 : bouclier persistant, un blocage par passe, bénéficiaire et créateur explicites.
 for(const action of s.actions){
  if(action.name!=='Bouclier de roche'||!approved.some(e=>e.actionId===action.id&&e.kind==='fatigue'&&String(e.reason||'').startsWith('Bouclier de roche :')))continue;
  if((s.temporaryEffects||[]).some(e=>e.originActionId===action.id))continue;
  if((s.temporaryEffects||[]).length>=10000){Object.assign(s,before);throw Error('Bouclier de roche : limite des effets temporaires');}
  const protectedId=action.options.earthShieldProtectedId||action.sourceId;
  (s.temporaryEffects||(s.temporaryEffects=[])).push({id:uid('temp',s.seq++),targetId:protectedId,
   label:'Bouclier de roche : prêt à bloquer (passe '+s.round+')',duration:'manual',createdRound:s.round,createdScene:s.scene||1,
   originType:'technique',originLabel:'Bouclier de roche',originActionId:action.id,originSourceId:action.sourceId,
   shieldBlockedRound:0,shieldGrantedGene:!before.fighters.find(f=>f.id===protectedId).statuses.includes('gene')});
 }
 // Synchroniser aussi les déplacements produits par les techniques résolues.
 syncEarthMetalAdvantage(s);
 // V2.10 : matérialiser les entraves approuvées dans un effet mécanique persistant.
 for(const action of s.actions){
  if(action.name!=='Entraves de métal')continue;
  const targetId=action.targetId;
  if(!effective.some(e=>e.actionId===action.id&&e.kind==='status_add'&&e.targetId===targetId&&e.detail==='gene'))continue;
  if((s.temporaryEffects||[]).some(e=>e.originActionId===action.id))continue;
  if((s.temporaryEffects||[]).length>=10000){Object.assign(s,before);throw Error('Entraves de métal : limite des effets temporaires');}
  s.temporaryEffects.push({id:uid('temp',s.seq++),targetId,label:'Entraves de métal : Gêné verrouillé',duration:'manual',createdRound:s.round,createdScene:s.scene||1,originType:'technique',originLabel:'Entraves de métal',originActionId:action.id,originSourceId:action.sourceId,metalExternalGene:before.fighters.some(f=>f.id===targetId&&f.statuses.includes('gene')&&(!(f.roundStatuses||[]).some(x=>x.status==='gene'&&x.expiresAfterRound>=s.round&&!x.external))&&(!before.temporaryEffects?.some(x=>x.originLabel==='Bouclier de roche'&&x.targetId===targetId&&x.shieldGrantedGene&&!x.shieldExternalGene)||before.temporaryEffects?.some(x=>x.originLabel==='Bouclier de roche'&&x.targetId===targetId&&x.shieldExternalGene)||(f.roundStatuses||[]).some(x=>x.status==='gene'&&x.expiresAfterRound>=s.round&&x.external)))&&!before.temporaryEffects?.some(x=>x.originLabel==='Entraves de métal'&&x.targetId===targetId),metalExternalAdvantage:independentEarthAdvantage(before,action.sourceId),metalGrantedAdvantage:!before.fighters.some(f=>f.id===action.sourceId&&f.statuses.includes('avantage'))&&isEngaged(s,action.sourceId,targetId)});
 }
 syncEarthMetalAdvantage(s);
 // V1.59 : créer une réserve persistante uniquement après validation intégrale.
 for(const action of s.actions){
  if(action.name!=='Armure de terre'||!approved.some(e=>e.actionId===action.id&&e.kind==='status_add'&&e.detail==='avantage'&&String(e.reason||'').startsWith('Armure de terre :')))continue;
  if((s.temporaryEffects||[]).some(e=>e.originActionId===action.id))continue;
  if((s.temporaryEffects||[]).length>=10000){Object.assign(s,before);throw Error('Limite des effets temporaires atteinte');}
  (s.temporaryEffects||(s.temporaryEffects=[])).push({id:uid('temp',s.seq++),targetId:action.sourceId,
   label:'Armure de terre : 3 / 3 points',duration:'manual',createdRound:s.round,createdScene:s.scene||1,
   originType:'technique',originLabel:'Armure de terre',originActionId:action.id,armorPoints:3,armorExternalAdvantage:independentEarthAdvantage(before,action.sourceId)||effective.some(e=>e.targetId===action.sourceId&&e.kind==='status_add'&&e.detail==='avantage'&&!persistentEarthStatus(e))});
 }
 // V1.81 : Étoile de lave persistante ; activation seulement après application effective du coût et du statut.
 for(const action of s.actions){
  if(action.name!=='Étoile de lave')continue;
  const activated=effective.some(e=>e.actionId===action.id&&e.kind==='fatigue'&&String(e.reason||'').startsWith('Étoile de lave : coût initial'))&&effective.some(e=>e.actionId===action.id&&e.kind==='status_add'&&e.detail==='avantage');
  if(!activated||(s.temporaryEffects||[]).some(e=>e.originActionId===action.id))continue;
  if((s.temporaryEffects||[]).length>=10000){Object.assign(s,before);throw Error('Étoile de lave : limite des effets temporaires');}
  (s.temporaryEffects||(s.temporaryEffects=[])).push({id:uid('temp',s.seq++),targetId:action.sourceId,
   label:'Étoile de lave : active — entretien en fin de passe',duration:'manual',createdRound:s.round,createdScene:s.scene||1,
   originType:'technique',originLabel:'Étoile de lave',originActionId:action.id,originSourceId:action.sourceId,
   lavaMaintainedRound:0,lavaExternalAdvantage:independentEarthAdvantage(before,action.sourceId)||effective.some(e=>e.targetId===action.sourceId&&e.kind==='status_add'&&e.detail==='avantage'&&!persistentEarthStatus(e))});
 }
 // V1.81 : un avantage obtenu indépendamment après l'activation reste présent à l'extinction.
 // Ne compter que les événements effectivement appliqués, jamais les propositions rejetées.
 for(const e of effective){
  if(e.kind!=='status_add'||e.detail!=='avantage'||persistentEarthStatus(e))continue;
  for(const star of (s.temporaryEffects||[]).filter(x=>x.originLabel==='Étoile de lave'&&x.targetId===e.targetId))star.lavaExternalAdvantage=true;
 }
 // V1.81 : Détection du pas lourd : droit d'interruption nominatif, limité à la passe.
 for(const action of s.actions){
  if(action.name!=='Détection du pas lourd')continue;
  if(!effective.some(e=>e.actionId===action.id&&e.kind==='status_add'&&e.detail==='pret'&&String(e.reason||'').startsWith('Détection du pas lourd :')))continue;
  const caster=fighter(s,action.sourceId);
  caster.bonuses=caster.bonuses||[];
  if(!caster.bonuses.some(b=>b.type==='earth_seismic_interrupt'&&b.originActionId===action.id))caster.bonuses.push({type:'earth_seismic_interrupt',round:s.round,originActionId:action.id});
 }
 // V1.81 : Boue gluante. Les frappes supplémentaires sont une ressource
 // nominative, utilisable une seule fois contre chaque adversaire enlisé
 // pendant la passe immédiatement suivante, indépendamment de l'approche.
 for(const action of s.actions){
  if(action.name!=='Boue gluante')continue;
  const targets=effective.filter(e=>e.actionId===action.id&&e.kind==='status_add'&&e.detail==='gene'&&String(e.reason||'').startsWith('Boue gluante :')).map(e=>e.targetId);
  if(!targets.length)continue;
  const caster=fighter(s,action.sourceId);
  caster.bonuses=caster.bonuses||[];
  for(const id of targets)caster.bonuses.push({type:'earth_mud_strike',targetId:id,round:s.round+1,originActionId:action.id});
 }
 // V1.07 : Projection tellurique (annexe A, p. 289). Le retour au sol
 // est explicitement prévu à la fin de la passe. Repère narratif uniquement :
 // l'état Avantagé et les engagements restent arbitrés par les règles existantes.
 // Ne créer le repère que si au moins un effet de la technique est accepté.
 for(const action of s.actions){
  if(action.name!=='Projection tellurique'||!approved.some(e=>e.actionId===action.id&&e.kind==='status_add'&&e.detail==='avantage'&&String(e.reason||'').startsWith('Projection tellurique :')))continue;
  const already=(s.temporaryEffects||[]).some(e=>e.originActionId===action.id);
  if(already)continue;
  if((s.temporaryEffects||[]).length>=10000){Object.assign(s,before);throw Error('Limite de 10 000 effets temporaires atteinte (technique)');}
  (s.temporaryEffects||(s.temporaryEffects=[])).push({
   id:uid('temp',s.seq++),targetId:action.sourceId,
   label:'Projection tellurique : retour au sol à la fin de la passe',
   duration:'round',createdRound:s.round,createdScene:s.scene||1,
   originType:'technique',originLabel:'Projection tellurique',originSourceId:null,
   originActionId:action.id
  });
 }
 // V1.38 : réservation différée seulement après validation du coût et de la note.
 for(const action of s.actions){
  if(action.name!=='À contretemps'||!approved.some(e=>e.actionId===action.id&&e.kind==='fatigue'&&String(e.reason||'').startsWith('À contretemps :')))continue;
  if((s.temporaryEffects||[]).some(e=>e.originActionId===action.id))continue;
  if((s.temporaryEffects||[]).length>=10000){Object.assign(s,before);throw Error('Limite de 10 000 effets temporaires atteinte');}
  (s.temporaryEffects||(s.temporaryEffects=[])).push({id:uid('temp',s.seq++),targetId:action.sourceId,
   label:'À contretemps : révélation anticipée de '+fighter(s,action.targetId).name+' à la prochaine passe (MJ)',
   duration:'round',createdRound:s.round,expiresAfterRound:s.round+1,createdScene:s.scene||1,
   originType:'technique',originLabel:'À contretemps',originSourceId:action.targetId,originActionId:action.id,
   countertimeOpponentId:action.targetId,countertimeResolved:false});
 }
 // V1.33 : conserver le pari de Souple comme un roseau seulement après validation.
 // Le libellé est visible au MJ ; ne pas afficher la prédiction sur un écran partagé avec les joueurs.
 for(const action of s.actions){
  if(action.name!=='Souple comme un roseau'||!approved.some(e=>e.actionId===action.id&&e.kind==='fatigue'&&String(e.reason||'').startsWith('Souple comme un roseau :')))continue;
  if((s.temporaryEffects||[]).some(e=>e.originActionId===action.id))continue;
  if((s.temporaryEffects||[]).length>=10000){Object.assign(s,before);throw Error('Limite de 10 000 effets temporaires atteinte (technique)');}
  (s.temporaryEffects||(s.temporaryEffects=[])).push({
   id:uid('temp',s.seq++),targetId:action.sourceId,
   label:'Souple comme un roseau : prédiction scellée contre '+fighter(s,action.targetId).name+' ; révéler après déclaration (MJ)',
   duration:'round',createdRound:s.round,expiresAfterRound:s.round+1,createdScene:s.scene||1,
   originType:'technique',originLabel:'Souple comme un roseau',originSourceId:action.targetId,originActionId:action.id,reedPrediction:action.options.airReedPrediction,reedTargetId:action.targetId,reedResolved:false
  });
 }
 // V1.29 : repère d'immunité temporaire, créé uniquement après approbation du MJ.
 // Il n'accorde aucune immunité mécanique sans qualification narrative de l'attaque.
 for(const action of s.actions){
  if(action.name!=='Amortir le poing rageur'||!approved.some(e=>e.actionId===action.id&&e.kind==='status_add'&&e.detail==='avantage'&&String(e.reason||'').startsWith('Amortir le poing rageur :')))continue;
  if((s.temporaryEffects||[]).some(e=>e.originActionId===action.id))continue;
  if((s.temporaryEffects||[]).length>=10000){Object.assign(s,before);throw Error('Limite de 10 000 effets temporaires atteinte (technique)');}
  (s.temporaryEffects||(s.temporaryEffects=[])).push({
   id:uid('temp',s.seq++),targetId:action.sourceId,
   label:'Amortir le poing rageur : immunité physique (qualification MJ)',
   duration:'round',createdRound:s.round,expiresAfterRound:s.round+1,createdScene:s.scene||1,
   originType:'technique',originLabel:'Amortir le poing rageur',originSourceId:null,originActionId:action.id
  });
 }
 s.history.push({round:s.round,phase:s.phase,events:clone(effective)});
 s.snapshots.push(before);
 s.proposals=[];
 return effective;
}
// V1.81 : interruption sismique arbitrée par le MJ. L'annulation de la
// technique ennemie est enregistrée, sans effacer une action déjà résolue.
function resolveEarthSeismicInterrupt(s,sourceId,enemyId,choice,confirmed=false,overflowConditions=[],enemyActionId=''){
 if(confirmed!==true)throw Error('Détection du pas lourd : confirmation MJ requise');
 // V1.81 : les propositions déjà préparées sont autorisées ; seule la technique annulée sera retirée.
 if(!APPROACHES.includes(s.phase))throw Error('Détection du pas lourd : passe active requise');
 if(!['pay','cancel'].includes(choice))throw Error('Détection du pas lourd : choix ennemi invalide');
 const caster=fighter(s,sourceId),enemy=fighter(s,enemyId);
 if(sourceId===enemyId)throw Error('Détection du pas lourd : adversaire distinct requis');
 const reserve=(caster.bonuses||[]).find(b=>b.type==='earth_seismic_interrupt'&&b.round===s.round);
 if(!reserve||!caster.statuses.includes('pret'))throw Error('Détection du pas lourd : interruption indisponible ou statut Prêt absent');
 // V1.81 : rattacher l'annulation à une technique précise encore en attente.
 // Aucune annulation rétroactive d'une action déjà inscrite dans l'historique.
 let enemyAction=null;
 if(choice==='cancel'){
  if(!enemyActionId)throw Error('Détection du pas lourd : choisir une technique ennemie en attente à annuler');
  enemyAction=s.actions.find(a=>a.id===enemyActionId&&a.sourceId===enemyId&&a.round===s.round);
  if(!enemyAction)throw Error('Détection du pas lourd : technique ennemie introuvable pour cette passe');
  if(enemyAction.cancelledBySeismic)throw Error('Détection du pas lourd : technique déjà annulée');
  if(s.history.some(h=>(h.events||[]).some(e=>e.actionId===enemyActionId)))throw Error('Détection du pas lourd : technique ennemie déjà résolue');
 }
 const rollback=clone(s);
 const before=clone({...s,snapshots:[]});
 try{
  const action={id:uid('seismic',s.seq++),sourceId,targetId:enemyId,name:'Détection du pas lourd : interruption'};
  const cost=event(s,action,'fatigue',sourceId,1,'','Détection du pas lourd : interruption (coût 1 fatigue)');
  cost.fatigueType='cost';
  const events=[cost];
  if(choice==='pay'){
   const payment=event(s,action,'fatigue',enemyId,3,'','Détection du pas lourd : ennemi paie 3 fatigues et poursuit sa technique');
   payment.fatigueType='cost';
   payment.overflowConditions=overflowConditions;
   events.push(payment);
  }else events.push(event(s,action,'note',enemyId,0,'','Détection du pas lourd : technique ennemie interrompue et annulée par décision MJ ; ne pas résoudre cette technique'));
  for(const e of events)apply(s,e);
  if(enemyAction){
   enemyAction.cancelledBySeismic=true;
   s.proposals=s.proposals.filter(e=>e.actionId!==enemyAction.id);
  }
  caster.statuses=caster.statuses.filter(x=>x!=='pret');
  if(caster.statusAppliedRound)delete caster.statusAppliedRound.pret;
  caster.bonuses=caster.bonuses.filter(b=>b!==reserve);
  s.snapshots.push(before);
  s.history.push({round:s.round,phase:s.phase,events:[...events,{kind:'status_remove',targetId:sourceId,detail:'pret',reason:'Détection du pas lourd : Prêt dépensé'}]});
  return {choice,events};
 }catch(err){for(const key of Object.keys(s))if(!Object.prototype.hasOwnProperty.call(rollback,key))delete s[key];Object.assign(s,rollback);throw err;}
}
function resolveEarthMudStrike(s,sourceId,targetId,choice,detail='',confirmed=false,overflowConditions=[],decisions={}){
 if(confirmed!==true)throw Error('Boue gluante : confirmation MJ requise');
 if(s.proposals.length)throw Error('Boue gluante : valider les propositions en attente');
 if(!APPROACHES.includes(s.phase))throw Error('Boue gluante : approche active requise');
 const caster=fighter(s,sourceId),victim=fighter(s,targetId);
 if(sourceId===targetId)throw Error('Boue gluante : cible distincte requise');
 const bonus=(caster.bonuses||[]).find(b=>b.type==='earth_mud_strike'&&b.targetId===targetId&&b.round===s.round);
 if(!bonus)throw Error('Boue gluante : aucune Frappe supplémentaire disponible pour cette cible');
 if(!['fatigue','condition','balance'].includes(choice))throw Error('Boue gluante : choisir la conséquence de Frapper');
 if(choice==='condition'&&(!resourceConditionNames(victim).includes(detail)||victim.conditions.includes(detail)))throw Error('Boue gluante : choisir un état libre');
 if(choice==='balance'&&![-1,1].includes(Number(detail)))throw Error('Boue gluante : direction d’équilibre +1 ou −1 requise');
 const rollback=clone(s);
 const before=clone({...s,snapshots:[]});
 try{
  const a={id:uid('mud',s.seq++),sourceId,targetId,name:'Boue gluante : Frapper supplémentaire',round:s.round,approach:s.phase,extraTechnique:true,options:{}};
  const e=event(s,a,choice==='fatigue'?'fatigue':choice==='condition'?'condition':'balance',targetId,choice==='fatigue'?2:choice==='balance'?Number(detail):0,choice==='condition'?detail:'','Boue gluante : Frapper supplémentaire (passe suivante, MJ)');
  s.actions.push(a);s.proposals.push(e);
  const bonusIndex=caster.bonuses.indexOf(bonus);
  const selected=typeof decisions==='function'?decisions():{...decisions};
  if(!selected){for(const key of Object.keys(s))if(!Object.prototype.hasOwnProperty.call(rollback,key))delete s[key];Object.assign(s,rollback);return null;}
  if(!Object.prototype.hasOwnProperty.call(selected,'overflow:'+e.id))selected['overflow:'+e.id]=overflowConditions;
  const effective=commit(s,selected);
  fighter(s,sourceId).bonuses.splice(bonusIndex,1);
  // Le commit commun et la consommation du droit forment une seule annulation.
  s.snapshots[s.snapshots.length-1]=before;
  return effective.find(x=>x.id===e.id)||{...e,amount:0,kind:'note',reason:'Boue gluante : attaque bloquée'};
 }catch(err){for(const key of Object.keys(s))if(!Object.prototype.hasOwnProperty.call(rollback,key))delete s[key];Object.assign(s,rollback);throw err;}
}
function releaseEarthArmorAdvantage(s,armor){
 const target=fighter(s,armor.targetId);
 // Une armure épuisée ne retire pas l'avantage d'une étoile de lave,
 // d'une autre armure ou d'une source temporaire encore active.
 const otherAdvantage=earthLavaOtherAdvantage(s,armor.targetId,armor.id);
 if(!armor.armorExternalAdvantage&&!otherAdvantage){
  target.statuses=target.statuses.filter(x=>x!=='avantage');
  if(target.statusAppliedRound)delete target.statusAppliedRound.avantage;
  s.notes.push('Armure de terre : réserve épuisée ; Avantagé retiré automatiquement pour '+target.name+'.');
 }else s.notes.push('Armure de terre : réserve épuisée ; Avantagé conservé (autre source connue ou armure active) pour '+target.name+'.');
}
function spendEarthArmor(s,id,mode,confirmed){
 const transactionRollback=clone(s);
 try{
 if(confirmed!==true)throw Error('Armure de terre : confirmation MJ requise');
 if(s.proposals.length)throw Error('Armure de terre : résoudre les propositions en attente');
 if(!['condition','fatigue'].includes(mode))throw Error('Armure de terre : type de protection invalide');
 const item=(s.temporaryEffects||[]).find(e=>e.id===id&&e.originLabel==='Armure de terre'&&Number.isInteger(e.armorPoints));
 if(!item||item.armorPoints<1)throw Error('Armure de terre : aucune réserve disponible');
 const before=clone({...s,snapshots:[]});
 item.armorPoints--;
 item.label='Armure de terre : '+item.armorPoints+' / 3 points';
 if(item.armorPoints===0){
  s.temporaryEffects=s.temporaryEffects.filter(e=>e.id!==id);
  releaseEarthArmorAdvantage(s,item);
 }
 const detail=mode==='condition'?'1 état':'2 fatigues';
 s.snapshots.push(before);
 s.history.push({round:s.round,phase:s.phase,events:[{kind:'earth_armor_spend',targetId:item.targetId,amount:1,detail,reason:'Armure de terre : 1 point dépensé pour annuler '+detail+' (dégâts NON appliqués automatiquement ; MJ confirme la résolution)'}]});
 return item.armorPoints;
 }catch(err){for(const key of Object.keys(s))if(!Object.prototype.hasOwnProperty.call(transactionRollback,key))delete s[key];Object.assign(s,transactionRollback);throw err;}
}
// V1.59 : résolution atomique d'un impact réel sous Armure de terre.
function resolveEarthArmorHit(s,id,kind,amount,points,confirmed,overflowConditions=[]){
 if(confirmed!==true)throw Error('Armure de terre : confirmation MJ requise');
 if(s.proposals.length)throw Error('Armure de terre : résoudre les propositions en attente');
 const armor=(s.temporaryEffects||[]).find(e=>e.id===id&&e.originLabel==='Armure de terre'&&Number.isInteger(e.armorPoints));
 if(!armor||armor.armorPoints<1)throw Error('Armure de terre : réserve indisponible');
 if(!Number.isInteger(points)||points<1||points>armor.armorPoints)throw Error('Armure de terre : au moins un point obligatoire, sans dépasser la réserve');
 if(kind==='fatigue'){
  if(!Number.isInteger(amount)||amount<1||amount>20)throw Error('Armure de terre : fatigue entrante invalide (1 à 20)');
 }else if(kind==='condition'){
  if(!resourceConditionNames(fighter(s,armor.targetId)).includes(amount))throw Error('Armure de terre : état invalide');
  if(points!==1)throw Error('Armure de terre : un seul point annule un état');
 }else throw Error('Armure de terre : type d’impact invalide');
 const target=fighter(s,armor.targetId);
 if(kind==='condition'&&target.conditions.includes(amount))throw Error('Armure de terre : cet état est déjà coché, aucun nouvel impact à annuler');
 const rollback=clone(s);
 const before=clone({...s,snapshots:[]});
 try{
  let residual=0;
  if(kind==='fatigue'){
   // Une protection ne peut dépenser plus de points que nécessaire
   // pour annuler la fatigue réellement entrante.
   if(points>Math.ceil(amount/2))throw Error('Armure de terre : dépense supérieure aux points nécessaires pour cet impact');
   residual=Math.max(0,amount-2*points);
   // V1.81 : même conversion des fatigues excédentaires que les événements du moteur.
   const impact={kind:'fatigue',targetId:target.id,amount:residual,overflowConditions};
   apply(s,impact);
  }else if(points<1&&!target.conditions.includes(amount))target.conditions.push(amount);
  armor.armorPoints-=points;
  armor.label='Armure de terre : '+armor.armorPoints+' / 3 points';
  if(!armor.armorPoints){
   s.temporaryEffects=s.temporaryEffects.filter(e=>e.id!==id);
   releaseEarthArmorAdvantage(s,armor);
  }
  s.snapshots.push(before);
  s.history.push({round:s.round,phase:s.phase,events:[{kind:'earth_armor_hit',targetId:target.id,amount:points,detail:kind==='fatigue'?amount+' fatigues entrantes ; '+residual+' appliquée(s)':amount+' annulé',reason:'Armure de terre : protection réactive validée par le MJ'}]});
  return {remaining:armor.armorPoints,residual};
 }catch(e){for(const key of Object.keys(s))if(!Object.prototype.hasOwnProperty.call(rollback,key))delete s[key];Object.assign(s,rollback);throw e;}
}
// V1.59 : opérations de bouclier atomiques, historisées et réversibles.
function earthShieldEffect(s,id){
 const shield=(s.temporaryEffects||[]).find(e=>e.id===id&&e.originLabel==='Bouclier de roche');
 if(!shield)throw Error('Bouclier de roche : bouclier inexistant ou révoqué');
 return shield;
}
function mutateEarthShield(s,id,operation,confirmed,baseCost){
 if(confirmed!==true)throw Error('Bouclier de roche : confirmation MJ obligatoire');
 if(s.proposals.length)throw Error('Bouclier de roche : résoudre les propositions en attente');
 if(!['block','revoke','consume'].includes(operation))throw Error('Bouclier de roche : opération invalide');
 const shield=earthShieldEffect(s,id),target=fighter(s,shield.targetId),caster=fighter(s,shield.originSourceId);
 if(operation==='block'&&shield.shieldBlockedRound===s.round)throw Error('Bouclier de roche : première attaque de cette passe déjà bloquée');
 if(operation==='consume'&&(!Number.isInteger(baseCost)||baseCost<1||baseCost>5))throw Error('Bouclier de roche : coût initial de la technique de Terre invalide');
 const rollback=clone(s);
 const before=clone({...s,snapshots:[]});
 try{
  let discount=0;
  if(operation==='block'){
   shield.shieldBlockedRound=s.round;
   shield.label='Bouclier de roche : première attaque bloquée (passe '+s.round+')';
  }else{
   if(operation==='consume')discount=1;
   s.temporaryEffects=s.temporaryEffects.filter(e=>e.id!==id);
   // Ne retirer Gêné que si ce bouclier l'a créé et si aucune autre source connue ne le maintient.
   const otherShield=s.temporaryEffects.some(e=>e.originLabel==='Bouclier de roche'&&e.targetId===target.id);
   if((shield.shieldGrantedGene||shield.shieldExternalGene)&&otherShield){const inheritor=s.temporaryEffects.find(e=>e.originLabel==='Bouclier de roche'&&e.targetId===target.id);if(shield.shieldGrantedGene)inheritor.shieldGrantedGene=true;if(shield.shieldExternalGene)inheritor.shieldExternalGene=true;}
   if(shield.shieldGrantedGene&&!otherShield&&!shield.shieldExternalGene&&!((target.roundStatuses||[]).some(x=>x.status==='gene'&&x.expiresAfterRound>=s.round))&&!s.temporaryEffects.some(x=>x.originLabel==='Entraves de métal'&&x.targetId===target.id)){
    target.statuses=target.statuses.filter(x=>x!=='gene');
    if(target.statusAppliedRound)delete target.statusAppliedRound.gene;
   }
  }
  s.snapshots.push(before);
  s.history.push({round:s.round,phase:s.phase,events:[{kind:'earth_shield_'+operation,sourceId:caster.id,targetId:target.id,amount:discount,detail:operation==='block'?'Première attaque bloquée':operation==='consume'?'Réduction de 1 fatigue sur un coût de '+baseCost+' (coût net '+(baseCost-1)+', NON appliqué automatiquement)':'Bouclier révoqué',reason:'Bouclier de roche : arbitrage MJ confirmé'}]});
  return {discount,netCost:operation==='consume'?baseCost-1:null};
 }catch(e){for(const key of Object.keys(s))if(!Object.prototype.hasOwnProperty.call(rollback,key))delete s[key];Object.assign(s,rollback);throw e;}
}
function undo(s){
 const before=s.snapshots.pop();if(!before)return false;
 const remaining=s.snapshots;
 // Restaurer exactement les clés de la sauvegarde, y compris celles qui ont disparu.
 // Object.assign seul laissait subsister des champs ajoutés par la passe annulée.
 for(const key of Object.keys(s))if(!Object.prototype.hasOwnProperty.call(before,key))delete s[key];
 Object.assign(s,clone(before));s.snapshots=remaining;return true;
}
function advance(s){
 if(s.proposals.length)throw Error('Propositions en attente');
 const i=APPROACHES.indexOf(s.phase);
 if(i<0||i===2)throw Error('Terminer la passe avant de poursuivre');
 s.phase=APPROACHES[i+1];
}
function endRound(s){
 if(s.proposals.length)throw Error('Propositions en attente');
 if(s.phase!=='esquiver')throw Error('Résoudre les trois approches');
 const rollback=clone(s);
 const before=clone({...s,snapshots:[]});
 try{
 // Protection : si aucune attaque n'a visé l'allié pendant la passe,
 // les deux personnages deviennent Confiants (p. 286).
 for(const protector of s.fighters){
  for(const r of protector.reactions){
   if(r.type!=='protection'||r.round!==s.round||r.targeted)continue;
   const ally=s.fighters.find(f=>f.id===r.allyId);
   if(!ally)continue;
   for(const f of [protector,ally]){
    if(!f.statuses.includes('confiant'))f.statuses.push('confiant');
    f.statusAppliedRound=f.statusAppliedRound||{};
    f.statusAppliedRound.confiant=s.round;
   }
  }
 }
 // Renforcé : effacer fatigue en fin de passe (pas au début de la suivante).
 for(const f of s.fighters){if((f.activeStatuses||[]).includes('renforce'))f.fatigue=Math.max(0,f.fatigue-1);if((f.activeStatuses||[]).includes('avantage')&&!earthPersistentAdvantage(s,f.id))f.statuses=f.statuses.filter(x=>x!=='avantage');}
 s.phase='fin';
 s.snapshots.push(before);
 s.history.push({round:s.round,phase:'fin',events:[{kind:'round_end',detail:'Fin de passe',reason:'Résolution des effets de fin de passe (annulable)'}]});
 }catch(err){for(const key of Object.keys(s))if(!Object.prototype.hasOwnProperty.call(before,key))delete s[key];Object.assign(s,rollback);throw err;}
}
// Repères temporaires purement narratifs, sans modification des règles mécaniques.
function addTemporaryEffect(s,targetId,label,duration,origin={}){
 const transactionRollback=clone(s);
 try{
 if(s.proposals.length)throw Error('Effet temporaire : valider les propositions en attente');
 fighter(s,targetId);
 if(typeof label!=='string'||!label.trim()||label.trim().length>120)throw Error('Effet temporaire : libellé de 1 à 120 caractères requis');
 if(!['round','scene','manual'].includes(duration))throw Error('Effet temporaire : durée invalide');
 if((s.temporaryEffects||[]).length>=10000)throw Error('Limite de 10 000 effets temporaires atteinte');
 if(!origin||typeof origin!=='object'||Array.isArray(origin))throw Error('Origine invalide');
 const originType=origin.type||'mj';
 if(!['mj','technique','personnage'].includes(originType))throw Error('Type d’origine invalide');
 const originLabel=origin.label===undefined?'':origin.label;
 if(typeof originLabel!=='string'||originLabel.length>120)throw Error('Libellé d’origine invalide');
 const originSourceId=origin.sourceId===undefined?null:origin.sourceId;
 if(originSourceId!==null&&(originType!=='personnage'||!s.fighters.some(f=>f.id===originSourceId)))throw Error('Personnage d’origine invalide');
 if(originType==='personnage'&&originSourceId===null)throw Error('Personnage d’origine requis');
 const before=clone({...s,snapshots:[]});
 const item={id:uid('temp',s.seq++),targetId,label:label.trim(),duration,createdRound:s.round,createdScene:s.scene||1,originType,originLabel:originLabel.trim(),originSourceId};
 (s.temporaryEffects||(s.temporaryEffects=[])).push(item);
 s.snapshots.push(before);
 s.history.push({round:s.round,phase:s.phase,events:[{kind:'temp_add',targetId,detail:item.label,reason:'Repère narratif temporaire ('+duration+')'}]});
 return item.id;
 }catch(err){for(const key of Object.keys(s))if(!Object.prototype.hasOwnProperty.call(transactionRollback,key))delete s[key];Object.assign(s,transactionRollback);throw err;}
}
function editTemporaryEffect(s,id,label,duration,origin){
 const transactionRollback=clone(s);
 try{
 if(s.proposals.length)throw Error('Effet temporaire : valider les propositions en attente');
 const item=(s.temporaryEffects||[]).find(x=>x.id===id);
 if(!item)throw Error('Effet temporaire introuvable');
 if(item.originLabel==='Étoile de lave')throw Error('Étoile de lave : utiliser les commandes dédiées');
 if(item.originLabel==='Entraves de métal')throw Error('Entraves de métal : libérer les entraves avant modification');
 if(((item.originLabel==='Bouclier de roche'&&item.shieldGrantedGene!==undefined)||(item.originLabel==='Armure de terre'&&Number.isInteger(item.armorPoints))))throw Error('Effet mécanique de Terre : utiliser les commandes de la technique pour le retirer ; modification générique interdite');
 if(typeof label!=='string'||!label.trim()||label.trim().length>120)throw Error('Effet temporaire : libellé de 1 à 120 caractères requis');
 if(!['round','scene','manual'].includes(duration))throw Error('Effet temporaire : durée invalide');
 // Argument facultatif : les appels des versions précédentes conservent la provenance.
 const type=origin===undefined?(item.originType||'mj'):origin?.type;
 const sourceId=origin===undefined?(item.originSourceId||null):(origin.sourceId===undefined?null:origin.sourceId);
 const originLabel=origin===undefined?(item.originLabel||''):(origin.label===undefined?'':origin.label);
 if(!['mj','technique','personnage'].includes(type))throw Error('Type d’origine invalide');
 if(typeof originLabel!=='string'||originLabel.length>120)throw Error('Libellé d’origine invalide');
 if(sourceId!==null&&(type!=='personnage'||!s.fighters.some(f=>f.id===sourceId)))throw Error('Personnage d’origine invalide');
 if(type==='personnage'&&sourceId===null)throw Error('Personnage d’origine requis');
 const cleaned=label.trim(),cleanOrigin=originLabel.trim();
 if(item.label===cleaned&&item.duration===duration&&(item.originType||'mj')===type&&(item.originLabel||'')===cleanOrigin&&(item.originSourceId||null)===sourceId)return false;
 const before=clone({...s,snapshots:[]});
 item.label=cleaned;item.duration=duration;item.originType=type;item.originLabel=cleanOrigin;item.originSourceId=sourceId;
 s.snapshots.push(before);
 s.history.push({round:s.round,phase:s.phase,events:[{kind:'temp_edit',targetId:item.targetId,detail:cleaned,reason:'Modification du repère narratif par le MJ'}]});
 return true;
 }catch(err){for(const key of Object.keys(s))if(!Object.prototype.hasOwnProperty.call(transactionRollback,key))delete s[key];Object.assign(s,transactionRollback);throw err;}
}
// V2.10 : libération des entraves avec justification explicite, y compris maîtrise du métal.
// Les contrôles génériques restent utilisables par le MJ pour une libération narrative.
function releaseEarthMetal(s,id,reason,confirmed=false,metalMasteryConfirmed=false){
 const transactionRollback=clone(s);
 try{
 if(confirmed!==true)throw Error('Entraves de métal : confirmation MJ requise');
 if(!['metal_mastery','combat_end','mj_release'].includes(reason))throw Error('Entraves de métal : motif de libération invalide');
 if(reason==='metal_mastery'&&metalMasteryConfirmed!==true)throw Error('Entraves de métal : maîtrise du métal de la cible non confirmée');
 const item=(s.temporaryEffects||[]).find(x=>x.id===id&&x.originLabel==='Entraves de métal');
 if(!item)throw Error('Entraves de métal : entraves introuvables');
 const released=removeTemporaryEffect(s,id);
 if(released){
  const last=s.history[s.history.length-1];
  if(last&&last.events&&last.events.length)last.events[0].reason='Entraves de métal : '+({metal_mastery:'libération par maîtrise du métal',combat_end:'fin du combat',mj_release:'libération narrative du MJ'}[reason]);
 }
 return released;
 }catch(err){for(const key of Object.keys(s))if(!Object.prototype.hasOwnProperty.call(transactionRollback,key))delete s[key];Object.assign(s,transactionRollback);throw err;}
}
function removeTemporaryEffect(s,id){
 const transactionRollback=clone(s);
 try{
 if(s.proposals.length)throw Error('Effet temporaire : valider les propositions en attente');
 const effects=s.temporaryEffects||[];const item=effects.find(x=>x.id===id);
 if(!item)throw Error('Effet temporaire introuvable');
 // V1.81 : le bouton générique Retirer doit respecter les règles des effets
 // mécaniques. Il ne doit jamais contourner la révocation du bouclier ou
 // l'expiration d'Avantagé lors de la disparition d'une armure.
 if(item.originLabel==='Entraves de métal'){
  const before=clone({...s,snapshots:[]});
  s.temporaryEffects=effects.filter(x=>x.id!==id);
  // V2.10 : transférer les provenances avant de retirer un lien parmi plusieurs.
  // Sinon le dernier lien pouvait effacer un Gêné/Avantagé indépendant,
  // simplement parce que le premier lien en détenait la preuve.
  const sameTarget=s.temporaryEffects.filter(x=>x.originLabel==='Entraves de métal'&&x.targetId===item.targetId);
  if(sameTarget.length&&item.metalExternalGene===true)sameTarget[0].metalExternalGene=true;
  const sameCaster=s.temporaryEffects.filter(x=>x.originLabel==='Entraves de métal'&&x.originSourceId===item.originSourceId);
  if(sameCaster.length){
   if(item.metalExternalAdvantage===true)sameCaster[0].metalExternalAdvantage=true;
   if(item.metalGrantedAdvantage===true&&!sameCaster.some(x=>x.metalGrantedAdvantage===true))sameCaster[0].metalGrantedAdvantage=true;
  }
  // V2.10 : préserver Gêné si une source indépendante est encore active.
  if(!s.temporaryEffects.some(x=>x.originLabel==='Entraves de métal'&&x.targetId===item.targetId)){
   const target=fighter(s,item.targetId);
   const otherSource=item.metalExternalGene||s.temporaryEffects.some(x=>x.originLabel==='Bouclier de roche'&&x.targetId===item.targetId)||
    (target.roundStatuses||[]).some(x=>x.status==='gene'&&x.expiresAfterRound>=s.round);
   if(!otherSource){target.statuses=target.statuses.filter(x=>x!=='gene');if(target.statusAppliedRound)delete target.statusAppliedRound.gene;}
  }
  // Si le dernier lien métallique disparaît, recalculer l'avantage même
  // lorsque plusieurs paires ont été créées avec des provenances différentes.
  const caster=fighter(s,item.originSourceId);
  const otherMetal=s.temporaryEffects.some(x=>x.originLabel==='Entraves de métal'&&x.originSourceId===caster.id&&fighter(s,x.targetId).statuses.includes('gene')&&isEngaged(s,caster.id,x.targetId));
  if(!otherMetal&&item.metalGrantedAdvantage&&!item.metalExternalAdvantage&&!s.temporaryEffects.some(x=>x.originLabel==='Entraves de métal'&&x.originSourceId===caster.id&&x.metalExternalAdvantage)&&!earthLavaOtherAdvantage(s,caster.id,null)){
   caster.statuses=caster.statuses.filter(x=>x!=='avantage');if(caster.statusAppliedRound)delete caster.statusAppliedRound.avantage;
  }
  syncEarthMetalAdvantage(s);
  s.snapshots.push(before);
  s.history.push({round:s.round,phase:s.phase,events:[{kind:'earth_metal_release',targetId:item.targetId,detail:item.label,reason:'Entraves de métal : libération confirmée par le MJ'}]});
  return true;
 }
 if(item.originLabel==='Étoile de lave')return resolveEarthLava(s,id,'extinguish',true);
 if(item.originLabel==='Bouclier de roche'){
  mutateEarthShield(s,id,'revoke',true);
  return true;
 }
 if(item.originLabel==='Armure de terre'&&Number.isInteger(item.armorPoints)){
  const before=clone({...s,snapshots:[]});
  s.temporaryEffects=effects.filter(x=>x.id!==id);
  releaseEarthArmorAdvantage(s,item);
  s.snapshots.push(before);
  s.history.push({round:s.round,phase:s.phase,events:[{kind:'earth_armor_revoke',targetId:item.targetId,detail:item.label,reason:'Armure de terre : retrait confirmé par le MJ'}]});
  return true;
 }
 const before=clone({...s,snapshots:[]});
 s.temporaryEffects=effects.filter(x=>x.id!==id);
 s.snapshots.push(before);
 s.history.push({round:s.round,phase:s.phase,events:[{kind:'temp_remove',targetId:item.targetId,detail:item.label,reason:'Retrait confirmé par le MJ'}]});
 return true;
 }catch(err){for(const key of Object.keys(s))if(!Object.prototype.hasOwnProperty.call(transactionRollback,key))delete s[key];Object.assign(s,transactionRollback);throw err;}
}
// V1.81 : les avantages de Terre persistants ne s'effacent pas en fin de passe.
function independentEarthAdvantage(s,targetId){
 const f=fighter(s,targetId);
 if(!f.statuses.includes('avantage'))return false;
 const effects=s.temporaryEffects||[];
 if(effects.some(e=>(e.targetId===targetId&&(e.armorExternalAdvantage===true||e.lavaExternalAdvantage===true))||(e.originSourceId===targetId&&e.originLabel==='Entraves de métal'&&e.metalExternalAdvantage===true)))return true;
 const timed=(f.roundStatuses||[]).filter(e=>e.status==='avantage'&&e.expiresAfterRound>=s.round);
 return timed.some(e=>e.external===true)||(!timed.length&&!earthPersistentAdvantage(s,targetId));
}
function persistentEarthStatus(e){return ['Armure de terre :','Étoile de lave :','Entraves de métal :','Bouclier de roche :'].some(prefix=>String(e.reason||'').startsWith(prefix));}
function earthPersistentAdvantage(s,targetId){
 return (s.temporaryEffects||[]).some(e=>e.targetId===targetId&&(e.originLabel==='Étoile de lave'||(e.originLabel==='Armure de terre'&&Number(e.armorPoints)>0)))||
  (s.temporaryEffects||[]).some(e=>e.originLabel==='Entraves de métal'&&e.originSourceId===targetId&&fighter(s,e.targetId).statuses.includes('gene')&&isEngaged(s,targetId,e.targetId));
}
function earthLavaOtherAdvantage(s,casterId,excludedId){
 return (s.temporaryEffects||[]).some(e=>e.id!==excludedId&&e.targetId===casterId&&((e.originLabel==='Étoile de lave')||(e.originLabel==='Armure de terre'&&e.armorPoints>0)))||
  (s.temporaryEffects||[]).some(e=>e.id!==excludedId&&e.originLabel==='Entraves de métal'&&e.originSourceId===casterId&&fighter(s,e.targetId).statuses.includes('gene')&&isEngaged(s,casterId,e.targetId))||
  !!(fighter(s,casterId).roundStatuses||[]).some(e=>e.status==='avantage'&&e.expiresAfterRound>=s.round);
}
function resolveEarthLava(s,id,operation,confirmed,overflowConditions=[]){
 if(confirmed!==true)throw Error('Étoile de lave : confirmation MJ requise');
 if(s.proposals.length)throw Error('Étoile de lave : valider les propositions en attente');
 const star=(s.temporaryEffects||[]).find(e=>e.id===id&&e.originLabel==='Étoile de lave');
 if(!star)throw Error('Étoile de lave : étoile introuvable');
 if(!['maintain','extinguish'].includes(operation))throw Error('Étoile de lave : opération invalide');
 if(operation==='maintain'&&(s.phase!=='fin'||star.lavaMaintainedRound===s.round))throw Error('Étoile de lave : entretien une seule fois, en fin de passe');
 const caster=fighter(s,star.targetId);
 const rollback=clone(s);
 const before=clone({...s,snapshots:[]});
 try{
  if(operation==='maintain'){
   // Reprise du moteur standard de fatigue : ne pas effacer le débordement.
   const e={id:uid('e',s.seq++),actionId:'earth_lava_maintenance',sourceId:caster.id,targetId:caster.id,kind:'fatigue',amount:1,detail:'',reason:'Étoile de lave : entretien de fin de passe',round:s.round,overflowConditions,fatigueType:'cost'};
   apply(s,e);star.lavaMaintainedRound=s.round;
   s.history.push({round:s.round,phase:s.phase,events:[e]});
  }else{
   s.temporaryEffects=s.temporaryEffects.filter(e=>e.id!==id);
   if(!star.lavaExternalAdvantage&&!earthLavaOtherAdvantage(s,caster.id,id)){
    caster.statuses=caster.statuses.filter(x=>x!=='avantage');
    if(caster.statusAppliedRound)delete caster.statusAppliedRound.avantage;
   }
   s.history.push({round:s.round,phase:s.phase,events:[{kind:'earth_lava_extinguish',targetId:caster.id,detail:star.label,reason:'Étoile de lave : extinction confirmée par le MJ'}]});
  }
  s.snapshots.push(before);
  return operation==='maintain'?'maintained':'extinguished';
 }catch(e){for(const key of Object.keys(s))if(!Object.prototype.hasOwnProperty.call(rollback,key))delete s[key];Object.assign(s,rollback);throw e;}
}
// Une attaque de l'étoile doit produire une conséquence offensive réelle sur une autre cible.
// Les coûts du lanceur, notes, postures et techniques défensives ne suffisent pas.
function earthLavaAttackEvent(e,attack){
 return e.actionId===attack.id && hostileEvent(e) && e.targetId!==attack.sourceId &&
  (!e.sourceId||e.sourceId===attack.sourceId) &&
  (e.kind==='fatigue'&&Number(e.amount)>0 ||
   e.kind==='condition'&&!!e.detail ||
   e.kind==='balance'&&Number(e.amount)!==0 ||
   e.kind==='status_add'&&!!e.detail);
}
function earthLavaResolvedHit(s,attack){
 const timeline=(s.history||[]).flatMap((h,hi)=>(h.events||[]).map((e,ei)=>({h,hi,ei,e})));
 return timeline.find(x=>x.h.round===s.round&&earthLavaAttackEvent(x.e,attack));
}
// Terre p.289 : Fracasser gratuit lié à une attaque réellement résolue avec l'étoile.
function earthLavaFracture(s,starId,attackId,description,confirmed){
 if(confirmed!==true)throw Error('Étoile de lave : confirmation MJ requise');
 if((s.proposals||[]).length)throw Error('Étoile de lave : résoudre les propositions en attente');
 const star=(s.temporaryEffects||[]).find(e=>e.id===starId&&e.originLabel==='Étoile de lave');
 if(!star)throw Error('Étoile de lave : étoile inactive');
 const attack=(s.actions||[]).find(a=>a.id===attackId&&a.sourceId===star.targetId&&a.round===s.round&&a.name!=='Étoile de lave');
 if(!attack)throw Error('Étoile de lave : attaque du porteur introuvable dans cette passe');
 if(attack.targetId===attack.sourceId)throw Error('Étoile de lave : une attaque doit viser une autre cible');
 // Une note de Fracasser ne constitue pas une attaque résolue. Vérifier la passe et la provenance.
 const resolved=earthLavaResolvedHit(s,attack);
 if(!resolved)throw Error('Étoile de lave : attaque non résolue');
 // Une étoile activée après l'attaque ne peut pas servir rétroactivement.
 if(star.originActionId){
  const timeline=(s.history||[]).flatMap((h,hi)=>(h.events||[]).map((e,ei)=>({h,hi,ei,e})));
  const activation=timeline.find(x=>x.e.actionId===star.originActionId&&x.e.kind==='fatigue');
  const hit=earthLavaResolvedHit(s,attack);
  if(!activation||!hit||hit.hi<activation.hi||(hit.hi===activation.hi&&hit.ei<=activation.ei))throw Error('Étoile de lave : attaque antérieure à l’activation de l’étoile');
 }
 if((s.lavaFractures||[]).some(x=>x.attackId===attackId))throw Error('Étoile de lave : destruction déjà accordée pour cette attaque');
 const detail=String(description||'').trim();
 if(!detail||detail.length>400)throw Error('Étoile de lave : décrire le décor tranché ou détruit (1 à 400 caractères)');
 const rollback=clone(s);
 const before=clone({...s,snapshots:[]});
 try{
  const entry={id:uid('lava',s.seq++),attackId,starId,casterId:star.targetId,round:s.round,description:detail};
  if(!s.lavaFractures)s.lavaFractures=[];
  s.lavaFractures.push(entry);
  s.history.push({round:s.round,phase:s.phase,events:[{kind:'note',actionId:attackId,sourceId:star.targetId,targetId:star.targetId,amount:0,detail:'',reason:'Étoile de lave : Fracasser gratuit du décor — '+detail,round:s.round}]});
  s.snapshots.push(before);
  return entry;
 }catch(e){for(const key of Object.keys(s))if(!Object.prototype.hasOwnProperty.call(rollback,key))delete s[key];Object.assign(s,rollback);throw e;}
}
function nextRound(s,overflowChoices={}){
 if(s.phase!=='fin')throw Error('Fin de passe requise');
 // V2.10 : ne jamais effacer des décisions MJ encore en attente lors du changement de passe.
 if((s.proposals||[]).length)throw Error('Passe suivante : valider ou refuser les propositions en attente avant de continuer');
 if(!Number.isInteger(s.round)||s.round<1||s.round>=100000)throw Error('Limite de 100 000 passes atteinte');
 // En danger : ne jamais perdre silencieusement la fatigue lorsque la jauge est pleine.
 // Prévalider tous les choix avant de modifier la passe.
 for(const f of s.fighters){
  if(!f.statuses.includes('en_danger')||f.fatigue<fatigueLimit(f))continue;
  const choice=overflowChoices[f.id];
  if(!resourceConditionNames(f).includes(choice)||f.conditions.includes(choice))
   throw Error(f.name+' : choisir un état libre pour la fatigue En danger (jauge pleine).');
 }
 const rollback=clone(s);
 const before=clone({...s,snapshots:[]});
 try{
 const oldRound=s.round;
 // Les étoiles non entretenues s'éteignent à la transition ; l'entretien n'est pas automatique.
 for(const star of (s.temporaryEffects||[]).filter(e=>e.originLabel==='Étoile de lave'&&e.lavaMaintainedRound!==s.round)){
  const caster=fighter(s,star.targetId);
  s.temporaryEffects=s.temporaryEffects.filter(e=>e.id!==star.id);
  if(!star.lavaExternalAdvantage&&!earthLavaOtherAdvantage(s,caster.id,star.id))caster.statuses=caster.statuses.filter(x=>x!=='avantage');
 }
 s.temporaryEffects=(s.temporaryEffects||[]).filter(e=>e.duration!=='round'||(Number.isInteger(e.expiresAfterRound)&&e.expiresAfterRound>s.round));
 // Expiration mécanique des statuts temporaires, avant la fatigue En danger.
 for(const f of s.fighters){
  const expiring=(f.roundStatuses||[]).filter(x=>x.expiresAfterRound<=s.round);
  for(const entry of expiring){
   // V1.81 : un statut à durée limitée ne peut pas supprimer la protection
   // encore fournie par une armure ou un bouclier de Terre persistant.
   // V1.81 : une autre durée encore active est également une source indépendante.
   // Ne pas laisser l'expiration d'une première source effacer la seconde.
   const futureSource=(f.roundStatuses||[]).some(x=>x!==entry&&x.status===entry.status&&x.expiresAfterRound>s.round);
   const independentSource=(f.roundStatuses||[]).some(x=>x.status===entry.status&&x.expiresAfterRound<=s.round&&x.external===true);
   // Reporter la provenance préexistante sur une source encore active.
   if(independentSource)for(const source of (f.roundStatuses||[])){if(source.status===entry.status&&source.expiresAfterRound>s.round)source.external=true;}
   const shields=entry.status==='gene'?(s.temporaryEffects||[]).filter(e=>e.originLabel==='Bouclier de roche'&&e.targetId===f.id):[];
   const armors=entry.status==='avantage'?(s.temporaryEffects||[]).filter(e=>e.originLabel==='Armure de terre'&&e.targetId===f.id&&Number(e.armorPoints)>0):[];
   const lavas=entry.status==='avantage'?(s.temporaryEffects||[]).filter(e=>e.originLabel==='Étoile de lave'&&e.targetId===f.id):[];
   // Si la source temporelle expire, tous les porteurs doivent abandonner sa
   // provenance, sinon le dernier bouclier/armure pourrait conserver le statut à tort.
   if(!futureSource&&!independentSource){
    for(const sh of shields){sh.shieldExternalGene=false;sh.shieldGrantedGene=true;}
    for(const armor of armors){armor.armorExternalAdvantage=false;armor.armorGrantedAdvantage=true;}
    for(const lava of lavas){lava.lavaExternalAdvantage=false;}
   }
   const metal=entry.status==='gene'&&(s.temporaryEffects||[]).some(e=>e.originLabel==='Entraves de métal'&&e.targetId===f.id);
   if(!futureSource&&!independentSource&&!shields.length&&!armors.length&&!lavas.length&&!metal){
    f.statuses=f.statuses.filter(x=>x!==entry.status);
    if(f.statusAppliedRound)delete f.statusAppliedRound[entry.status];
   }
  }
  f.roundStatuses=(f.roundStatuses||[]).filter(x=>x.expiresAfterRound>s.round);
 }
 s.round++;s.phase='declaration';s.actions=[];s.proposals=[];s.reedProtections=[];
 syncEarthMetalAdvantage(s);
 for(const f of s.fighters){if(f.windReserve&&f.windReserve.usableRound<s.round)delete f.windReserve;}
 for(const f of s.fighters){
  f.blocked=f.bonuses.filter(b=>b.type==='blocked'&&b.round===s.round).map(b=>b.approach);
  f.bonuses=f.bonuses.filter(b=>b.round>=s.round);
  f.endureAllowance=f.bonuses.filter(b=>b.type==='endure_extra'&&b.round===s.round).reduce((n,b)=>n+b.count,0);
  f.reactions=[];f.reedMayChangeApproach=false;
  f.approach=null;f.roll=null;f.activeStatuses=[];f.geneChoice='malus';
  if(f.statuses.includes('en_danger')){
   if(f.fatigue>=fatigueLimit(f))f.conditions.push(overflowChoices[f.id]);
   else f.fatigue++;
  }
 }
 // V1.81 : la transition de passe est une transaction réversible, y compris
 // l'expiration des effets et les conséquences du statut En danger.
 s.snapshots.push(before);
 s.history.push({round:oldRound,phase:'fin',events:[{kind:'next_round',targetId:null,detail:'Passe '+oldRound+' → '+s.round,reason:'Transition de passe et expiration des effets temporaires'}]});
 }catch(err){for(const key of Object.keys(s))if(!Object.prototype.hasOwnProperty.call(before,key))delete s[key];Object.assign(s,rollback);throw err;}
}
// V2.10 : clôture explicite du combat, distincte du changement de scène.
// Une seule transaction annule l'ensemble des entraves, sans toucher aux états
// indépendants ni aux ressources permanentes des combattants.
function endCombat(s,confirmed=false){
 if(confirmed!==true)throw Error('Fin du combat : confirmation MJ requise');
 if(s.proposals.length||s.actions.length)throw Error('Fin du combat : résoudre les propositions et actions en attente');
 if(s.phase!=='fin'&&s.phase!=='declaration')throw Error('Fin du combat : terminer la résolution en cours');
 if(s.phase==='declaration'&&s.fighters.some(f=>f.approach!==null||f.roll!==null))throw Error('Fin du combat : terminer les déclarations en cours');
 const bindings=(s.temporaryEffects||[]).filter(e=>e.originLabel==='Entraves de métal');
 if(!bindings.length)return 0;
 // Contrôler toutes les références avant de retirer la première entrave.
 for(const binding of bindings){fighter(s,binding.targetId);fighter(s,binding.originSourceId);}
 const rollback=clone(s);
 const before=clone({...s,snapshots:[]});
 const targets=new Set(bindings.map(e=>e.targetId));
 const casters=new Set(bindings.map(e=>e.originSourceId));
 try{
 s.temporaryEffects=s.temporaryEffects.filter(e=>e.originLabel!=='Entraves de métal');
 for(const id of targets){
  const f=fighter(s,id);
  const other=(s.temporaryEffects||[]).some(e=>e.originLabel==='Bouclier de roche'&&e.targetId===id)||
   (f.roundStatuses||[]).some(e=>e.status==='gene'&&e.expiresAfterRound>=s.round);
  if(!other&&!bindings.some(e=>e.targetId===id&&e.metalExternalGene)){f.statuses=f.statuses.filter(x=>x!=='gene');if(f.statusAppliedRound)delete f.statusAppliedRound.gene;}
 }
 for(const id of casters){
  const f=fighter(s,id);
  const own=bindings.filter(e=>e.originSourceId===id);
  if(own.some(e=>e.metalGrantedAdvantage)&&!own.some(e=>e.metalExternalAdvantage)&&!earthLavaOtherAdvantage(s,id,null)){
   f.statuses=f.statuses.filter(x=>x!=='avantage');if(f.statusAppliedRound)delete f.statusAppliedRound.avantage;
  }
 }
 syncEarthMetalAdvantage(s);
 s.snapshots.push(before);
 s.history.push({round:s.round,phase:s.phase,events:[{kind:'earth_metal_combat_end',targetId:null,amount:bindings.length,reason:'Fin du combat : toutes les entraves de métal ont été libérées (MJ)'}]});
 return bindings.length;
 }catch(err){for(const key of Object.keys(s))if(!Object.prototype.hasOwnProperty.call(before,key))delete s[key];Object.assign(s,rollback);throw err;}
}
// Changement de scène : remet à disposition le matériel, sans effacer les ressources
// permanentes ni modifier la passe en cours. Transaction annulable.
function newScene(s){
 if(s.proposals.length)throw Error('Nouvelle scène : valider les propositions en attente');
 if(s.phase!=='declaration'&&s.phase!=='fin')throw Error('Nouvelle scène : terminer la résolution de l’approche en cours');
 if(s.phase==='declaration'&&s.fighters.some(f=>f.approach!==null||f.roll!==null))throw Error('Nouvelle scène : effacer ou terminer les déclarations déjà engagées');
 if(s.actions.length)throw Error('Nouvelle scène : terminer les actions en attente');
 if(!Number.isInteger(s.scene||1)||(s.scene||1)<1||(s.scene||1)>=100000)throw Error('Limite de 100 000 scènes atteinte');
 const rollback=clone(s);
 const before=clone({...s,snapshots:[]});
 try{
 const oldScene=s.scene||1;
 // Les effets mécaniques liés à la scène doivent être révoqués par leur
 // logique métier : une simple suppression laisserait Gêné/Avantagé fantômes.
 // Conserver UNE transaction et UN seul undo pour tout le changement de scène.
 const sceneEffects=(s.temporaryEffects||[]).filter(e=>e.duration==='scene'&&e.originLabel!=='Entraves de métal');
 const historyLength=s.history.length,snapshotLength=s.snapshots.length;
 for(const effect of sceneEffects)removeTemporaryEffect(s,effect.id);
 s.history.length=historyLength;
 s.snapshots.length=snapshotLength;
 s.scene=oldScene+1;
 s.sceneTitle="";
 const affected=[];
 for(const f of s.fighters){
  f.bonuses=(f.bonuses||[]).filter(b=>b.type!=='disarmed_technique');
  if(f.equipmentDisabled){f.equipmentDisabled=false;affected.push(f.id)}
 }
 const removedTraps=(s.traps||[]).length;
 s.traps=[];
 s.snapshots.push(before);
 s.history.push({round:s.round,phase:s.phase,events:[{kind:'new_scene',sourceId:null,targetId:null,detail:'Scène '+s.scene,reason:'Nouvelle scène confirmée par le MJ',equipmentRestored:affected,trapsCleared:removedTraps}]});
 return s.scene;
 }catch(err){for(const key of Object.keys(s))if(!Object.prototype.hasOwnProperty.call(before,key))delete s[key];Object.assign(s,rollback);throw err;}
}
// Intitulé narratif de scène : transaction MJ, conservée et annulable.
function renameScene(s,title){
 if(s.proposals.length)throw Error('Nom de scène : valider les propositions en attente');
 if(typeof title!=='string'||!title.trim()||title.trim().length>120)throw Error('Nom de scène : saisir 1 à 120 caractères');
 const normalized=title.trim();
 if((s.sceneTitle||'')===normalized)return normalized;
 const before=clone({...s,snapshots:[]});
 s.sceneTitle=normalized;
 s.snapshots.push(before);
 s.history.push({round:s.round,phase:s.phase,events:[{kind:'scene_title',sourceId:null,targetId:null,detail:normalized,reason:'Intitulé confirmé par le MJ'}]});
 return normalized;
}
// Journal narratif de scène : notes datées par scène et passe, indépendantes des effets de combat.
function addSceneNote(s,content){
 if(s.proposals.length)throw Error('Journal : valider les propositions en attente');
 if(typeof content!=='string'||!content.trim()||content.trim().length>1000)throw Error('Journal : saisir 1 à 1000 caractères');
 // Même plafond que l'import : ne jamais créer une sauvegarde impossible à recharger.
 if((s.sceneJournal||[]).length>=100000)throw Error('Journal : limite de 100 000 notes atteinte');
 const before=clone({...s,snapshots:[]});
 const note={id:'scene-note-'+s.seq++,scene:s.scene||1,round:s.round,title:s.sceneTitle||'',text:content.trim()};
 (s.sceneJournal||(s.sceneJournal=[])).push(note);
 s.snapshots.push(before);
 s.history.push({round:s.round,phase:s.phase,events:[{kind:'scene_note',sourceId:null,targetId:null,detail:note.text,reason:'Note narrative du MJ',scene:note.scene}]});
 return note.id;
}
// Corrections du journal : opérations MJ atomiques, sans changer la scène historique.
function editSceneNote(s,id,content){
 if(s.proposals.length)throw Error('Journal : valider les propositions en attente');
 const note=(s.sceneJournal||[]).find(n=>n.id===id);
 if(!note)throw Error('Note introuvable');
 if(typeof content!=='string'||!content.trim()||content.trim().length>1000)throw Error('Journal : saisir 1 à 1000 caractères');
 const cleaned=content.trim();
 if(note.text===cleaned)return false;
 const before=clone({...s,snapshots:[]});
 note.text=cleaned;
 s.snapshots.push(before);
 s.history.push({round:s.round,phase:s.phase,events:[{kind:'scene_note_edit',sourceId:null,targetId:null,detail:cleaned,reason:'Note corrigée par le MJ',scene:note.scene}]});
 return true;
}
function removeSceneNote(s,id){
 if(s.proposals.length)throw Error('Journal : valider les propositions en attente');
 const notes=s.sceneJournal||[];
 const note=notes.find(n=>n.id===id);
 if(!note)throw Error('Note introuvable');
 const before=clone({...s,snapshots:[]});
 s.sceneJournal=notes.filter(n=>n.id!==id);
 s.snapshots.push(before);
 s.history.push({round:s.round,phase:s.phase,events:[{kind:'scene_note_remove',sourceId:null,targetId:null,detail:note.text,reason:'Note retirée par le MJ',scene:note.scene}]});
 return true;
}
// V1.14 : export CSV du journal, sans modifier la sauvegarde ni l'historique.
// Les champs sont systématiquement cités, les guillemets doublés et les
// cellules susceptibles d'être interprétées comme formules neutralisées.
function exportSceneJournalCSV(s,scene='all',search=''){
 if(scene!=='all'&&(!Number.isInteger(Number(scene))||Number(scene)<1||Number(scene)>100000))throw Error('Filtre de scène invalide');
 const query=String(search).trim().toLocaleLowerCase('fr');
 const quote=value=>{
  let v=String(value??'');
  if(/^[\s\uFEFF]*[=+@-]/.test(v))v="'"+v;
  return '"'+v.replace(/"/g,'""')+'"';
 };
 const rows=[['Scène','Titre','Passe','Note']];
 for(const n of (s.sceneJournal||[])){
  if(scene!=='all'&&n.scene!==Number(scene))continue;
  if(query&&!n.text.toLocaleLowerCase('fr').includes(query)&&!(n.title||'').toLocaleLowerCase('fr').includes(query))continue;
  rows.push([n.scene,n.title||'',n.round,n.text]);
 }
 return '\uFEFF'+rows.map(row=>row.map(quote).join(';')).join('\r\n')+'\r\n';
}
// Déclenchement différé explicite : le MJ confirme l'entrée d'un adversaire.
// L'ensemble (état, équilibre, consommation du piège) est atomique et annulable.
function triggerTrap(s,trapId,targetId,condition,direction){
 if(s.proposals.length)throw Error('Piège : valider les propositions en attente');
 const trap=(s.traps||[]).find(x=>x.id===trapId);
 if(!trap)throw Error('Piège introuvable ou déjà déclenché');
 const target=fighter(s,targetId),owner=fighter(s,trap.ownerId);
 if(target.id===owner.id)throw Error('Piège : le propriétaire ne peut pas être la cible');
 // Les camps ne sont pas déductibles de PJ/PNJ : le MJ confirme l'adversaire.
 const allowed=resourceConditionNames(target);
 if(!allowed.includes(condition)||target.conditions.includes(condition))throw Error('Piège : choisir un état non coché');
 if(![-1,1].includes(direction))throw Error('Piège : direction du décentrage requise');
 const before=clone({...s,snapshots:[]});
 const action={id:uid('trap-trigger',s.seq++),sourceId:owner.id,targetId:target.id};
 const events=[event(s,action,'condition',target.id,0,condition,'Pose de pièges : entrée dans '+trap.zone),event(s,action,'balance',target.id,direction,'','Pose de pièges : décentrage')];
 const draft=clone(s);
 for(const e of events)apply(draft,e);
 draft.traps=draft.traps.filter(x=>x.id!==trapId);
 Object.assign(s,draft);
 s.snapshots.push(before);
 s.history.push({round:s.round,phase:s.phase,events});
 return events;
}
function previewCommit(s,decisions={}){return commit(clone(s),decisions,true)}
const CombatCore={APPROACHES,STATUS,fighterRemovalBlock,removeFighter,requiredFighterStatuses,updateFighter,previewCommit,createCombat,addFighter,fighter,isEngaged,setEngagement,clearEngagements,disengageFighter,declare,reveal,allowance,setGeneChoice,escapeTrap,queueTechnique,resolveReedBet,changeReedApproach,revealCountertime,waiveCountertime,propose,manual,commit,spendEarthArmor,resolveEarthArmorHit,resolveEarthMudStrike,resolveEarthSeismicInterrupt,resolveEarthLava,earthLavaFracture,undo,advance,endRound,nextRound,triggerTrap,newScene,endCombat,renameScene,addSceneNote,editSceneNote,removeSceneNote,exportSceneJournalCSV,addTemporaryEffect,editTemporaryEffect,removeTemporaryEffect,releaseEarthMetal,mutateEarthShield};
export { CombatCore };
