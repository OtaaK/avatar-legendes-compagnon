function importCombat(ev){const file=ev.target.files?.[0];if(!file)return;file.text().then(txt=>{try{const x=JSON.parse(txt);validateCombat(x);validateBackupLinks(lib,x);commitCombatMutation(()=>{s=x;render()})}catch(err){alert(err.message)}}).catch(err=>alert('Lecture impossible : '+err.message)).finally(()=>{ev.target.value=''})}

function clearCatalogFamilies(){document.querySelectorAll('.catalog-family-check').forEach(el=>el.checked=false);renderCatalog()}
function renderCatalog(){
 const q=($('catalogSearch')?.value||'').trim().toLocaleLowerCase('fr');
 const families=Array.from(document.querySelectorAll('.catalog-family-check:checked')).map(el=>el.value),approach=$('catalogApproach')?.value||'',rare=$('catalogRare')?.value||'';
 $('catalogFamilySummary').textContent=families.length?families.length===1?document.querySelector('.catalog-family-check:checked').parentElement.innerText.trim():families.length+' familles sélectionnées':'Toutes les familles';
 const found=TECH_CATALOG.filter(t=>(!q||t.nom.toLocaleLowerCase('fr').includes(q))&&(!families.length||families.includes(t.famille))&&(!approach||t.approche===approach)&&(!rare||(rare==='rare')===!!t.rare));
 $('catalogCount').textContent=found.length+' technique(s) trouvée(s) · 102 effets avancés documentés · 2 automatisations testées, 100 sous arbitrage MJ';
 $('catalogResults').innerHTML=found.map(t=>`<button type="button" class="catalog-mini" data-family="${safe(t.famille)}" data-ui-click="openCatalogDetail" data-id="${safe(t.id)}"><strong>${safe(t.nom)}</strong><span class="catalog-tag">${safe(t.famille)}</span>${t.rare?'<span class="catalog-rare-star" title="Technique rare" aria-label="Technique rare">★</span>':''}<small>${safe(t.approche)}</small></button>`).join('')||'<p>Aucun résultat.</p>';
 $('catalogBrowser').hidden=false;$('catalogDetail').hidden=true;
}
function openCatalogDetail(id){
 const t=TECH_CATALOG.find(x=>x.id===id);if(!t)return;
 $('catalogBrowser').hidden=true;$('catalogDetail').hidden=false;
 $('catalogDetail').innerHTML=`<button class="alt catalog-back" onclick="closeCatalogDetail()">← Retour aux techniques</button><h3>${safe(t.nom)}</h3><p><span class="chip">${safe(t.famille)}</span> ${t.rare?'<span class="chip">Rare</span>':''}</p><p><b>Approche :</b> ${safe(t.approche)}</p><p><b>Référence :</b> Livre p. ${safe(t.page)}</p>${t.prerequis_specialise?'<p><b>Prérequis :</b> '+safe(t.prerequis_specialise)+'</p>':''}${t.famille!=='base'?(TECH_AUDIT[t.id]?'<p class="small-help" role="note"><b>Effet comparé au texte extrait du livre (p. ${TECH_AUDIT[t.id].page}).</b> '+(TECH_AUDIT[t.id].automatisation==='assistance_partielle_v233'?'Assistance testée V2.33 ; choix narratifs soumis au MJ, arbitrages de règles encore ouverts.':TECH_AUDIT[t.id].automatisation==='validee_v049'?'Automatisation testée V0.49 (cas couverts par les tests ; autres choix soumis au MJ).':(/^validee_v0/.test(TECH_AUDIT[t.id].automatisation)?'Automatisation testée (certains choix restent soumis au MJ).':'Automatisation non validée ; arbitrage MJ nécessaire.'))+'</p><p><b>Effet vérifié (synthèse) :</b> '+safe(TECH_AUDIT[t.id].resume_verifie)+'</p>':'<p class="small-help" role="note"><b>Validation des règles en attente :</b> les effets et prérequis de cette technique avancée n’ont pas encore été vérifiés individuellement. L’attribution à une fiche ne signifie pas que ses effets sont automatisés. Consulter le livre et arbitrer en tant que MJ.</p>'):''}${t.effet_resume?'<p><b>Résumé de travail :</b> '+safe(t.effet_resume)+'</p>':'<p class="small-help">Effet détaillé non transcrit : consulter le livre de règles.</p>'}<button class="alt" data-ui-click="selectCatalogTechnique" data-id="${safe(t.id)}">Attribuer à une fiche</button>`;
 $('catalogDetail').scrollIntoView({block:'start'});
}
function closeCatalogDetail(){$('catalogBrowser').hidden=false;$('catalogDetail').hidden=true}
function selectCatalogTechnique(id){const t=TECH_CATALOG.find(t=>t.id===id);if(!t)return;const select=$('sheetTechnique');if(!select||!Array.from(select.options).some(o=>o.value===id)){alert('Sélectionne une fiche compatible (les techniques de groupe sont réservées aux PNJ).');return}select.value=id;select.scrollIntoView({behavior:'smooth',block:'center'})}
let wizardStep=0;
const WIZARD_STEPS=4;
function wizardError(message=''){$('wizardError').textContent=message}
function wizardData(){
 return {name:$('wizardName').value.trim(),livret:$('wizardBook').value,bonus:$('wizardBonus').value,
 training:$('wizardTraining').value,history:$('wizardHistory').value.trim(),
 relationships:$('wizardRelations').value.split('\n').map(x=>x.trim()).filter(Boolean)};
}
function wizardValidate(step){
 const x=wizardData();
 if(step===0){
  if(!x.name)throw Error('Renseigne le nom du personnage.');
  if(!Playbooks.byName(x.livret))throw Error('Choisis un livret.');
 }
 if(step===1)Playbooks.initialStats(x.livret,x.bonus);
 if(step===2&&!x.training)throw Error('Choisis un entraînement.');
 return x;
}
function chooseWizardBonus(key){$('wizardBonus').value=key;wizardPreview()}
function wizardPreview(){
 const p=Playbooks.byName($('wizardBook').value);if(!p)return;
 const keys=[['creativite','Créativité'],['concentration','Concentration'],['harmonie','Harmonie'],['enthousiasme','Enthousiasme']];
 let bonus=$('wizardBonus').value;
 if(!keys.some(([key],i)=>key===bonus&&p.stats[i]<2)){bonus=keys.find(([key],i)=>p.stats[i]<2)[0];$('wizardBonus').value=bonus;}
 $('wizardStatChoices').innerHTML=keys.map(([key,label])=>{
  let value=p.stats[keys.findIndex(item=>item[0]===key)]+(bonus===key?1:0),invalid=p.stats[keys.findIndex(item=>item[0]===key)]>=2;
  return `<button type="button" class="wizard-stat ${bonus===key?'selected':''}" aria-pressed="${bonus===key}" ${invalid?'disabled':''} data-ui-click="chooseWizardBonus" data-id="${safe(key)}"><span>${label}</span><strong>${value>=0?'+':''}${value}</strong>${bonus===key?'<em>✓ Bonus appliqué</em>':'<em>Cliquer pour +1</em>'}</button>`;
 }).join('');
 $('wizardRelationsBox').hidden=false; // Les dix livrets officiels comportent une rubrique « Relations ».
 try{
  const st=Playbooks.initialStats(p,bonus);
  $('wizardSummary').innerHTML=`<b>Équilibre initial</b><div class="wizard-balance"><div class="wizard-balance-head"><strong>${safe(p.principles[0])}</strong><strong>${safe(p.principles[1])}</strong></div><div class="wizard-balance-track"></div><div class="wizard-balance-ticks"><span>−3</span><span>−2</span><span>−1</span><span>0</span><span>+1</span><span>+2</span><span>+3</span></div></div><small>Position initiale : 0 · Livret p. ${p.page}</small>`;
 }catch(e){$('wizardSummary').textContent=e.message}
}
function chooseWizardTraining(value){$('wizardTraining').value=value;renderWizardTraining()}
function renderWizardTraining(){
 const selected=$('wizardTraining').value;
 const icons={'Maîtrise de l’Air':'◌','Maîtrise de l’Eau':'≈','Maîtrise de la Terre':'◆','Maîtrise du Feu':'♨','Armes':'⚔','Technologie':'⚙'};
 const colors={'Maîtrise de l’Air':'#A4B6C5','Maîtrise de l’Eau':'#2196F3','Maîtrise de la Terre':'#22B85A','Maîtrise du Feu':'#EF4444','Armes':'#505866','Technologie':'#790F66'};
 $('wizardTrainingChoices').innerHTML=Roster.TRAININGS.filter(Boolean).map(t=>`<button type="button" class="wizard-training ${selected===t?'selected':''}" style="--training-color:${colors[t]}" aria-pressed="${selected===t}" data-ui-click="chooseWizardTraining" data-id="${safe(t)}"><span class="wizard-training-icon">${icons[t]}</span><span>${safe(t)}</span>${selected===t?'<b class="wizard-training-check">✓</b>':''}</button>`).join('');
}
function wizardReview(){
 const x=wizardData(),p=Playbooks.byName(x.livret);
 if(!p)return;
 const st=Playbooks.initialStats(p,x.bonus);
 const labels={creativite:'Créativité',concentration:'Concentration',harmonie:'Harmonie',enthousiasme:'Enthousiasme'};
 $('wizardReview').innerHTML=`<div class="wizard-review-header"><span class="wizard-review-avatar">✦</span><div><h3>${safe(x.name)}</h3><span>${safe(x.livret)} · PJ</span></div></div>
 <div class="wizard-review-section"><h4>Caractéristiques</h4><div class="wizard-review-stats">${Object.entries(st).map(([k,v])=>`<div class="wizard-review-stat ${k===x.bonus?'boosted':''}"><span>${labels[k]}</span><strong>${v>=0?'+':''}${v}</strong>${k===x.bonus?'<small>+1 création</small>':''}</div>`).join('')}</div></div>
 <div class="wizard-review-section"><h4>Principes et équilibre</h4><div class="wizard-balance"><div class="wizard-balance-head"><strong>${safe(p.principles[0])}</strong><strong>${safe(p.principles[1])}</strong></div><div class="wizard-balance-track"></div><div class="wizard-balance-ticks"><span>−3</span><span>−2</span><span>−1</span><span>0</span><span>+1</span><span>+2</span><span>+3</span></div></div></div>
 <div class="wizard-review-section"><h4>Entraînement</h4><span class="wizard-review-training">${safe(x.training)}</span></div>
 ${x.relationships.length?`<div class="wizard-review-section"><h4>Relations</h4><ul>${x.relationships.map(r=>`<li>${safe(r)}</li>`).join('')}</ul></div>`:''}`;
}

