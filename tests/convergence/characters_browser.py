"""Parcours du lot 2 sur le vrai build React/Vite portable."""
import json, os, shutil, subprocess
from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from functools import partial
from threading import Thread
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2];DIST=ROOT/'dist/companion';OUT=ROOT/'work/lot2-browser';OUT.mkdir(parents=True,exist_ok=True)
fixture=OUT/'fictif.json';subprocess.run(['node',str(ROOT/'tests/convergence/character-fixture.mjs'),str(fixture)],check=True);original=json.loads(fixture.read_text())
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(DIST)));Thread(target=server.serve_forever,daemon=True).start();url=f'http://127.0.0.1:{server.server_port}/index.html'
results={'viewports':[]}
def project(page):return page.evaluate("JSON.parse(localStorage.getItem('avatar-compagnon-react-session-v1')).session")
def character(page,name):return next(c for c in project(page)['library']['characters'] if c['name']==name)
def open_person(page,name):
 page.get_by_role('navigation',name='Navigation principale').get_by_role('button',name='Personnages',exact=True).click();page.get_by_role('button',name='Ouvrir la fiche de '+name,exact=True).click();page.get_by_role('heading',name=name,exact=True).wait_for()
def import_file(page,file=fixture):
 page.get_by_role('navigation',name='Navigation principale').get_by_role('button',name='Gestion',exact=True).click();page.get_by_label('Importer une sauvegarde Codex',exact=True).set_input_files(str(file));page.get_by_role('dialog').wait_for();page.get_by_role('button',name='Confirmer l’import').click();page.get_by_role('dialog').wait_for(state='detached');page.get_by_role('status').filter(has_text='Sauvegarde importée').wait_for()
def edit(page):
 page.get_by_role('button',name='Modifier le personnage',exact=True).click();page.get_by_role('dialog').wait_for();return page.get_by_role('dialog')
