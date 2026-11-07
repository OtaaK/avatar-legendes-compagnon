"""Tests Chromium des filtres combinés des effets temporaires V1.09."""
from _paths import APP_DIR, APP_HTML, CHROMIUM_EXECUTABLE
from pathlib import Path
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path=CHROMIUM_EXECUTABLE,args=['--no-sandbox','--disable-dev-shm-usage'])
    page=browser.new_page(); errors=[]; answers=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    def dialog(d):
        if d.type=='prompt': d.accept(answers.pop(0))
        else: d.accept()
    page.on('dialog',dialog)
    page.evaluate("""() => {const data={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>data[k]??null,setItem:(k,v)=>data[k]=String(v),removeItem:k=>delete data[k]}})}""")
    page.set_content(APP_HTML.read_text(encoding='utf-8'),wait_until='load')
    page.get_by_role('button',name='Reprendre le combat').click()
    page.get_by_role('button',name='Réinitialiser la démonstration').click()
    page.get_by_role('button',name='+ PNJ').click()
    page.locator('[data-combat-nav="round"]').click()
    for data in [('Brume froide','1','1'),('Voile de glace','2','2','Glissade'),('Brume persistante','2','3','1')]:
        answers.extend(['1',*data]);page.get_by_role('button',name='Ajouter un effet temporaire (MJ)').click()
    assert page.evaluate('s.temporaryEffects.length')==3
    page.locator('#temporaryOriginFilter').select_option('technique')
    assert 'Voile de glace' in page.locator('#temporaryEffects').inner_text()
    assert 'Brume froide' not in page.locator('#temporaryEffects').inner_text()
    page.locator('#temporaryEffectSearch').fill('GLISSADE')
    assert 'Voile de glace' in page.locator('#temporaryEffects').inner_text()
    page.locator('#temporaryEffectSearch').fill('absent')
    assert '(0 / 3)' in page.locator('#temporaryEffects').inner_text()
    page.locator('#temporaryEffectSearch').fill('')
    page.locator('#temporaryOriginFilter').select_option('personnage')
    page.locator('#temporaryEffectFilter').select_option('scene')
    assert 'Brume persistante' in page.locator('#temporaryEffects').inner_text()
    assert 'Voile de glace' not in page.locator('#temporaryEffects').inner_text()
    assert page.evaluate('s.temporaryEffects.length')==3
    assert not errors,errors
    browser.close()
print('E2E Chromium V1.09 OK : provenance, recherche, filtres combinés, aucune mutation')
