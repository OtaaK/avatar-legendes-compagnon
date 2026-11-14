"""Démarrage, commandes, annulation et préférences sur quatre tailles, sans réseau externe."""
from _paths import APP_DIR, CHROMIUM_EXECUTABLE
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from threading import Thread
from playwright.sync_api import sync_playwright

class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args): pass

server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(APP_DIR)))
Thread(target=server.serve_forever,daemon=True).start()
try:
    with sync_playwright() as pw:
        browser=pw.chromium.launch(executable_path=CHROMIUM_EXECUTABLE,args=['--no-sandbox'])
        for width,height in [(390,844),(768,1024),(1280,900),(1920,1080)]:
            context=browser.new_context(viewport={'width':width,'height':height})
            page=context.new_page(); errors=[]; alerts=[]
            page.on('pageerror',lambda e:errors.append(str(e)))
            # Les invites de création sont annulées ; aucune nouvelle fiche ne doit apparaître.
            page.on('dialog',lambda d:d.dismiss() if d.type in ['prompt','confirm'] else (alerts.append(d.message),d.accept()))
            page.goto(f'http://127.0.0.1:{server.server_port}/simulateur.html')
            assert page.evaluate("localStorage.getItem('avatar-roster-v020')===null&&localStorage.getItem('avatar-v020')===null")
            page.evaluate('render();renderSheets();renderCatalog()')
            assert page.evaluate("localStorage.getItem('avatar-roster-v020')===null&&localStorage.getItem('avatar-v020')===null")
            page.keyboard.press('Alt+2')
            assert page.locator('#view-characters').is_visible()
            page.locator('[data-character-kind="PNJ"]').click()
            page.locator('#characterCreate').click()
            assert page.evaluate('lib.characters.length')==0
            assert page.evaluate("localStorage.getItem('avatar-roster-v020')===null")
            # Créer par la vraie enveloppe, puis ouvrir la carte au clavier.
            page.evaluate("commitLibraryMutation(()=>Roster.createCharacter(lib,'Recette <locale>','PNJ'));renderSheets();renderCharacterCards();renderNpcDirectory()")
            card=page.locator('#npcDirectory .character-card')
            card.focus();card.press('Enter')
            assert page.locator('#characterDetailView').is_visible()
            page.locator('#sheetQuick').get_by_role('button',name='Ajouter au combat',exact=True).click()
            assert page.evaluate('s.fighters.length')==1
            # L’affichage peut changer les préférences, jamais les sauvegardes métier.
            stored=page.evaluate("[localStorage.getItem('avatar-roster-v020'),localStorage.getItem('avatar-v020')]")
            page.evaluate('render();renderSheets();renderCatalog()')
            assert page.evaluate("[localStorage.getItem('avatar-roster-v020'),localStorage.getItem('avatar-v020')]")==stored
            page.locator('#fighters').get_by_role('button',name='Modifier le combattant',exact=True).click()
            page.locator('#combatEditFatigue').fill('2')
            page.get_by_role('button',name='Annuler',exact=True).click()
            assert page.evaluate('s.fighters[0].fatigue')==0
            page.locator('#fighters').get_by_role('button',name='Modifier le combattant',exact=True).click()
            page.locator('#combatEditFatigue').fill('2')
            page.get_by_role('button',name='Enregistrer le combattant',exact=True).click()
            assert page.evaluate('s.fighters[0].fatigue===2&&lib.characters[0].fatigue===0')
            page.get_by_role('button',name='Annuler dernière validation',exact=True).click()
            assert page.evaluate('s.fighters[0].fatigue===0&&lib.characters[0].fatigue===0')
            page.locator('[data-combat-nav="round"]').click()
            page.locator('[data-view="catalog"]').click()
            page.reload()
            assert page.locator('#view-catalog').is_visible()
            # Défaut préexistant reproduit sur ae4c86a : le premier rendu réécrit fighters.
            assert page.evaluate("currentCombatTab==='fighters'&&s.fighters.length===1&&lib.characters.length===1")
            # Une fois chargé, les interactions restent utilisables hors réseau.
            context.set_offline(True)
            page.locator('[data-view="combat"]').click()
            assert page.locator('[data-combat-tab="fighters"]').is_visible()
            assert not errors,errors
            assert not alerts,alerts
            context.close()
        # Un stockage de préférences indisponible ne bloque pas la navigation.
        context=browser.new_context();page=context.new_page();errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.add_init_script("for(const method of ['getItem','setItem','removeItem']){const original=Storage.prototype[method];Storage.prototype[method]=function(key,...args){if(['avatar-ui-view','avatar-combat-tab','avatar-session-location'].includes(key))throw Error('Préférences indisponibles');return original.call(this,key,...args)}}")
        page.goto(f'http://127.0.0.1:{server.server_port}/simulateur.html')
        page.locator('[data-view="catalog"]').click()
        assert page.locator('#view-catalog').is_visible()
        assert page.evaluate("localStorage.getItem('avatar-roster-v020')===null&&localStorage.getItem('avatar-v020')===null")
        assert not errors,errors
        context.close();browser.close()
finally:
    server.shutdown()
print('Commandes, rendu sans sauvegarde, annulation, clavier, rechargement et hors réseau : 4 tailles ; préférences refusées sans blocage')
