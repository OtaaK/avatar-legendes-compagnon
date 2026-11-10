"""Lot Lieux : scénarios synthétiques ; aucun PDF ni texte privé officiel."""
import os,json,shutil,subprocess,base64
from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from functools import partial
from threading import Thread
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2];DIST=ROOT/'dist/companion';OUT=ROOT/'work/places-browser';OUT.mkdir(parents=True,exist_ok=True)
subprocess.run(['node',str(ROOT/'tests/convergence/place-fixture.mjs'),str(OUT/'fictif.json')],check=True);backup=json.loads((OUT/'fictif.json').read_text());key='avatar-compagnon-react-session-v1'
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(DIST)));Thread(target=server.serve_forever,daemon=True).start();url=f'http://127.0.0.1:{server.server_port}/index.html'
results={'viewports':[]};png=base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jFWQAAAAASUVORK5CYII=')
def state(p):return p.evaluate('(key)=>JSON.parse(localStorage.getItem(key)).session',key)
def seed(p):
 p.evaluate('(data)=>{localStorage.setItem("avatar-compagnon-react-session-v1",JSON.stringify({format:"avatar-compagnon-react-session",version:1,revision:1,session:{library:data.library,combat:data.combat,backupMetadata:{future:"keep"}}}));localStorage.setItem("avatar-roster-v021","HISTORIQUE");}',backup);p.reload();p.get_by_role('heading',name='Lieux',exact=True).wait_for()
def tree(p,name):return p.get_by_role('navigation',name='Arborescence des lieux').get_by_role('button').filter(has_text=name).last
def select(p,name):tree(p,name).click();p.get_by_role('heading',name=name,exact=True).wait_for()
def group(p,title,n):assert p.get_by_role('region',name=title,exact=True).locator('.presence-list > button').count()==n
# section avec aria-label n'est pas toujours exposée comme region si le navigateur ignore la langue ; Chromium est contrôlé ici.
def create(p,name,parent=None):
 if parent:select(p,parent);p.locator('.place-hero-actions').get_by_role('button',name='Ajouter un sous-lieu',exact=True).click()
 else:p.get_by_role('button',name='Ajouter un lieu racine',exact=True).click()
 d=p.get_by_role('dialog');p.wait_for_function("document.querySelector('[role=dialog] input')===document.activeElement");d.get_by_label('Nom du lieu',exact=True).fill(name);
 for _ in range(8):p.keyboard.press('Tab');assert d.evaluate('e=>e.contains(document.activeElement)')
 d.get_by_label('Nom du lieu',exact=True).fill(name);d.get_by_label('Description',exact=True).fill('Description synthétique\nDeuxième ligne');d.get_by_role('button',name='Ajouter le sous-lieu' if parent else 'Ajouter le lieu racine',exact=True).click();d.wait_for(state='detached');p.get_by_role('heading',name=name,exact=True).wait_for()