function wizardRender(){
 document.querySelectorAll('.wizard-page').forEach(page=>{page.hidden=Number(page.dataset.step)!==wizardStep});
 $('wizardProgress').innerHTML=Array.from({length:WIZARD_STEPS},(_,i)=>`<span class="${i<=wizardStep?'active':''}" title="Étape ${i+1} sur ${WIZARD_STEPS}"></span>`).join('');
 $('wizardPrev').hidden=wizardStep===0;
 $('wizardNext').hidden=wizardStep===WIZARD_STEPS-1;
 $('wizardFinish').hidden=wizardStep!==WIZARD_STEPS-1;
 if(wizardStep===1)wizardPreview();
 if(wizardStep===2)renderWizardTraining();
 if(wizardStep===3)wizardReview();
 wizardError();
}
function wizardMove(delta){
 try{
  if(delta>0)wizardValidate(wizardStep);
  wizardStep=Math.max(0,Math.min(WIZARD_STEPS-1,wizardStep+delta));
  wizardRender();
 }catch(e){wizardError(e.message)}
}
function toggleWizard(force){
 const wizard=$('wizard'),open=typeof force==='boolean'?force:wizard.hidden;
 wizard.hidden=!open;$('wizardToggle').setAttribute('aria-expanded',String(open));
 $('wizardToggle').textContent=open?'Masquer la création':'+ Créer un PJ';
 if(open)$('wizardName').focus();
}
function resetWizard(){
 if(wizardStep>0&&!confirm('Recommencer la création du personnage ?'))return;
 $('wizardName').value='';$('wizardBook').selectedIndex=0;$('wizardBonus').value='creativite';
 $('wizardTraining').value='';$('wizardHistory').value='';$('wizardRelations').value='';
 wizardStep=0;wizardRender();
}
function createFromWizard(){
 try{
  for(let i=0;i<WIZARD_STEPS-1;i++)wizardValidate(i);
  const x=wizardData();
  const other=lib.characters.find(c=>c.kind==='PJ'&&c.livret===x.livret);
  if(other&&!confirm(`Le livret est déjà utilisé par ${other.name}. Continuer avec l'accord du groupe ?`))return;
  // Build and validate all data before inserting the new sheet.
  const book=Playbooks.byName(x.livret);
  const preset={livret:book.name,stats:Playbooks.initialStats(book,x.bonus),principles:[...book.principles],balance:0,center:0};
  const candidate={...Roster.makeCharacter('preview',x.name,'PJ'),...preset,training:x.training,history:x.history,relationships:x.relationships};
  Roster.validateCharacter(candidate);
  const c=commitLibraryMutation(()=>{const created=Roster.createCharacter(lib,x.name,'PJ');Roster.updateCharacter(lib,created.id,{...preset,training:x.training,history:x.history,relationships:x.relationships});return created});
  renderSheets(c.id);render();
  $('wizardName').value='';$('wizardHistory').value='';$('wizardRelations').value='';
  wizardStep=0;wizardRender();toggleWizard(false);
  setView('characters',false);openCharacterDetail(c.id);
 }catch(e){wizardError(e.message)}
}
function initWizard(){
 const el=$('wizardBook');if(!el)return;
 el.innerHTML=Playbooks.PLAYBOOKS.map(p=>`<option value="${safe(p.name)}">${safe(p.name)}</option>`).join('');
 renderWizardTraining();
 wizardRender();
}
function newSheet(kind){try{const name=prompt('Nom du personnage');if(!name)return;const c=commitLibraryMutation(()=>Roster.createCharacter(lib,name,kind));renderSheets(c.id);openCharacterDetail(c.id)}catch(e){alert(e.message)}}
const VIEWS=['home','characters','combat','catalog'];
let currentView='home';
let currentSheetTab='identity';
function quickNavigation(e){
 if(e.altKey&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&['1','2','3','4'].includes(e.key)){
  if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;
  e.preventDefault();setView(VIEWS[Number(e.key)-1]);
 }
}
function setView(view,scroll=true){
 if(!VIEWS.includes(view))view='home';
 currentView=view;
 document.querySelectorAll('.app-view').forEach(el=>{el.hidden=el.id!=='view-'+view && !(view==='combat'&&el.id==='view-combat-panels')});
 document.querySelectorAll('.main-nav button').forEach(b=>{const active=b.dataset.view===view;b.classList.toggle('active',active);b.setAttribute('aria-current',active?'page':'false')});
 if(scroll)window.scrollTo({top:0,behavior:'instant'});
 uiPreferences.write('avatar-ui-view',view)
}
function setSheetTab(tab){
 if(!['identity','resources','story','techniques'].includes(tab))return;
 currentSheetTab=tab;applySheetTab();
}
function applySheetTab(){
 const form=$('sheetForm');if(!form)return;
 form.querySelectorAll('[data-sheet-group]').forEach(el=>{el.hidden=el.dataset.sheetGroup!==currentSheetTab});
 // Identity fields are ungrouped; hide only their visual wrappers on other tabs, not the inputs needed by saveSheet.
 form.querySelectorAll('.sheet-identity').forEach(el=>{el.hidden=currentSheetTab!=='identity'});
 form.querySelectorAll('.sheet-save').forEach(el=>{el.hidden=currentSheetTab==='techniques'});
 document.querySelectorAll('.sheet-nav button').forEach(b=>{const active=b.dataset.sheetTab===currentSheetTab;b.classList.toggle('active',active);b.setAttribute('aria-selected',active?'true':'false')});
}
let characterKind='PJ';
let characterDetailOpen=false;
const POSITIVE_STATUSES=new Set(['Renforcé','Avantagé','Confiant','Prêt']);
const STATUS_EXPLANATIONS={
 'Renforcé':'Statut positif. Consulter les règles de combat pour son application et sa durée.',
 'Avantagé':'Statut positif. Consulter les règles de combat pour son application et sa durée.',
 'Confiant':'Statut positif. Consulter les règles de combat pour son application et sa durée.',
 'Prêt':'Statut positif. Consulter les règles de combat pour son application et sa durée.',
 'En danger':'Statut négatif. Consulter les règles de combat pour son application et sa durée.',
 'Gêné':'Statut négatif. Consulter les règles de combat pour son application et sa durée.',
 'Piégé':'Statut négatif. Consulter les règles de combat pour son application et sa durée.',
 'Étourdi':'Statut négatif. Consulter les règles de combat pour son application et sa durée.'
};
const CONDITION_EXPLANATIONS={
 'Terrifié':'État émotionnel marqué. Consulter la règle officielle pour ses conséquences et sa résolution.',
 'En colère':'État émotionnel marqué. Consulter la règle officielle pour ses conséquences et sa résolution.',
 'Coupable':'État émotionnel marqué. Consulter la règle officielle pour ses conséquences et sa résolution.',
 'Fragile':'État émotionnel marqué. Consulter la règle officielle pour ses conséquences et sa résolution.',
 'Confus':'État émotionnel marqué. Consulter la règle officielle pour ses conséquences et sa résolution.'
};
function chipHtml(name,type){
 const color=type==='condition'?'condition':POSITIVE_STATUSES.has(name)?'positive':'negative';
 return `<button type="button" class="card-chip ${color}" data-chip="${safe(name)}" data-chip-type="${type}" onclick="showCardTooltip(event,this)" onmouseenter="showCardTooltip(event,this)" onmouseleave="hideCardTooltip()" onfocus="showCardTooltip(event,this)" onblur="hideCardTooltip(false)" aria-label="Effet de ${safe(name)}">${safe(name)}</button>`;
}
function balanceGraphic(c){
 const val=Math.max(-3,Math.min(3,Number(c.balance)||0)),cx=12+(val+3)*296/6;
 const ticks=Array.from({length:7},(_,i)=>`<circle cx="${12+i*296/6}" cy="10.5" r="2.5" fill="#91a7be" opacity=".65"/><text x="${12+i*296/6}" y="29" text-anchor="middle" font-size="10" fill="#b7c7d8">${i-3>0?'+':''}${i-3}</text>`).join('');
 return `<div class="card-balance"><div class="card-label">Équilibre</div><div class="balance-principles"><span>${safe(c.principles?.[0]||'Principe −')}</span><span>${safe(c.principles?.[1]||'Principe +')}</span></div><svg class="balance-svg" viewBox="0 0 320 36" role="img" aria-label="Équilibre ${val}"><rect x="12" y="8" width="296" height="5" rx="2.5" fill="#435873"/>${ticks}<circle cx="${cx}" cy="10.5" r="7" fill="#4294d1" stroke="#e7f4ff" stroke-width="1"/><circle cx="${cx}" cy="10.5" r="2" fill="white"/></svg></div>`;
}
function characterCard(c){
 const fatigue=Math.max(0,Math.min(5,Number(c.fatigue)||0));
 const cells=Array.from({length:5},(_,i)=>`<span class="${i<fatigue?'used':''}"></span>`).join('');
 const conditions=(c.conditions||[]).map(x=>chipHtml(x,'condition')).join('')||'<span class="card-muted">Aucun état</span>';
 const statuses=(c.statuses||[]).map(x=>chipHtml(x,'status')).join('')||'<span class="card-muted">Aucun statut</span>';
 return `<article class="character-card" role="button" tabindex="0" aria-label="Ouvrir la fiche de ${safe(c.name)}" data-ui-click="openCharacterDetail" data-id="${safe(c.id)}" data-ui-keydown="openCharacterDetail"><div class="card-head"><div><h3>${safe(c.name)}</h3><p class="sub">${safe(c.livret|| (c.kind==='PJ'?'Livret non précisé':'Rôle non précisé'))}</p></div><span aria-hidden="true">›</span></div><div class="card-risk"><div class="card-label">Fatigue et états</div><div class="fatigue-cells" role="img" aria-label="Fatigue ${fatigue} sur 5">${cells}</div><div class="card-chips">${conditions}</div></div>${balanceGraphic(c)}<div class="card-status"><div class="card-label">Statuts de combat</div><div class="card-chips">${statuses}</div></div>${c.kind==='PNJ'?`<div class="card-location">⌖ ${safe(c.location||'Sans lieu')}</div>`:''}</article>`;
}
function showCardTooltip(event,button){
 event.stopPropagation();const name=button.dataset.chip,type=button.dataset.chipType;
 const tip=$('cardTooltip');tip.innerHTML=`<strong>${safe(name)}</strong>${safe((type==='condition'?CONDITION_EXPLANATIONS:STATUS_EXPLANATIONS)[name]||'Consulter le livre de règles pour les effets détaillés.')}`;
 tip.hidden=false;const rect=button.getBoundingClientRect(),width=tip.offsetWidth,height=tip.offsetHeight;
 tip.style.left=Math.max(12,Math.min(window.innerWidth-width-12,rect.left))+'px';
 tip.style.top=(rect.bottom+height+10<window.innerHeight?rect.bottom+7:Math.max(8,rect.top-height-7))+'px';
}
function hideCardTooltip(force=true){if(force)$('cardTooltip').hidden=true}
function renderCharacterCards(){
 $('pjDirectory').innerHTML=lib.characters.filter(c=>c.kind==='PJ').sort((a,b)=>a.name.localeCompare(b.name,'fr')).map(characterCard).join('')||'<p>Aucun PJ. Utilise « Nouveau PJ » pour commencer.</p>';
 document.querySelectorAll('[data-character-kind]').forEach(b=>{b.classList.toggle('active',b.dataset.characterKind===characterKind);b.setAttribute('aria-pressed',String(b.dataset.characterKind===characterKind))});
 $('characterListTitle').textContent=characterKind==='PJ'?'Personnages joueurs':'Personnages non joueurs';
 $('characterCreate').textContent=characterKind==='PJ'?'+ Nouveau PJ':'+ Nouveau PNJ';
 $('pjDirectory').hidden=characterKind!=='PJ';$('npcDirectorySection').hidden=characterKind!=='PNJ';
 $('characterListView').hidden=characterDetailOpen;$('characterDetailView').hidden=!characterDetailOpen;
}
function setCharacterKind(kind){if(!['PJ','PNJ'].includes(kind))return;characterKind=kind;characterDetailOpen=false;toggleWizard(false);hideCardTooltip();renderCharacterCards()}
function openCharacterDetail(id){
 const c=lib.characters.find(x=>x.id===id);if(!c)return;
 if(characterDetailOpen&&$('sheetSelect').value!==id)try{saveSheet(true)}catch(e){return}
 characterKind=c.kind;characterDetailOpen=true;$('sheetSelect').value=id;showSheet();setSheetTab('identity');renderCharacterCards();hideCardTooltip();
 $('characterDetailView').scrollIntoView({block:'start',behavior:'instant'});
}
function closeCharacterDetail(){
 if(characterDetailOpen)try{saveSheet(true)}catch(e){return}
 characterDetailOpen=false;hideCardTooltip();renderCharacterCards();
 $('characterListView').scrollIntoView({block:'start',behavior:'instant'});
}
function createCurrentCharacter(){if(characterKind==='PJ'){toggleWizard(true);$('wizard').scrollIntoView({block:'start'})}else newSheet('PNJ')}

