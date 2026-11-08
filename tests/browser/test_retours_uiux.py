"""Retours de recette : Légendaire guidé, lieu renommé et retrait de combattant sûr."""
from _paths import APP_DIR, CHROMIUM_EXECUTABLE
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from threading import Thread
import json
from playwright.sync_api import sync_playwright
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(APP_DIR)))
Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_port}/simulateur.html'
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(executable_path=CHROMIUM_EXECUTABLE,headless=True,args=['--no-sandbox'])
  for width,height in [(1280,900),(390,844),(320,640),(844,390)]:
   context=browser.new_context(viewport={'width':width,'height':height},accept_downloads=True);page=context.new_page();errors=[];alerts=[];confirms=[];choice={'accept':True};page.on('pageerror',lambda e:errors.append(str(e)))
   def dialog(d):
    if d.type=='alert':alerts.append(d.message);d.accept()
    else:
     confirms.append(d.message)
     if choice['accept']:d.accept()
     else:d.dismiss()
   page.on('dialog',dialog);page.goto(url)
   page.evaluate("""() => {lib=Roster.createLibrary();const c=Roster.createCharacter(lib,'Légende de recette','PNJ');Roster.updateCharacter(lib,c.id,{principles:['Protection','']});s=CombatCore.createCombat();persistCompleteBackup(lib,s);renderSheets(c.id);render();setView('characters');setCharacterKind('PNJ');openCharacterDetail(c.id)}""")
   old=page.evaluate("localStorage.getItem('avatar-roster-v020')")
   # La classification seule reste possible, sans modification de ressources.
   page.get_by_role('button',name='Modifier',exact=True).click();choice['accept']=False;page.locator('#sheetImportance').select_option('Légendaire');choice['accept']=True;assert '15 fatigues' in confirms[-1];assert page.locator('#npcFatigueMax').input_value()=='5'
   page.get_by_role('button',name='Enregistrer la fiche',exact=True).click();assert page.evaluate('lib.characters[0].importance')=='Légendaire';assert page.evaluate('fatigueLimit(lib.characters[0])')==5
   # Nouveau choix d’importance : accepter prépare automatiquement les bonnes valeurs.
   page.get_by_role('button',name='Modifier',exact=True).click();assert page.locator('.npc-resource-editor').evaluate('e=>e.open');assert '15 fatigues' in page.locator('#npcImportanceHint').inner_text();choice['accept']=False;page.locator('#sheetImportance').select_option('Mineur');choice['accept']=True;page.locator('#sheetImportance').select_option('Légendaire')
   assert page.locator('.npc-resource-editor').evaluate('e=>e.open');assert page.locator('#npcFatigueMax').input_value()=='15';assert 'Fatigue proposée : 15' in page.locator('#npcProfilePreview').inner_text();assert page.locator('#npcConditionCount').input_value()=='8'
   page.get_by_role('button',name='Enregistrer la fiche',exact=True).click();assert 'exactement 8' in alerts[-1];assert page.evaluate('fatigueLimit(lib.characters[0])')==5
   labels=['Terrifié','En colère','Coupable','Fragile','Confus','Épuisé','Réticent','Isolé'];page.locator('#npcConditionNames').fill('\n'.join(labels));assert page.locator('#sheetQuick .resource-cell').count()==15
   page.get_by_role('button',name='Fatigue : 14 sur 15',exact=True).click();page.get_by_role('button',name='Enregistrer la fiche',exact=True).click();assert page.locator('#sheetQuick .resource-cell').count()==15;assert page.evaluate('lib.characters[0].fatigue')==14
   assert page.evaluate("localStorage.getItem('avatar-roster-v020')")!=old,'La classification enregistrée précède volontairement la première activation'
   page.get_by_role('button',name='← Retour aux cartes',exact=True).click();assert page.locator('.character-card .fatigue-cells span').count()==15
   # Renommer un lieu déjà lié rafraîchit immédiatement carte, fiche et filtre.
   page.evaluate("""() => {const id=PlaceRules.create(lib,'Ancien port');PlaceRules.setLinks(lib,lib.characters[0].id,{currentId:id,homeId:id,associatedIds:[id]});saveLibrary();renderSheets();setCharacterKind('PNJ');window.portId=id;}""")
   page.locator('#npcFilterSummary').click();page.locator('#npcLocationFilter').select_option('Ancien port');assert 'Ancien port' in page.locator('.character-card .card-location').inner_text();page.evaluate('openPlace(portId)');page.get_by_role('button',name='Modifier le lieu',exact=True).click();page.locator('#placeName').fill('Port renommé')
   # Un échec d’écriture ne renomme pas le lieu ni le filtre.
   page.evaluate('window.realSave=saveLibrary;saveLibrary=()=>false');page.get_by_role('button',name='Enregistrer le lieu',exact=True).click();assert 'annulée' in page.locator('#placeFeedback').inner_text();assert page.evaluate("PlaceRules.find(lib,portId).name")=='Ancien port';page.evaluate('saveLibrary=realSave');page.get_by_role('button',name='Enregistrer le lieu',exact=True).click()
   page.locator('.main-nav [data-view="characters"]').click();assert page.locator('#npcLocationFilter').input_value()=='Port renommé';assert 'Port renommé' in page.locator('.character-card .card-location').inner_text();page.locator('.card-open').click();assert 'Port renommé' in page.locator('#sheetRead').inner_text()
   # Deux combattants, dont une copie liée ; retrait sans suppression de la fiche.
   page.get_by_role('button',name='Ajouter au combat',exact=True).click();page.evaluate("setView('combat');setCombatTab('fighters');add('PNJ');CombatCore.setEngagement(s,s.fighters[0].id,s.fighters[1].id,true);persist('avatar-v020',s);render()")
   linked=page.evaluate('s.fighters[0].id');library=page.evaluate('lib');before=page.evaluate('s');button=page.locator(f'[data-remove-fighter="{linked}"]');assert button.is_enabled();choice['accept']=False;button.click();choice['accept']=True;assert page.evaluate('s')==before
   page.evaluate("window.realPersist=persist;persist=(key,value)=>key==='avatar-v020'?false:realPersist(key,value)");button.click();assert 'annulée' in alerts[-1];assert page.evaluate('s')==before;page.evaluate('persist=realPersist')
   button.click();assert page.evaluate('s.fighters.length')==1;assert page.evaluate('s.engagements.length')==0;assert page.evaluate('lib')==library
   removed=page.evaluate('s');page.reload();assert page.evaluate('s')==removed;page.evaluate("setView('combat');back()");assert page.evaluate('s')==before;assert page.evaluate('lib')==library
   # Phase active et effet lié : pas de suppression silencieuse de mécanique.
   page.evaluate("s.phase='defendre';render()");assert page.locator(f'[data-remove-fighter="{linked}"]').is_disabled();page.evaluate("s.phase='declaration';s.temporaryEffects.push({id:'temp-99',targetId:s.fighters[0].id,originType:'mj',label:'Test dépendance',duration:'manual',createdRound:1,createdScene:1});render()");assert page.locator(f'[data-remove-fighter="{linked}"]').is_disabled();page.evaluate("s.temporaryEffects=[];render()");page.locator(f'[data-remove-fighter="{linked}"]').click();assert page.evaluate('s.fighters.length')==1
   # L’application reste utilisable quand le dernier combattant est retiré.
   last=page.evaluate('s.fighters[0].id');page.locator(f'[data-remove-fighter="{last}"]').click();assert page.evaluate('s.fighters.length')==0;assert page.locator('#source option').count()==0;assert page.evaluate('lib')==library
   page.evaluate("setView('characters');setCharacterKind('PNJ');openCharacterDetail(lib.characters[0].id)");assert page.get_by_role('button',name='Ajouter au combat',exact=True).is_enabled();assert page.locator('#sheetQuick .resource-cell').count()==15
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),width
   expected=page.evaluate('({library:lib,combat:s})');page.evaluate("setView('management')")
   with page.expect_download() as pending:page.get_by_role('button',name='Exporter la sauvegarde complète',exact=True).click()
   data=json.loads(open(pending.value.path()).read());assert data['library']==expected['library'] and data['combat']==expected['combat'];page.locator('#backupImportFile').set_input_files({'name':'retours.json','mimeType':'application/json','buffer':json.dumps(data).encode()});page.wait_for_function("document.getElementById('backupImportFile').value===''");page.reload();assert page.evaluate('({library:lib,combat:s})')==expected
   assert not errors,errors;context.close();print(f'OK retours UI/UX {width}×{height}')
  browser.close()
finally:server.shutdown()
