"""Chromium E2E : transition de scène, garde des déclarations et annulation."""
from pathlib import Path
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    page=browser.new_page(); errors=[]; dialogs=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    def handle(d):
        dialogs.append((d.type,d.message));d.accept()
    page.on('dialog',handle)
    page.evaluate("""() => {const data={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>data[k]??null,setItem:(k,v)=>data[k]=String(v),removeItem:k=>delete data[k]}})}""")
    page.set_content(Path(__file__).with_name('simulateur.html').read_text(encoding='utf-8'),wait_until='load',timeout=30000)
    page.get_by_role('button',name='Reprendre le combat').click()
    page.get_by_role('button',name='Réinitialiser la démonstration').click()
    page.get_by_role('button',name='+ PNJ').click()
    page.locator('[data-combat-nav="round"]').click()
    page.evaluate("""() => {s.fighters[0].equipmentDisabled=true;s.fighters[0].materials=2;s.fighters[0].fatigue=3;s.traps=[{id:'trap-test',ownerId:s.fighters[0].id,zone:'Passerelle',round:1}];render()}""")
    page.get_by_role('button',name='Nouvelle scène (MJ)').click()
    assert page.evaluate('s.scene')==2
    assert page.evaluate('s.fighters[0].equipmentDisabled') is False
    assert page.evaluate('s.fighters[0].materials')==2
    assert page.evaluate('s.fighters[0].fatigue')==3
    assert page.evaluate('s.traps.length')==0
    page.get_by_role('button',name='Annuler dernière validation').click()
    assert page.evaluate('s.scene')==1
    assert page.evaluate('s.fighters[0].equipmentDisabled') is True
    assert page.evaluate('s.traps.length')==1
    page.locator('#declarations select').first.select_option('attaquer')
    page.get_by_role('button',name='Nouvelle scène (MJ)').click()
    assert page.evaluate('s.scene')==1
    assert any('déclarations déjà engagées' in m for typ,m in dialogs if typ=='alert'),dialogs
    assert not errors,errors
    print('E2E Chromium V0.98 OK : transition, restauration, conservation, annulation, déclaration bloquée')
    browser.close()
