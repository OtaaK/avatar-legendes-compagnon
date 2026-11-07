"""Export public: aucun pari dans les actions, effets, instantanés, export privé intact."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
root=Path(__file__).parent
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=browser.new_page(accept_downloads=True)
 page.evaluate("""() => {const store={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=String(v),removeItem:k=>delete store[k]}})}""")
 page.set_content((root/'simulateur.html').read_text(),wait_until='load')
 page.evaluate("""() => {s.actions.push({name:'Souple comme un roseau',options:{airReedPrediction:'attaquer'}});s.temporaryEffects.push({reedPrediction:'defendre',label:'Pari scellé'});s.snapshots.push({actions:[{options:{airReedPrediction:'esquiver'}}]});}""")
 with page.expect_download() as ev:page.evaluate('downloadPublicCombat()')
 dl=ev.value; assert dl.suggested_filename=='avatar-compte-rendu-public-v1-34.json'
 data=json.loads(Path(dl.path()).read_text()); encoded=json.dumps(data)
 assert data['format']=='avatar-compagnon-compte-rendu-public'
 assert 'reedPrediction' not in encoded and 'airReedPrediction' not in encoded
 assert data['combat']['actions'][0]['name']=='Souple comme un roseau'
 with page.expect_download() as ev:page.evaluate('download()')
 private=json.loads(Path(ev.value.path()).read_text())
 assert private['actions'][0]['options']['airReedPrediction']=='attaquer'
 assert private['temporaryEffects'][0]['reedPrediction']=='defendre'
 browser.close()
print('CHROMIUM V1.34 OK : export public expurgé, export privé conservé')
