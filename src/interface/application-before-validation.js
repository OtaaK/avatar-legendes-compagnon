let lib=Roster.createLibrary();
const techniques={defendre:['Riposter','Protection','Fort comme un chêne','Se mettre à l’abri','Serrer les dents'],attaquer:['Frapper','Presser l’adversaire','Charge','Frappe dévastatrice','Acharnement'],esquiver:['Dérobade','Observation rapide','Trouver la faille']};
function setGeneCombatChoice(id,choice){try{CombatCore.setGeneChoice(s,id,choice);render()}catch(e){alert(e.message)}}
function demo(){s=CombatCore.createCombat();render()}
function add(kind){CombatCore.addFighter(s,kind+' '+s.seq,kind);render()}
function setApproach(id,value){try{CombatCore.declare(s,id,value,$('roll-'+id)?.value||'7-9')}catch(e){alert(e.message)}render()}
function setRoll(id,value){const f=CombatCore.fighter(s,id);f.roll=value;render()}
let currentCombatTab='fighters';
function setCombatTab(tab){
 if(!['fighters','round','technique','approval'].includes(tab))return;
 currentCombatTab=tab;
 document.querySelectorAll('.combat-panel').forEach(p=>p.hidden=p.dataset.combatTab!==tab);
 document.querySelectorAll('[data-combat-nav]').forEach(b=>{const active=b.dataset.combatNav===tab;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active))});
 try{localStorage.setItem('avatar-combat-tab',tab)}catch(e){}
}
function quickSheetResource(kind,delta){
 try{
  const id=$('sheetSelect').value;if(!id)throw Error('Sélectionne un personnage');
  saveSheet(true);
  const c=lib.characters.find(x=>x.id===id);
  const limits=kind==='fatigue'?[0,5]:[-3,3];
  const value=Math.min(limits[1],Math.max(limits[0],c[kind]+delta));
  if(value===c[kind])return;
  commitLibraryMutation(()=>Roster.updateCharacter(lib,id,{[kind]:value}));renderSheets(id);
 }catch(e){alert(e.message)}
}
function quickSheetCondition(name){
 try{const id=$('sheetSelect').value;saveSheet(true);commitLibraryMutation(()=>Roster.toggleCondition(lib,id,name));renderSheets(id)}catch(e){alert(e.message)}
}
function refreshSheetQuick(){
 const c=lib.characters.find(x=>x.id===$('sheetSelect').value);if(!c)return;
 renderSheetQuick({...c,name:$('sheetName')?.value??c.name,fatigue:Number($('sheetFatigue')?.value??c.fatigue),balance:Number($('sheetBalance')?.value??c.balance)});
}
function renderSheetQuick(c){
 const bar=$('sheetQuick');if(!bar)return;
 if(!c){bar.innerHTML='';return}
 bar.innerHTML=`<strong>${safe(c.name)}</strong><button type="button" data-ui-click="includeSheet" data-id="${safe(c.id)}" ${s.fighters.some(f=>f.characterId===c.id)?'disabled':''}>${s.fighters.some(f=>f.characterId===c.id)?'Déjà dans le combat':'Ajouter au combat'}</button><div class="resource"><span>Fatigue</span><button class="alt" aria-label="Retirer une fatigue" onclick="quickSheetResource('fatigue',-1)">−</button><output>${safe(c.fatigue)}/5</output><button aria-label="Ajouter une fatigue" onclick="quickSheetResource('fatigue',1)">+</button></div>
 <div class="resource"><span>Équilibre</span><button class="alt" aria-label="Diminuer l’équilibre" onclick="quickSheetResource('balance',-1)">−</button><output>${c.balance>0?'+':''}${safe(c.balance)}</output><button aria-label="Augmenter l’équilibre" onclick="quickSheetResource('balance',1)">+</button></div>
 <div class="quick-conditions">${Roster.CONDITIONS.map(n=>`<button class="pill negative ${c.conditions.includes(n)?'active':''}" aria-pressed="${c.conditions.includes(n)}" data-ui-click="quickSheetCondition" data-id="${safe(n)}">${c.conditions.includes(n)?'✓ ':''}${safe(n)}</button>`).join('')}</div>`;
}
function disengageOne(id){try{const f=CombatCore.fighter(s,id);if(confirm('Rompre tous les engagements de '+f.name+' ? Cette opération peut être annulée.'))CombatCore.disengageFighter(s,id);render()}catch(e){alert(e.message);render()}}
function clearAllEngagements(){try{if(!(s.engagements||[]).length)return;if(confirm('Rompre tous les engagements actuels ? Cette opération peut être annulée.'))CombatCore.clearEngagements(s);render()}catch(e){alert(e.message);render()}}
function changeEngagement(a,b,checked){try{CombatCore.setEngagement(s,a,b,checked);render()}catch(e){alert(e.message);render()}}
function triggerTrapUI(id){try{
 const trap=(s.traps||[]).find(x=>x.id===id);if(!trap)return;
 const targets=s.fighters.filter(f=>f.id!==trap.ownerId);
 if(!targets.length)throw Error('Aucun adversaire disponible');
 const answer=prompt('Adversaire entré dans '+trap.zone+' ?\n'+targets.map((f,i)=>(i+1)+'. '+f.name).join('\n'),'1');
 if(answer===null)return;
 const target=targets[Number(answer)-1];if(!target)throw Error('Adversaire invalide');
 const choices=['Terrifié','En colère','Coupable','Fragile','Confus'].filter(x=>!target.conditions.includes(x));
 const chosen=prompt('État à cocher :\n'+choices.map((c,i)=>(i+1)+'. '+c).join('\n'),'1');if(chosen===null)return;
 const condition=choices[Number(chosen)-1];if(!condition)throw Error('État invalide');
 const dir=prompt('Direction du décentrage (+1 ou -1)','1');if(dir===null)return;
 if(!confirm('Déclencher le piège et appliquer état + équilibre à '+target.name+' ?'))return;
 CombatCore.triggerTrap(s,id,target.id,condition,Number(dir));render();
}catch(e){alert(e.message);render()}}
function renameSceneUI(){try{const title=prompt("Nom de la scène (1 à 120 caractères)",s.sceneTitle||"");if(title===null)return;CombatCore.renameScene(s,title);render()}catch(e){alert(e.message)}}
function editSceneNoteUI(id){try{const note=(s.sceneJournal||[]).find(n=>n.id===id);if(!note)throw Error('Note introuvable');const content=prompt('Corriger la note narrative',note.text);if(content===null)return;CombatCore.editSceneNote(s,id,content);render()}catch(e){alert(e.message)}}
function removeSceneNoteUI(id){try{if(!confirm('Supprimer cette note narrative ?'))return;CombatCore.removeSceneNote(s,id);render()}catch(e){alert(e.message)}}
function addSceneNoteUI(){try{const note=prompt("Note narrative de scène (1 à 1000 caractères)","");if(note===null)return;CombatCore.addSceneNote(s,note);render()}catch(e){alert(e.message)}}
function addTemporaryEffectUI(){try{
 const choices=s.fighters.map((f,i)=>(i+1)+'. '+f.name).join('\n');
 const target=prompt('Combattant concerné :\n'+choices,'1');if(target===null)return;
 const f=s.fighters[Number(target)-1];if(!f)throw Error('Combattant invalide');
 const label=prompt('Description de l’effet temporaire (narratif uniquement)');if(label===null)return;
 const duration=prompt('Durée : 1 = fin de passe, 2 = fin de scène, 3 = retrait manuel','2');if(duration===null)return;
 const scope={'1':'round','2':'scene','3':'manual'}[duration];
 const originChoice=prompt('Origine : 1 = décision MJ, 2 = technique, 3 = personnage','1');if(originChoice===null)return;
 const originType={'1':'mj','2':'technique','3':'personnage'}[originChoice];if(!originType)throw Error('Origine invalide');
 let origin={type:originType};
 if(originType==='technique'){const name=prompt('Nom de la technique (facultatif)','');if(name===null)return;origin.label=name;}
 if(originType==='personnage'){const who=prompt('Personnage à l’origine :\n'+choices,'1');if(who===null)return;const source=s.fighters[Number(who)-1];if(!source)throw Error('Personnage d’origine invalide');origin.sourceId=source.id;}
 CombatCore.addTemporaryEffect(s,f.id,label,scope,origin);render();
}catch(e){alert(e.message)}}
function editTemporaryEffectUI(id){try{
 const item=(s.temporaryEffects||[]).find(e=>e.id===id);if(!item)throw Error('Effet temporaire introuvable');
 const label=prompt('Modifier la description de l’effet',item.label);if(label===null)return;
 const current={round:'1',scene:'2',manual:'3'}[item.duration];
 const choice=prompt('Durée : 1 = fin de passe, 2 = fin de scène, 3 = retrait manuel',current);if(choice===null)return;
 const currentOrigin={mj:'1',technique:'2',personnage:'3'}[item.originType||'mj'];
 const originChoice=prompt('Origine : 1 = décision MJ, 2 = technique, 3 = personnage',currentOrigin);if(originChoice===null)return;
 const type={'1':'mj','2':'technique','3':'personnage'}[originChoice];if(!type)throw Error('Origine invalide');
 const origin={type};
 if(type==='technique'){const name=prompt('Nom de la technique (facultatif)',item.originType==='technique'?(item.originLabel||''):'');if(name===null)return;origin.label=name;}
 if(type==='personnage'){
  const choices=s.fighters.map((f,i)=>(i+1)+'. '+f.name).join('\n');
  const defaultIndex=Math.max(0,s.fighters.findIndex(f=>f.id===item.originSourceId))+1;
  const who=prompt('Personnage à l’origine :\n'+choices,String(defaultIndex));if(who===null)return;
  const source=s.fighters[Number(who)-1];if(!source)throw Error('Personnage d’origine invalide');origin.sourceId=source.id;
 }
 CombatCore.editTemporaryEffect(s,id,label,{'1':'round','2':'scene','3':'manual'}[choice],origin);render();
}catch(e){alert(e.message)}}
function removeTemporaryEffectUI(id){try{
 const item=(s.temporaryEffects||[]).find(e=>e.id===id);
 if(item?.originLabel==='Entraves de métal'){
  const answer=prompt('Libérer les entraves : 1 = la cible maîtrise le métal ; 2 = fin du combat ; 3 = décision narrative du MJ. Annuler = conserver.','3');
  if(answer===null)return;
  const reason={'1':'metal_mastery','2':'combat_end','3':'mj_release'}[answer];
  if(!reason)throw Error('Entraves de métal : choisir 1, 2 ou 3');
  if(!confirm(reason==='metal_mastery'?'MJ : confirmer que la cible maîtrise le métal et se libère ?':'MJ : confirmer la libération des entraves ?'))return;
  commitCombatMutation(()=>CombatCore.releaseEarthMetal(s,id,reason,true,reason==='metal_mastery'));
 }else{
  if(!confirm('Retirer cet effet temporaire ?'))return;
  commitCombatMutation(()=>CombatCore.removeTemporaryEffect(s,id));
 }
 render();
}catch(e){alert(e.message)}}
function endCombatUI(){try{if(!confirm("MJ : terminer le combat et libérer toutes les Entraves de métal ? Les autres effets et ressources seront conservés. Cette opération peut être annulée."))return;const count=commitCombatMutation(()=>CombatCore.endCombat(s,true));render();if(count===0)alert("Aucune Entrave de métal active à libérer.")}catch(e){alert(e.message);render()}}
function newSceneUI(){try{if(!confirm('Commencer une nouvelle scène ? Les équipements seront réactivés et les pièges de la scène précédente retirés. Les fatigues, états et matériels seront conservés.'))return;CombatCore.newScene(s);render()}catch(e){alert(e.message)}}
function resolveReedBetUI(id){try{
 if(!confirm('MJ : révéler le pari secret après déclaration de toutes les approches ?'))return;
 const won=CombatCore.resolveReedBet(s,id,true);
 if(!won&&confirm('Prédiction incorrecte. Modifier maintenant l’approche du personnage ?')){
  const bet=s.temporaryEffects.find(e=>e.id===id);
  const options=CombatCore.APPROACHES;
  const answer=prompt('Approche : '+options.map((x,i)=>(i+1)+' = '+x).join(', '),'1');
  if(answer!==null){const index=Number(answer)-1;if(!options[index])throw Error('Approche invalide');CombatCore.changeReedApproach(s,bet.targetId,options[index]);}
 }
 render();
}catch(e){alert(e.message)}}
function waiveCountertimeUI(id){try{
 if(!confirm('À contretemps : l’adversaire est Étourdi ou Piégé et ne peut pas déclarer. Renoncer explicitement à la révélation anticipée ? Cette décision MJ sera journalisée.'))return;
 commitCombatMutation(()=>CombatCore.waiveCountertime(s,id,true));render();
 }catch(e){alert(e.message);}}
