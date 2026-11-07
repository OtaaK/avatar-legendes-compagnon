"""V0.90 : atomicité des engagements Glissade via contrôles Chromium."""
from pathlib import Path
import re
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    page=browser.new_page()
    errors=[]; alerts=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    def on_dialog(d):
        if d.type=='alert': alerts.append(d.message)
        d.accept()
    page.on('dialog',on_dialog)
    page.evaluate("""() => {const d={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>d[k]??null,setItem:(k,v)=>d[k]=String(v),removeItem:k=>delete d[k]}})}""")
    page.set_content(Path(__file__).with_name('simulateur.html').read_text(encoding='utf-8'),wait_until='load',timeout=30000)
    page.get_by_role('button',name='Reprendre le combat').click()
    page.get_by_role('button',name='Réinitialiser la démonstration').click()
    for _ in range(3):page.get_by_role('button',name='+ PNJ').click()
    page.locator('[data-combat-nav="fighters"]').click()
    # B et C sont engagés au départ.
    page.locator('#fighters > .fighter').last.locator('input[type="checkbox"]').nth(2).check()
    assert page.evaluate('CombatCore.isEngaged(s,s.fighters[1].id,s.fighters[2].id)')
    page.locator('[data-combat-nav="round"]').click()
    page.locator('#declarations select').nth(0).select_option('esquiver')
    page.locator('#declarations select').nth(1).select_option('defendre')
    page.locator('#declarations select').nth(2).select_option('defendre')
    page.locator('#step').click();page.locator('#step').click();page.locator('#step').click()
    assert page.evaluate('s.phase')=='esquiver'
    page.locator('[data-combat-nav="technique"]').click()
    page.locator('#tech').select_option(label='Glissade')
    page.locator('#target').select_option(index=1)
    page.locator('.glissade-enemy').nth(0).check()
    # Nouvelle paire A-B, ancienne paire B-C rompue.
    page.locator('.glissade-new-pair').nth(0).check()
    page.get_by_role('button',name='Préparer les effets').click()
    page.locator('[data-combat-nav="approval"]').click()
    terrain=page.locator('#proposals label').filter(has=page.locator('input[type="checkbox"]'))
    assert page.locator('#proposals label').filter(has_text='disengage').count()==1
    assert page.locator('#proposals label').filter(has_text=re.compile(r'\bengage\b')).count()==1
    # Refus d'un seul changement : rejet atomique sans mutation.
    page.locator('#proposals label').filter(has_text='disengage').locator('input').uncheck()
    before=page.evaluate('JSON.stringify(s.engagements)')
    page.get_by_role('button',name='Valider les effets cochés').click()
    assert any('valider ou refuser ensemble' in msg for msg in alerts),alerts
    assert page.evaluate('JSON.stringify(s.engagements)')==before
    # Tout accepter puis annuler.
    page.locator('#proposals label').filter(has_text='disengage').locator('input').check()
    page.get_by_role('button',name='Valider les effets cochés').click()
    assert page.evaluate('CombatCore.isEngaged(s,s.fighters[0].id,s.fighters[1].id)')
    assert not page.evaluate('CombatCore.isEngaged(s,s.fighters[1].id,s.fighters[2].id)')
    page.get_by_role('button',name='Annuler dernière validation').click()
    assert not page.evaluate('CombatCore.isEngaged(s,s.fighters[0].id,s.fighters[1].id)')
    assert page.evaluate('CombatCore.isEngaged(s,s.fighters[1].id,s.fighters[2].id)')
    assert not errors,errors
    print('E2E V0.90 OK : refus partiel atomique, acceptation complète, annulation des engagements')
    browser.close()