def add_resource(page,title,name,status=False):
 region=page.get_by_role('region',name=title,exact=True);region.get_by_label('Choisir un '+('statut' if status else 'état')+' à ajouter',exact=True).select_option(name);region.get_by_role('button',name='Ajouter '+('le statut' if status else 'l’état'),exact=True).click()
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),headless=True,args=['--no-sandbox'])
  for w,h in [(1440,1024),(1280,800),(768,1024),(390,844)]:
   context=browser.new_context(viewport={'width':w,'height':h},has_touch=w<800,accept_downloads=True);page=context.new_page();page.set_default_timeout(10000);errors=[];dialogs=[];answer={'accept':True}
   page.on('pageerror',lambda e:errors.append(str(e)))
   def dialog(d):
    dialogs.append(d.message)
    if d.type=='confirm' and not answer['accept']:d.dismiss()
    else:d.accept()
   page.on('dialog',dialog);page.goto(url)
   assert page.evaluate("localStorage.getItem('avatar-compagnon-react-session-v1')") is None
   page.evaluate("localStorage.setItem('avatar-roster-v021','ANCIEN INTACT')")
   import_file(page);open_person(page,'Lin test');before=project(page)
   # Fatigue immédiate et annulable, principes réels, centre distinct, copie combat intacte.
   assert 'Devoir' in page.locator('.balance-principles').inner_text();assert 'Liberté' in page.locator('.balance-principles').inner_text()
   page.get_by_role('button',name='Augmenter fatigue',exact=True).click();page.get_by_role('status').filter(has_text='Ressources enregistrées').wait_for();assert character(page,'Lin test')['fatigue']==1;assert project(page)['combat']==before['combat']
   page.get_by_role('button',name='Annuler le dernier ajustement').click();page.get_by_role('status').filter(has_text='ajustement annulé').wait_for();assert character(page,'Lin test')['fatigue']==0
   page.get_by_role('button',name='Déplacer l’équilibre à +3',exact=True).click();page.wait_for_function("JSON.parse(localStorage.getItem('avatar-compagnon-react-session-v1')).session.library.characters[0].balance===3");assert character(page,'Lin test')['center']==-2
   add_resource(page,'États / conditions','En colère');page.wait_for_function("JSON.parse(localStorage.getItem('avatar-compagnon-react-session-v1')).session.library.characters[0].conditions.includes('En colère')")
   add_resource(page,'Statuts','Gêné',True);page.wait_for_function("JSON.parse(localStorage.getItem('avatar-compagnon-react-session-v1')).session.library.characters[0].statuses.includes('Gêné')");assert character(page,'Lin test')['conditions']==['En colère']
   assert any('statut sur la fiche permanente' in d for d in dialogs)
   # Fenêtre PJ : validation, annulation refusée puis acceptée, focus et pas de perte silencieuse.
   d=edit(page);d.get_by_label('Nom',exact=True).fill('Brouillon abandonné');answer['accept']=False;page.keyboard.press('Escape');assert d.is_visible();answer['accept']=True;page.keyboard.press('Escape');d.wait_for(state='detached');page.wait_for_function("document.activeElement?.textContent==='Modifier le personnage'");assert character(page,'Lin test')['name']=='Lin test'
   # Édition du centre confirmée ; portrait valide local.
   d=edit(page);d.get_by_label('Centre d’équilibre',exact=True).fill('-1')
   png=bytes.fromhex('89504e470d0a1a0a') # Fausses signatures doivent échouer au décodage.
   d.get_by_label('Portrait local',exact=False).set_input_files({'name':'faux.png','mimeType':'image/png','buffer':png});d.get_by_role('alert').filter(has_text='illisi').wait_for()
   d.get_by_label('Portrait local',exact=False).set_input_files({'name':'trop.png','mimeType':'image/png','buffer':b'x'*262145});d.get_by_role('alert').filter(has_text='256 Ko').wait_for()
   import base64
   valid=base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==')
   d.get_by_label('Portrait local',exact=False).set_input_files({'name':'portrait.png','mimeType':'image/png','buffer':valid});d.locator('img.local-portrait').wait_for();d.get_by_role('button',name='Enregistrer la fiche').click();d.wait_for(state='detached');assert character(page,'Lin test')['center']==-1;assert any('centre d’équilibre' in v for v in dialogs)
   # Onglet/fiche conservés après reload, navigation précédent/suivant.
   page.get_by_role('navigation',name='Sections de la fiche').get_by_role('button',name='Histoire et relations').click();hash_value=page.evaluate('location.hash');page.reload();page.get_by_role('heading',name='Histoire et relations').wait_for();assert page.evaluate('location.hash')==hash_value
   tabs=page.locator('.detail-tabs');assert tabs.evaluate('(e)=>e.scrollHeight<=e.clientHeight'), 'Défilement vertical des onglets'
   page.screenshot(path=str(OUT/f'fiche-pj-{w}.png'),full_page=True)
   # Chaque capacité PNJ et non combattant ; carte de profil + limites réelles.
   for cap in [0,3,5,10,15]:
    open_person(page,'PNJ '+str(cap))
    if cap:assert page.get_by_role('group',name=f'Fatigue : 0 sur {cap}',exact=True).is_visible()
    else:assert page.get_by_text('PNJ non combattant',exact=True).is_visible();assert not page.get_by_role('button',name='Augmenter fatigue',exact=True).count()
   # Nom PNJ modifiable sans changer les lieux ; états propres et équilibre 0…4.
   open_person(page,'PNJ 15');old=character(page,'PNJ 15');d=edit(page);d.get_by_label('Nom',exact=True).fill('PNJ renommé');d.get_by_role('button',name='Enregistrer la fiche').click();d.wait_for(state='detached');assert character(page,'PNJ renommé')['placeLinks']==old['placeLinks'];assert character(page,'PNJ renommé')['future']==old['future'];assert character(page,'PNJ renommé')['id']==old['id']
   assert page.get_by_role('button',name='Valeur +4',exact=True).is_visible();add_resource(page,'États / conditions','État du profil');page.wait_for_function("JSON.parse(localStorage.getItem('avatar-compagnon-react-session-v1')).session.library.characters.find(c=>c.name==='PNJ renommé').conditions.length===1")
   # Importance seule : refuser la proposition garde les cinq fatigues historiques.
   open_person(page,'PNJ historique');d=edit(page);answer['accept']=False;d.get_by_label('Importance',exact=True).select_option('Champion');answer['accept']=True;d.get_by_role('button',name='Enregistrer la fiche').click();d.wait_for(state='detached');assert 'npcResources' not in character(page,'PNJ historique')
   # Recherche, filtrage, retour liste ; création PJ réelle.
   page.get_by_role('button',name='Retour aux personnages',exact=True).click();page.get_by_role('textbox',name='Rechercher un personnage non joueur').fill('renommé');assert page.locator('.npc-grid .character-card').count()==1;page.get_by_role('textbox',name='Rechercher un personnage non joueur').fill('')
   page.get_by_role('button',name='Ajouter un personnage joueur',exact=True).click();d=page.get_by_role('dialog');d.get_by_label('Nom',exact=True).fill('PJ créé');d.get_by_label('Principe gauche',exact=True).fill('Patience');d.get_by_label('Principe droit',exact=True).fill('Action');d.get_by_role('button',name='Enregistrer la fiche').click();d.wait_for(state='detached');page.get_by_role('heading',name='PJ créé',exact=True).wait_for();assert character(page,'PJ créé')['kind']=='PJ'
   if w==1440:
    page.get_by_role('button',name='Retour aux personnages',exact=True).click();page.get_by_role('button',name='Ajouter un personnage non joueur',exact=True).click();d=page.get_by_role('dialog');d.get_by_label('Nom',exact=True).fill('PNJ créé légendaire');d.get_by_label('Importance',exact=True).select_option('Légendaire');d.get_by_role('button',name='Enregistrer la fiche').click();d.get_by_role('alert').wait_for();assert d.is_visible()
    d.get_by_label('Noms des états du profil (un par ligne)',exact=True).fill('Terrifié\nEn colère\nCoupable\nFragile\nConfus\nÉtat six\nÉtat sept\nÉtat huit');d.get_by_label('Principe du PNJ',exact=True).fill('Protection');d.get_by_role('button',name='Enregistrer la fiche').click();d.wait_for(state='detached');assert character(page,'PNJ créé légendaire')['npcResources']['fatigueMax']==15;open_person(page,'PJ créé')
   # Quota sur édition : brouillon conservé puis nouvelle tentative ; nom permanent intact.
   d=edit(page);d.get_by_label('Nom',exact=True).fill('PJ après quota');page.evaluate("()=>{window.__set=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw new DOMException('Quota test','QuotaExceededError')}}");d.get_by_role('button',name='Enregistrer la fiche').click();d.get_by_role('alert').filter(has_text='Quota test').wait_for();assert d.get_by_label('Nom',exact=True).input_value()=='PJ après quota';assert character(page,'PJ créé')['name']=='PJ créé';page.evaluate('()=>{Storage.prototype.setItem=window.__set}');d.get_by_role('button',name='Enregistrer la fiche').click();d.wait_for(state='detached')
   # Export complet et import contrôlé, sans perte d'inconnus ni du combat.
   page.get_by_role('navigation',name='Navigation principale').get_by_role('button',name='Gestion',exact=True).click();expected=project(page)
   with page.expect_download() as pending:page.get_by_role('button',name='Exporter la sauvegarde du projet').click()
   export=Path(pending.value.path()).read_text();out=OUT/f'export-{w}.json';out.write_text(export);data=json.loads(export);assert data['library']==expected['library'];assert data['combat']==original['combat'];assert data['futureExport']=='keep'
   import_file(page,out);assert project(page)['library']==expected['library'];assert page.evaluate("localStorage.getItem('avatar-roster-v021')")=='ANCIEN INTACT'
   open_person(page,'PJ après quota');context.set_offline(True);page.screenshot(path=str(OUT/f'fiche-finale-{w}.png'),full_page=True);assert page.evaluate('document.documentElement.scrollWidth<=innerWidth');assert not errors,errors
   results['viewports'].append({'width':w,'height':h,'characters':True,'resourcesAndUndo':True,'pnjProfiles':True,'placesPreserved':True,'portraits':True,'quotaRecovery':True,'roundtrip':True,'focusAndTabs':True,'pageErrors':errors})
   context.close()
  # Conflit réel du projet pendant une édition : brouillon conservé, aucune écriture.
  context=browser.new_context(accept_downloads=True);a=context.new_page();b=context.new_page()
  for page in [a,b]:page.set_default_timeout(15000);page.on('dialog',lambda d:d.accept())
  a.goto(url);import_file(a);b.goto(url);open_person(b,'Lin test');d=edit(b);d.get_by_label('Nom',exact=True).fill('Brouillon concurrent')
  open_person(a,'Lin test');a.get_by_role('button',name='Augmenter fatigue',exact=True).click()
  b.locator('.feature-feedback[role=alert]').filter(has_text='Modification externe').wait_for();d.get_by_role('button',name='Enregistrer la fiche').click();d.get_by_role('alert').filter(has_text='bloquée').wait_for();assert d.get_by_label('Nom',exact=True).input_value()=='Brouillon concurrent';assert character(a,'Lin test')['fatigue']==1;assert character(a,'Lin test')['name']=='Lin test';results['twoTabProjectConflict']=True;context.close()
  # Démarrage à froid et persistance métier, réseau coupé, document embarqué.
  def offline_session(target,transport=False):
   context=browser.new_context(offline=True,accept_downloads=True);page=context.new_page();page.set_default_timeout(10000);page.on('dialog',lambda d:d.accept());requests=[];page.on('request',lambda r:requests.append(r.url))
   if transport:context.route(target,lambda route:route.fulfill(status=200,content_type='text/html',body=(DIST/'index.html').read_text()))
   try:
    page.goto(target);import_file(page);open_person(page,'Lin test');page.get_by_role('button',name='Augmenter fatigue',exact=True).click();page.wait_for_function("JSON.parse(localStorage.getItem('avatar-compagnon-react-session-v1')).session.library.characters[0].fatigue===1");page.reload();page.get_by_role('heading',name='Lin test',exact=True).wait_for();assert character(page,'Lin test')['fatigue']==1
    page.get_by_role('navigation',name='Navigation principale').get_by_role('button',name='Gestion',exact=True).click()
    with page.expect_download() as pending:page.get_by_role('button',name='Exporter la sauvegarde du projet').click()
    assert json.loads(Path(pending.value.path()).read_text())['library']['characters'][0]['fatigue']==1
    assert all(r.split('#')[0]==target for r in requests),requests
    return True
   finally:context.close()
  results['offlineEmbeddedProject']=offline_session(url,True)
  try:results['offlineNativeFile']=offline_session((DIST/'index.html').as_uri())
  except Exception as error:results['offlineNativeFile']=False;results['offlineNativeLimitation']=str(error)[:500]
  browser.close()
finally:server.shutdown();(OUT/'results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
print(json.dumps(results,ensure_ascii=False,indent=2))
