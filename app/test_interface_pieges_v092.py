"""E2E Chromium : armement et déclenchement de Pose de pièges depuis les contrôles réels."""
from pathlib import Path
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    page=browser.new_page()
    errors=[];dialogs=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    def handle(d):
        dialogs.append(d.message)
        if d.type=='prompt': d.accept('1')
        else: d.accept()
    page.on('dialog',handle)
    page.evaluate("""() => {const data={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>data[k]??null,setItem:(k,v)=>{data[k]=String(v)},removeItem:k=>{delete data[k]}}});}""")
    page.set_content(Path(__file__).with_name('simulateur.html').read_text(encoding='utf-8'),wait_until='load',timeout=30000)
    page.get_by_role('button',name='Reprendre le combat').click()
    page.get_by_role('button',name='Réinitialiser la démonstration').click()
    page.get_by_role('button',name='+ PNJ').click()
    page.get_by_role('button',name='+ PNJ').click()
    page.locator('[data-combat-nav="round"]').click()
    page.locator('#declarations select').nth(0).select_option('esquiver')
    page.locator('#declarations select').nth(1).select_option('attaquer')
    page.locator('#step').click()  # révéler
    page.locator('#step').click()  # avancer vers attaque
    page.locator('#step').click()  # avancer vers esquive
    assert page.evaluate('s.phase')=='esquiver',page.evaluate('s.phase')
    page.locator('[data-combat-nav="technique"]').click()
    page.locator('#tech').select_option(label='Pose de pièges')
    page.locator('#trapZone').fill('Entrée du hangar')
    page.get_by_role('button',name='Préparer les effets').click()
    page.locator('[data-combat-nav="approval"]').click()
    assert page.locator('#proposals input[type="checkbox"]').count()==2
    page.get_by_role('button',name='Valider les effets cochés').click()
    page.locator('[data-combat-nav="fighters"]').click()
    assert page.get_by_role('button',name='Déclencher (prochain adversaire)').count()==1
    assert page.evaluate('s.traps.length')==1
    page.get_by_role('button',name='Déclencher (prochain adversaire)').click()
    assert len(dialogs)==4,dialogs
    assert page.evaluate('s.traps.length')==0
    assert page.evaluate('s.fighters[1].conditions.includes("Terrifié")')
    assert page.evaluate('s.fighters[1].balance')==1
    page.get_by_role('button',name='Annuler dernière validation').click()
    assert page.evaluate('s.traps.length')==1
    assert not page.evaluate('s.fighters[1].conditions.includes("Terrifié")')
    assert page.evaluate('s.fighters[1].balance')==0
    page.get_by_role('button',name='Annuler dernière validation').click()
    assert page.evaluate('s.traps.length')==0
    assert page.evaluate('s.fighters[0].fatigue')==0
    assert not errors,errors
    print('E2E Chromium V0.92 OK : armer, déclencher, état, équilibre, double annulation')
    browser.close()
