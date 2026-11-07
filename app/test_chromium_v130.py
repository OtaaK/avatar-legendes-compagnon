"""Chromium: interactions UI, exports JSON réels, réimport complet et contrôle des données."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
root=Path(__file__).parent
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=browser.new_page(accept_downloads=True,viewport={'width':1280,'height':900})
 errors=[];alerts=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('dialog',lambda d:(alerts.append(d.message),d.accept('PJ Test' if d.type=='prompt' else None)))
 page.evaluate("""() => {const store={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>Object.prototype.hasOwnProperty.call(store,k)?store[k]:null,setItem:(k,v)=>store[k]=String(v),removeItem:k=>delete store[k]}})}""")
 page.set_content((root/'simulateur.html').read_text(encoding='utf8'),wait_until='load')
 assert 'V1.34' in page.title()
 page.get_by_text('Ouvrir les personnages').click()
 page.evaluate("newSheet('PJ')")
 assert page.evaluate('lib.characters.length')>=1
 page.evaluate('setView("combat")')
 page.get_by_role('button',name='+ PJ').click()
 page.get_by_role('button',name='+ PNJ').click()
 assert page.evaluate('s.fighters.length')>=2
 for fn,filename,verify in [
  ('exportCompleteBackup','avatar-sauvegarde-complete-v1-34.json',lambda j:j['format']=='avatar-compagnon-backup' and len(j['combat']['fighters'])>=2),
  ('exportRoster','avatar-fiches-v1-34.json',lambda j:len(j['characters'])>=1),
  ('download','avatar-combat-v1-34.json',lambda j:len(j['fighters'])>=2),
 ]:
  with page.expect_download() as event:page.evaluate(fn+'()')
  download=event.value
  assert download.suggested_filename==filename,(fn,download.suggested_filename)
  data=json.loads(Path(download.path()).read_text())
  assert verify(data),fn
  if fn=='exportCompleteBackup':backup=data
 # Importer le même export après mutation : les personnages et le combat doivent être restaurés.
 page.evaluate('lib.characters=[];s.fighters=[];render()')
 assert page.evaluate('s.fighters.length')==0
 page.locator('input[onchange="importCompleteBackup(event)"]').set_input_files({'name':'restore.json','mimeType':'application/json','buffer':json.dumps(backup).encode()})
 page.wait_for_function('s.fighters.length >= 2 && lib.characters.length >= 1')
 assert not errors,errors
 assert not [a for a in alerts if 'impossible' in a.lower()],alerts
 browser.close()
print('CHROMIUM V1.30 OK : navigation, 3 exports JSON et import complet avec restauration')
