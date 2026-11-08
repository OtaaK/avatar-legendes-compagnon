"""Livrets : socle manuel, brouillons et sauvegardes réelles, sans effets de manœuvre."""
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
custom="Note <img src=x onerror=window.injected=1> d'évolution"
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(executable_path=CHROMIUM_EXECUTABLE,headless=True,args=['--no-sandbox'])
  for width,height in [(1280,900),(390,844),(320,640),(844,390)]:
   context=browser.new_context(viewport={'width':width,'height':height},accept_downloads=True);page=context.new_page();errors=[];alerts=[];choice={'accept':True};page.on('pageerror',lambda e:errors.append(str(e)))
   def dialog(d):
    if d.type=='alert':alerts.append(d.message);d.accept()
    elif choice['accept']:d.accept()
    else:d.dismiss()
   page.on('dialog',dialog);page.goto(url)
   page.evaluate("""() => {lib=Roster.createLibrary();const c=Roster.createCharacter(lib,'Vif','PJ');Roster.updateCharacter(lib,c.id,{livret:Playbooks.PLAYBOOKS[0].name,fatigue:2,balance:1,conditions:['Confus'],playbookMoves:['Manœuvre personnelle <img src=x onerror=window.injected=1>'],history:'Origines conservées',relationships:['Lien conservé']});Roster.createCharacter(lib,'Observateur','PNJ');s=CombatCore.createCombat();persistCompleteBackup(lib,s);renderSheets(c.id);render();setView('characters');setCharacterKind('PJ');openCharacterDetail(c.id);setSheetTab('playbook')}""")
   baseline=page.evaluate("({library:lib,combat:s,oldLib:localStorage.getItem('avatar-roster-v020'),oldCombat:localStorage.getItem('avatar-v020')})")
   assert page.locator('#sheetNav button').all_text_contents()==['Aperçu','Livret','Techniques','Histoire et relations'];assert page.locator('#sheetQuick .book-gauge').count()==0
   assert 'Suivi non encore renseigné' in page.locator('#sheetRead').inner_text();assert page.locator('#sheetRead .book-gauge span').count()==4;assert not page.evaluate('window.injected||false')
   assert page.evaluate('({library:lib,combat:s})')=={'library':baseline['library'],'combat':baseline['combat']}
   page.get_by_role('button',name='Aperçu',exact=True).click();assert page.locator('.book-gauge:visible').count()==0;page.get_by_role('button',name='Livret',exact=True).click()
   page.get_by_role('button',name='Modifier le suivi du Livret',exact=True).click();page.locator('#sheetBookProgress').fill('3');page.locator('#sheetBookNotes').fill(custom);page.locator('#sheetBookMoment').select_option('unlocked')
   choice['accept']=False;page.get_by_role('button',name='Enregistrer la fiche',exact=True).click();choice['accept']=True;assert page.evaluate('lib.characters[0].playbookState===undefined');assert page.locator('#sheetBookProgress').input_value()=='3'
   page.evaluate("""() => {const write=Storage.prototype.setItem;let once=true;Storage.prototype.setItem=function(k,v){if(k==='avatar-v021'&&once){once=false;throw Error('Quota Livret injecté')}return write.call(this,k,v)}}""")
   page.get_by_role('button',name='Enregistrer la fiche',exact=True).click();assert 'annulée' in alerts[-1];assert page.evaluate('lib.characters[0].playbookState===undefined');assert page.locator('#sheetBookProgress').input_value()=='3'
   page.get_by_role('button',name='Enregistrer la fiche',exact=True).click();assert page.evaluate('BookState.entry(lib.characters[0]).progress')==3;assert page.evaluate("localStorage.getItem('avatar-roster-v020')")==baseline['oldLib'];assert page.evaluate("localStorage.getItem('avatar-v020')")==baseline['oldCombat']
   page.get_by_role('button',name='Modifier le suivi du Livret',exact=True).click();page.locator('#sheetBookProgress').fill('4');page.locator('#sheetBookEvolutions').fill('Évolution à choisir, pas encore appliquée');page.get_by_role('button',name='Enregistrer la fiche',exact=True).click();assert 'Évolution à choisir avec le MJ' in page.locator('#sheetRead').inner_text()
   page.get_by_role('button',name='Modifier le suivi du Livret',exact=True).click();page.locator('#sheetBookProgress').fill('1');choice['accept']=False;page.get_by_role('button',name='Accueil',exact=True).click();choice['accept']=True;assert page.locator('#sheetBookProgress').input_value()=='1';page.get_by_role('button',name='Annuler les modifications',exact=True).click();assert page.evaluate('BookState.entry(lib.characters[0]).progress')==4
   # Changement simultané refusé, puis changements séparés et retour au suivi original.
   page.get_by_role('button',name='Modifier le suivi du Livret',exact=True).click();page.locator('#sheetBookProgress').fill('2');page.get_by_role('button',name='Aperçu',exact=True).click();second=page.evaluate('Playbooks.PLAYBOOKS[1].name');page.locator('#sheetLivret').select_option(second);page.get_by_role('button',name='Enregistrer la fiche',exact=True).click();assert 'séparément' in alerts[-1];assert page.evaluate('BookState.entry(lib.characters[0]).progress')==4
   page.get_by_role('button',name='Livret',exact=True).click();page.locator('#sheetBookProgress').fill('4');page.get_by_role('button',name='Enregistrer la fiche',exact=True).click();assert page.evaluate('lib.characters[0].livret')==second;assert page.evaluate('BookState.entry(lib.characters[0]).progress')==0
   page.get_by_role('button',name='Modifier le suivi du Livret',exact=True).click();page.locator('#sheetBookProgress').fill('2');page.get_by_role('button',name='Enregistrer la fiche',exact=True).click()
   page.get_by_role('button',name='Modifier le suivi du Livret',exact=True).click();page.get_by_role('button',name='Aperçu',exact=True).click();first=page.evaluate('Playbooks.PLAYBOOKS[0].name');page.locator('#sheetLivret').select_option(first);page.get_by_role('button',name='Enregistrer la fiche',exact=True).click();page.get_by_role('button',name='Livret',exact=True).click();assert page.evaluate('BookState.entry(lib.characters[0]).progress')==4
   for key in ['stats','fatigue','balance','center','conditions','statuses','techniques','playbookMoves','history','relationships']:
    assert page.evaluate(f'lib.characters[0].{key}')==baseline['library']['characters'][0][key],key
   assert not page.evaluate('window.injected||false');assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),width
   expected=page.evaluate('({library:lib,combat:s})');page.evaluate("setView('management')")
   with page.expect_download() as pending:page.get_by_role('button',name='Exporter la sauvegarde complète',exact=True).click()
   data=json.loads(open(pending.value.path()).read());assert data['version']==2 and data['library']==expected['library']
   bad=json.loads(json.dumps(data));bad['library']['characters'][0]['playbookState']['entries'][0]['progress']=99;page.locator('#backupImportFile').set_input_files({'name':'invalide.json','mimeType':'application/json','buffer':json.dumps(bad).encode()});page.wait_for_function("document.getElementById('backupImportFile').value===''");assert 'Progression' in alerts[-1];assert page.evaluate('({library:lib,combat:s})')==expected
   page.evaluate("lib.characters[0].name='Temporaire';saveLibrary()");page.locator('#backupImportFile').set_input_files({'name':'livrets.json','mimeType':'application/json','buffer':json.dumps(data).encode()});page.wait_for_function("document.getElementById('backupImportFile').value===''");page.reload();assert page.evaluate('({library:lib,combat:s})')==expected
   page.evaluate("setView('characters');setCharacterKind('PJ');openCharacterDetail(lib.characters[0].id);setSheetTab('playbook')")
   if width in [1280,390]:
    output=APP_DIR.parent/'work';output.mkdir(exist_ok=True);page.screenshot(path=str(output/f'livrets-{width}.png'),full_page=True)
   page.evaluate("setCharacterKind('PNJ');openCharacterDetail(lib.characters[1].id)");assert page.locator('#sheetNav button').all_text_contents()==['Aperçu','Techniques','Lieux'];assert page.locator('.book-gauge:visible').count()==0
   if width==1280:
    page.evaluate("Roster.updateCharacter(lib,lib.characters[0].id,{livret:'Livret personnalisé <inconnu>'});renderSheets();setCharacterKind('PJ');openCharacterDetail(lib.characters[0].id);setSheetTab('playbook')");assert 'Aucune référence intégrée' in page.locator('#sheetRead').inner_text();page.get_by_role('button',name='Modifier le suivi du Livret',exact=True).click();assert page.locator('#sheetLivret').input_value()=='Livret personnalisé <inconnu>';page.locator('#sheetBookProgress').fill('1');page.get_by_role('button',name='Enregistrer la fiche',exact=True).click();assert page.evaluate('lib.characters[0].playbookState.entries.length')==3
   assert not errors,errors;context.close();print(f'OK Livrets {width}×{height}')
  browser.close()
finally:server.shutdown()