function revealCountertimeUI(id){try{
 if(!confirm('MJ : révéler l’approche de l’adversaire AVANT que le bénéficiaire ne choisisse la sienne ?'))return;
 const approach=commitCombatMutation(()=>CombatCore.revealCountertime(s,id,true));
 alert('Approche révélée : '+approach+'. Le bénéficiaire peut maintenant choisir son approche.');render();
}catch(e){alert(e.message)}}
function earthLavaUI(id,operation){try{
 const star=s.temporaryEffects.find(e=>e.id===id&&e.originLabel==='Étoile de lave');
 if(!star)throw Error('Étoile de lave : effet introuvable');
 if(operation==='maintain'&&CombatCore.fighter(s,star.targetId).fatigue>=5)throw Error('Étoile de lave : fatigue insuffisante pour entretenir l’étoile ; la laisser s’éteindre ou l’éteindre maintenant.');
 if(!confirm(operation==='maintain'?'MJ : payer 1 fatigue en fin de passe pour conserver l’étoile ?':'MJ : éteindre l’étoile de lave ?'))return;
 commitCombatMutation(()=>CombatCore.resolveEarthLava(s,id,operation,true));render();
}catch(e){alert(e.message)}}
function earthLavaFractureUI(id){try{
 const star=s.temporaryEffects.find(e=>e.id===id&&e.originLabel==='Étoile de lave');
 if(!star)throw Error('Étoile de lave : étoile inactive');
 const timeline=(s.history||[]).flatMap((h,hi)=>(h.events||[]).map((e,ei)=>({h,hi,ei,e})));
 const activation=star.originActionId?timeline.find(x=>x.e.actionId===star.originActionId&&x.e.kind==='fatigue'):null;
 const eligible=(s.actions||[]).filter(a=>{
  if(a.sourceId!==star.targetId||a.round!==s.round||a.name==='Étoile de lave'||a.targetId===a.sourceId||(s.lavaFractures||[]).some(x=>x.attackId===a.id))return false;
  const hit=earthLavaResolvedHit(s,a);
  return !!hit&&(!star.originActionId||(!!activation&&(hit.hi>activation.hi||(hit.hi===activation.hi&&hit.ei>activation.ei))));
 });
 if(!eligible.length)throw Error('Étoile de lave : aucune attaque résolue et non utilisée pendant cette passe');
 const choices=eligible.map((a,i)=>(i+1)+'. '+a.name+' ['+a.id+']').join('\n');
 const answer=prompt('Quelle attaque a utilisé l’étoile de lave pour frapper ?\n'+choices,'1');
 if(answer===null)return;
 const index=Number(answer)-1;
 if(!Number.isInteger(index)||index<0||index>=eligible.length)throw Error('Étoile de lave : numéro d’attaque invalide');
 const detail=prompt('Décrire la portion de décor tranchée ou détruite gratuitement (Fracasser) :','');
 if(detail===null)return;
 if(!confirm('MJ : confirmer que cette attaque a utilisé l’étoile et que la destruction du décor est gratuite ?'))return;
 commitCombatMutation(()=>CombatCore.earthLavaFracture(s,id,eligible[index].id,detail,true));render();
}catch(e){alert(e.message)}}
function spendEarthArmorUI(id,mode){try{
 if(!confirm('MJ : confirmer qu’une attaque inflige '+(mode==='condition'?'un état':'au moins 2 fatigues')+' et que ses dégâts ne sont pas déjà appliqués ?'))return;
 const remaining=commitCombatMutation(()=>CombatCore.spendEarthArmor(s,id,mode,true));
 render();alert('Armure de terre : '+remaining+' point(s) restant(s). Les dégâts annulés ne doivent pas être appliqués une seconde fois.');
}catch(e){alert(e.message)}}
function resolveEarthArmorHitUI(id){try{
 const kind=prompt('Armure de terre : type d’impact entrant ? fatigue ou condition','fatigue');if(kind===null)return;
 const raw=prompt(kind==='fatigue'?'Nombre de fatigues entrantes (1 à 20)':'État entrant (Terrifié, En colère, Coupable, Fragile, Confus)',kind==='fatigue'?'2':'Terrifié');if(raw===null)return;
 const amount=kind==='fatigue'?Number(raw):raw.trim();
 const pointsRaw=prompt('Points de réserve à dépenser (au moins 1, obligatoire pour chaque attaque)', '1');if(pointsRaw===null)return;
 const points=Number(pointsRaw);
 const armor=s.temporaryEffects.find(e=>e.id===id&&e.originLabel==='Armure de terre');
 const wearer=armor?CombatCore.fighter(s,armor.targetId):null;
 const residual=kind==='fatigue'?Math.max(0,amount-2*points):0;
 const overflow=wearer?Math.max(0,wearer.fatigue+residual-5):0;
 let overflowConditions=[];
 if(overflow){
  const available=['Terrifié','En colère','Coupable','Fragile','Confus'].filter(c=>!wearer.conditions.includes(c));
  const rawOverflow=prompt('Fatigue excédentaire : choisir '+overflow+' état(s) distinct(s) parmi '+available.join(', ')+' (séparés par des virgules)',available.slice(0,overflow).join(', '));
  if(rawOverflow===null)return;
  overflowConditions=rawOverflow.split(',').map(x=>x.trim());
 }
 if(!confirm('MJ : cet impact n’a PAS déjà été appliqué ? Résoudre atomiquement l’impact et la protection ?'))return;
 const result=commitCombatMutation(()=>CombatCore.resolveEarthArmorHit(s,id,kind,amount,points,true,overflowConditions));
 render();alert('Armure de terre : '+result.remaining+' point(s) restant(s) ; '+result.residual+' fatigue(s) effectivement appliquée(s).');
}catch(e){alert(e.message)}}
function earthShieldUI(id,operation){try{
 let baseCost=0;
 if(operation==='consume'){
  const raw=prompt('Coût de fatigue ORIGINAL de la technique de Terre (1 à 5) : réduction de 1, bouclier consommé. La fatigue nette devra être appliquée lors de la résolution de la technique.', '1');
  if(raw===null)return;baseCost=Number(raw);
 }
 const text=operation==='block'?'Confirmer la PREMIÈRE attaque de cette passe contre le bénéficiaire ? Elle est entièrement bloquée et ne doit PAS être appliquée.':operation==='revoke'?'Révoquer le bouclier immobile et retirer le Gêné qu’il a créé (sauf autre bouclier) ?':'Consommer le bouclier pour réduire de 1 fatigue le coût d’une technique de Terre ? Ne pas déduire deux fois cette réduction.';
 if(!confirm('MJ : '+text))return;
 const result=commitCombatMutation(()=>CombatCore.mutateEarthShield(s,id,operation,true,baseCost));
 render();if(operation==='consume')alert('Bouclier consommé. Coût net de la technique : '+result.netCost+' fatigue(s). Appliquer ce coût UNE seule fois lors de sa résolution.');
}catch(e){alert(e.message)}}
function earthSeismicInterruptUI(sourceId){try{
 const enemies=s.fighters.filter(f=>f.id!==sourceId);
 if(!enemies.length)throw Error('Aucun adversaire disponible');
 const names=enemies.map(f=>f.name+' ['+f.id+']').join(', ');
 const id=prompt('Détection du pas lourd : identifiant de l’ennemi dont la technique commence : '+names,enemies[0].id);
 if(id===null)return;
 const enemy=enemies.find(f=>f.id===id);
 if(!enemy)throw Error('Adversaire introuvable');
 const choice=prompt('Choix de '+enemy.name+' : pay (3 fatigues et technique maintenue) ou cancel (technique annulée) ?', 'cancel');
 if(choice===null)return;
 let overflow=[];
 if(choice==='pay'&&enemy.fatigue+3>5)throw Error('Fatigue insuffisante pour payer 3 fatigues : choisir cancel.');
 let enemyActionId='';
 if(choice==='cancel'){
  const pending=s.actions.filter(a=>a.sourceId===id&&a.round===s.round&&!a.cancelledBySeismic&&!s.history.some(h=>(h.events||[]).some(e=>e.actionId===a.id)));
  if(!pending.length)throw Error('Aucune technique ennemie déclarée en attente : impossible de l’annuler automatiquement.');
  const selected=prompt('Technique ennemie EN ATTENTE à annuler (identifiant obligatoire) : '+pending.map(a=>a.name+' ['+a.id+']').join(', '),pending.length===1?pending[0].id:'');
  if(selected===null)return;
  enemyActionId=selected.trim();
  if(!pending.some(a=>a.id===enemyActionId))throw Error('Technique ennemie en attente introuvable');
 }
 if(!confirm('MJ : l’interruption est déclarée AVANT la résolution de la technique ennemie. Confirmer la dépense de Prêt et 1 fatigue ?'))return;
 commitCombatMutation(()=>CombatCore.resolveEarthSeismicInterrupt(s,sourceId,id,choice,true,overflow,enemyActionId));render();
}catch(e){alert(e.message)}}
function earthMudStrikeUI(sourceId,targetId){try{
 const target=CombatCore.fighter(s,targetId);
 const choice=prompt('Boue gluante : conséquence choisie par '+target.name+' : fatigue, condition ou balance ?', 'fatigue');
 if(choice===null)return;
 let detail='';
 if(choice==='condition'){detail=prompt('État à cocher : Terrifié, En colère, Coupable, Fragile ou Confus','Terrifié');if(detail===null)return;}
 if(choice==='balance'){detail=prompt('Déplacement de l’équilibre : +1 ou -1','1');if(detail===null)return;}
 if(!confirm('MJ : résoudre la Frappe supplémentaire de Boue gluante contre '+target.name+' ? Ce choix consommera uniquement son droit de Frapper.'))return;
 commitCombatMutation(()=>CombatCore.resolveEarthMudStrike(s,sourceId,targetId,choice,detail,true,[],()=>{render();return approvalDecisions();}));render();
}catch(e){alert(e.message);render()}}
function renderTemporaryEffects(){
 const root=$('temporaryEffects');if(!root)return;
 const all=s.temporaryEffects||[];
 const filter=$('temporaryEffectFilter')?.value||'all';
 const originFilter=$('temporaryOriginFilter')?.value||'all';
 const query=($('temporaryEffectSearch')?.value||'').trim().toLocaleLowerCase('fr');
 const shown=all.filter(e=>{
  if(filter!=='all'&&e.duration!==filter)return false;
  if(originFilter!=='all'&&(e.originType||'mj')!==originFilter)return false;
  if(!query)return true;
  const target=CombatCore.fighter(s,e.targetId).name;
  const source=e.originType==='personnage'&&e.originSourceId?CombatCore.fighter(s,e.originSourceId).name:'';
  return [e.label,e.originLabel||'',target,source].some(value=>value.toLocaleLowerCase('fr').includes(query));
 });
 root.innerHTML='<h4>Effets temporaires ('+shown.length+' / '+all.length+')</h4>'+(shown.map(e=>'<p><b>'+safe(CombatCore.fighter(s,e.targetId).name)+'</b> — '+safe(e.label)+' · '+(e.originType==='technique'?'Technique'+(e.originLabel?' : '+safe(e.originLabel):''):e.originType==='personnage'&&e.originSourceId?'Personnage : '+safe(CombatCore.fighter(s,e.originSourceId).name):'Décision MJ')+' · '+({round:'fin de passe',scene:'fin de scène',manual:'retrait manuel'}[e.duration])+(e.countertimeOpponentId&&!e.countertimeResolved&&s.round===e.createdRound+1&&s.phase==='declaration'?' <button type="button" data-ui-click="revealCountertimeUI" data-id="'+safe(e.id)+'">Révéler approche (MJ)</button>'+(CombatCore.fighter(s,e.countertimeOpponentId).statuses.some(x=>x==='etourdi'||x==='piege')&&!CombatCore.fighter(s,e.countertimeOpponentId).approach?' <button type="button" class="alt" data-ui-click="waiveCountertimeUI" data-id="'+safe(e.id)+'">Arbitrer impossibilité (MJ)</button>':''):'')+(e.reedPrediction&&!e.reedResolved&&s.round===e.createdRound+1&&s.phase!=='declaration'?' <button type="button" data-ui-click="resolveReedBetUI" data-id="'+safe(e.id)+'">Révéler (MJ)</button>':'')+(e.originLabel==='Bouclier de roche'?(e.shieldBlockedRound===s.round?' <strong>Protection déjà utilisée pour cette passe</strong>':' <strong>Protection disponible</strong> <button type="button" data-ui-click="earthShieldUI" data-id="'+safe(e.id)+'" data-extra="block">Bloquer 1re attaque (MJ)</button>')+' <button type="button" data-ui-click="earthShieldUI" data-id="'+safe(e.id)+'" data-extra="consume">Consommer (−1 fatigue)</button> <button type="button" data-ui-click="earthShieldUI" data-id="'+safe(e.id)+'" data-extra="revoke">Révoquer</button>':'')+(e.originLabel==='Étoile de lave'?' <button type="button" data-ui-click="earthLavaUI" data-id="'+safe(e.id)+'" data-extra="maintain">Entretenir (1 fatigue)</button> <button type="button" data-ui-click="earthLavaFractureUI" data-id="'+safe(e.id)+'">Fracasser le décor (gratuit)</button> <button type="button" data-ui-click="earthLavaUI" data-id="'+safe(e.id)+'" data-extra="extinguish">Éteindre</button>':'')+(e.originLabel==='Armure de terre'&&Number.isInteger(e.armorPoints)?' <button type="button" data-ui-click="resolveEarthArmorHitUI" data-id="'+safe(e.id)+'">Résoudre impact entrant (MJ)</button> <button type="button" data-ui-click="spendEarthArmorUI" data-id="'+safe(e.id)+'" data-extra="condition">Annuler 1 état (−1 pt)</button> <button type="button" data-ui-click="spendEarthArmorUI" data-id="'+safe(e.id)+'" data-extra="fatigue">Annuler 2 fatigues (−1 pt)</button>':'')+' <button type="button" class="alt" data-ui-click="editTemporaryEffectUI" data-id="'+safe(e.id)+'">Modifier</button> <button type="button" class="alt" data-ui-click="removeTemporaryEffectUI" data-id="'+safe(e.id)+'">Retirer</button></p>').join('')||'<p class="small-note">Aucun effet temporaire pour ce filtre.</p>');
 const seismic=(s.fighters||[]).filter(f=>(f.bonuses||[]).some(b=>b.type==='earth_seismic_interrupt'&&b.round===s.round)&&f.statuses.includes('pret'));
 if(seismic.length)root.innerHTML+='<h4>Détection du pas lourd — interruption (passe '+safe(s.round)+')</h4>'+seismic.map(f=>'<p>'+safe(f.name)+' <button type="button" data-ui-click="earthSeismicInterruptUI" data-id="'+safe(f.id)+'">Interrompre une technique (MJ)</button></p>').join('');
 const mud=(s.fighters||[]).flatMap(f=>(f.bonuses||[]).filter(b=>b.type==='earth_mud_strike'&&b.round===s.round).map(b=>({source:f,target:s.fighters.find(x=>x.id===b.targetId)}))).filter(x=>x.target);
 if(mud.length)root.innerHTML+='<h4>Boue gluante — Frapper supplémentaire (passe '+safe(s.round)+')</h4>'+mud.map(x=>'<p>'+safe(x.source.name)+' → '+safe(x.target.name)+' <button type="button" data-ui-click="earthMudStrikeUI" data-id="'+safe(x.source.id)+'" data-extra="'+safe(x.target.id)+'">Frapper (MJ)</button></p>').join('');

}
function exportSceneJournalUI(){try{
 const csv=CombatCore.exportSceneJournalCSV(s,$('journalSceneFilter').value,$('journalSearch').value);
 const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='avatar-journal-scene-'+(s.scene||1)+'.csv';
 document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}catch(e){alert(e.message)}}
