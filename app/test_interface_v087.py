"""Parcours E2E Playwright : clics et sélecteurs réels, sans appeler CombatCore."""
from pathlib import Path
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    page=browser.new_page()
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('dialog',lambda dialog:(print('DIALOG',dialog.message),dialog.accept()))
    page.evaluate("""() => { const data={}; Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>data[k]??null,setItem:(k,v)=>{data[k]=String(v)},removeItem:k=>{delete data[k]}}}); }""")
    page.set_content(Path(__file__).with_name('simulateur.html').read_text(encoding='utf-8'),wait_until='load',timeout=30000)
    page.get_by_role('button',name='Reprendre le combat').click()
    page.get_by_role('button',name='Réinitialiser la démonstration').click()
    page.get_by_role('button',name='+ PNJ').click()
    page.get_by_role('button',name='+ PNJ').click()
    assert '2 combattant(s)' in page.locator('#combatSummary').inner_text()
    page.locator('[data-combat-nav="round"]').click()
    declarations=page.locator('#declarations select')
    assert declarations.count()==2
    declarations.nth(0).select_option('attaquer')
    declarations=page.locator('#declarations select')
    declarations.nth(1).select_option('defendre')
    page.locator('#step').click() # reveal
    page.locator('#step').click() # advance to attack
    assert 'attaquer' in page.evaluate('s.phase')
    page.locator('[data-combat-nav="technique"]').click()
    page.locator('#tech').select_option(label='Aveuglé par la science')
    page.locator('#scienceFatigue').select_option('1')
    page.locator('#target').select_option(index=1)
    page.get_by_role('button',name='Préparer les effets').click()
    page.locator('[data-combat-nav="approval"]').click()
    assert page.locator('#proposals input[type="checkbox"]').count()>=2
    page.get_by_role('button',name='Valider les effets cochés').click()
    assert 'événement(s) validé(s)' in page.locator('#history').inner_text()
    page.locator('[data-combat-nav="fighters"]').click()
    cards=page.locator('#fighters > .fighter')
    assert 'Fatigue : 1/5' in cards.nth(0).inner_text()
    assert 'Fatigue : 1/5' in cards.nth(1).inner_text()
    assert 'Gêné' in cards.nth(1).inner_text()
    page.get_by_role('button',name='Annuler dernière validation').click()
    cards=page.locator('#fighters > .fighter')
    assert 'Fatigue : 0/5' in cards.nth(0).inner_text()
    assert 'Fatigue : 0/5' in cards.nth(1).inner_text()
    assert not errors,errors
    print('E2E Chromium V0.87 OK : ajout PNJ, déclarations, choix technique, validation MJ, statuts, annulation ; aucune erreur JS')
    browser.close()
