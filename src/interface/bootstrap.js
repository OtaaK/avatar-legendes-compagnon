// Installation unique, dans l’ordre historique, puis premier affichage.
document.addEventListener('keydown',quickNavigation);
document.addEventListener('click',e=>{if(!e.target.closest?.('.card-chip'))hideCardTooltip()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')hideCardTooltip()});
for(const type of ['click','change','keydown'])document.addEventListener(type,handleDataAction);
// Le premier affichage ne doit pas écraser une sauvegarde corrompue ou non restaurée.
originalRender();
restoreNpcSessionLocation();renderSheets();renderCatalog();initWizard();renderCharacterCards();
try{setCombatTab(uiPreferences.read('avatar-combat-tab','fighters'))}catch(e){setCombatTab('fighters')}
try{setView(uiPreferences.read('avatar-ui-view','home'),false)}catch(e){setView('home',false)}
