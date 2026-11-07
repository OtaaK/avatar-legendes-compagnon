"""V0.89 : dépassement de fatigue et annulation par interface Chromium."""
from _paths import APP_DIR, APP_HTML, CHROMIUM_EXECUTABLE
from pathlib import Path
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path=CHROMIUM_EXECUTABLE,args=['--no-sandbox','--disable-dev-shm-usage'])
    page=browser.new_page()
    errors=[]; prompts=[]
    page.on('pageerror',lambda error:errors.append(str(error)))
    def dialog_handler(dialog):
        if dialog.type=='prompt':
            prompts.append(dialog.message)
            dialog.accept('Terrifié')
        else: dialog.accept()
    page.on('dialog',dialog_handler)
    page.evaluate("""() => {const d={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>d[k]??null,setItem:(k,v)=>d[k]=String(v),removeItem:k=>delete d[k]}})}""")
    page.set_content(APP_HTML.read_text(encoding='utf-8'),wait_until='load',timeout=30000)
    page.get_by_role('button',name='Reprendre le combat').click()
    page.get_by_role('button',name='Réinitialiser la démonstration').click()
    for _ in range(2):page.get_by_role('button',name='+ PNJ').click()
    page.locator('[data-combat-nav="round"]').click()
    page.locator('#declarations select').nth(0).select_option('attaquer')
    page.locator('#declarations select').nth(1).select_option('defendre')
    page.locator('#step').click();page.locator('#step').click()
    def attack():
        page.locator('[data-combat-nav="technique"]').click()
        page.locator('#tech').select_option(label='Aveuglé par la science')
        page.locator('#scienceFatigue').select_option('3')
        page.locator('#target').select_option(index=1)
        page.get_by_role('button',name='Préparer les effets').click()
        page.locator('[data-combat-nav="approval"]').click()
        page.get_by_role('button',name='Valider les effets cochés').click()
    attack()
    page.locator('[data-combat-nav="fighters"]').click()
    cards=page.locator('#fighters > .fighter')
    assert 'Fatigue : 3/5' in cards.nth(0).inner_text()
    page.locator('[data-combat-nav="round"]').click()
    for _ in range(3):page.locator('#step').click()
    assert page.evaluate('s.phase')=='declaration',page.evaluate('s.phase')
    page.locator('#declarations select').nth(0).select_option('attaquer')
    page.locator('#step').click();page.locator('#step').click()
    attack()
    page.locator('[data-combat-nav="fighters"]').click()
    cards=page.locator('#fighters > .fighter')
    assert 'Fatigue : 5/5' in cards.nth(0).inner_text(),cards.nth(0).inner_text()
    assert 'Terrifié' in cards.nth(0).inner_text(),cards.nth(0).inner_text()
    assert len(prompts)==1 and 'fatigue excédentaire' in prompts[0],prompts
    page.get_by_role('button',name='Annuler dernière validation').click()
    cards=page.locator('#fighters > .fighter')
    assert 'Fatigue : 3/5' in cards.nth(0).inner_text()
    assert 'Terrifié' not in cards.nth(0).inner_text()
    assert not errors,errors
    print('E2E V0.89 OK : fatigue 3→5, état de débordement choisi par le MJ, annulation complète')
    browser.close()
