"""V1.27: vraie origine HTTP locale, stockage local Chromium et rechargement."""
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from threading import Thread
from functools import partial
from playwright.sync_api import sync_playwright
root=Path(__file__).parent
server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(root)))
Thread(target=server.serve_forever,daemon=True).start()
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  context=browser.new_context(viewport={'width':1280,'height':900})
  page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  try:
   page.goto(f'http://127.0.0.1:{server.server_port}/simulateur.html',wait_until='load')
   real_origin=True
  except Exception as exc:
   if 'ERR_BLOCKED_BY_ADMINISTRATOR' not in str(exc): raise
   real_origin=False
   page.evaluate("""() => {const store={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>Object.hasOwn(store,k)?store[k]:null,setItem:(k,v)=>store[k]=String(v),removeItem:k=>delete store[k]}})}""")
   page.set_content((root/'simulateur.html').read_text(encoding='utf8'),wait_until='load')
  assert 'V1.34' in page.title(),page.title()
  assert page.evaluate("typeof localStorage.setItem==='function'")
  page.evaluate("localStorage.setItem('avatar-v127-persistence','test-127')")
  if real_origin:
   page.reload(wait_until='load')
   assert page.evaluate("localStorage.getItem('avatar-v127-persistence')")=='test-127'
  page.get_by_text('Ouvrir les personnages').click()
  page.get_by_role('button',name='+ Nouveau PJ').click()
  page.evaluate("setView('combat')")
  page.get_by_role('button',name='+ PJ').click()
  page.get_by_role('button',name='+ PNJ').click()
  page.evaluate("s.phase='defendre';s.fighters[0].approach='defendre';render();setCombatTab('technique')")
  assert page.evaluate("TECH_CATALOG.some(x=>x.nom==='Oscillations du vent')")
  page.evaluate("""() => {const tech=document.querySelector('#tech');const entry=TECH_CATALOG.find(x=>x.nom==='Oscillations du vent');const opt=document.createElement('option');opt.value=entry.id;opt.textContent=entry.nom;tech.appendChild(opt);tech.value=entry.id;syncOptions()}""")
  assert page.locator('#airOscConfirmed').count()==1
  assert not errors,errors
  context.close();browser.close()
 print('CHROMIUM OK : navigation, personnages, panneau Oscillations ; HTTP réel et persistance : '+('validés' if real_origin else 'BLOQUÉS par politique administrateur'))
finally:server.shutdown()
