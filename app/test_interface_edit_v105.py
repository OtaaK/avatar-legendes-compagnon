from pathlib import Path
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page();answers=[];errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 def dialog(d):
  if d.type=='prompt':d.accept(answers.pop(0))
  else:d.accept()
 page.on('dialog',dialog)
 page.evaluate("""() => {const data={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>data[k]??null,setItem:(k,v)=>data[k]=String(v),removeItem:k=>delete data[k]}})}""")
 page.set_content(Path(__file__).with_name('simulateur.html').read_text(),wait_until='load')
 page.get_by_role('button',name='Reprendre le combat').click()
 page.get_by_role('button',name='Réinitialiser la démonstration').click()
 page.get_by_role('button',name='+ PNJ').click()
 page.locator('[data-combat-nav="round"]').click()
 answers.extend(['1','Brouillard','2','1'])
 page.get_by_role('button',name='Ajouter un effet temporaire (MJ)').click()
 answers.extend(['Vent','3','1'])
 page.locator('#temporaryEffects button').filter(has_text='Modifier').click()
 assert page.evaluate('s.temporaryEffects[0].label')=='Vent'
 assert page.evaluate('s.temporaryEffects[0].duration')=='manual'
 page.get_by_role('button',name='Annuler dernière validation').click()
 assert page.evaluate('s.temporaryEffects[0].label')=='Brouillard'
 assert page.evaluate('s.temporaryEffects[0].duration')=='scene'
 assert not errors,errors
 browser.close()
 print('E2E Chromium V1.05 OK : édition et annulation')
