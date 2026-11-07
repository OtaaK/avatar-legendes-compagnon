"""V0.88 : décisions MJ partielles et rejet total, via les contrôles réels."""
from pathlib import Path
from playwright.sync_api import sync_playwright

HTML=Path(__file__).with_name('simulateur.html').read_text(encoding='utf-8')
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    page=browser.new_page()
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('dialog',lambda d:d.accept())
    page.evaluate("""() => {const d={}; Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>d[k]??null,setItem:(k,v)=>d[k]=String(v),removeItem:k=>delete d[k]}})}""")
    page.set_content(HTML,wait_until='load',timeout=30000)
    page.get_by_role('button',name='Reprendre le combat').click()
    page.get_by_role('button',name='Réinitialiser la démonstration').click()
    for _ in range(2):page.get_by_role('button',name='+ PNJ').click()
    page.locator('[data-combat-nav="round"]').click()
    page.locator('#declarations select').nth(0).select_option('attaquer')
    page.locator('#declarations select').nth(1).select_option('defendre')
    page.locator('#step').click()
    page.locator('#step').click()
    page.locator('[data-combat-nav="technique"]').click()
    def prepare():
        page.locator('#tech').select_option(label='Aveuglé par la science')
        page.locator('#scienceFatigue').select_option('1')
        page.locator('#target').select_option(index=1)
        page.get_by_role('button',name='Préparer les effets').click()
        page.locator('[data-combat-nav="approval"]').click()
    def fighters():
        page.locator('[data-combat-nav="fighters"]').click()
        return page.locator('#fighters > .fighter')
    prepare()
    # Accepter la fatigue du lanceur et de la cible, mais refuser Gêné.
    assert page.locator('#proposals input[type="checkbox"]').count()==3
    page.locator('#proposals label').filter(has_text='status_add').locator('input').uncheck()
    page.get_by_role('button',name='Valider les effets cochés').click()
    cards=fighters()
    assert 'Fatigue : 1/5' in cards.nth(0).inner_text()
    assert 'Fatigue : 1/5' in cards.nth(1).inner_text()
    assert 'Gêné' not in cards.nth(1).inner_text()
    page.get_by_role('button',name='Annuler dernière validation').click()
    cards=fighters()
    assert 'Fatigue : 0/5' in cards.nth(0).inner_text()
    assert 'Fatigue : 0/5' in cards.nth(1).inner_text()
    # Rejeter tout le lot ne doit créer ni effet ni historique supplémentaire.
    page.locator('[data-combat-nav="technique"]').click()
    prepare()
    page.get_by_role('button',name='Rejeter le lot').click()
    assert 'Aucune proposition en attente' in page.locator('#proposals').inner_text()
    cards=fighters()
    assert 'Fatigue : 0/5' in cards.nth(0).inner_text()
    assert 'Fatigue : 0/5' in cards.nth(1).inner_text()
    assert not errors,errors
    print('E2E V0.88 OK : approbation partielle, refus du statut, annulation et rejet intégral sans effet')
    browser.close()
