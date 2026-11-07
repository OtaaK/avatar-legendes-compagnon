"""E2E Chromium des effets temporaires et de leur filtre."""
from _paths import APP_DIR, APP_HTML, CHROMIUM_EXECUTABLE
from pathlib import Path
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path=CHROMIUM_EXECUTABLE,args=['--no-sandbox','--disable-dev-shm-usage'])
    page=browser.new_page();errors=[];answers=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    def dialog(d):
        if d.type=='prompt':d.accept(answers.pop(0))
        else:
            print('DIALOG',d.type,d.message);d.accept()
    page.on('dialog',dialog)
    page.evaluate("""() => {const data={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>data[k]??null,setItem:(k,v)=>data[k]=String(v),removeItem:k=>delete data[k]}})}""")
    page.set_content(APP_HTML.read_text(encoding='utf-8'),wait_until='load')
    page.get_by_role('button',name='Reprendre le combat').click()
    page.get_by_role('button',name='Réinitialiser la démonstration').click()
    page.get_by_role('button',name='+ PNJ').click()
    page.locator('[data-combat-nav="round"]').click()
    for label,duration in [('Fumée','1'),('Brouillard','2'),('Serment','3')]:
        answers.extend(['1',label,duration,'1']);page.get_by_role('button',name='Ajouter un effet temporaire (MJ)').click()
    assert page.evaluate('s.temporaryEffects.length')==3
    page.locator('#temporaryEffectFilter').select_option('scene')
    assert 'Brouillard' in page.locator('#temporaryEffects').inner_text()
    assert 'Fumée' not in page.locator('#temporaryEffects').inner_text()
    page.locator('#temporaryEffects button').filter(has_text='Retirer').click()
    assert page.evaluate('s.temporaryEffects.length')==2
    page.get_by_role('button',name='Annuler dernière validation').click()
    assert page.evaluate('s.temporaryEffects.length')==3
    page.locator('#temporaryEffectFilter').select_option('all')
    assert all(x in page.locator('#temporaryEffects').inner_text() for x in ['Fumée','Brouillard','Serment'])
    assert not errors,errors
    browser.close()
    print('E2E Chromium V1.03 OK : ajout, filtre, retrait, annulation')
