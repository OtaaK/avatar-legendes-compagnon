"""Lieux : parcours réels, liens indépendants, brouillons et sauvegardes."""
from _paths import APP_DIR, CHROMIUM_EXECUTABLE
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from threading import Thread
import json,base64
from playwright.sync_api import sync_playwright
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(APP_DIR)))
Thread(target=server.serve_forever,daemon=True).start()
png=base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=')
url=f'http://127.0.0.1:{server.server_port}/simulateur.html'
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(executable_path=CHROMIUM_EXECUTABLE,headless=True,args=['--no-sandbox'])
  for width,height in [(1280,900),(390,844),(320,640),(844,390)]:
   context=browser.new_context(viewport={'width':width,'height':height},accept_downloads=True);page=context.new_page();errors=[];dialogs=[];choice={'accept':True};page.on('pageerror',lambda e:errors.append(str(e)))
   def dialog(d):
    dialogs.append(d.message)
    if d.type=='confirm' and not choice['accept']:d.dismiss()
    else:d.accept()
   page.on('dialog',dialog);page.goto(url)
   page.evaluate("""() => {lib=Roster.createLibrary();const c=Roster.createCharacter(lib,'Gardien','PNJ');Roster.updateCharacter(lib,c.id,{location:'Port ancien'});s=CombatCore.createCombat();if(!persistCompleteBackup(lib,s))throw Error('Initialisation');renderSheets();render();setView('places')}""")
   baseline=page.evaluate("({l:localStorage.getItem('avatar-roster-v020'),c:localStorage.getItem('avatar-v020')})")
   page.get_by_role('button',name='Créer un lieu',exact=True).click();page.locator('#placeName').fill('Région');choice['accept']=False;page.get_by_role('button',name='Enregistrer le lieu',exact=True).click();choice['accept']=True
   assert page.evaluate('PlaceRules.all(lib).length')==0
   # Panne sur la seconde écriture de génération : aucun modèle ni clé historique perdu.
   page.evaluate("""() => {const write=Storage.prototype.setItem;let once=true;Storage.prototype.setItem=function(key,value){if(key==='avatar-v021'&&once){once=false;throw Error('Quota lieu injecté')}return write.call(this,key,value)}}""")
   page.get_by_role('button',name='Enregistrer le lieu',exact=True).click();assert 'annulée' in page.locator('#placeFeedback').inner_text();assert page.evaluate('PlaceRules.all(lib).length')==0;assert page.locator('#placeName').input_value()=='Région'
   page.get_by_role('button',name='Enregistrer le lieu',exact=True).click();root=page.evaluate('selectedPlaceId')
   assert page.evaluate("localStorage.getItem('avatar-roster-v020')")==baseline['l'];assert page.evaluate("localStorage.getItem('avatar-v020')")==baseline['c']
   # Image embarquée, refus du SVG, lecture tardive neutralisée après annulation.
   if width==1280:
    page.get_by_role('button',name='Modifier le lieu',exact=True).click();page.locator('#placeImage').set_input_files({'name':'interdit.svg','mimeType':'image/svg+xml','buffer':b'<svg/>'});assert 'maximum requise' in page.locator('#placeFeedback').inner_text()
    page.locator('#placeImage').set_input_files({'name':'lieu.png','mimeType':'image/png','buffer':png});page.wait_for_function("document.getElementById('placePortrait').value.startsWith('data:image/png;base64,')");page.get_by_role('button',name='Enregistrer le lieu',exact=True).click();assert page.locator('.place-portrait').count()==1
    page.get_by_role('button',name='Modifier le lieu',exact=True).click();page.evaluate("() => {window.RealReader=FileReader;window.FileReader=class{readAsDataURL(){window.latePlaceImage=()=>{this.result='data:image/png;base64,iVBORw0KGgo=';this.onload()}}};}");page.locator('#placeImage').set_input_files({'name':'retard.png','mimeType':'image/png','buffer':png});page.get_by_role('button',name='Annuler',exact=True).click();page.get_by_role('button',name='Modifier le lieu',exact=True).click();page.get_by_role('button',name='Retirer l’illustration',exact=True).click();page.evaluate('() => {latePlaceImage();FileReader=RealReader;}');assert page.locator('#placePortrait').input_value()=='';page.get_by_role('button',name='Enregistrer le lieu',exact=True).click()
   for name in ['Ville','Quartier','Salle']:
    page.get_by_role('button',name='Créer un sous-lieu',exact=True).click();page.locator('#placeName').fill(name);page.get_by_role('button',name='Enregistrer le lieu',exact=True).click()
   room=page.evaluate('selectedPlaceId');city=page.evaluate('lib.places[1].id')
   assert page.locator('.place-breadcrumb button').all_text_contents()==['Tous les lieux','Région','Ville','Quartier','Salle']
   page.get_by_role('button',name='Modifier le lieu',exact=True).click();page.locator('#placeName').fill('Brouillon');choice['accept']=False;page.get_by_role('button',name='Accueil',exact=True).click();assert page.locator('#placeName').input_value()=='Brouillon';choice['accept']=True
   page.get_by_role('button',name='Annuler',exact=True).click();assert page.locator('#placesContent h3').first.inner_text()=='Salle'
   # Mise à jour du parent : ses descendants ne sont pas proposés.
   page.get_by_role('button',name='Ville',exact=True).first.click();page.get_by_role('button',name='Modifier le lieu',exact=True).click();assert page.locator('#placeParent option').count()==2;page.locator('#placeName').fill("Ville <img src=x onerror=window.injected=1>");page.get_by_role('button',name='Enregistrer le lieu',exact=True).click();assert not page.evaluate('window.injected||false')
   page.evaluate("setView('characters');setCharacterKind('PNJ');openCharacterDetail(lib.characters[0].id)")
   page.get_by_role('button',name='Modifier',exact=True).click();page.get_by_role('button',name='Lieux',exact=True).last.click()
   # Une association seule ne remplace pas l’ancienne position en texte.
   page.locator(f'[data-place-association="{city}"]').check();page.get_by_role('button',name='Enregistrer la fiche',exact=True).click();assert page.evaluate('PlaceRules.currentName(lib,lib.characters[0])')=='Port ancien';assert 'Port ancien' in page.locator('#sheetRead').inner_text();assert not page.evaluate("Object.hasOwn(lib.characters[0].placeLinks,'currentId')")
   page.get_by_role('button',name='Modifier',exact=True).click()
   page.locator('#sheetHomePlace').select_option(root);page.locator('#sheetCurrentPlace').select_option(room);page.locator(f'[data-place-association="{city}"]').check();page.get_by_role('button',name='Enregistrer la fiche',exact=True).click()
   links=page.evaluate('lib.characters[0].placeLinks');assert links=={'homeId':root,'currentId':room,'associatedIds':[city]};assert page.evaluate('lib.characters[0].location')=='Port ancien'
   page.locator('#quickNpcPlace').select_option(city);page.get_by_role('button',name='Appliquer la position',exact=True).click();assert page.evaluate('lib.characters[0].placeLinks.homeId')==root;assert page.evaluate('lib.characters[0].placeLinks.associatedIds')==[city]
   page.locator('#quickNpcPlace').select_option(room);page.get_by_role('button',name='Appliquer la position',exact=True).click()
   page.evaluate('openPlace('+json.dumps(root)+')');assert 'Présents actuellement (0)' in page.locator('#placePeople').inner_text();page.locator('#placeRecursive').select_option('yes');assert 'Présents actuellement (1)' in page.locator('#placePeople').inner_text();assert 'Associés au lieu (1)' in page.locator('#placePeople').inner_text()
   assert page.locator('#placePeople button').count()==3
   page.locator('#placePeople button').first.click();assert page.locator('#characterDetailView').is_visible()
   page.evaluate('openPlace('+json.dumps(city)+')');choice['accept']=False;page.get_by_role('button',name='Supprimer le lieu',exact=True).click();choice['accept']=True;assert '1 sous-lieu' in dialogs[-1] and '1 PNJ' in dialogs[-1];assert page.evaluate('PlaceRules.all(lib).length')==4
   page.get_by_role('button',name='Supprimer le lieu',exact=True).click();assert page.evaluate('PlaceRules.all(lib).length')==3;assert page.evaluate('lib.characters.length')==1;assert page.evaluate('lib.characters[0].placeLinks.currentId')==room;assert page.evaluate('lib.characters[0].placeLinks.associatedIds')==[]
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),width
   if width in [1280,390]:
    output=APP_DIR.parent/'work';output.mkdir(exist_ok=True);page.reload();page.evaluate('openPlace('+json.dumps(root)+')');page.screenshot(path=str(output/f'lieux-{width}.png'),full_page=True)
   # Export/restauration complets via Gestion, puis comparaison fidèle après rechargement.
   expected=page.evaluate('({library:lib,combat:s})');page.evaluate("setView('management')")
   with page.expect_download() as pending:page.get_by_role('button',name='Exporter la sauvegarde complète',exact=True).click()
   data=json.loads(open(pending.value.path()).read());assert data['version']==2;assert data['library']==expected['library']
   page.evaluate('lib.places[0].name="Altéré"');page.locator('#backupImportFile').set_input_files({'name':'lieux.json','mimeType':'application/json','buffer':json.dumps(data).encode()})
   page.wait_for_function('lib.places[0].name==="Région"');page.reload();assert page.evaluate('({library:lib,combat:s})')==expected
   # Un cycle dans un fichier complet est refusé avant toute mutation.
   bad=json.loads(json.dumps(data));bad['library']['places'][0]['parentId']=room
   before=page.evaluate('({library:lib,combat:s})');page.locator('#backupImportFile').set_input_files({'name':'cycle.json','mimeType':'application/json','buffer':json.dumps(bad).encode()});page.wait_for_function("document.getElementById('backupImportFile').value===''");assert any('Cycle' in d for d in dialogs);assert page.evaluate('({library:lib,combat:s})')==before
   # Rattachement volontaire du texte historique : aucun domicile déduit.
   page.evaluate("setView('characters');setCharacterKind('PNJ');openCharacterDetail(lib.characters[0].id);setSheetTab('places')");page.locator('#sheetRead details summary').click();page.get_by_role('button',name='Relier ce texte à un lieu',exact=True).click();assert page.evaluate('PlaceRules.currentName(lib,lib.characters[0])')=='Port ancien';assert page.evaluate('lib.characters[0].placeLinks.homeId')==root;assert page.evaluate('lib.characters[0].location')=='Port ancien'
   # Import d’orphelins : conservation explicite, jamais suppression silencieuse.
   page.evaluate("""() => {lib.places[0].parentId='parent-absent';lib.characters[0].placeLinks.homeId='domicile-absent';saveLibrary();setView('places')}""")
   assert '2 référence(s)' in page.locator('.place-warning summary').inner_text();assert page.evaluate('lib.characters[0].placeLinks.homeId')=='domicile-absent'
   # Noms identiques : le sélecteur distingue les chemins et les identifiants.
   page.evaluate("() => {const a=PlaceRules.create(lib,'Pièce',lib.places[0].id),b=PlaceRules.create(lib,'Pièce');saveLibrary();window.homonyms=[a,b];setView('characters');setCharacterKind('PNJ');openCharacterDetail(lib.characters[0].id);setSheetTab('places')}")
   options=page.locator('#quickNpcPlace option').all_text_contents();labels=[label for label in options if 'Pièce' in label];assert len(labels)==2 and labels[0]!=labels[1];assert any('Région' in label for label in labels)
   assert not errors,errors
   context.close();print(f'OK Lieux {width}×{height}')
  browser.close()
finally:server.shutdown()
