"""Recette du shell réellement compilé, sans démarrer de serveur de développement."""
import json, os, shutil, sys, re
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from threading import Thread
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
DIST=ROOT/'dist/companion'
OUT=ROOT/'work/lot1-browser'
OUT.mkdir(parents=True,exist_ok=True)
html=(DIST/'index.html').read_text()
assert not re.search(r'<(?:script|link)\b[^>]*(?:src|href)=["\'][^"\']+\.(?:js|css)',html), 'Ressource externe JS/CSS'
assert len(list(DIST.iterdir()))==1, 'Le build doit être mono-fichier'
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args): pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(DIST)))
Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_port}/index.html'
legacy={'avatar-roster-v021':'ANCIENNE BIBLIOTHÈQUE','avatar-v021':'ANCIEN COMBAT','avatar-legendes-compagnon-demo-v1':'DEMO INTACTE','avatar-complete-import-journal-v1':'JOURNAL INTACT'}
results={'viewports':[],'offline':{},'errors':[]}
def no_overflow(page):
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),page.evaluate('({w:innerWidth,sw:document.documentElement.scrollWidth})')
def within(locator,w,h):
 box=locator.bounding_box();assert box and box['x']>=-1 and box['y']>=-1 and box['x']+box['width']<=w+1 and box['y']+box['height']<=h+1,box
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),headless=True,args=['--no-sandbox'])
  for w,h in [(1440,1024),(1280,800),(768,1024),(390,844)]:
   context=browser.new_context(viewport={'width':w,'height':h},has_touch=w<800,accept_downloads=True)
   context.add_init_script('''const original=Storage.prototype.setItem;window.__writes=[];Storage.prototype.setItem=function(k,v){window.__writes.push(k);return original.call(this,k,v)};''')
   page=context.new_page();page.set_default_timeout(10000);errors=[];requests=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   page.on('request',lambda r:requests.append(r.url))
   page.goto(url);page.get_by_role('heading',name='Accueil',exact=True).wait_for()
   assert page.evaluate('window.__writes')==[]
   page.evaluate('(entries)=>Object.entries(entries).forEach(([k,v])=>localStorage.setItem(k,v))',legacy)
   nav=page.get_by_role('navigation',name='Navigation principale')
   for name in ['Accueil','Personnages','Lieux','Combats','Techniques','Gestion']:
    button=nav.get_by_role('button',name=name,exact=True);within(button,w,h)
    if w<800:button.tap()
    else:button.click()
    page.get_by_role('heading',name=name,exact=True).wait_for();assert button.get_attribute('aria-current')=='page'
    assert page.evaluate('decodeURIComponent(location.hash)')=='#'+name.lower()
    no_overflow(page)
   page.go_back();page.get_by_role('heading',name='Techniques',exact=True).wait_for()
   page.go_forward();page.get_by_role('heading',name='Gestion',exact=True).wait_for()
   nav.get_by_role('button',name='Techniques',exact=True).focus();page.keyboard.press('Enter');page.get_by_role('heading',name='Techniques',exact=True).wait_for()
   nav.get_by_role('button',name='Gestion',exact=True).focus();page.keyboard.press('Enter');page.get_by_role('heading',name='Gestion',exact=True).wait_for()
   # Focus initial, boucle Tab/Shift-Tab, Échap et retour à l'appelant.
   help_button=page.get_by_role('button',name='À propos du lot 1',exact=True);help_button.click()
   dialog=page.get_by_role('dialog');dialog.wait_for();assert dialog.get_attribute('aria-modal')=='true'
   assert page.locator('.app-shell').evaluate('(e)=>e.inert')
   for _ in range(7):
    page.keyboard.press('Tab');assert dialog.evaluate('(e)=>e.contains(document.activeElement)')
   page.keyboard.press('Shift+Tab');assert dialog.evaluate('(e)=>e.contains(document.activeElement)')
   close=dialog.get_by_role('button',name='Fermer',exact=True);close.scroll_into_view_if_needed();within(close,w,h)
   page.keyboard.press('Escape');dialog.wait_for(state='detached');page.wait_for_function("document.activeElement?.textContent==='À propos du lot 1'")
   # Persistance, export réel puis lecture d'un fichier local et annulation sans écriture.
   page.get_by_label('Note de test',exact=True).fill(f'Note hors ligne {w}')
   page.get_by_role('button',name='Enregistrer la note de test',exact=True).click();page.get_by_role('status').filter(has_text='enregistrée').wait_for()
   with page.expect_download() as pending:page.get_by_role('button',name='Exporter l’état de test',exact=True).click()
   exported=Path(pending.value.path()).read_text();assert json.loads(exported)['lot1Note']==f'Note hors ligne {w}'
   before=page.evaluate('({...localStorage})')
   page.get_by_label('Examiner une copie JSON',exact=True).set_input_files({'name':'copie.json','mimeType':'application/json','buffer':exported.encode()})
   dialog=page.get_by_role('dialog');dialog.wait_for();assert 'Sauvegarde complète' in dialog.inner_text();dialog.get_by_role('button',name='Annuler l’examen').click();dialog.wait_for(state='detached')
   assert not page.get_by_text('Sauvegarde complète reconnu.',exact=False).count()
   page.wait_for_function("document.activeElement?.textContent==='Examiner une copie JSON'")
   assert page.evaluate('({...localStorage})')==before
   page.reload();page.get_by_role('heading',name='Gestion',exact=True).wait_for();assert page.get_by_label('Note de test',exact=True).input_value()==f'Note hors ligne {w}'
   for key,value in legacy.items():assert page.evaluate('(k)=>localStorage.getItem(k)',key)==value
   assert not errors,errors;assert all(r==url for r in requests),requests
   page.screenshot(path=str(OUT/f'gestion-{w}.png'),full_page=True)
   nav.get_by_role('button',name='Accueil',exact=True).click();page.screenshot(path=str(OUT/f'accueil-{w}.png'),full_page=True)
   results['viewports'].append({'width':w,'height':h,'navigation':True,'touch':w<800,'modalKeyboardFocus':True,'overflow':False,'persistenceAndFiles':True,'externalRequests':0})
   context.close()
  # Deux onglets, notifications storage réelles et note brouillon préservée.
  context=browser.new_context();a=context.new_page();b=context.new_page();a.goto(url+'#gestion');b.goto(url+'#gestion')
  b.get_by_label('Note de test',exact=True).fill('Brouillon B')
  a.get_by_label('Note de test',exact=True).fill('Valeur A');a.get_by_role('button',name='Enregistrer la note de test').click()
  b.get_by_role('alert').filter(has_text='Modification externe').wait_for();assert b.get_by_label('Note de test',exact=True).input_value()=='Brouillon B';assert b.get_by_role('button',name='Enregistrer la note de test').is_disabled()
  results['twoTabsConflict']=True;context.close()
  # Quota réel simulé au port Storage, retour à la normale et rechargement.
  context=browser.new_context();page=context.new_page();page.goto(url+'#gestion');page.get_by_label('Note de test',exact=True).fill('Brouillon conservé')
  page.evaluate("() => {window.__set=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw new DOMException('Quota test','QuotaExceededError')}}")
  page.get_by_role('button',name='Enregistrer la note de test').click();page.get_by_role('status').filter(has_text='Quota test').wait_for();assert page.get_by_label('Note de test',exact=True).input_value()=='Brouillon conservé'
  page.evaluate('() => {Storage.prototype.setItem=window.__set}');page.get_by_role('button',name='Enregistrer la note de test').click();page.get_by_role('status').filter(has_text='enregistrée').wait_for();page.reload();assert page.get_by_label('Note de test',exact=True).input_value()=='Brouillon conservé';results['quotaRecovery']=True;context.close()
  # Accès refusé dès le montage : l'interface reste accessible, pas de reset.
  context=browser.new_context();context.add_init_script("Storage.prototype.getItem=function(){throw new Error('Accès local refusé')}");page=context.new_page();page.goto(url+'#gestion');page.get_by_role('alert').filter(has_text='Accès local refusé').wait_for();assert page.get_by_role('button',name='Enregistrer la note de test').is_disabled();results['deniedStorage']=True;context.close()
  # Vrai essai file://, contexte froid et réseau coupé, sans assouplir la politique.
  context=browser.new_context(offline=True,accept_downloads=True);page=context.new_page();requests=[];page.on('request',lambda r:requests.append(r.url))
  try:
   page.goto((DIST/'index.html').as_uri()+'#gestion',timeout=10000);page.get_by_role('heading',name='Gestion',exact=True).wait_for(timeout=5000)
   page.get_by_label('Note de test',exact=True).fill('File hors ligne');page.get_by_role('button',name='Enregistrer la note de test').click();page.get_by_role('status').filter(has_text='enregistrée').wait_for(timeout=3000)
   page.reload();assert page.get_by_label('Note de test',exact=True).input_value()=='File hors ligne'
   results['offline']['fileColdStart']=True;results['offline']['filePersistence']=True
  except Exception as error:results['offline']['fileColdStart']=False;results['offline']['fileLimitation']=str(error)[:600]
  context.close()
  # Document autonome chargé à froid par un transport de test, tout réseau désactivé.
  # Prouve l'absence de sous-ressource ; pas une preuve du double-clic Mac.
  context=browser.new_context(offline=True,accept_downloads=True);page=context.new_page();requests=[];page.on('request',lambda r:requests.append(r.url))
  context.route(url,lambda route:route.fulfill(status=200,content_type='text/html',body=html))
  page.goto(url+'#gestion');page.get_by_role('heading',name='Gestion',exact=True).wait_for();page.get_by_label('Note de test',exact=True).fill('Froid hors réseau');page.get_by_role('button',name='Enregistrer la note de test').click();page.get_by_role('status').filter(has_text='enregistrée').wait_for()
  with page.expect_download() as pending:page.get_by_role('button',name='Exporter l’état de test').click()
  offline_export=Path(pending.value.path()).read_text();assert json.loads(offline_export)['lot1Note']=='Froid hors réseau'
  page.get_by_label('Examiner une copie JSON',exact=True).set_input_files({'name':'hors-reseau.json','mimeType':'application/json','buffer':offline_export.encode()});page.get_by_role('dialog').wait_for();page.get_by_role('button',name='Annuler l’examen').click()
  page.reload();assert page.get_by_label('Note de test',exact=True).input_value()=='Froid hors réseau'
  assert all(r.split('#')[0]==url for r in requests),requests
  results['offline']['embeddedDocumentColdStart']=True;results['offline']['subresourceRequests']=0;results['offline']['exportAndPersistence']=True
  context.close();browser.close()
finally:
 server.shutdown();(OUT/'results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
print(json.dumps(results,ensure_ascii=False,indent=2))
