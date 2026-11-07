from _paths import APP_DIR, APP_HTML, CHROMIUM_EXECUTABLE
import re
from pathlib import Path
VERSION = re.search(r'<title>[^<]*(V[0-9]+\.[0-9]+)', APP_HTML.read_text()).group(1)
EXPORT_VERSION = VERSION.lower().replace('.', '-')
"""Tests réels de l'interface Chromium. Nécessite Python Playwright et Chromium.
L'environnement peut interdire file:// et localhost ; dans ce cas, le HTML est chargé
avec set_content et localStorage est simulé : cela ne valide PAS la persistance disque.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright

HTML=APP_HTML.read_text(encoding='utf8')
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=CHROMIUM_EXECUTABLE,headless=True,args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1280,'height':900})
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    # Stockage de test en mémoire, sans prétendre tester le vrai stockage local.
    page.evaluate('''() => { const store={}; Object.defineProperty(window,'localStorage',{
      configurable:true,value:{getItem:k=>Object.hasOwn(store,k)?store[k]:null,
      setItem:(k,v)=>{store[k]=String(v)},removeItem:k=>{delete store[k]},
      clear:()=>{for(const k of Object.keys(store))delete store[k]}}}); }''')
    page.set_content(HTML,wait_until='load')
    assert VERSION in page.title()
    assert page.locator('#view-home').is_visible()
    page.get_by_text('Ouvrir les personnages').click()
    assert page.locator('#view-characters').is_visible()
    page.get_by_role('button',name='+ Nouveau PJ').click()
    assert page.locator('#view-characters').is_visible()
    page.evaluate("setView('catalog')")
    assert page.locator('#view-catalog').is_visible()
    page.locator('#catalogSearch').fill('Onde de choc')
    assert 'Onde de choc' in page.locator('#catalogResults').inner_text()
    page.evaluate("setView('combat')")
    assert page.locator('#view-combat').is_visible()
    before=page.evaluate('s.fighters.length')
    page.get_by_role('button',name='+ PJ').click()
    assert page.evaluate('s.fighters.length')==before+1
    page.get_by_role('button',name='+ PNJ').click()
    assert page.evaluate('s.fighters.length')==before+2
    page.evaluate("setCombatTab('round')")
    assert page.locator('[data-combat-tab="round"]').is_visible()
    page.evaluate("setCombatTab('approval')")
    assert page.locator('[data-combat-tab="approval"]').is_visible()
    # Vérification réelle des sélecteurs de technique et de leur rendu.
    page.evaluate("s.phase='esquiver'; s.fighters[0].approach='esquiver'; render(); setCombatTab('technique')")
    assert page.locator('#source option').count() >= 1
    assert page.locator('#tech option').count() >= 2
    page.locator('#tech').select_option(label='Soutenir ou entraver · base')
    assert page.locator('#opts').is_visible()
    assert not errors, errors
    print('CHROMIUM OK : chargement, navigation, fiche PJ, catalogue filtré, ajout PJ/PNJ, onglets, sélecteurs de techniques, aucune exception JS')
    browser.close()
