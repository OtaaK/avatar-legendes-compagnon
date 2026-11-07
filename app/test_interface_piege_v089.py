"""V0.89 : effet différé Piégé, libération MJ et annulation via Chromium."""
from pathlib import Path
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    page=browser.new_page()
    errors=[]
    dialogs=[]
    def on_dialog(d):
        dialogs.append((d.type,d.message))
        if d.type=='prompt' and 'Nombre de cases' in d.message:d.accept('2')
        elif d.type=='prompt' and 'Choisir un état' in d.message:d.accept('Terrifié')
        else:d.accept()
    page.on('dialog',on_dialog)
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.evaluate("""() => {const data={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>data[k]??null,setItem:(k,v)=>data[k]=String(v),removeItem:k=>delete data[k]}})}""")
    page.set_content(Path(__file__).with_name('simulateur.html').read_text(encoding='utf-8'),wait_until='load',timeout=30000)
    page.get_by_role('button',name='Reprendre le combat').click()
    page.get_by_role('button',name='Réinitialiser la démonstration').click()
    for _ in range(2):page.get_by_role('button',name='+ PNJ').click()
    page.locator('[data-combat-nav="round"]').click()
    page.locator('#declarations select').nth(0).select_option('attaquer')
    page.locator('#declarations select').nth(1).select_option('defendre')
    page.locator('#step').click()
    page.locator('#step').click()
    page.locator('[data-combat-nav="technique"]').click()
    page.locator('#tech').select_option(label='Aveuglé par la science')
    page.locator('#scienceFatigue').select_option('2')
    page.locator('#scienceExtra').select_option('piege')
    page.locator('#target').select_option(index=1)
    page.get_by_role('button',name='Préparer les effets').click()
    page.locator('[data-combat-nav="approval"]').click()
    assert page.locator('#proposals label').filter(has_text='piege').count()==1
    page.get_by_role('button',name='Valider les effets cochés').click()
    page.locator('[data-combat-nav="fighters"]').click()
    cards=page.locator('#fighters > .fighter')
    assert 'Piégé' in cards.nth(1).inner_text()
    assert 'Fatigue : 2/5' in cards.nth(0).inner_text()
    # Le statut est différé : il reste actif pendant les approches suivantes.
    page.locator('[data-combat-nav="round"]').click()
    while page.evaluate('s.phase')!='fin':page.locator('#step').click()
    page.locator('[data-combat-nav="fighters"]').click()
    assert 'Piégé' in cards.nth(1).inner_text()
    page.get_by_role('button',name='Libérer de Piégé').click()
    assert 'Piégé' not in cards.nth(1).inner_text()
    assert 'Fatigue : 3/5' in cards.nth(1).inner_text() # 1 initiale + 2 libération
    assert 'Terrifié' in cards.nth(1).inner_text()
    assert any('Nombre de cases' in message for _,message in dialogs)
    assert not errors,errors
    print('E2E V0.89 OK : Piégé différé, libération MJ (2 fatigue + Terrifié), statut retiré')
    browser.close()