function renderSceneJournal(){
 const sceneSelect=$('journalSceneFilter'),searchInput=$('journalSearch'),limitSelect=$('journalLimit');
 if(!sceneSelect||!searchInput||!limitSelect)return;
 const selected=sceneSelect.value||String(s.scene||1);
 const sceneNumbers=[...new Set([...(s.sceneJournal||[]).map(n=>n.scene),s.scene||1])].filter(n=>Number.isInteger(n)&&n>=1).sort((a,b)=>b-a);
 sceneSelect.innerHTML='<option value="all">Toutes les scènes</option>'+sceneNumbers.map(n=>'<option value="'+n+'">Scène '+n+'</option>').join('');
 sceneSelect.value=selected==='all'||sceneNumbers.includes(Number(selected))?selected:String(s.scene||1);
 const query=searchInput.value.trim().toLocaleLowerCase('fr');
 const matches=(s.sceneJournal||[]).filter(n=>(sceneSelect.value==='all'||n.scene===Number(sceneSelect.value))&&(!query||n.text.toLocaleLowerCase('fr').includes(query)||(n.title||'').toLocaleLowerCase('fr').includes(query)));
 const limit=limitSelect.value==='all'?matches.length:20;
 const visible=matches.slice(-limit).reverse();
 $('sceneJournal').innerHTML='<h4>Journal narratif ('+matches.length+' note(s))</h4>'+(visible.map(n=>'<p><b>Scène '+Number(n.scene)+(n.title?' — '+safe(n.title):'')+' · Passe '+Number(n.round)+'</b> — '+safe(n.text)+' <button type="button" class="alt" data-ui-click="editSceneNoteUI" data-id="'+safe(n.id)+'">Modifier</button> <button type="button" class="alt" data-ui-click="removeSceneNoteUI" data-id="'+safe(n.id)+'">Supprimer</button></p>').join('')||'<p class="small-note">Aucune note correspondante.</p>')+(visible.length<matches.length?'<p class="small-note">'+(matches.length-visible.length)+' note(s) masquée(s) : choisir « Toutes » pour les afficher.</p>':'');
}
function editCombatFighter(id){try{
 const f=CombatCore.fighter(s,id);
 if(s.phase!=='declaration'||s.actions.length||s.proposals.length)throw Error('Modifier le combattant avant la révélation des approches, sans action en attente.');
 const dialog=$('combatFighterDialog'),required=CombatCore.requiredFighterStatuses(s,id);dialog.dataset.fighterId=id;
 dialog.innerHTML=`<form onsubmit="event.preventDefault();saveCombatFighter()"><h3 id="combatFighterEditorTitle">Modifier le combattant</h3><p>${safe(f.kind)} · Modifications pour ce combat uniquement${f.characterId?' ; la fiche permanente reste indépendante':''}.</p>
 <label for="combatEditName">Nom dans ce combat</label><input id="combatEditName" required maxlength="100" value="${safe(f.name)}">
 <label for="combatEditFatigue">Fatigue</label><input id="combatEditFatigue" type="number" min="0" max="5" step="1" required value="${safe(f.fatigue)}">
 <label for="combatEditBalance">Équilibre</label><input id="combatEditBalance" type="number" min="-3" max="3" step="1" required value="${safe(f.balance)}">
 <label for="combatEditMaterials">Matériels</label><input id="combatEditMaterials" type="number" min="0" step="1" required value="${safe(f.materials||0)}">
 <fieldset><legend>États</legend>${Roster.CONDITIONS.map(c=>`<label><input class="combat-edit-condition" type="checkbox" value="${safe(c)}" ${f.conditions.includes(c)?'checked':''}>${safe(c)}</label>`).join('')}</fieldset>
 <fieldset><legend>Statuts</legend>${CombatCore.STATUS.map(status=>`<label><input class="combat-edit-status" type="checkbox" value="${status}" ${f.statuses.includes(status)||required.includes(status)?'checked':''} ${required.includes(status)?'disabled':''}>${safe(Roster.FROM_ENGINE[status])}${required.includes(status)?' (effet actif)':''}</label>`).join('')}</fieldset>
 <p class="small-note">Les statuts maintenus par une technique se retirent depuis cet effet. La modification peut être annulée avec l’historique du combat.</p>
 <div class="row"><button type="submit">Enregistrer le combattant</button><button type="button" class="alt" onclick="$('combatFighterDialog').close()">Annuler</button></div></form>`;
 dialog.showModal();$('combatEditName').focus();
}catch(error){alert(error.message)}}
function saveCombatFighter(){try{
 const dialog=$('combatFighterDialog');
 commitCombatMutation(()=>CombatCore.updateFighter(s,dialog.dataset.fighterId,{name:$('combatEditName').value,fatigue:Number($('combatEditFatigue').value),balance:Number($('combatEditBalance').value),materials:Number($('combatEditMaterials').value),conditions:Array.from(dialog.querySelectorAll('.combat-edit-condition:checked')).map(el=>el.value),statuses:Array.from(dialog.querySelectorAll('.combat-edit-status:checked')).map(el=>el.value)}));
 dialog.close();render();
}catch(error){alert(error.message)}}
function openCombatSheet(id){const f=CombatCore.fighter(s,id);if(f.characterId){setView('characters');openCharacterDetail(f.characterId);}}
function render(){
 renderCombatLibrary();
 $('fighters').innerHTML=s.fighters.map(f=>`<div class="fighter"><b>${safe(f.name)}</b> <span class="chip">${safe(f.kind)}</span><button type="button" class="alt" title="Disponible avant la révélation des approches" data-ui-click="editCombatFighter" data-id="${safe(f.id)}" ${s.phase!=='declaration'||s.actions.length||s.proposals.length?'disabled':''}>Modifier le combattant</button>${f.characterId?`<button type="button" class="alt" data-ui-click="openCombatSheet" data-id="${safe(f.id)}">Ouvrir la fiche</button>`:''}${s.phase==='declaration'&&f.statuses.includes('gene')?`<label>Gêné — traitement pour cette passe<select data-ui-change="setGeneCombatChoice" data-id="${safe(f.id)}"><option value="malus" ${f.geneChoice!=='fatigue'?'selected':''}>Subir le malus (PJ : −2 physique ; PNJ : −1 technique)</option><option value="fatigue" ${f.geneChoice==='fatigue'?'selected':''}>Cocher 1 fatigue pour ignorer le malus</option></select></label>`:''}${f.statuses.includes('piege')&&(s.phase==='declaration'||s.phase==='fin')?`<button type="button" class="alt" data-ui-click="releaseTrapped" data-id="${safe(f.id)}" title="Libération confirmée par le MJ : répartir 3 coûts entre fatigue et états">Libérer de Piégé (3 coûts)</button>`:''}${f.characterId?`<button class="alt" data-ui-click="syncSheet" data-id="${safe(f.id)}">Reporter sur la fiche</button>`:''}<p>Fatigue : ${safe(f.fatigue)}/5 · Matériels : ${safe(f.materials||0)}${f.equipmentDisabled?" (équipement hors service)":""} · Équilibre : ${safe(f.balance)} · États : ${f.conditions.map(safe).join(', ')||'—'}<br>Statuts : ${f.statuses.map(x=>safe(Roster.FROM_ENGINE[x]||x)).join(', ')||'—'} · Blocages : ${f.blocked.map(x=>safe(approachLabels[x]||x)).join(', ')||'—'}</p></div>`).join('');
 $('fighters').innerHTML+='<div class="fighter"><b>Engagements (confirmés par le MJ)</b><p class="small-note">Cocher les paires engagées. Glissade permet de rompre et de créer des engagements avec validation MJ. La remise à zéro est une transaction unique, annulable.</p><button type="button" class="alt" onclick="clearAllEngagements()" '+(!(s.engagements||[]).length?'disabled':'')+'>Rompre tous les engagements</button>'+s.fighters.map(f=>'<button type="button" class="alt" data-ui-click="disengageOne" data-id="'+safe(f.id)+'" '+(!(s.engagements||[]).some(pair=>pair.includes(f.id))?'disabled':'')+'>Désengager '+safe(f.name)+'</button>').join('')+s.fighters.flatMap((f,i)=>s.fighters.slice(i+1).map(g=>'<label><input type="checkbox" style="width:auto" '+(CombatCore.isEngaged(s,f.id,g.id)?'checked':'')+' data-ui-change="changeEngagement" data-id="'+safe(f.id)+'" data-extra="'+safe(g.id)+'"> '+safe(f.name)+' ↔ '+safe(g.name)+'</label>')).join('')+'</div>';
 $('fighters').innerHTML+='<div class="fighter"><b>Pièges armés (MJ)</b>' + ((s.traps||[]).length?(s.traps||[]).map(t=>'<p>'+safe(t.zone)+' — '+safe(CombatCore.fighter(s,t.ownerId).name)+' <button type="button" class="alt" data-ui-click="triggerTrapUI" data-id="'+safe(t.id)+'" '+(s.proposals.length?'disabled':'')+'>Déclencher (prochain adversaire)</button></p>').join(''):'<p>Aucun piège armé.</p>')+'</div>';
 $('phase').innerHTML=`<h3>Scène ${safe(s.scene||1)}${s.sceneTitle?" — "+safe(s.sceneTitle):""} · Passe ${safe(s.round)} — ${s.phase==='declaration'?'Déclaration':s.phase==='fin'?'Fin de passe':approachLabels[s.phase]}</h3>`;
 renderSceneJournal();
 const temporary=s.temporaryEffects||[];
 renderTemporaryEffects();
 $('declarations').innerHTML=s.phase==='declaration'?'<p class="small-note">Les combattants Étourdis ou Piégés ne déclarent pas d’approche. Le MJ doit lever le statut ou résoudre leur libération.</p>'+ s.fighters.filter(f=>!f.statuses.includes('etourdi')&&!f.statuses.includes('piege')).map(f=>`<label>${safe(f.name)} — approche</label><select data-ui-change="setApproach" data-id="${safe(f.id)}"><option value="">Choisir…</option>${CombatCore.APPROACHES.map(a=>`<option value="${a}" ${f.approach===a?'selected':''}>${approachLabels[a]}</option>`).join('')}</select>${f.kind==='PJ'?`<label>Posture</label><select id="roll-${safe(f.id)}" data-ui-change="setRoll" data-id="${safe(f.id)}">${['6-','7-9','10+'].map(r=>`<option ${f.roll===r?'selected':''}>${r}</option>`).join('')}</select>`:''}`).join(''):'<p>Approches déclarées : '+s.fighters.map(f=>`${safe(f.name)} : ${safe(approachLabels[f.approach]||f.approach)}`).join(' · ')+'</p>';
 $('step').textContent=s.phase==='declaration'?'Révéler les approches':s.phase==='esquiver'?'Terminer la passe':s.phase==='fin'?'Passe suivante':'Approche suivante';
 $('help').textContent=s.phase==='fin'?'Renforcé s’applique à la fin de la passe. En danger s’applique au début de la suivante.':'Les effets d’une même approche sont proposés puis validés par le MJ. Gêné : appliquer −2 aux jets physiques PJ si le coût de fatigue n’a pas été payé.';
 const oldSrc=$('source').value,oldTar=$('target').value;
 $('source').innerHTML=s.fighters.filter(f=>f.approach===s.phase).map(f=>`<option value="${safe(f.id)}" ${f.id===oldSrc?'selected':''}>${safe(f.name)}</option>`).join('');
 $('target').innerHTML=s.fighters.map(f=>`<option value="${safe(f.id)}" ${f.id===oldTar?'selected':''}>${safe(f.name)}</option>`).join('');
 syncTechnique();
 $('proposals').innerHTML=s.proposals.length?s.proposals.map(e=>`<label><input type="checkbox" id="accept-${safe(e.id)}" checked style="width:auto"> ${safe(e.kind)} — ${safe(CombatCore.fighter(s,e.targetId).name)} ${safe(e.detail||'')} ${safe(e.amount||'')}</label>`).join(''):'<p>Aucune proposition en attente.</p>';
 $('history').innerHTML=s.history.slice(-8).reverse().map(h=>`<p>Passe ${safe(h.round)} · ${safe(h.phase)} : ${h.events.length} événement(s) validé(s)</p>`).join('')||'<p>Historique vide.</p>';
 $('combatSummary').textContent=`Scène ${safe(s.scene||1)}${s.sceneTitle?" — "+safe(s.sceneTitle):""} · Passe ${safe(s.round)} · ${s.phase==='declaration'?'Déclaration':s.phase==='fin'?'Fin':approachLabels[s.phase]} · ${s.fighters.length} combattant(s) · ${s.proposals.length} effet(s) en attente`;
 setCombatTab(currentCombatTab);
}
function syncTechnique(){
 const f=s.fighters.find(x=>x.id===$('source').value),select=$('tech'),previous=select.value;
 let entries=f?TECH_CATALOG.filter(t=>CombatRules.available(f,t,s.phase).ok):[];
 if($('combatKnownOnly')?.checked&&entries.some(t=>t.famille!=='base'))entries=entries.filter(t=>t.famille!=='base');
 if($('combatTechniqueCount'))$('combatTechniqueCount').textContent=entries.length+' technique(s) disponibles pour cette approche';
 select.innerHTML=entries.map(t=>`<option value="${safe(t.id)}" ${t.id===previous?'selected':''}>${safe(t.nom)}${t.famille==='base'?' · base':''}</option>`).join('');
 if(!entries.length)select.innerHTML='<option value="">Aucune technique accessible</option>';
 syncOptions();
}
function escapeHtml(value){return String(value).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch]));}
function syncOptions(){const entry=TECH_CATALOG.find(x=>x.id===$('tech').value),t=entry?.nom||'',f=s.fighters.find(x=>x.id===$('source').value);let opts='';
 $('techHelp').textContent=entry?`${entry.famille} · p. ${entry.page} · ${f?.kind==='PJ'?('Niveau : '+(CombatRules.masteryFor(f,entry)||'non appris')):'PNJ'} · ${['Frapper','Riposter','Protection','Presser l’adversaire','Charge','Acharnement','Dérobade','Observation rapide','Frappe dévastatrice','Frapper un point faible','Fort comme un chêne','Se mettre à l’abri','Serrer les dents','Trouver la faille','Fouet d’eau','Plaque de givre','Gantelet de glace','Électrochoc','Aveuglé par la science','Meilleur, plus rapide, plus fort','Collecter du matériel','Maintenance','Puissance maximale','Colonne de pierre','Projection tellurique','Enfouissement','Jet de flammes','Gantelet de terre','Disque de feu','Mords la poussière','Arc de foudre','Mouvements tectoniques','Tourbillon miniature','Souffle du vent','Aspiration','Vélocité du vent','Boulet de canon','Coussin d’air','Cône d’air','Onde de choc','Vague d’air','Sphère d’air','Oscillations du vent','Amortir le poing rageur','Contre-attaque','Entraves de métal','Escalier de poussière','Boue gluante','Bouclier de roche','Détection du pas lourd','Étoile de lave'].includes(t)?'Effets assistés':'Arbitrage MJ'}`:'';
 $('postureMode').innerHTML=f?.kind==='PJ'&&f.roll==='10+'?'<label>Option de posture (10+)</label><select id="techMode"><option value="double">Deux techniques différentes (base ou maîtrisées)</option><option value="single">Une technique acquise ou pratiquée (coût éventuel)</option></select>':'';

 if(['Frapper','Charge','Frappe dévastatrice','Fouet d’eau'].includes(t))opts='<label>Choix de la cible</label><select id="choice"><option value="fatigue">2 fatigues</option><option value="condition">Un état</option><option value="balance">Décalage équilibre</option></select><label>État (si choisi)</label><select id="condition">'+Roster.CONDITIONS.map(x=>`<option>${x}</option>`).join('')+'</select><label>Direction du décalage (si choisi)</label><select id="direction"><option value="1">+1</option><option value="-1">−1</option></select>';
 if(t==='Souffle du vent')opts='<label>Choix de la cible</label><select id="windChoice"><option value="etourdi">Devenir Étourdi</option><option value="fatigue">Cocher 4 fatigues</option></select><p class="small-note">La cible est renversée ; placement arbitré par le MJ.</p>';
 if(t==='Aspiration')opts='<label>Petit objet visé</label><input id="airObject" maxlength="120" placeholder="Ex. : parchemin, clef"><label>Un personnage choisit-il de résister ?</label><select id="airResistance"><option value="none">Non : objet récupéré</option><option value="resist">Oui : la cible sélectionnée coche 2 fatigues</option></select><p class="small-note">Si résistance, sélectionner le personnage qui retient ou bloque l’objet. L’objet reste narratif.</p>';
 if(t==='Cône d’air')opts='<p class="small-note">Coût : 1 fatigue pour le lanceur et 1 par allié participant ; 2 fatigues infligées par allié. Le MJ confirme la portée et la participation.</p><label><input type="checkbox" id="airConeInRange" style="width:auto"> Portée et participants confirmés par le MJ</label>'+s.fighters.filter(x=>x.id!==f?.id).map(x=>'<label><input type="checkbox" class="air-cone-ally" value="'+safe(x.id)+'" style="width:auto"> Allié participant : '+safe(x.name)+'</label>').join('');
 if(t==='Onde de choc')opts='<p class="small-note">Coût : 2 fatigues. Désigner TOUS les autres personnages de la zone (alliés compris). Chaque personnage peut choisir 4 fatigues plutôt que devenir Étourdi. Les déplacements restent narratifs.</p><label><input type="checkbox" id="airShockZoneConfirmed" style="width:auto"> Zone et présence de chaque personnage vérifiées par le MJ</label>'+s.fighters.filter(x=>x.id!==f?.id).map(x=>'<label><input type="checkbox" class="air-shock-target" value="'+safe(x.id)+'" style="width:auto"> Présent dans la zone : '+safe(x.name)+'</label><label><input type="checkbox" class="air-shock-resist" value="'+safe(x.id)+'" style="width:auto"> '+safe(x.name)+' choisit 4 fatigues au lieu d’Étourdi</label>').join('');
 if(t==='Oscillations du vent')opts='<p class="small-note">Pour chaque ennemi actuellement engagé ayant choisi Avancer et attaquer : effacer 1 fatigue et réserver 1 point pour la prochaine passe. Les points remplacent la fatigue uniquement si vous Avancez et attaquez à la passe suivante.</p><label><input type="checkbox" id="airOscConfirmed" style="width:auto"> Approches et engagements vérifiés par le MJ</label>';
 if(t==='Vague d’air')opts='<p class="small-note">Choisir : dévier une attaque ennemie pour 1 fatigue, OU, sans attaque ennemie, infliger 2 fatigues à 1 à 3 ennemis en fin de passe. Le MJ confirme la situation.</p><label><input type="checkbox" id="airWaveConfirmed" style="width:auto"> Circonstances confirmées par le MJ</label><label>Mode</label><select id="airWaveMode"><option value="block">Dévier une attaque (1 fatigue)</option><option value="blast">Rafale de fin de passe (2 fatigues par ennemi)</option></select>'+s.fighters.filter(x=>x.id!==f?.id).map(x=>'<label><input type="checkbox" class="air-wave-target" value="'+safe(x.id)+'" style="width:auto"> Ennemi ciblé : '+safe(x.name)+'</label>').join('');
 if(t==='Armure de terre')opts='<p class="small-note">Terre p.289 : crée une réserve de 3 points, sans fatigue. Tant qu’il reste des points, vous êtes Avantagé. Dépenser 1 point pour annuler un état ou 2 fatigue ; obligation de dépenser au moins 1 point à chaque attaque qui infligerait fatigue ou état. La réserve est suivie dans les effets temporaires, avec boutons de dépense ; Avantagé est retiré automatiquement à zéro sauf si une autre source est détectée.</p><label><input type="checkbox" id="earthArmorConfirmed" style="width:auto"> Matériau disponible et activation confirmés par le MJ</label>';
 if(t==='Bouclier de roche')opts='<p class="small-note">Terre p.289 : 1 fatigue, le personnage protégé devient Gêné. Le bouclier immobile bloque la première attaque de chaque passe contre ce personnage. La première attaque est bloquée automatiquement. Les boutons servent aux attaques narratives, à la révocation ou à la consommation manuelle ; le sélecteur de technique applique la réduction automatiquement.</p><label><input type="checkbox" id="earthShieldConfirmed" style="width:auto"> Position fixe et bénéficiaire confirmés par le MJ</label><label>Personnage protégé</label><select id="earthShieldProtectedId">'+s.fighters.map(x=>'<option value="'+escapeHtml(x.id)+'" '+(x.id===f?.id?'selected':'')+'>'+escapeHtml(x.name)+'</option>').join('')+'</select>';
 if(t==='Détection du pas lourd')opts='<p class="small-note">Terre p.289 : devient Prêt. Une fois la technique validée, utiliser le bouton d’interruption pendant cette passe : consomme Prêt et 1 fatigue ; l’ennemi choisit 3 fatigues ou annulation. L’annulation doit être déclarée AVANT la résolution de la technique ennemie.</p><label><input type="checkbox" id="earthSeismicConfirmed" style="width:auto"> Sens sismique et situation confirmés par le MJ</label>';
 if(t==='Étoile de lave')opts='<p class="small-note">Terre p.289 : 1 fatigue pour activer, Avantagé tant que l’étoile est active. Entretien et Fracasser gratuit disponibles dans les effets ; le MJ confirme les attaques avec l’étoile et le décor concerné.</p><label><input type="checkbox" id="earthLavaConfirmed" style="width:auto"> Maîtrise de la lave et activation confirmées par le MJ</label>';
 if(t==='Boue gluante')opts='<p class="small-note">Terre p.289 : seuls les adversaires engagés ayant ciblé le lanceur durant cette passe deviennent Gênés. À la passe suivante, Frapper chacun de ces adversaires en plus des techniques normales, quelle que soit l’approche : résolution différée depuis les effets, avec les protections et réactions ordinaires.</p><label><input type="checkbox" id="earthMudConfirmed" style="width:auto"> Liste exhaustive des assaillants et engagements confirmée par le MJ</label>'+s.fighters.filter(x=>x.id!==f?.id).map(x=>'<label><input type="checkbox" class="earth-mud-attacker" value="'+escapeHtml(x.id)+'" style="width:auto"> Assaillant engagé : '+escapeHtml(x.name)+'</label>').join('');
 if(t==='Entraves de métal')opts='<p class="small-note">Terre p.289 : cible Gênée, ne perd ce statut que si elle maîtrise le métal ou à la fin du combat. Le lanceur est Avantagé tant que la cible est Gênée et engagée. Engagements et libération suivis par le moteur ; dérogation narrative explicite possible pour le MJ.</p><label><input type="checkbox" id="earthMetalConfirmed" style="width:auto"> Maîtrise du métal et cible confirmées par le MJ</label>';
 if(t==='Escalier de poussière')opts='<p class="small-note">Terre p.289 : position surélevée, Avantagé et Prêt ; un adversaire engagé peut cocher 2 fatigues pour annuler cet effet.</p><label><input type="checkbox" id="earthStairsConfirmed" style="width:auto"> Position surélevée confirmée par le MJ</label><label>Adversaire engagé qui annule (facultatif)</label><select id="earthStairsBlocker"><option value="">Aucun : appliquer Avantagé et Prêt</option>'+s.fighters.filter(x=>x.id!==f?.id).map(x=>'<option value="'+escapeHtml(x.id)+'">'+escapeHtml(x.name)+'</option>').join('')+'</select>';
 if(t==='À contretemps')opts='<p class="small-note">Armes p. 292 : cochez 1 fatigue pour devenir Prêt et obliger un adversaire engagé à révéler son approche avant votre choix à la prochaine passe. Le statut Prêt est appliqué après validation ; le moment de révélation reste arbitré par le MJ.</p><label><input type="checkbox" id="countertimeConfirmed" style="width:auto"> Adversaire engagé et conditions confirmés par le MJ</label>';
 if(t==='Contre-attaque')opts='<p class="small-note">Armes p. 292 : Frapper comme si 1 fatigue avait été cochée, sans payer cette fatigue. Cible engagée ayant déclaré Avancer et attaquer ; aucun statut négatif sur le riposteur. Le MJ confirme la situation.</p><label><input type="checkbox" id="weaponCounterConfirmed" style="width:auto"> Approche adverse et engagement confirmés par le MJ</label><label>Effet imposé</label><select id="choice"><option value="fatigue">2 fatigues</option><option value="condition">Un état</option></select><label>État infligé (si choisi)</label><select id="condition">'+Roster.CONDITIONS.map(x=>`<option>${x}</option>`).join('')+'</select>';
 if(t==='Désarmement')opts='<p class="small-note">Armes p. 292 : 2 fatigues pour interdire une technique avancée Avancer et attaquer possédée par la cible jusqu’à la fin de la rencontre. Le MJ confirme la possession ; la restriction est levée à la nouvelle scène.</p><label><input type="checkbox" id="weaponDisarmConfirmed" style="width:auto"> Possession et choix confirmés par le MJ</label><label>Technique de la cible à interdire</label><select id="weaponDisarmTechnique">'+TECH_CATALOG.filter(x=>x.famille!=="base"&&x.approche==="Avancer et attaquer").map(x=>'<option value="'+escapeHtml(x.nom)+'">'+escapeHtml(x.nom)+'</option>').join('')+'</select>';
 if(t==='Feinte')opts='<p class="small-note">Armes p. 292 : si vous avez été visé par une ou plusieurs attaques pendant cette passe, cochez 1 fatigue pour infliger immédiatement un état à chacun de vos assaillants. Le MJ identifie tous les assaillants, sans inventer d’historique des attaques.</p><label><input type="checkbox" id="weaponFeintConfirmed" style="width:auto"> Attaques reçues et liste exhaustive des assaillants confirmées par le MJ</label>'+s.fighters.filter(x=>x.id!==f?.id).map(x=>'<label><input type="checkbox" class="weapon-feint-attacker" value="'+escapeHtml(x.id)+'" style="width:auto"> '+escapeHtml(x.name)+'</label><select class="weapon-feint-condition" data-attacker="'+escapeHtml(x.id)+'">'+CONDITIONS.map(c=>'<option value="'+escapeHtml(c)+'">'+escapeHtml(c)+'</option>').join('')+'</select>').join('');
 if(t==='Estocade précise')opts='<p class="small-note">Armes p. 292 : 1 fatigue, 2 fatigues et Gêné sur la cible. Option : 1 fatigue de plus pour tenter un déplacement à portée, qu’un adversaire engagé peut bloquer en cochant 1 fatigue.</p><label><input type="checkbox" id="weaponPiercingConfirmed" style="width:auto"> Arme perforante ou d’estoc confirmée par le MJ</label><label><input type="checkbox" id="weaponMoveExtra" style="width:auto"> Tenter le déplacement supplémentaire (+1 fatigue)</label><label><input type="checkbox" id="weaponMoveConfirmed" style="width:auto"> Position à portée confirmée par le MJ</label><label><input type="checkbox" id="weaponMoveBlocked" style="width:auto"> Un adversaire engagé bloque le déplacement (+1 fatigue pour lui)</label><label>Adversaire qui bloque</label><select id="weaponBlockerId"><option value="">Aucun</option>'+s.fighters.filter(x=>x.id!==f?.id).map(x=>'<option value="'+x.id+'">'+x.name+'</option>').join('')+'</select>';
 if(t==='Clouer une mouche contre un tronc d’arbre')opts='<p class="small-note">Armes p. 292 : 1 fatigue pour Gêné ; 3 fatigues pour Gêné et Piégé.</p><label><input type="checkbox" id="weaponArrowsConfirmed" style="width:auto"> Tir de flèches et cible confirmés par le MJ</label><label>Coût</label><select id="weaponArrowCost"><option value="1">1 fatigue : Gêné</option><option value="3">3 fatigues : Gêné et Piégé</option></select>';
 if(t==='Position surélevée')opts='<p class="small-note">Armes p. 292 : 1 fatigue, Avantagé ; ignorer douleur et statuts négatifs des attaques reçues pendant cette passe. Cette immunité est un rappel narratif : le MJ doit arbitrer les attaques, et aucun effet déjà approuvé n’est effacé automatiquement.</p><label><input type="checkbox" id="weaponHighGroundConfirmed" style="width:auto"> Position surélevée confirmée par le MJ</label>';
 if(t==='Souple comme un roseau')opts='<p class="small-note">Coût : 2 fatigues. Le MJ enregistre secrètement une prédiction de l’approche de la cible pour la prochaine passe. En cas d’erreur, le lanceur peut changer d’approche ; si elle est juste, il devient Avantagé et la cible ne peut pas le viser avec ses techniques durant cette passe. Résolution manuelle par le MJ. Attention : le pari reste visible dans les effets temporaires ; ne pas partager cet écran avec les joueurs.</p><label>Approche prédite (secret MJ)</label><select id="airReedPrediction"><option value="defendre">Défendre et prendre à revers</option><option value="attaquer">Avancer et attaquer</option><option value="esquiver">Esquiver et analyser</option></select><label><input type="checkbox" id="airReedConfirmed" style="width:auto"> Le MJ confirme le pari secret et la cible</label>';
 if(t==='Amortir le poing rageur')opts='<p class="small-note">Cocher 2 fatigues et devenir Avantagé. Protection contre les attaques physiques puissantes, vigoureuses et les projections jusqu’à la fin de la prochaine passe. La qualification des attaques reste soumise au MJ ; le repère de protection expire automatiquement à la fin de la prochaine passe.</p><label><input type="checkbox" id="airCushionArmorConfirmed" style="width:auto"> Le MJ confirme les conditions de la technique</label>';
 if(t==='Sphère d’air')opts='<p class="small-note">Devenir Avantagé tant que la sphère est maintenue. Sacrifier la sphère pour éviter la fatigue ou un état d’une attaque relève du MJ et reste manuel.</p><label><input type="checkbox" id="airSphereConfirmed" style="width:auto"> Le MJ confirme que la sphère est maintenue</label>';
 const reserve=f?.windReserve;
 if(reserve?.usableRound===s.round&&f?.approach==='attaquer'&&reserve.points>0)opts+='<label>Points Oscillations du vent à dépenser sur le coût de cette technique</label><input type="number" id="windSpend" min="0" max="'+reserve.points+'" value="0"><p class="small-note">Réserve disponible : '+reserve.points+' point(s). Ne peut pas dépasser le coût en fatigue de cette technique.</p>';
 if(t==='Coussin d’air')opts='<p class="small-note">Coût : 1 fatigue. Choisir un allié à portée attaqué pendant cette passe. Le MJ doit confirmer ces conditions.</p><label><input type="checkbox" id="airCushionConfirmed" style="width:auto"> Je confirme que la cible est un allié à portée attaqué pendant cette passe</label><label>Effet à effacer</label><select id="airCushionChoice"><option value="fatigue">Jusqu’à 2 fatigues</option><option value="condition">Un état</option><option value="status">Un statut</option></select><label>État à effacer (si choisi)</label><select id="airCushionCondition">'+Roster.CONDITIONS.map(x=>`<option>${x}</option>`).join('')+'</select><label>Statut à effacer (si choisi)</label><select id="airCushionStatus">'+Roster.STATUSES.map(x=>`<option value="${Roster.TO_ENGINE[x]}">${x}</option>`).join('')+'</select>';
 if(t==='Boulet de canon')opts='<p class="small-note">Coût : 1 fatigue. La cible ne doit pas être déjà engagée avec vous ; les anciens engagements sont rompus et la cible subit un état choisi par le MJ.</p><label>État infligé à la cible</label><select id="condition">'+Roster.CONDITIONS.map(x=>`<option>${x}</option>`).join('')+'</select>';
 if(t==='Vélocité du vent')opts='<p class="small-note">Coût 1 fatigue ; rompt les engagements actuels. La sortie de scène dépend de l’absence de blocage jusqu’à la fin de la passe (MJ).</p>';
 if(t==='Tourbillon miniature')opts='<p class="small-note">Coût de 3 fatigues ; la cible devient Gênée et Étourdie.</p>';
 if(t==='Projection tellurique')opts='<p class="small-note">Coût 1 fatigue, devient Avantagé. Le MJ coche uniquement les adversaires engagés incapables de suivre le lanceur dans les airs. Ces engagements seront rompus automatiquement. Le retour au milieu de l’affrontement à la fin de la passe reste narratif.</p><label>Adversaires incapables de suivre (MJ)</label>'+s.fighters.filter(x=>x.id!==$('source').value&&CombatCore.isEngaged(s,$('source').value,x.id)).map(x=>'<label><input type="checkbox" class="earth-air-unable" value="'+safe(x.id)+'" style="width:auto"> '+safe(x.name)+'</label>').join('');
 if(t==='Mouvements tectoniques')opts='<label><input type="checkbox" id="tectonicZone" style="width:auto"> Cibler une zone (coût : 1 fatigue ; plusieurs adversaires possibles)</label><label>Adversaires concernés (MJ)</label>'+s.fighters.filter(x=>x.id!==$('source').value).map(x=>`<label><input type="checkbox" class="tectonic-target" value="${safe(x.id)}" style="width:auto"> ${safe(x.name)}</label>`).join('');
 if(t==='Arc de foudre')opts='<label>État infligé</label><select id="condition">'+Roster.CONDITIONS.map(x=>'<option>'+x+'</option>').join('')+'</select><p class="small-note">Cible engagée ayant utilisé Avancer et attaquer durant cette passe.</p>';
 if(t==='Gantelet de terre')opts='<label>Choix de la cible</label><select id="choice"><option value="fatigue">2 fatigues</option><option value="condition">1 état</option></select><label>État si choisi</label><select id="condition">'+Roster.CONDITIONS.map(x=>'<option>'+x+'</option>').join('')+'</select><label>Projection (MJ : choix de la cible)</label><select id="earthGauntletProjection"><option value="none">Ne pas projeter</option><option value="project">Projeter : rompre l’engagement</option><option value="resist">Résister : +1 fatigue, engagement maintenu</option></select>';
 if(t==='Jet de flammes')opts='<label>Fatigue investie</label><select id="fireCost"><option value="1">1 — Gêné</option><option value="3">3 — Gêné et En danger</option><option value="5">5 — Piégé, En danger et Gêné</option></select>';
 if(t==='Disque de feu')opts='<label>Choix de la cible</label><select id="fireChoice"><option value="esquive">1 fatigue et incendie (MJ)</option><option value="conditions">Deux états</option></select><label>Premier état</label><select id="fireCondition1">'+Roster.CONDITIONS.map(x=>'<option>'+x+'</option>').join('')+'</select><label>Second état (distinct)</label><select id="fireCondition2">'+Roster.CONDITIONS.map(x=>'<option>'+x+'</option>').join('')+'</select>';
 if(t==='Fouet d’eau')opts=opts.replace('<option value="balance">Décalage équilibre</option>','');
 if(t==='Fouet d’eau')opts+='<p class="small-note">Choix de la cible : 2 fatigues ou 1 état ; coût de 1 fatigue pour le lanceur (p. 288).</p>';
 if(t==='Frapper')opts+='<label class="small-note"><input type="checkbox" id="forceStrike" style="width:auto" onchange="updateStrikeChoices()"> Cocher 1 fatigue pour imposer 2 fatigues ou 1 état (p. 159)</label><p class="small-note">Sans effort supplémentaire, la cible choisit entre 2 fatigues, 1 état ou un décalage d’équilibre.</p>';
 if(t==='Presser l’adversaire')opts='<label>Approche interdite à la prochaine passe</label><select id="blocked">'+CombatCore.APPROACHES.map(a=>`<option value="${a}">${approachLabels[a]}</option>`).join('')+'</select>';
 if(t==='Observation rapide')opts=`<label>Réponse du MJ obtenue ?</label><select id="answer"><option value="yes">Oui</option><option value="no">Non</option></select><label>Partager le plan avec</label><select id="share"><option value="">Personne</option>${s.fighters.filter(f=>f.id!==$('source').value).map(f=>`<option value="${safe(f.id)}">${safe(f.name)}</option>`).join('')}</select>`;
 if(t==='Frapper un point faible')opts='<p class="small-note">Engagement requis dans le panneau Engagements du MJ (vérifié automatiquement). La cible doit être Gênée ; fatigue infligée = nombre de ses états cochés.</p>';
 if(t==='Trouver la faille')opts='<label>Direction du décalage différé</label><select id="direction"><option value="1">+1</option><option value="-1">−1</option></select><label><input type="checkbox" id="principleKnown" style="width:auto"> Principe adverse connu (confirmé par le MJ)</label><label><input type="checkbox" id="extraShift" style="width:auto"> Cocher 1 fatigue pour un deuxième décalage lorsque la faille est exploitée</label><p class="small-note">La faille est consommée à la prochaine fatigue ou au prochain état effectivement infligé à cette cible.</p>';
 if(t==='Glissade')opts='<p class="small-note">Choisir les ennemis à portée et les résistances. Cocher ensuite les nouveaux engagements voulus : seuls les liens impliquant un ennemi déplacé sont pris en compte. Les changements d’engagement de cette Glissade doivent être tous acceptés ou tous refusés ensemble lors de la validation MJ ; fatigue et états restent indépendants.</p>'+s.fighters.filter(x=>x.id!==f?.id).map(x=>'<label><input type="checkbox" class="glissade-enemy" value="'+safe(x.id)+'" style="width:auto"> À portée : '+safe(x.name)+'</label><label class="small-note"><input type="checkbox" class="glissade-resist" value="'+safe(x.id)+'" style="width:auto"> '+safe(x.name)+' résiste (1 fatigue + Gêné)</label>').join('')+'<p><b>Nouveaux engagements souhaités</b></p>'+s.fighters.flatMap((x,i)=>s.fighters.slice(i+1).map(y=>'<label><input type="checkbox" class="glissade-new-pair" data-a="'+safe(x.id)+'" data-b="'+safe(y.id)+'" style="width:auto"> '+safe(x.name)+' ↔ '+safe(y.name)+'</label>')).join('');
 if(t==='Meilleur, plus rapide, plus fort')opts='<p class="small-note">Technologie, p. 293 : 1 fatigue pour changer de position sans opposition. Pour 1 fatigue de plus, devenir Renforcé tant que la position est tenue OU sécuriser une zone dangereuse. La position et sa durée restent sous arbitrage MJ.</p><label><input type="checkbox" id="positionUnopposed" style="width:auto"> Le MJ confirme que le déplacement est sans opposition</label><label>Position ou zone atteinte</label><input id="positionDescription" maxlength="160" placeholder="Ex. : plateforme au-dessus de la cour"><label>Option supplémentaire</label><select id="positionBonus"><option value="none">Aucune (1 fatigue)</option><option value="reinforced">Renforcé tant que la position est tenue (2 fatigues)</option><option value="secure">Sécuriser une zone dangereuse (2 fatigues)</option></select>';
 if(t==='Aveuglé par la science')opts='<p class="small-note">p. 293 : investir 1 à 3 fatigues. La cible subit 1 fatigue et devient Gênée ; à 2 fatigues, ajouter Piégé ou Étourdi ; à 3, les deux.</p><label>Fatigue investie</label><select id="scienceFatigue"><option value="1">1 fatigue</option><option value="2">2 fatigues</option><option value="3">3 fatigues</option></select><label>Statut supplémentaire (si 2 fatigues)</label><select id="scienceExtra"><option value="piege">Piégé</option><option value="etourdi">Étourdi</option></select>';
 if(t==='Puissance maximale')opts='<p class="small-note">Technologie, p. 293 : devient Gêné, inflige 2 fatigues plus 1 par matériel dépensé (+2 supplémentaires si au moins 3 matériels). Toute la réserve est dépensée. Plus aucun gain de matériel jusqu’à la fin de la scène. Les effets doivent être validés ensemble par le MJ.</p>';
 if(t==='Maintenance')opts='<p class="small-note">Technologie, p. 293 : cocher 1 fatigue, effacer un état déjà coché et réserver 3 matériels. Les trois effets sont soumis à la validation du MJ.</p><label>État à effacer</label><select id="maintenanceCondition">'+Roster.CONDITIONS.map(x=>`<option>${x}</option>`).join('')+'</select>';
 if(t==='Collecter du matériel')opts='<p class="small-note">p. 293 : réserver 3 matériels et devenir Prêt. Les matériels sont conservés dans la fiche du combattant. Ils peuvent remplacer les coûts de fatigue des techniques technologiques.</p>';
 if(t==='Pose de pièges')opts='<p class="small-note">p. 293 : 1 fatigue pour armer un piège. Le MJ déclenche son effet lorsque le prochain adversaire entre dans la zone ; état et décentrage sont appliqués ensemble.</p><label>Zone piégée</label><input id="trapZone" maxlength="120" placeholder="Ex. : entrée du hangar">';
 if(t==='Électrochoc')opts='<p class="small-note">p. 293 : cible à portée, coût 1 fatigue. Personne : décentrage ; si technologie ou métal, devient Étourdie. Objet : ralentissement ou arrêt temporaire, suivi MJ.</p><label><input type="checkbox" id="shockInRange" style="width:auto"> Le MJ confirme la portée</label><label>Nature de la cible</label><select id="shockTargetType"><option value="person">Personne</option><option value="object">Objet</option></select><label>Direction du décentrage (personne)</label><select id="shockDirection"><option value="1">+1</option><option value="-1">−1</option></select><label><input type="checkbox" id="shockMetal" style="width:auto"> Personne utilisant la technologie ou couverte de métal</label><label>Objet visé (si cible matérielle)</label><input id="shockObjectName" maxlength="100" placeholder="Ex. : automaton, porte métallique"><p class="small-note">Pour un objet, la cible combattante sélectionnée est ignorée : le nom saisi désigne l’objet narratif.</p>';
 if(t==='Gantelet de glace')opts='<p class="small-note">Vous devenez Prêt. Votre prochaine attaque inflige 1 fatigue supplémentaire, y compris si elle a plusieurs effets. Le bonus est consommé même si la cible est protégée (p. 288).</p>';
 if(t==='Plaque de givre')opts='<label><input type="checkbox" id="iceConfirmed" style="width:auto"> Le MJ confirme que la cible se tient sur la plaque de glace</label><p class="small-note">La cible devient Gênée tant qu’elle reste sur la glace ; le lanceur devient Prêt à l’engager. Retirer Gêné manuellement lorsque la cible quitte la glace (p. 288).</p>';
 if(t==='Dérobade')opts='<label>État à effacer</label><select id="condition">'+Roster.CONDITIONS.map(x=>`<option>${x}</option>`).join('')+'</select>';
 if(entry&&(entry.famille==='technologie'||entry.famille==='base'))opts+='<p class="small-note">V0.95 — Substitution : 1 matériel remplace 1 fatigue personnelle à payer pour cette technique (si la réserve est suffisante). Les techniques de base exigent confirmation de l’entraînement technologique par le MJ.</p>'+(entry.famille==='base'?'<label><input type="checkbox" id="technologyBasicConfirmed" style="width:auto"> Cette technique de base utilise mon entraînement technologique (MJ)</label>':'')+'<label>Matériels utilisés à la place de fatigue</label><input type="number" id="materialsInsteadOfFatigue" min="0" max="99" value="0">';
 // Un bouclier peut être sacrifié lors de la validation du coût, pas avant.
 const earthTechniques=['Armure de terre','Bouclier de roche','Boue gluante','Colonne de pierre','Détection du pas lourd','Enfouissement','Entraves de métal','Escalier de poussière','Étoile de lave','Gantelet de terre','Mords la poussière','Mouvements tectoniques','Projection tellurique'];
 const myShields=(s.temporaryEffects||[]).filter(e=>e.originLabel==='Bouclier de roche'&&e.originSourceId===$('source').value);
 if(earthTechniques.includes(t)&&myShields.length)opts+='<label>Bouclier de roche à consommer pour réduire le coût (facultatif)</label><select id="earthShieldDiscountId"><option value="">Ne pas consommer</option>'+myShields.map(e=>'<option value="'+safe(e.id)+'">Bouclier protégeant '+safe(CombatCore.fighter(s,e.targetId).name)+'</option>').join('')+'</select><p class="small-note">Réduction de 1 fatigue appliquée automatiquement lors de la validation de la technique. Un coût nul ne permet pas de consommer le bouclier.</p>';
 $('opts').innerHTML=opts;
}
function updateStrikeChoices(){const choice=$('choice'),forced=$('forceStrike')?.checked;if(!choice)return;const balance=Array.from(choice.options).find(o=>o.value==='balance');if(balance)balance.disabled=!!forced;if(forced&&choice.value==='balance')choice.value='fatigue';}
function targetOpponent(){const id=$('source').value;const enemy=s.fighters.find(x=>x.id!==id);if(enemy){$('target').value=enemy.id}}
function prepare(){try{
 const f=CombatCore.fighter(s,$('source').value),t=$('target').value,entry=TECH_CATALOG.find(x=>x.id===$('tech').value);
 if(!entry)throw Error('Choisis une technique accessible');
 const name=entry.nom;
 const options={catalogEntry:entry,earthArmorConfirmed:!!$('earthArmorConfirmed')?.checked,earthShieldConfirmed:!!$('earthShieldConfirmed')?.checked,earthShieldProtectedId:$('earthShieldProtectedId')?.value||'',earthShieldDiscountId:$('earthShieldDiscountId')?.value||'',earthAirUnableTargets:Array.from(document.querySelectorAll('.earth-air-unable:checked')).map(x=>x.value),earthGauntletProjection:$('earthGauntletProjection')?.value||'none',earthSeismicConfirmed:!!$('earthSeismicConfirmed')?.checked,earthLavaConfirmed:!!$('earthLavaConfirmed')?.checked,earthMudConfirmed:!!$('earthMudConfirmed')?.checked,earthMudAttackers:Array.from(document.querySelectorAll('.earth-mud-attacker:checked')).map(x=>x.value),earthMetalConfirmed:!!$('earthMetalConfirmed')?.checked,earthStairsConfirmed:!!$('earthStairsConfirmed')?.checked,earthStairsBlocker:$('earthStairsBlocker')?.value||'',countertimeConfirmed:!!$('countertimeConfirmed')?.checked,weaponCounterConfirmed:!!$('weaponCounterConfirmed')?.checked,weaponDisarmConfirmed:!!$('weaponDisarmConfirmed')?.checked,weaponDisarmTechnique:$('weaponDisarmTechnique')?.value,weaponFeintConfirmed:!!$('weaponFeintConfirmed')?.checked,weaponFeintAttackers:Array.from(document.querySelectorAll('.weapon-feint-attacker:checked')).map(x=>x.value),weaponFeintConditions:Object.fromEntries(Array.from(document.querySelectorAll('.weapon-feint-condition')).map(x=>[x.dataset.attacker,x.value])),weaponPiercingConfirmed:!!$('weaponPiercingConfirmed')?.checked,weaponMoveExtra:!!$('weaponMoveExtra')?.checked,weaponMoveConfirmed:!!$('weaponMoveConfirmed')?.checked,weaponMoveBlocked:!!$('weaponMoveBlocked')?.checked,weaponBlockerId:$('weaponBlockerId')?.value||'',weaponArrowsConfirmed:!!$('weaponArrowsConfirmed')?.checked,weaponArrowCost:Number($('weaponArrowCost')?.value),weaponHighGroundConfirmed:!!$('weaponHighGroundConfirmed')?.checked,tectonicZone:!!$('tectonicZone')?.checked,tectonicTargets:Array.from(document.querySelectorAll('.tectonic-target:checked')).map(x=>x.value),mode:$('techMode')?.value||'double',windChoice:$('windChoice')?.value,airConeInRange:!!$('airConeInRange')?.checked,airConeAllies:Array.from(document.querySelectorAll('.air-cone-ally:checked')).map(x=>x.value),airShockZoneConfirmed:!!$('airShockZoneConfirmed')?.checked,airShockTargets:Array.from(document.querySelectorAll('.air-shock-target:checked')).map(x=>x.value),airShockResisting:Array.from(document.querySelectorAll('.air-shock-resist:checked')).map(x=>x.value),airWaveConfirmed:!!$('airWaveConfirmed')?.checked,airWaveMode:$('airWaveMode')?.value,airWaveTargets:Array.from(document.querySelectorAll('.air-wave-target:checked')).map(x=>x.value),airCushionArmorConfirmed:!!$('airCushionArmorConfirmed')?.checked,airReedConfirmed:!!$('airReedConfirmed')?.checked,airReedPrediction:$('airReedPrediction')?.value,airSphereConfirmed:!!$('airSphereConfirmed')?.checked,airOscConfirmed:!!$('airOscConfirmed')?.checked,windSpend:Number($('windSpend')?.value||0),airCushionConfirmed:!!$('airCushionConfirmed')?.checked,airCushionChoice:$('airCushionChoice')?.value,airCushionCondition:$('airCushionCondition')?.value,airCushionStatus:$('airCushionStatus')?.value,airObject:$('airObject')?.value||'',airResistance:$('airResistance')?.value,fireCost:$('fireCost')?.value,fireChoice:$('fireChoice')?.value,fireConditions:[$('fireCondition1')?.value,$('fireCondition2')?.value],choice:$('choice')?.value,condition:$('condition')?.value,direction:Number($('direction')?.value),blocked:$('blocked')?.value,forceStrike:!!$('forceStrike')?.checked,answerConfirmed:$('answer')?.value==='yes',shareWithId:$('share')?.value||null,principleKnown:!!$('principleKnown')?.checked,extraShift:!!$('extraShift')?.checked,positionUnopposed:!!$('positionUnopposed')?.checked,positionDescription:$('positionDescription')?.value||'',positionBonus:$('positionBonus')?.value,scienceFatigue:Number($('scienceFatigue')?.value),scienceExtra:$('scienceExtra')?.value,materialsInsteadOfFatigue:Number($('materialsInsteadOfFatigue')?.value||0),technologyBasicConfirmed:!!$('technologyBasicConfirmed')?.checked,maintenanceCondition:$('maintenanceCondition')?.value,trapZone:$('trapZone')?.value||'',shockInRange:!!$('shockInRange')?.checked,shockTargetType:$('shockTargetType')?.value,shockDirection:Number($('shockDirection')?.value),shockMetal:!!$('shockMetal')?.checked,shockObjectName:$('shockObjectName')?.value||'',iceConfirmed:!!$('iceConfirmed')?.checked,glissadeEnemies:Array.from(document.querySelectorAll('.glissade-enemy:checked')).map(x=>x.value),glissadeResisting:Array.from(document.querySelectorAll('.glissade-resist:checked')).map(x=>x.value),glissadeNewEngagements:Array.from(document.querySelectorAll('.glissade-new-pair:checked')).map(x=>[x.dataset.a,x.dataset.b])};
 if(f.kind==='PJ'&&f.roll==='6-'){options.balanceCostApproved=confirm('Sur 6−, confirmer le décentrage d’équilibre pour utiliser une technique de base ?');if(!options.balanceCostApproved)return;const direction=prompt('Direction du décentrage : +1 ou -1','1');if(!['1','-1'].includes(direction))return;options.balanceDirection=Number(direction)}
 const effectiveTarget=name==='Électrochoc'&&options.shockTargetType==='object'?f.id:t;
 const a=CombatCore.queueTechnique(s,f.id,name,f.approach,effectiveTarget,options);
 try{CombatCore.propose(s,a)}catch(err){s.actions=s.actions.filter(x=>x.id!==a.id);throw err}$('message').textContent='Effets proposés, en attente de validation.';render();
}catch(e){$('message').textContent=e.message}}
function approvalDecisions(){
 const decisions={};for(const e of s.proposals)decisions[e.id]=$('accept-'+e.id).checked;
 // D'abord choisir les interceptions, puis calculer tous les effets (réactions incluses).
 // V0.67 : un seul dialogue par attaque et cible, même lorsque
 // ses effets sont entrelacés avec ceux d'autres attaques.
 const seenAttacks=new Set(),reservedUI=new Set();
 for(const e of s.proposals.filter(x=>['fatigue','condition','balance'].includes(x.kind)||(x.kind==='status_add'&&['en_danger','gene','piege','etourdi'].includes(x.detail)))){
  if(decisions[e.id]===false||e.sourceId===e.targetId||e.fatigueType==='cost')continue;
  const key=e.actionId+'|'+e.targetId;
  if(seenAttacks.has(key))continue;
  seenAttacks.add(key);
  const protectors=s.fighters.filter(f=>!reservedUI.has(f.id)&&f.id!==e.sourceId&&f.reactions.some(r=>r.type==='protection'&&r.allyId===e.targetId&&r.round===s.round&&!r.used));
  if(!protectors.length)continue;
  const intercept=confirm('Une Protection est armée. Intercepter cette attaque pour 1 fatigue ?');
  decisions['intercept:'+e.id]=intercept;
  if(!intercept)continue;
  let chosen=protectors[0];
  if(protectors.length>1){
   const options=protectors.map((f,i)=>(i+1)+'. '+f.name).join('\n');
   const selection=prompt('Quel protecteur intervient ?\n'+options,'1');
   if(selection===null){decisions['intercept:'+e.id]=false;continue;}
   const index=Number(selection)-1;
   if(!Number.isInteger(index)||index<0||index>=protectors.length)throw Error('Choix de protecteur invalide');
   chosen=protectors[index];
  }
  decisions['protector:'+e.id]=chosen.id;
  reservedUI.add(chosen.id);
 }
 // V2.10 : allocation MJ par attaque, y compris les attaques mixtes.
 const armorPreview=CombatCore.previewCommit(s,decisions);
 const armorAvailable=new Map((s.temporaryEffects||[]).filter(x=>x.originLabel==='Armure de terre'&&Number(x.armorPoints)>0).map(x=>[x.targetId,Number(x.armorPoints)]));
 const armorAttacks=new Map();
 for(const e of armorPreview){
  if(e.actionId==='armor'&&String(e.reason||'').includes('point(s) de réserve dépensé(s) automatiquement'))continue;
  const original=s.proposals.find(p=>p.id===e.id);
  if(!original||original.sourceId===original.targetId||original.fatigueType==='cost'||!armorAvailable.has(original.targetId))continue;
  if(original.kind!=='fatigue'&&original.kind!=='condition')continue;
  // Reconstituer uniquement les effets encore applicables après interception et protections.
  if(e.kind==='note'&&!String(e.reason||'').includes('Armure de terre'))continue;
  const key=original.actionId+'|'+original.targetId;
  if(!armorAttacks.has(key))armorAttacks.set(key,{targetId:original.targetId,fatigue:0,firstFatigue:null,conditions:[]});
  const g=armorAttacks.get(key);
  if(original.kind==='fatigue'&&Number(original.amount)>0){g.fatigue+=Number(original.amount);if(!g.firstFatigue)g.firstFatigue=original;}
  if(original.kind==='condition'&&original.detail&&!CombatCore.fighter(s,original.targetId).conditions.includes(original.detail)&&!g.conditions.some(c=>c.detail===original.detail))g.conditions.push(original);
 }
 for(const g of armorAttacks.values()){
  const reserve=armorAvailable.get(g.targetId)||0;
  if(!reserve||(!g.fatigue&&!g.conditions.length))continue;
  const name=CombatCore.fighter(s,g.targetId).name;
  const mixed=g.fatigue>0&&g.conditions.length>0;
  // V2.32 : ne pas imposer silencieusement le premier état quand plusieurs
  // états distincts arrivent dans la même attaque. Même avec un seul point,
  // le MJ doit pouvoir choisir l'état annulé.
  if(!mixed&&g.fatigue>0&&(g.fatigue<=2||reserve===1)) {armorAvailable.set(g.targetId,reserve-1);continue;}
  if(!mixed&&!g.fatigue&&g.conditions.length===1){armorAvailable.set(g.targetId,reserve-1);continue;}
  const maxFatigue=Math.min(reserve,Math.ceil(g.fatigue/2));
  const defaultFatigue=g.fatigue?1:0;
  const fatigueAnswer=g.fatigue?prompt(name+' — Armure de terre : '+g.fatigue+' fatigue(s), '+g.conditions.length+' état(s).\nPoints pour la fatigue (0 à '+maxFatigue+', 1 point annule 2 fatigues).\nAu moins 1 point au total pour cette attaque.',String(defaultFatigue)):'0';
  if(fatigueAnswer===null)return;
  const fp=Number(fatigueAnswer);
  if(!Number.isInteger(fp)||fp<0||fp>maxFatigue)throw Error('Armure de terre : allocation de fatigue invalide');
  if(g.firstFatigue)decisions['armor:'+g.firstFatigue.id]=fp;
  let spent=fp;
  for(const c of g.conditions){
   // Une fois la réserve épuisée, les autres états sont subis : ne pas
   // proposer au MJ une dépense impossible et ne pas sur-réserver.
   if(spent>=reserve){decisions['armor:'+c.id]=0;continue;}
   const answer=prompt(name+' — Annuler l’état « '+c.detail+' » ?\n0 = subir ; 1 = dépenser 1 point d’armure.\nRéserve restante pour cette attaque : '+(reserve-spent),String(!g.fatigue&&spent===0?1:0));
   if(answer===null)return;
   const cp=Number(answer);
   if(!Number.isInteger(cp)||cp<0||cp>1)throw Error('Armure de terre : choisir 0 ou 1');
   decisions['armor:'+c.id]=cp;spent+=cp;
  }
  if(spent<1||spent>reserve)throw Error('Armure de terre : dépenser entre 1 et '+reserve+' point(s) pour cette attaque');
  armorAvailable.set(g.targetId,reserve-spent);
 }
 const effective=CombatCore.previewCommit(s,decisions);
 const simulated=new Map(s.fighters.map(f=>[f.id,{fatigue:f.fatigue,conditions:new Set(f.conditions)}]));
 for(const e of effective){
  const state=simulated.get(e.targetId);
  if(e.kind==='condition'&&e.detail)state.conditions.add(e.detail);
  if(e.kind==='condition_remove')state.conditions.delete(e.detail);
  if(e.kind!=='fatigue')continue;
  const next=state.fatigue+e.amount;
  if(next>5){
   if(e.fatigueType==='cost')throw Error(CombatCore.fighter(s,e.targetId).name+' : fatigue insuffisante pour ce coût volontaire (p. 100)');
   const chosen=[];
   for(let i=0;i<next-5;i++){
    const available=Roster.CONDITIONS.filter(c=>!state.conditions.has(c));
    if(!available.length)throw Error('Tous les états de '+CombatCore.fighter(s,e.targetId).name+' sont cochés : arbitrage MJ nécessaire.');
    const answer=prompt(CombatCore.fighter(s,e.targetId).name+' : fatigue excédentaire ('+e.reason+'), choisir un état parmi '+available.join(' / '),available[0]);
    if(answer===null)return;
    if(!available.includes(answer))throw Error('État invalide : '+answer);
    state.conditions.add(answer);chosen.push(answer);
   }
   decisions['overflow:'+e.id]=chosen;
  }
  state.fatigue=Math.max(0,Math.min(5,next));
 }
 return decisions;
}
function approve(){try{const decisions=approvalDecisions();if(!decisions)return;CombatCore.commit(s,decisions);render();}catch(e){alert(e.message)}}
function reject(){s.proposals=[];render()}
function back(){CombatCore.undo(s);render()}
function releaseTrapped(id){
 const f=CombatCore.fighter(s,id);
 if(!confirm('Le MJ confirme-t-il une action fictionnelle permettant à '+f.name+' de se libérer ?'))return;
 const raw=prompt('Nombre de cases de fatigue à cocher (0 à 3). Les cases restantes seront des états choisis ensuite.','3');
 if(raw===null)return;
 const fatigue=Number(raw);
 if(!Number.isInteger(fatigue)||fatigue<0||fatigue>3){alert('Indiquer un entier entre 0 et 3.');return}
 const conditions=[];
 for(let i=0;i<3-fatigue;i++){
  const available=Roster.CONDITIONS.filter(c=>!f.conditions.includes(c)&&!conditions.includes(c));
  const chosen=prompt('Choisir un état disponible : '+available.join(' / '),available[0]||'');
  if(chosen===null)return;
  if(!available.includes(chosen)){alert('État invalide ou déjà marqué.');return}
  conditions.push(chosen);
 }
 try{commitCombatMutation(()=>CombatCore.escapeTrap(s,id,fatigue,conditions,true));render()}catch(e){alert(e.message)}
}
function step(){try{if(s.phase==='declaration')commitCombatMutation(()=>CombatCore.reveal(s));else if(s.phase==='esquiver')commitCombatMutation(()=>CombatCore.endRound(s));else if(s.phase==='fin'){
 const overflowChoices={};
 for(const f of s.fighters.filter(f=>f.statuses.includes('en_danger')&&f.fatigue>=5)){
  const available=Roster.CONDITIONS.filter(c=>!f.conditions.includes(c));
  if(!available.length)throw Error(f.name+' : tous les états sont marqués ; mise hors de combat à arbitrer.');
  const choice=prompt(f.name+' : En danger, choisir un état pour reporter la fatigue : '+available.join(' / '),available[0]);
  if(choice===null)return;
  if(!available.includes(choice))throw Error('État invalide : '+choice);
  overflowChoices[f.id]=choice;
 }
 commitCombatMutation(()=>CombatCore.nextRound(s,overflowChoices));
}else commitCombatMutation(()=>CombatCore.advance(s));render()}catch(e){alert(e.message)}}
// V0.27 : validation des sauvegardes avant toute mutation de l'état.
