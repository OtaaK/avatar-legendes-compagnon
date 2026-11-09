"""Bibliothèque informative : vraies métadonnées, textes synthétiques de test uniquement."""
import json,os,shutil,subprocess,runpy
from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from functools import partial
from threading import Thread
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2];DIST=ROOT/'dist/companion';OUT=ROOT/'work/library-browser';OUT.mkdir(parents=True,exist_ok=True)
fixture=OUT/'fictif.json';subprocess.run(['node',str(ROOT/'tests/convergence/character-fixture.mjs'),str(fixture)],check=True);backup=json.loads(fixture.read_text())
catalog=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import{TECH_CATALOG as c}from'./packages/domain/src/catalog.js';console.log(JSON.stringify(c.map(({id,nom,famille,approche})=>({id,nom,famille,approche}))));"],cwd=ROOT,text=True))
family_names=['Base','Universelles','Groupe','Eau','Terre','Feu','Air','Armes','Technologie'];family_ids=['base','universelle','groupe_pnj','eau','terre','feu','air','armes','technologie'];approaches=['Avancer et attaquer','Défendre et prendre à revers','Esquiver et analyser']
# Aucun contenu du PDF dans ces fixtures, captures ou rapports distribués.
synthetic='Texte synthétique de recette, sans extrait du livre.\n\n'+('\n'.join('• Élément synthétique '+str(i) for i in range(70)))+'\n\nFIN DU TEXTE SYNTHÉTIQUE'
pack=json.dumps({'format':'avatar-technique-descriptions-privees','version':1,'techniques':[{'id':'base-frapper','description':synthetic}]},ensure_ascii=False).encode()
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(DIST)));Thread(target=server.serve_forever,daemon=True).start();url=f'http://127.0.0.1:{server.server_port}/index.html'
colors=['rgb(157, 170, 187)','rgb(195, 143, 106)','rgb(104, 165, 149)','rgb(27, 169, 225)','rgb(146, 187, 82)','rgb(216, 75, 99)','rgb(184, 160, 106)','rgb(79, 121, 180)','rgb(142, 94, 199)']
full_pack=json.dumps({'format':'avatar-technique-descriptions-privees','version':1,'techniques':[{'id':t['id'],'description':synthetic+'\\n\\nID synthétique : '+t['id']} for t in catalog]},ensure_ascii=False).encode()
results={'viewports':[]}
def seed(page):
 page.evaluate('''data=>{localStorage.setItem('avatar-compagnon-react-session-v1',JSON.stringify({format:'avatar-compagnon-react-session',version:1,revision:1,session:{library:data.library,combat:data.combat,backupMetadata:{}}}));localStorage.setItem('avatar-roster-v021','HISTORIQUE INTACT');localStorage.setItem('avatar-v021','COMBAT INTACT');}''',backup);page.reload();page.get_by_role('heading',name='Techniques',exact=True).wait_for()
def family(page):return page.get_by_role('group',name='Filtrer par famille')
def approach(page):return page.get_by_role('group',name='Filtrer par approche')
def count(page,n):page.wait_for_function('(n)=>document.querySelectorAll(".library-card").length===n',arg=n)
def reset(page):page.get_by_role('button',name='Réinitialiser les filtres',exact=True).click();count(page,111)
def upload_private(page,buffer=pack):
 page.get_by_role('navigation',name='Navigation principale').get_by_role('button',name='Gestion',exact=True).click();page.get_by_label('Fichier privé de descriptions',exact=True).set_input_files({'name':'prive-synthetique.json','mimeType':'application/json','buffer':buffer});page.get_by_role('dialog').wait_for()