let npcSessionLocation='';
function selectNpcLocationForSession(){
 const selected=$('npcLocationFilter').value;
 if(!selected){alert('Choisis un lieu pour la session.');return}
 npcSessionLocation=selected;uiPreferences.write('avatar-session-location',selected)
 renderNpcDirectory();
}
function clearNpcSessionLocation(){npcSessionLocation='';uiPreferences.remove('avatar-session-location');renderNpcDirectory()}
function renderNpcDirectory(){
 const filter=$('npcLocationFilter'),current=filter.value;
 const locations=Roster.npcLocations(lib);
 filter.innerHTML='<option value="">Tous les lieux</option><option value="__none__">Sans lieu</option>'+locations.map(loc=>`<option value="${safe(loc)}">${safe(loc)}</option>`).join('');
 filter.value=[...filter.options].some(o=>o.value===current)?current:([...filter.options].some(o=>o.value===npcSessionLocation)?npcSessionLocation:'');
 const query=$('npcSearch').value.trim();
 const npcs=Roster.listNpcs(lib,{search:query,location:filter.value==='__none__'?'':filter.value}).filter(c=>filter.value!=='__none__'||!c.location);
 $('npcCount').textContent=npcs.length+' PNJ';
 $('npcSessionBanner').textContent=npcSessionLocation?'Lieu de session : '+(npcSessionLocation==='__none__'?'Sans lieu':npcSessionLocation):'Aucun lieu de session sélectionné';
 $('npcDirectory').innerHTML=npcs.map(characterCard).join('')||'<p>Aucun PNJ ne correspond à cette recherche.</p>';
}
function restoreNpcSessionLocation(){npcSessionLocation=uiPreferences.read('avatar-session-location','')}
function renderSheets(selected){
 const el=$('sheetSelect'),prev=selected||el.value;
 el.innerHTML=lib.characters.map(c=>`<option value="${safe(c.id)}" ${c.id===prev?'selected':''}>${safe(c.name)} (${safe(c.kind)})</option>`).join('');
 showSheet();
 renderNpcDirectory();renderCharacterCards();renderCombatLibrary();
 $('sheetList').innerHTML=lib.characters.map(c=>`<div class="fighter"><b>${safe(c.name)}</b> · ${safe(c.kind)} · ${safe(c.livret||'Livret non précisé')}<br><small>${c.techniques.length} technique(s)</small><br><button data-ui-click="includeSheet" data-id="${safe(c.id)}">Ajouter au combat</button></div>`).join('')||'<p>Crée une fiche pour commencer.</p>';
}
function showSheet(){
 const c=lib.characters.find(x=>x.id===$('sheetSelect').value);
 if(!c){$('sheetForm').innerHTML='<p>Aucune fiche sélectionnée.</p>';renderSheetQuick(null);return}
 renderSheetQuick(c);
 $('sheetForm').innerHTML=`<div class="sheet-identity"><label>Nom</label><input id="sheetName" oninput="refreshSheetQuick()" value="${safe(c.name)}">
 <label>Livret / rôle</label>${c.kind==='PJ'?`<select id="sheetLivret"><option value="">Choisir un livret…</option>${CombatRules.LIVRETS.map(x=>`<option value="${safe(x)}" ${c.livret===x?'selected':''}>${safe(x)}</option>`).join('')}</select>`:`<input id="sheetLivret" value="${safe(c.livret)}" placeholder="Rôle du PNJ">`}
 ${c.kind==='PNJ'?`<label for="sheetLocation">Lieu (modifiable)</label><input id="sheetLocation" maxlength="120" list="knownNpcLocations" value="${safe(c.location||'')}" placeholder="Ex. Ba Sing Se"><datalist id="knownNpcLocations">${Roster.npcLocations(lib).map(x=>`<option value="${safe(x)}"></option>`).join('')}</datalist>`:''}
 ${c.kind==='PJ'?`<button type="button" class="alt" onclick="applySelectedBook()">Réappliquer les valeurs de départ du livret…</button><p class="small-help">Attention : cette action remplace les caractéristiques, principes, équilibre et centre, pas les autres informations.</p>`:''}
 </div><div class="sheet-section" data-sheet-group="identity"><b>Caractéristiques</b><p class="small-note">Utilise + et −. Maximum +2 sans manœuvre spéciale autorisant +3 (p. 122). Les valeurs initiales dépendent du livret : à renseigner d'après le livre.</p>
 ${Roster.STATS.map(k=>`<div class="field-head"><label>${safe(k[0].toUpperCase()+k.slice(1))}</label></div><div class="stepfield"><button type="button" class="stepper alt" data-ui-click="stepField" data-id="stat-${safe(k)}" data-extra="-1" data-min="-3" data-max="2">−</button><output id="view-stat-${k}">${safe(c.stats[k])}</output><button type="button" class="stepper" data-ui-click="stepField" data-id="stat-${safe(k)}" data-extra="1" data-min="-3" data-max="2">+</button><input type="hidden" id="stat-${k}" value="${safe(c.stats[k])}"></div>`).join('')}</div>
 <div class="sheet-section" data-sheet-group="resources"><b>Ressources</b>
 <label>Fatigue</label><div class="stepfield"><button type="button" class="stepper alt" onclick="stepField('sheetFatigue',-1,0,5)">−</button><output id="view-sheetFatigue">${safe(c.fatigue)}</output><button type="button" class="stepper" onclick="stepField('sheetFatigue',1,0,5)">+</button><input type="hidden" id="sheetFatigue" value="${safe(c.fatigue)}"></div>
 <label>Équilibre (position)</label><div class="stepfield"><button type="button" class="stepper alt" onclick="stepField('sheetBalance',-1,-3,3)">−</button><output id="view-sheetBalance">${safe(c.balance)}</output><button type="button" class="stepper" onclick="stepField('sheetBalance',1,-3,3)">+</button><input type="hidden" id="sheetBalance" value="${safe(c.balance)}"></div></div>
 <div class="sheet-section" data-sheet-group="resources"><b>Équilibre et principes</b>
 <p class="small-note">Les deux principes dépendent du livret. Renseigne leurs noms d'après le livre.</p>
 <label>Principe côté −</label><input id="principleLeft" maxlength="80" placeholder="Nom du premier principe" value="${safe(c.principles?.[0]||'')}">
 <label>Principe côté +</label><input id="principleRight" maxlength="80" placeholder="Nom du second principe" value="${safe(c.principles?.[1]||'')}">
 <div class="balance-legend"><span id="balanceLeft">${safe(c.principles?.[0]||'Principe −')}</span><span id="balanceRight">${safe(c.principles?.[1]||'Principe +')}</span></div>
 <label>Centre (position de référence)</label><div class="stepfield"><button type="button" class="stepper alt" onclick="stepField('sheetCenter',-1,-3,3)">−</button><output id="view-sheetCenter">${safe(c.center??0)}</output><button type="button" class="stepper" onclick="stepField('sheetCenter',1,-3,3)">+</button><input type="hidden" id="sheetCenter" value="${safe(c.center??0)}"></div>
 </div>
 <div class="sheet-section" data-sheet-group="resources"><b>États émotionnels</b><p class="small-note">Coche ou décoche d'un clic. Les cinq états officiels sont listés p. 101.</p>
 <div>${Roster.CONDITIONS.map(name=>`<button type="button" class="pill negative ${c.conditions.includes(name)?'active':''}" aria-pressed="${c.conditions.includes(name)}" data-ui-click="toggleSheetCondition" data-id="${safe(name)}">${c.conditions.includes(name)?'✓ ':''}${safe(name)}</button>`).join('')}</div>
 <p class="small-note">Malus des états et mise hors de combat : à arbitrer selon la manœuvre concernée.</p></div>
 <div class="sheet-section" data-sheet-group="resources"><b>Statuts de combat</b><p class="small-note">Choisis les statuts en fonction de la fiction (pp. 155–157).</p>
 <div>${Roster.STATUSES.map(name=>`<button type="button" class="pill ${c.statuses.includes(name)?'active':''}" aria-pressed="${c.statuses.includes(name)}" data-ui-click="toggleSheetStatus" data-id="${safe(name)}">${c.statuses.includes(name)?'✓ ':''}${safe(name)}</button>`).join('')}</div></div>
 <div class="sheet-section" data-sheet-group="story"><b>Entraînement et relations</b><label>Entraînement</label><select id="sheetTraining">${Roster.TRAININGS.map(t=>`<option value="${safe(t)}" ${c.training===t?'selected':''}>${safe(t||'À choisir…')}</option>`).join('')}</select>
 <input type="hidden" id="sheetHistory" value="${safe(c.history||'')}">
 ${c.kind==='PJ'&&Playbooks.byName(c.livret)?'<label>Relations du livret (une par ligne)</label>':'<label>Relations (facultatif)</label>'}<textarea id="sheetRelations" maxlength="3000" placeholder="Qui me fait confiance ? Qui dois-je protéger ?">${safe((c.relationships||[]).join('\n'))}</textarea>
 <label>Manœuvres spéciales du livret (une par ligne, saisie libre)</label><textarea id="sheetMoves" maxlength="2500" placeholder="Nom de la manœuvre…">${safe((c.playbookMoves||[]).join('\n'))}</textarea>
 <p class="small-help">Les manœuvres de livret ne sont pas automatisées : les inscrire ici sert d'aide-mémoire. Les choix narratifs et les liens sont libres.</p></div>
 <div data-sheet-group="story"><label>Notes</label><input id="sheetNotes" value="${safe(c.notes||'')}">
 </div><button class="sheet-save" onclick="saveSheet()">Enregistrer la fiche</button>
 <div data-sheet-group="techniques"><h3>Techniques connues</h3>${c.techniques.map(t=>`<p>${safe(t.name)} · ${safe(t.mastery)}</p>`).join('')||'<p>Aucune technique renseignée.</p>'}
 <label>Ajouter une technique du catalogue</label><select id="sheetTechnique">${TECH_CATALOG.filter(t=>c.kind==='PNJ'||t.accessible_pj!==false).map(t=>`<option value="${safe(t.id)}">${safe(t.nom)} (${safe(t.famille)})</option>`).join('')}</select><label>Degré</label><select id="sheetMastery"><option value="acquise">Acquise</option><option value="pratiquee">Pratiquée</option><option value="maitrisee">Maîtrisée</option></select>
 <button onclick="addSheetTechnique()">Ajouter / actualiser</button></div>`;
 applySheetTab();
}
function applySelectedBook(){
 try{const id=$('sheetSelect').value,livret=$('sheetLivret').value;
 if(!Playbooks.byName(livret))throw Error('Choisis un livret');
 const bonus=prompt('Bonus +1 : creativite, concentration, harmonie ou enthousiasme','creativite');
 if(bonus===null)return;
 const patch=Playbooks.applyPreset(lib,id,livret,bonus.trim().toLowerCase());
 if(!confirm('Remplacer les caractéristiques, principes, équilibre et centre par les valeurs de création ?'))return;
 commitLibraryMutation(()=>Roster.updateCharacter(lib,id,patch));renderSheets(id);
 }catch(e){alert(e.message)}
}
function toggleSheetCondition(name){
 try{saveSheet(true);const id=$('sheetSelect').value;commitLibraryMutation(()=>Roster.toggleCondition(lib,id,name));renderSheets(id)}catch(e){alert(e.message)}
}
function toggleSheetStatus(name){
 try{saveSheet(true);const id=$('sheetSelect').value;commitLibraryMutation(()=>Roster.toggleStatus(lib,id,name));renderSheets(id)}catch(e){alert(e.message)}
}
function stepField(id,delta,min,max){
 const field=$(id);if(!field)return;
 const next=Math.min(max,Math.max(min,Number(field.value)+delta));
 field.value=String(next);const view=$('view-'+id);if(view)view.textContent=String(next);
 if(id==='sheetFatigue'||id==='sheetBalance')refreshSheetQuick();
}
function saveSheet(quiet=false){
 try{const id=$('sheetSelect').value;const stats=Object.fromEntries(Roster.STATS.map(k=>[k,Number($('stat-'+k).value)]));
 commitLibraryMutation(()=>Roster.updateCharacter(lib,id,{name:$('sheetName').value,livret:$('sheetLivret').value,stats,fatigue:Number($('sheetFatigue').value),balance:Number($('sheetBalance').value),center:Number($('sheetCenter').value),principles:[$('principleLeft').value,$('principleRight').value],training:$('sheetTraining').value,history:$('sheetHistory').value,relationships:$('sheetRelations').value.split('\n').map(x=>x.trim()).filter(Boolean),playbookMoves:$('sheetMoves').value.split('\n').map(x=>x.trim()).filter(Boolean),notes:$('sheetNotes').value,...($('sheetLocation')?{location:$('sheetLocation').value.trim()}:{})}));
 if(!quiet){renderSheets(id);render();alert('Fiche enregistrée.')}else {renderNpcDirectory();renderCharacterCards()}}catch(e){alert(e.message);if(quiet)throw e}
}
function addSheetTechnique(){try{saveSheet(true);const id=$('sheetSelect').value;const t=TECH_CATALOG.find(t=>t.id===$('sheetTechnique').value);if(!t)throw Error('Technique inconnue');const c=lib.characters.find(c=>c.id===id);if(t.famille==='groupe_pnj'&&c.kind!=='PNJ')throw Error('Technique réservée aux groupes de PNJ');commitLibraryMutation(()=>Roster.assignTechnique(lib,id,t.nom,$('sheetMastery').value));renderSheets(id)}catch(e){alert(e.message)}}
function renderCombatLibrary(){
 const select=$('combatSheetSelect');if(!select)return;
 const previous=select.value,available=lib.characters.filter(c=>!s.fighters.some(f=>f.characterId===c.id));
 select.innerHTML=available.length?available.map(c=>`<option value="${safe(c.id)}">${safe(c.name)} (${safe(c.kind)})</option>`).join(''):'<option value="">Aucune fiche disponible à ajouter</option>';
 if(available.some(c=>c.id===previous))select.value=previous;
 select.disabled=!available.length;$('includeSelectedSheetButton').disabled=!available.length;
}
function includeSelectedSheet(){const id=$('combatSheetSelect').value;if(id)includeSheet(id);}
function includeSheet(id){try{if($('sheetSelect').value===id)saveSheet(true);Roster.addToCombat(lib,s,id);render();setView('combat');setCombatTab('fighters')}catch(e){alert(e.message)}}
function syncSheet(fighterId){
 if(!confirm('Reporter les ressources du combattant vers sa fiche permanente ?'))return;
 try{commitLibraryMutation(()=>Roster.syncCombatToLibrary(lib,s,fighterId));restoreNpcSessionLocation();renderSheets();render()}catch(e){alert(e.message)}
}
function exportCompleteBackup(){
 const data={format:'avatar-compagnon-backup',version:1,createdAt:new Date().toISOString(),library:lib,combat:s};
 const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='avatar-sauvegarde-complete-v2-33.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function importCompleteBackup(event){
 const file=event.target.files?.[0];if(!file)return;
 file.text().then(text=>{
  try{
   const data=JSON.parse(text);
   if(data.format!=='avatar-compagnon-backup'||data.version!==1)throw Error('Format de sauvegarde non reconnu');
   const restored=Roster.importLibrary(data.library);
   const combat=data.combat;
   validateCombat(combat);validateBackupLinks(restored,combat);
   if(!confirm('Remplacer les fiches et le combat actuels par cette sauvegarde ?'))return;
   const oldLib=lib,oldCombat=s,oldSheet=$('sheetSelect').value;
   lib=restored;s=combat;
   try{
    // Le rendu est en lecture seule : une erreur ne doit pas écraser les sauvegardes.
    renderSheets();render();
    if(!persistCompleteBackup(restored,combat))throw Error('Import non enregistré : stockage indisponible. Restauration des données précédentes tentée. Conserve tes exports JSON.');
   }catch(error){lib=oldLib;s=oldCombat;renderSheets(oldSheet);originalRender();throw error;}
   setView('characters');
  }catch(e){alert('Import impossible : '+e.message)}
 }).catch(e=>alert('Lecture de la sauvegarde impossible : '+e.message)).finally(()=>{event.target.value=''});
}
