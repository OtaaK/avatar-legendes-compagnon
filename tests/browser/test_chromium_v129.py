from _paths import APP_DIR, APP_HTML, CHROMIUM_EXECUTABLE
import re
from pathlib import Path
VERSION = re.search(r'<title>[^<]*(V[0-9]+\.[0-9]+)', APP_HTML.read_text()).group(1)
EXPORT_VERSION = VERSION.lower().replace('.', '-')
"""V1.29: scénario de rendu réel Chromium (chargement set_content, stockage simulé)."""
from pathlib import Path
from playwright.sync_api import sync_playwright
root=APP_DIR
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=CHROMIUM_EXECUTABLE,headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1280,'height':900})
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.evaluate("""() => {const store={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>Object.hasOwn(store,k)?store[k]:null,setItem:(k,v)=>store[k]=String(v),removeItem:k=>delete store[k]}})}""")
 page.set_content((root/'simulateur.html').read_text(encoding='utf8'),wait_until='load')
 assert VERSION in page.title()
 page.get_by_text('Ouvrir les personnages').click()
 page.get_by_role('button',name='+ Nouveau PJ').click()
 page.evaluate("setView('combat')")
 page.get_by_role('button',name='+ PJ').click()
 page.get_by_role('button',name='+ PNJ').click()
 page.evaluate("s.phase='esquiver';s.fighters[0].approach='esquiver';render();setCombatTab('technique')")
 page.evaluate("""() => {const tech=document.querySelector('#tech');const entry=TECH_CATALOG.find(x=>x.nom==='Amortir le poing rageur');if(!entry)throw Error('Technique absente');const opt=document.createElement('option');opt.value=entry.id;opt.textContent=entry.nom;tech.appendChild(opt);tech.value=entry.id;syncOptions()}""")
 assert page.locator('#airCushionArmorConfirmed').count()==1
 page.locator('#airCushionArmorConfirmed').check()
 assert page.locator('#airCushionArmorConfirmed').is_checked()
 assert not errors,errors
 browser.close()
print('CHROMIUM OK : navigation, création, sélection et case de confirmation Amortir')