def open_fr(app):
 reset(app);family(app).get_by_role('button',name='Base',exact=True).click();app.get_by_role('searchbox',name='Rechercher une technique par nom').fill('Frapper');count(app,1);app.locator('.library-card').click();app.get_by_role('dialog').wait_for()
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),headless=True,args=['--no-sandbox'])
  for w,h in [(1440,1024),(1280,800),(768,1024),(390,844)]:
   context=browser.new_context(viewport={'width':w,'height':h},has_touch=w<800,accept_downloads=True);context.add_init_script("window.__writes=[];const set=Storage.prototype.setItem,remove=Storage.prototype.removeItem;Storage.prototype.setItem=function(k,v){window.__writes.push(k);return set.call(this,k,v)};Storage.prototype.removeItem=function(k){window.__writes.push(k);return remove.call(this,k)};")
   page=context.new_page();page.set_default_timeout(15000);errors=[];requests=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('request',lambda r:requests.append(r.url));page.on('dialog',lambda d:d.accept());page.goto(url+'#techniques');seed(page)
   assert page.evaluate('window.__writes')==[];before=page.evaluate('({...localStorage})');count(page,111)
   assert family(page).get_by_role('button').all_inner_texts()==['Toutes']+family_names
   assert approach(page).get_by_role('button').all_inner_texts()==['Toutes']+approaches
   assert page.locator('.reference-library select').count()==0
   # Familles seules et toutes les intersections approche/famille.
   for fid,name in zip(family_ids,family_names):
    family(page).get_by_role('button',name=name,exact=True).click();count(page,9 if fid=='base' else 12 if fid in ['armes','technologie'] else 13)
    assert family(page).get_by_role('button',name=name,exact=True).get_attribute('aria-pressed')=='true'
    for a in approaches:
     approach(page).get_by_role('button',name=a,exact=True).click();count(page,sum(t['famille']==fid and t['approche']==a for t in catalog))
    approach(page).get_by_role('button',name='Toutes',exact=True).click()
   reset(page)
   for a in approaches:approach(page).get_by_role('button',name=a,exact=True).click();count(page,sum(t['approche']==a for t in catalog))
   reset(page);q=page.get_by_role('searchbox',name='Rechercher une technique par nom');q.fill('ÉTOILE');count(page,sum('étoile' in t['nom'].lower() for t in catalog));q.fill('etoile');assert page.locator('[data-technique-id="terre-etoile-de-lave"]').count()==1
   # Conservation des critères lors du changement de famille/approche et recherche par nom seule.
   q.fill('feu');family(page).get_by_role('button',name='Feu',exact=True).click();approach(page).get_by_role('button',name=approaches[0],exact=True).click();count(page,4);assert q.input_value()=='feu';family(page).get_by_role('button',name='Toutes',exact=True).click();assert approach(page).get_by_role('button',name=approaches[0],exact=True).get_attribute('aria-pressed')=='true';assert q.input_value()=='feu'
   family(page).get_by_role('button',name='Base',exact=True).click();count(page,0);assert page.get_by_text('Aucune technique ne correspond',exact=True).is_visible();reset(page);q.fill('statut contextuel');count(page,0);reset(page)
   # Densité et bordures : neuf familles, 1 px, identité conservée au survol/focus.
   grid=page.locator('.technique-grid');columns=grid.evaluate('e=>getComputedStyle(e).gridTemplateColumns.split(" ").length')
   assert columns >= (4 if w==1440 else 3 if w==1280 else 2 if w==768 else 1),columns
   for fid,color in zip(family_ids,colors):
    card=page.locator(f'.library-card[data-family="{fid}"]').first
    card.scroll_into_view_if_needed();style=card.evaluate('e=>({border:getComputedStyle(e).borderTopColor,width:getComputedStyle(e).borderTopWidth,height:e.getBoundingClientRect().height})')
    assert style['border']==color and style['width']=='1px',style
    assert style['height']<155,style
    card.hover();assert card.evaluate('e=>getComputedStyle(e).borderTopColor')==color
    page.keyboard.press('Tab');card.focus();assert card.evaluate('e=>getComputedStyle(e).outlineStyle')!='none';assert card.evaluate('e=>getComputedStyle(e).borderTopColor')==color
   page.mouse.move(0,0)
   # Cartes = trois informations, un seul élément interactif, nom exact et approche.
   first=page.locator('.library-card').first;assert first.locator('button,input,select,a').count()==0
   assert [line.casefold() for line in first.inner_text().splitlines()]==[line.casefold() for line in ['Base','Se préparer','Défendre et prendre à revers']],first.inner_text()
   assert first.locator('.library-card-name').inner_text()=='Se préparer'
   for forbidden in ['Connue','En apprentissage','Maîtrisée','Voir le détail','Apprendre','Utiliser']:assert page.locator('.library-card').get_by_text(forbidden,exact=True).count()==0
   # Chaque zone, clavier Entrée/Espace et tactile ouvrent une seule fenêtre.
   for child in [None,'.library-card-name','.eyebrow','.training-mark']:
    target=first if child is None else first.locator(child);target.click();dialog=page.get_by_role('dialog');assert dialog.count()==1;assert dialog.get_by_role('heading',name='Se préparer',exact=True).is_visible();assert dialog.locator('.description-unavailable').is_visible();assert dialog.locator('select').count()==0
    for _ in range(4):page.keyboard.press('Tab');assert dialog.evaluate('e=>e.contains(document.activeElement)')
    page.keyboard.press('Shift+Tab');assert dialog.evaluate('e=>e.contains(document.activeElement)');assert page.locator('.app-shell').evaluate('e=>e.inert');page.keyboard.press('Escape');dialog.wait_for(state='detached');page.wait_for_function('document.activeElement?.classList.contains("library-card")')
   # Les quatre coins à l'intérieur de la bordure sont eux aussi cliquables.
   first.scroll_into_view_if_needed();box=first.bounding_box()
   for x,y in [(8,8),(box['width']-8,8),(8,box['height']-8),(box['width']-8,box['height']-8)]:
    first.click(position={'x':x,'y':y});page.get_by_role('dialog').wait_for();page.keyboard.press('Escape');page.get_by_role('dialog').wait_for(state='detached')
   for key in ['Enter','Space']:
    first.focus();page.keyboard.press(key);page.get_by_role('dialog').wait_for();assert page.get_by_role('dialog').count()==1;page.get_by_role('button',name='Fermer la fenêtre').click();page.get_by_role('dialog').wait_for(state='detached')
   if w<800:first.tap();page.get_by_role('dialog').wait_for();page.keyboard.press('Escape')
   for group in [family(page),approach(page)]:
    assert group.evaluate('e=>e.scrollWidth<=e.clientWidth')
    for button in group.get_by_role('button').all():
     box=button.bounding_box();assert box['x']>=0 and box['x']+box['width']<=w+1;assert box['height']>=44
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth');assert page.evaluate('({...localStorage})')==before;assert page.evaluate('window.__writes')==[]
   page.screenshot(path=str(OUT/f'bibliotheque-{w}.png'),full_page=True)
   # Contenu privé : aperçu/annulation sans écriture, confirmation, export Codex excluant le texte.
   upload_private(page);page.get_by_role('button',name='Annuler le chargement').click();assert page.evaluate('({...localStorage})')==before
   upload_private(page);page.get_by_role('button',name='Confirmer le chargement privé').click();page.get_by_role('dialog').wait_for(state='detached');assert page.evaluate('window.__writes')==['avatar-compagnon-private-technique-texts-v1'];assert page.evaluate("localStorage.getItem('avatar-roster-v021')")=='HISTORIQUE INTACT'
   with page.expect_download() as pending:page.get_by_role('button',name='Exporter la sauvegarde du projet').click()
   assert 'Texte synthétique' not in Path(pending.value.path()).read_text()
   # Export privé dédié et restauration groupée des 111 entrées, sans campagne.
   with page.expect_download() as private_download:page.get_by_role('button',name='Exporter mes descriptions privées',exact=True).click()
   exported_private=Path(private_download.value.path()).read_bytes();assert json.loads(exported_private)['techniques']==json.loads(pack)['techniques']
   upload_private(page,full_pack);page.get_by_role('button',name='Confirmer le chargement privé').click();page.get_by_role('dialog').wait_for(state='detached')
   assert len(json.loads(page.evaluate("localStorage.getItem('avatar-compagnon-private-technique-texts-v1')"))['techniques'])==111
   with page.expect_download() as all_download:page.get_by_role('button',name='Exporter mes descriptions privées',exact=True).click()
   assert json.loads(Path(all_download.value.path()).read_text())==json.loads(full_pack)
   page.get_by_role('button',name='Effacer les descriptions privées',exact=True).click()
   assert page.evaluate("localStorage.getItem('avatar-compagnon-private-technique-texts-v1')") is None
   upload_private(page,exported_private);page.get_by_role('button',name='Confirmer le chargement privé').click();page.get_by_role('dialog').wait_for(state='detached')
   page.get_by_role('navigation',name='Navigation principale').get_by_role('button',name='Techniques',exact=True).click();open_fr(page);dialog=page.get_by_role('dialog');assert dialog.locator('.full-technique-description').inner_text()==synthetic;assert 'FIN DU TEXTE SYNTHÉTIQUE' in dialog.inner_text();assert dialog.locator('.description-unavailable').count()==0
   close=dialog.get_by_role('button',name='Fermer la fenêtre');close.scroll_into_view_if_needed();assert close.is_visible();page.screenshot(path=str(OUT/f'detail-synthetique-{w}.png'));close.click();page.reload();open_fr(page);assert page.get_by_role('dialog').locator('.full-technique-description').inner_text()==synthetic;page.keyboard.press('Escape');assert not errors,errors;assert all(r.split('#')[0]==url for r in requests),requests
   results['viewports'].append({'width':w,'height':h,'filters':True,'cardAndModal':True,'keyboardAndFocus':True,'privateTextComplete':True,'consultationWrites':0,'pageErrors':errors});context.close()
  # Quota privé et fichier invalide : aucune modification du jeu précédent ou du projet.
  context=browser.new_context();page=context.new_page();page.on('dialog',lambda d:d.accept());page.goto(url+'#techniques');seed(page);before=page.evaluate('({...localStorage})');upload_private(page);page.evaluate("()=>{Storage.prototype.setItem=function(){throw new DOMException('Quota privé','QuotaExceededError')}}");page.get_by_role('button',name='Confirmer le chargement privé').click();page.get_by_role('dialog').get_by_role('alert').filter(has_text='Quota privé').wait_for();assert page.evaluate('({...localStorage})')==before;page.get_by_role('button',name='Annuler le chargement').click();page.get_by_label('Fichier privé de descriptions',exact=True).set_input_files({'name':'invalide.json','mimeType':'application/json','buffer':b'{'});page.get_by_role('alert').first.wait_for();assert page.evaluate('({...localStorage})')==before;results['privateQuotaAndInvalidFile']=True;context.close()
  # Préparation PDF hors réseau : PDF fabriqué sans un seul texte du livre.
  pdf_buffer=runpy.run_path(str(ROOT/'tests/convergence/synthetic-technique-pdf.py'))['synthetic_pdf']()
  context=browser.new_context(offline=True,accept_downloads=True);context.route(url,lambda route:route.fulfill(status=200,content_type='text/html',body=(DIST/'index.html').read_text()));page=context.new_page();page.set_default_timeout(30000);page.goto(url+'#gestion');before=page.evaluate('({...localStorage})')
  # Annulation pendant la lecture : aucun résultat tardif ni concurrence JSON/PDF.
  page.evaluate("()=>{const original=File.prototype.arrayBuffer;window.__restoreRead=()=>{File.prototype.arrayBuffer=original};File.prototype.arrayBuffer=function(){return new Promise(resolve=>{window.__releasePdf=async()=>resolve(await original.call(this))})}}")
  page.get_by_label('PDF personnel des règles',exact=True).set_input_files({'name':'a-annuler.pdf','mimeType':'application/pdf','buffer':pdf_buffer});page.get_by_role('button',name='Annuler la lecture du PDF',exact=True).wait_for();assert page.get_by_role('button',name='Charger un fichier privé de descriptions',exact=True).is_disabled()
  page.wait_for_function("typeof window.__releasePdf==='function'");page.get_by_role('button',name='Annuler la lecture du PDF',exact=True).click();page.evaluate('async()=>{await window.__releasePdf();window.__restoreRead()}');assert page.get_by_role('dialog').count()==0;assert page.evaluate('({...localStorage})')==before
  page.get_by_label('PDF personnel des règles',exact=True).set_input_files({'name':'recette-synthetique.pdf','mimeType':'application/pdf','buffer':pdf_buffer});page.get_by_role('dialog').wait_for();assert '111' in page.get_by_role('dialog').inner_text();assert page.evaluate('({...localStorage})')==before
  page.get_by_role('button',name='Annuler le chargement',exact=True).click();assert page.evaluate('({...localStorage})')==before
  page.get_by_label('PDF personnel des règles',exact=True).set_input_files({'name':'recette-synthetique.pdf','mimeType':'application/pdf','buffer':pdf_buffer});page.get_by_role('dialog').wait_for();page.get_by_role('button',name='Confirmer le chargement privé',exact=True).click();page.get_by_role('dialog').wait_for(state='detached')
  with page.expect_download() as saved:page.get_by_role('button',name='Exporter mes descriptions privées',exact=True).click()
  bank=json.loads(Path(saved.value.path()).read_text());assert len(bank['techniques'])==111
  for t in bank['techniques']:
   assert 'Texte de recette entierement synthetique.' in t['description'];assert 'Passage '+t['id']+' segment 0.' in t['description']
   if t['id'] in ['base-riposter','base-se-recueillir']:assert 'segment 1.' in t['description']
  page.reload();assert page.get_by_text('111 descriptions disponibles dans ce navigateur.',exact=True).is_visible()
  before_invalid=page.evaluate('({...localStorage})');page.get_by_label('PDF personnel des règles',exact=True).set_input_files({'name':'invalide.pdf','mimeType':'application/pdf','buffer':b'not-pdf'});page.locator('.private-pdf-preparation [role=alert]').wait_for();assert page.evaluate('({...localStorage})')==before_invalid
  wrong_title=pdf_buffer.replace('Se préparer'.encode('cp1252'),b'Non reconnu',1)
  page.get_by_label('PDF personnel des règles',exact=True).set_input_files({'name':'edition-differente.pdf','mimeType':'application/pdf','buffer':wrong_title});page.locator('.private-pdf-preparation [role=alert]').filter(has_text='Titre ou approche non reconnus').wait_for();assert page.evaluate('({...localStorage})')==before_invalid;assert page.get_by_role('dialog').count()==0
  results['privatePdfSynthetic111Offline']=True;results['privatePdfCancelAndWrongEdition']=True;context.close()
  # Hors réseau : document froid et descriptions effectivement fournies localement.
  def offline(target,transport=False):
   context=browser.new_context(offline=True);page=context.new_page();page.set_default_timeout(10000);page.on('dialog',lambda d:d.accept())
   if transport:context.route(target,lambda route:route.fulfill(status=200,content_type='text/html',body=(DIST/'index.html').read_text()))
   try:
    page.goto(target+'#techniques');count(page,111);upload_private(page);page.get_by_role('button',name='Confirmer le chargement privé').click();page.get_by_role('dialog').wait_for(state='detached');page.get_by_role('navigation',name='Navigation principale').get_by_role('button',name='Techniques',exact=True).click();open_fr(page);assert page.get_by_role('dialog').locator('.full-technique-description').inner_text()==synthetic;page.keyboard.press('Escape');page.reload();open_fr(page);assert page.get_by_role('dialog').locator('.full-technique-description').inner_text()==synthetic;return True
   finally:context.close()
  results['offlineEmbedded']=offline(url,True)
  try:results['offlineNativeFile']=offline((DIST/'index.html').as_uri())
  except Exception as error:results['offlineNativeFile']=False;results['offlineNativeLimitation']=str(error)[:500]
  if results.get('offlineNativeFile'):
   native=browser.new_context(offline=True);page=native.new_page();page.set_default_timeout(30000);page.goto((DIST/'index.html').as_uri()+'#gestion')
   page.get_by_label('PDF personnel des règles',exact=True).set_input_files({'name':'recette-synthetique.pdf','mimeType':'application/pdf','buffer':pdf_buffer});page.get_by_role('dialog').wait_for();page.get_by_role('button',name='Confirmer le chargement privé',exact=True).click();page.get_by_role('dialog').wait_for(state='detached');page.reload();assert page.get_by_text('111 descriptions disponibles dans ce navigateur.',exact=True).is_visible();results['privatePdfNativeFileOffline']=True;native.close()
  browser.close()
finally:server.shutdown();(OUT/'results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
print(json.dumps(results,ensure_ascii=False,indent=2))