def edit(p,name=None,description=None,parent=None):
 p.get_by_role('button',name='Modifier le lieu',exact=True).click();d=p.get_by_role('dialog')
 if name is not None:d.get_by_label('Nom du lieu',exact=True).fill(name)
 if description is not None:d.get_by_label('Description',exact=True).fill(description)
 if parent is not None:d.get_by_label('Lieu parent',exact=True).select_option(parent)
 d.get_by_role('button',name='Enregistrer le lieu',exact=True).click();d.wait_for(state='detached')
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),args=['--no-sandbox'])
  for w,h in [(1440,1024),(1280,800),(768,1024),(390,844)]:
   c=browser.new_context(viewport={'width':w,'height':h},has_touch=w<800,accept_downloads=True);c.add_init_script("window.__writes=[];const set=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){window.__writes.push(k);return set.call(this,k,v)}");p=c.new_page();p.set_default_timeout(15000);errors=[];requests=[];p.on('pageerror',lambda e:errors.append(str(e)));p.on('request',lambda r:requests.append(r.url));p.on('dialog',lambda d:d.accept());p.goto(url+'#lieux');seed(p);before=state(p);assert p.evaluate('window.__writes')==[]
   group(p,'Présents actuellement',0);group(p,'Domiciliés ici',1);group(p,'Associés au lieu',0)
   p.get_by_label('Inclure les sous-lieux',exact=True).check();group(p,'Présents actuellement',2);group(p,'Domiciliés ici',2);group(p,'Associés au lieu',2);p.reload();assert p.get_by_label('Inclure les sous-lieux',exact=True).is_checked()
   select(p,'Quartier de Jade');assert p.get_by_role('navigation',name='Fil d’Ariane').get_by_role('button').all_text_contents()==['Région du test','Cité du port','Quartier de Jade']
   p.get_by_role('button',name='Replier Région du test',exact=True).click();assert tree(p,'Quartier de Jade').count()==0;p.get_by_role('button',name='Déplier Région du test',exact=True).click();assert tree(p,'Quartier de Jade').count()==1
   select(p,'Cité du port');p.get_by_label('Inclure les sous-lieux',exact=True).uncheck();group(p,'Présents actuellement',1);group(p,'Domiciliés ici',1);group(p,'Associés au lieu',2)
   assert p.get_by_role('region',name='Associés au lieu',exact=True).get_by_role('button').filter(has_text='Guide lié').locator('img.local-portrait').count()==1
   select(p,'Lieu orphelin');assert '%2F' in p.url;select(p,'Cité du port');assert state(p)==before;assert p.evaluate('window.__writes')==[];assert tree(p,'Lieu orphelin').is_visible();assert all(r.split('#')[0]==url or r.startswith(('data:image/png','data:image/jpeg','data:image/webp')) for r in requests),requests
   assert p.evaluate('document.documentElement.scrollWidth<=innerWidth');p.screenshot(path=str(OUT/f'lieux-{w}.png'),full_page=True)
   # PNJ depuis le lieu : retour, rechargement et trois liens indépendants.
   p.get_by_label('Inclure les sous-lieux',exact=True).check();p.get_by_role('region',name='Présents actuellement',exact=True).get_by_role('button').filter(has_text='Gardien du port').click();p.get_by_role('heading',name='Lieux du PNJ',exact=True).wait_for();p.reload();p.get_by_role('heading',name='Lieux du PNJ',exact=True).wait_for();p.get_by_label('Domicile',exact=True).select_option('place-4');p.get_by_role('button',name='Enregistrer les liens',exact=True).click();p.wait_for_function("JSON.parse(localStorage.getItem('avatar-compagnon-react-session-v1')).session.library.characters.find(c=>c.name==='Gardien du port').placeLinks.homeId==='place-4'")
   npc=next(x for x in state(p)['library']['characters'] if x['name']=='Gardien du port');assert npc['placeLinks']['currentId']=='place-2';assert npc['placeLinks']['associatedIds']==['place-2'];assert state(p)['combat']==before['combat']
   p.get_by_role('button',name='Retour au lieu',exact=True).click();p.get_by_role('heading',name='Cité du port',exact=True).wait_for();assert p.get_by_label('Inclure les sous-lieux',exact=True).is_checked()
   # Création de plusieurs niveaux, édition du lieu seule, image valide et refus d'image étrangère.
   create(p,'Racine ajoutée');assert len(state(p)['library']['places'])==len(before['library']['places'])+1;create(p,'Sous-lieu créé','Racine ajoutée');create(p,'Niveau profond','Sous-lieu créé')
   original_people=state(p)['library']['characters'];select(p,'Cité du port');edit(p,name='Port renommé',description='Description révisée\nSans perte');assert state(p)['library']['characters']==original_people;assert state(p)['combat']==before['combat'];assert next(x for x in state(p)['library']['places'] if x['id']=='place-2')['future']=={'keep':42}
   select(p,'Quartier de Jade');edit(p,parent='place-4');assert next(x for x in state(p)['library']['places'] if x['id']=='place-3')['parentId']=='place-4';assert state(p)['library']['characters']==original_people
   select(p,'Région du test');p.get_by_role('button',name='Modifier le lieu',exact=True).click();d=p.get_by_role('dialog');assert d.get_by_label('Lieu parent').locator('option[value="place-2"]').count()==0;d.get_by_label('Illustration locale').set_input_files({'name':'interdit.svg','mimeType':'image/svg+xml','buffer':b'<svg/>'});d.get_by_role('alert').wait_for();d.get_by_role('button',name='Annuler',exact=True).click()
   p.get_by_role('button',name='Modifier le lieu',exact=True).click();d=p.get_by_role('dialog');d.get_by_label('Illustration locale').set_input_files({'name':'locale.png','mimeType':'image/png','buffer':png});d.get_by_role('img',name='Illustration du lieu',exact=True).wait_for();d.get_by_role('button',name='Enregistrer le lieu',exact=True).click();d.wait_for(state='detached');assert p.locator('.place-illustration img').is_visible()
   # Suppression protégée : aperçu et annulation sans écriture puis stratégie explicite du moteur.
   select(p,'Région du test');old=state(p);p.get_by_role('button',name='Supprimer le lieu',exact=True).click();d=p.get_by_role('dialog');assert d.get_by_role('button',name='Confirmer la suppression',exact=True).is_disabled();d.get_by_role('button',name='Annuler',exact=True).click();assert state(p)==old
   p.get_by_role('button',name='Supprimer le lieu',exact=True).click();d=p.get_by_role('dialog');d.get_by_role('checkbox').check();d.get_by_role('button',name='Confirmer la suppression',exact=True).click();d.wait_for(state='detached');after=state(p);assert len(after['library']['characters'])==len(old['library']['characters']);assert after['combat']==old['combat'];assert next(x for x in after['library']['places'] if x['id']=='place-2')['parentId'] is None;assert next(x for x in after['library']['characters'] if x['name']=='Guide lié')['placeLinks']['homeId'] is None
   # Export/réimport via le véritable panneau ; les données restent identiques après lecture et recharge.
   p.get_by_role('navigation',name='Navigation principale').get_by_role('button',name='Gestion',exact=True).click()
   with p.expect_download() as download:p.get_by_role('button',name='Exporter la sauvegarde du projet',exact=True).click()
   exported=Path(download.value.path()).read_bytes();document=json.loads(exported);assert document['library']==after['library'];assert document['combat']==after['combat'];assert p.evaluate("localStorage.getItem('avatar-roster-v021')")=='HISTORIQUE'
   p.get_by_label('Importer une sauvegarde Codex',exact=True).set_input_files({'name':'restauration-lieux.json','mimeType':'application/json','buffer':exported});p.get_by_role('dialog').wait_for();p.get_by_role('button',name='Confirmer l’import',exact=True).click();p.get_by_role('dialog').wait_for(state='detached');p.reload();assert state(p)['library']==after['library'];assert state(p)['combat']==after['combat'];assert not errors,errors;results['viewports'].append({'width':w,'height':h,'hierarchy':True,'threeRelations':True,'safeDeletion':True,'portrait':True,'roundtripExport':True,'pageErrors':errors});c.close()
  # Quota : le brouillon reste ouvert et une seconde tentative ne consomme pas d'ID.
  c=browser.new_context();p=c.new_page();p.on('dialog',lambda d:d.accept());p.goto(url+'#lieux');seed(p);before=state(p);p.get_by_role('button',name='Ajouter un lieu racine',exact=True).click();d=p.get_by_role('dialog');d.get_by_label('Nom du lieu',exact=True).fill('Réessai après quota')
  p.evaluate("()=>{window.__realSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='avatar-compagnon-react-session-v1')throw new DOMException('Quota simulé','QuotaExceededError');return window.__realSet.call(this,k,v)}}");d.get_by_role('button',name='Ajouter le lieu racine',exact=True).click();d.get_by_role('alert').filter(has_text='Quota simulé').wait_for();assert state(p)==before;assert d.get_by_label('Nom du lieu',exact=True).input_value()=='Réessai après quota';p.evaluate('()=>{Storage.prototype.setItem=window.__realSet;}');d.get_by_role('button',name='Ajouter le lieu racine',exact=True).click();d.wait_for(state='detached');assert next(x for x in state(p)['library']['places'] if x['name']=='Réessai après quota')['id']=='place-5';results['quotaDraftRetry']=True;c.close()
  # Deux onglets : une ancienne édition ne remplace pas l'enregistrement de l'autre.
  c=browser.new_context();a=c.new_page();b=c.new_page();a.on('dialog',lambda d:d.accept());b.on('dialog',lambda d:d.accept());a.goto(url+'#lieux');seed(a);b.goto(url+'#lieux');b.get_by_role('button',name='Modifier le lieu',exact=True).click();b.get_by_role('dialog').get_by_label('Nom du lieu',exact=True).fill('Ancienne fenêtre');edit(a,name='Modification récente');saved=state(a);b.get_by_role('dialog').get_by_role('button',name='Enregistrer le lieu',exact=True).click();b.get_by_role('dialog').get_by_role('alert').wait_for();assert state(a)==saved;assert b.get_by_role('dialog').get_by_label('Nom du lieu',exact=True).input_value()=='Ancienne fenêtre';results['staleTabRefused']=True;c.close()
  # Démarrage froid, écriture explicite, descendants et persistance hors réseau.
  def offline(target,transport=False):
   c=browser.new_context(offline=True);p=c.new_page();p.on('dialog',lambda d:d.accept());p.set_default_timeout(10000)
   if transport:c.route(target,lambda route:route.fulfill(status=200,content_type='text/html',body=(DIST/'index.html').read_text()))
   try:
    p.goto(target+'#lieux');create(p,'Lieu hors ligne');create(p,'Sous-lieu hors ligne','Lieu hors ligne');before=state(p);p.reload();p.get_by_role('heading',name='Sous-lieu hors ligne',exact=True).wait_for();assert state(p)==before;return True
   finally:c.close()
  results['offlineEmbedded']=offline(url,True)
  try:results['offlineNativeFile']=offline((DIST/'index.html').as_uri())
  except Exception as e:
   if 'ERR_BLOCKED_BY_ADMINISTRATOR' not in str(e):raise
   results['offlineNativeFile']=False;results['nativeLimitation']='ERR_BLOCKED_BY_ADMINISTRATOR dans le cloud ; recette native CI/Mac distincte.'
  browser.close()
finally:server.shutdown();(OUT/'results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
print(json.dumps(results,ensure_ascii=False,indent=2))
