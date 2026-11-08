"""Recette transversale : modèles combinés, mobile, combat, sauvegardes et hors réseau."""
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
  for width,height in [(1440,1000),(1024,768),(390,844),(320,640),(844,390)]:
   context=browser.new_context(viewport={'width':width,'height':height},accept_downloads=True);page=context.new_page();errors=[];alerts=[];requests=[];page.on('pageerror',lambda e:errors.append(str(e)))
   def dialog(d):
    if d.type=='alert':alerts.append(d.message)
    d.accept()
   page.on('dialog',dialog);page.goto(url)
   page.evaluate("""() => {lib=Roster.createLibrary();const a=Roster.createCharacter(lib,'Lin de test','PJ'),b=Roster.createCharacter(lib,'Gardienne de test','PNJ');Roster.updateCharacter(lib,a.id,{livret:Playbooks.PLAYBOOKS[0].name,history:'Origines conservées'});Roster.assignTechnique(lib,a.id,'Armure de terre','maitrisee');s=CombatCore.createCombat();persistCompleteBackup(lib,s);window.oldPoint={library:JSON.parse(JSON.stringify(lib)),combat:JSON.parse(JSON.stringify(s))};const root=PlaceRules.create(lib,'Région'),city=PlaceRules.create(lib,'Ville',root),room=PlaceRules.create(lib,'Temple',city);Roster.updateCharacter(lib,b.id,{importance:'Mineur',npcResources:{format:'avatar-npc-resources',version:1,combatant:true,fatigueMax:3,balanceMax:1,conditions:['Réticent']},principles:['Protection',''],fatigue:1});PlaceRules.setLinks(lib,b.id,{homeId:root,associatedIds:[city],currentId:room});Roster.updateCharacter(lib,a.id,{playbookState:BookState.patch(lib.characters.find(c=>c.id===a.id),a.livret,{progress:3,notes:'Suivi conservé'})});const fa=Roster.addToCombat(lib,s,a.id),fb=Roster.addToCombat(lib,s,b.id);CombatCore.declare(s,fa.id,'defendre','10+');CombatCore.declare(s,fb.id,'attaquer','10+');CombatCore.reveal(s);persistCompleteBackup(lib,s);renderSheets(a.id);render();setView('home')}""")
   initial=page.evaluate('({library:lib,combat:s})');raw=page.evaluate("[localStorage.getItem('avatar-roster-v021'),localStorage.getItem('avatar-v021')]")
   page.get_by_role('button',name='Explorer les lieux',exact=True).click();assert page.locator('#view-places').is_visible()
   page.evaluate('openPlace(lib.places[0].id)');page.locator('#placeRecursive').select_option('yes');assert 'Présents actuellement (1)' in page.locator('#placePeople').inner_text();page.locator('#placePeople button').first.click();assert page.locator('#characterDetailView').is_visible()
   assert page.locator('#sheetQuick .resource-cell').count()==3
   if width<=900:
    before_height=page.locator('#sheetQuick').bounding_box()['height'];page.locator('#sheetResourceToggle').click();assert page.locator('#sheetResourceToggle').get_attribute('aria-expanded')=='false';assert not page.locator('#sheetFatigueResource').is_visible();assert page.locator('#sheetQuick').bounding_box()['height']<before_height
    assert 'Fatigue 1/3' in page.locator('#sheetResourceToggle').inner_text();page.get_by_role('button',name='Lieux',exact=True).last.click();assert not page.locator('#sheetFatigueResource').is_visible()
    page.set_viewport_size({'width':1200,'height':900});assert page.locator('#sheetFatigueResource').is_visible();assert not page.locator('#sheetResourceToggle').is_visible();page.set_viewport_size({'width':width,'height':height});page.locator('#sheetResourceToggle').click();assert page.locator('#sheetFatigueResource').is_visible()
   else:assert not page.locator('#sheetResourceToggle').is_visible()
   assert page.evaluate('({library:lib,combat:s})')==initial
   assert page.evaluate("[localStorage.getItem('avatar-roster-v021'),localStorage.getItem('avatar-v021')]")==raw
   # Ressource permanente et annulation, sans modifier la copie de combat.
   combat_before=page.evaluate('s');page.locator('#sheetQuick').get_by_role('button',name='Ajouter une fatigue',exact=True).click();assert page.evaluate('lib.characters[1].fatigue')==2;assert page.evaluate('s')==combat_before;page.get_by_role('button',name='Annuler le dernier ajustement',exact=True).click();assert page.evaluate('lib.characters[1].fatigue')==1
   # Libellé de champ : clic et focus accessibles sans changement de valeur.
   page.get_by_role('button',name='Modifier',exact=True).click();page.get_by_role('button',name='Aperçu',exact=True).click();page.locator('label[for="sheetName"]').click();assert page.locator('#sheetName').evaluate('e=>e===document.activeElement');page.get_by_role('button',name='Annuler les modifications',exact=True).click()
   page.evaluate("openCharacterDetail(lib.characters[0].id);setSheetTab('playbook')");page.get_by_role('button',name='Modifier le suivi du Livret',exact=True).click();page.locator('#sheetBookProgress').fill('4');page.get_by_role('button',name='Enregistrer la fiche',exact=True).click();assert page.evaluate('BookState.entry(lib.characters[0]).progress')==4
   # Même bibliothèque étendue pendant une vraie validation/annulation de technique.
   library_before=page.evaluate('lib');page.evaluate("setView('combat');setCombatTab('technique')");page.locator('#source').select_option('p-1');page.locator('#target').select_option('p-2');tech=page.evaluate("TECH_CATALOG.find(t=>t.nom==='Armure de terre').id");page.locator('#tech').select_option(tech);page.locator('#earthArmorConfirmed').check();page.get_by_role('button',name='Préparer les effets',exact=True).click();assert page.evaluate('s.proposals.length')>0
   prepared=page.evaluate('JSON.stringify(s)');page.locator('[data-combat-nav="approval"]').click();page.get_by_role('button',name='Valider les effets cochés',exact=True).click();assert page.evaluate("s.temporaryEffects.some(e=>e.originLabel==='Armure de terre')");page.evaluate('back()');assert page.evaluate('JSON.stringify(s)')==prepared;assert page.evaluate('lib')==library_before
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),width
   # Toutes les données combinées voyagent dans une sauvegarde complète, hors réseau.
   page.evaluate("setView('home')");page.get_by_role('button',name='Sauvegarder ma partie',exact=True).click();assert page.locator('#view-management').is_visible();context.set_offline(True);page.on('request',lambda r:requests.append(r.url));expected=page.evaluate('({library:lib,combat:s})')
   with page.expect_download() as pending:page.get_by_role('button',name='Exporter la sauvegarde complète',exact=True).click()
   data=json.loads(open(pending.value.path()).read());assert data['library']==expected['library'] and data['combat']==expected['combat'] and data['version']==2
   with page.expect_download() as pending:page.get_by_role('button',name='Exporter l’état avant les données étendues',exact=True).click()
   old=json.loads(open(pending.value.path()).read());assert old['version']==1 and {'library':old['library'],'combat':old['combat']}==page.evaluate('oldPoint')
   page.evaluate("lib.characters[0].name='Altéré';saveLibrary()");page.locator('#backupImportFile').set_input_files({'name':'complet.json','mimeType':'application/json','buffer':json.dumps(data).encode()});page.wait_for_function("document.getElementById('backupImportFile').value===''");assert page.evaluate('({library:lib,combat:s})')==expected
   assert not [r for r in requests if r.startswith(('http:','https:'))],requests;context.set_offline(False);page.reload();assert page.evaluate('({library:lib,combat:s})')==expected
   page.evaluate("setView('characters');setCharacterKind('PJ');openCharacterDetail(lib.characters[0].id);setSheetTab('playbook');window.scrollTo(0,0)")
   if width in [1440,390]:
    output=APP_DIR.parent/'work';output.mkdir(exist_ok=True);page.screenshot(path=str(output/f'recette-uiux-{width}.png'),full_page=True)
   # Le raccourci de cible doit actualiser les états de sa nouvelle cible.
   page.evaluate("""() => {Roster.assignTechnique(lib,lib.characters[0].id,'Dérobade','maitrisee');s=CombatCore.createCombat();const a=Roster.addToCombat(lib,s,lib.characters[0].id),b=Roster.addToCombat(lib,s,lib.characters[1].id);CombatCore.declare(s,a.id,'esquiver','10+');CombatCore.declare(s,b.id,'defendre','10+');CombatCore.reveal(s);while(s.phase!=='esquiver')CombatCore.advance(s);render();setView('combat');setCombatTab('technique')}""")
   page.locator('#source').select_option('p-1');page.locator('#target').select_option('p-1');tech=page.evaluate("TECH_CATALOG.find(t=>t.nom==='Dérobade').id");page.locator('#tech').select_option(tech);assert 'Terrifié' in page.locator('#condition option').all_text_contents();page.get_by_role('button',name='Cibler un autre combattant',exact=True).click();assert page.locator('#target').input_value()=='p-2';assert page.locator('#condition option').all_text_contents()==['Réticent']
   # Les quatre segmentations PNJ restent utilisables dans la même interface.
   for cap,count,balance in [(3,1,1),(5,3,2),(10,5,3),(15,8,4)]:
    page.evaluate("""p => {const c=lib.characters[1];Roster.updateCharacter(lib,c.id,{npcResources:{format:'avatar-npc-resources',version:1,combatant:true,fatigueMax:p.cap,balanceMax:p.balance,conditions:Array.from({length:p.count},(_,i)=>'État '+(i+1))}});renderSheets(c.id);setView('characters');setCharacterKind('PNJ');openCharacterDetail(c.id)}""",{'cap':cap,'count':count,'balance':balance})
    assert page.locator('#sheetQuick .resource-cell').count()==cap
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(width,cap)
   page.evaluate("() => {const c=Roster.createCharacter(lib,'Sans combat','PNJ');Roster.updateCharacter(lib,c.id,{npcResources:{format:'avatar-npc-resources',version:1,combatant:false,fatigueMax:0,balanceMax:0,conditions:[]}});renderSheets(c.id);setView('characters');setCharacterKind('PNJ');openCharacterDetail(c.id)}");assert page.locator('#sheetResourceToggle').get_attribute('hidden') is not None
   assert not errors,errors;assert alerts==['Fiche enregistrée.'],alerts;context.close();print(f'OK recette UI/UX {width}×{height}')
  browser.close()
finally:server.shutdown()
