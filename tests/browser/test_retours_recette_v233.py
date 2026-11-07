"""Retours de recette : récapitulatif, confirmation, filtres et passage fiches/combat."""
from _paths import APP_DIR, CHROMIUM_EXECUTABLE
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from threading import Thread
from playwright.sync_api import sync_playwright

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

server = ThreadingHTTPServer(('127.0.0.1',0), partial(QuietHandler,directory=str(APP_DIR)))
Thread(target=server.serve_forever,daemon=True).start()
url = f'http://127.0.0.1:{server.server_port}/simulateur.html'
count = 0
try:
    with sync_playwright() as pw:
        browser = pw.chromium.launch(executable_path=CHROMIUM_EXECUTABLE,headless=True,args=['--no-sandbox'])
        for viewport in [{'width':1280,'height':900},{'width':390,'height':844}]:
            context = browser.new_context(viewport=viewport)
            page = context.new_page(); alerts=[]; errors=[]
            def dialog(d):
                if d.type == 'alert': alerts.append(d.message)
                d.accept('Garde de test' if d.type == 'prompt' else None)
            page.on('dialog',dialog);page.on('pageerror',lambda e:errors.append(str(e)))
            page.goto(url)
            assert 'correctifs de recette' in page.locator('.app-version').inner_text()
            page.get_by_role('button',name='Ouvrir les personnages',exact=True).click()
            page.locator('[data-character-kind="PNJ"]').click()
            page.get_by_role('button',name='+ Nouveau PNJ',exact=True).click()
            page.locator('[data-sheet-tab="resources"]').click()
            page.locator('#sheetFatigue').locator('..').get_by_role('button',name='+',exact=True).click()
            assert page.locator('#view-sheetFatigue').inner_text()=='1'
            assert page.locator('#sheetQuick .resource output').nth(0).inner_text()=='1/5'
            assert page.evaluate('lib.characters[0].fatigue')==0, 'Le brouillon ne doit pas être enregistré silencieusement'
            page.locator('#sheetBalance').locator('..').get_by_role('button',name='+',exact=True).click()
            assert page.locator('#sheetQuick .resource output').nth(1).inner_text()=='+1'
            page.locator('[data-sheet-tab="identity"]').click()
            page.locator('#sheetName').fill('Garde modifié')
            assert page.locator('#sheetQuick strong').inner_text()=='Garde modifié'
            page.get_by_role('button',name='Enregistrer la fiche',exact=True).click()
            assert alerts==['Fiche enregistrée.'],alerts
            assert page.evaluate('lib.characters[0].fatigue')==1
            assert page.evaluate('lib.characters[0].balance')==1
            # Échec d'écriture : pas de faux message de succès, ni d'altération de la bibliothèque.
            page.locator('[data-sheet-tab="resources"]').click()
            page.locator('#sheetFatigue').locator('..').get_by_role('button',name='+',exact=True).click()
            page.evaluate('saveLibrary=()=>false')
            page.get_by_role('button',name='Enregistrer la fiche',exact=True).click()
            assert 'annulée' in alerts[-1],alerts
            assert alerts.count('Fiche enregistrée.')==1
            assert page.evaluate('lib.characters[0].fatigue')==1
            page.reload()
            page.locator('[data-character-kind="PNJ"]').click()
            page.get_by_role('button',name='Ouvrir la fiche de Garde modifié',exact=True).click()
            assert page.locator('#sheetQuick .resource output').nth(0).inner_text()=='1/5'
            # Le bouton autrefois caché est désormais visible sur la fiche.
            page.locator('#sheetQuick').get_by_role('button',name='Ajouter au combat',exact=True).click()
            assert page.locator('[data-combat-tab="fighters"]').is_visible()
            assert page.evaluate("s.fighters[0].name==='Garde modifié'&&s.fighters[0].characterId===lib.characters[0].id&&s.fighters[0].fatigue===1&&s.fighters[0].balance===1")
            assert page.locator('#includeSelectedSheetButton').is_disabled()
            # La copie peut être modifiée sans changer la fiche permanente.
            page.locator('#fighters').get_by_role('button',name='Modifier le combattant',exact=True).click()
            assert page.locator('#combatFighterDialog').evaluate('el=>el.scrollWidth<=el.clientWidth')
            page.locator('#combatEditName').fill('Garde en combat')
            page.locator('#combatEditFatigue').fill('3')
            page.get_by_role('button',name='Enregistrer le combattant',exact=True).click()
            assert page.evaluate("s.fighters[0].name==='Garde en combat'&&s.fighters[0].fatigue===3&&lib.characters[0].name==='Garde modifié'&&lib.characters[0].fatigue===1")
            page.reload()
            assert page.evaluate("s.fighters[0].name==='Garde en combat'&&s.fighters[0].fatigue===3")
            page.get_by_role('button',name='Annuler dernière validation',exact=True).click()
            assert page.evaluate("s.fighters[0].name==='Garde modifié'&&s.fighters[0].fatigue===1")
            # Ajouter une autre fiche depuis le sélecteur Combat, sans utiliser de bouton caché.
            page.get_by_role('button',name='♙ Personnages',exact=True).click()
            page.locator('[data-character-kind="PJ"]').click()
            page.get_by_role('button',name='+ Nouveau PJ',exact=True).click()
            page.locator('#wizardName').fill('Héro de test')
            page.locator('#wizardNext').click();page.locator('#wizardNext').click()
            page.locator('#wizardTrainingChoices button').filter(has_text='Maîtrise de la Terre').click()
            page.locator('#wizardNext').click();page.locator('#wizardFinish').click()
            page.get_by_role('button',name='← Retour aux cartes',exact=True).click()
            assert page.locator('#pjDirectory').is_visible()
            assert page.locator('#pjDirectory .character-card').count()==1
            page.locator('[data-character-kind="PNJ"]').click()
            assert not page.locator('#pjDirectory').is_visible()
            assert page.locator('#npcDirectory .character-card').count()==1
            assert 'Héro de test' not in page.locator('#npcDirectory').inner_text()
            assert page.evaluate("lib.characters.filter(c=>c.kind==='PJ').length===1&&lib.characters.filter(c=>c.kind==='PNJ').length===1")
            page.get_by_role('button',name='⚔ Combat',exact=True).click()
            page.locator('#combatSheetSelect').select_option(label='Héro de test (PJ)')
            page.get_by_role('button',name='Ajouter la fiche au combat',exact=True).click()
            assert page.evaluate("s.fighters.length===2&&s.fighters.some(f=>f.kind==='PJ'&&f.name==='Héro de test')")
            assert not errors,errors
            count+=1;context.close()
            # Combat rapide : nom et ressources éditables, annulation et échec de persistance.
            context = browser.new_context(viewport=viewport)
            page = context.new_page();errors=[];alerts=[]
            page.on('dialog',dialog);page.on('pageerror',lambda e:errors.append(str(e)))
            page.goto(url);page.get_by_role('button',name='Reprendre le combat',exact=True).click()
            page.get_by_role('button',name='+ PNJ',exact=True).click()
            before=page.evaluate('JSON.stringify(s)')
            page.get_by_role('button',name='Modifier le combattant',exact=True).click()
            page.locator('#combatEditName').fill('Nom abandonné')
            page.locator('#combatFighterDialog').get_by_role('button',name='Annuler',exact=True).click()
            assert page.evaluate('JSON.stringify(s)')==before
            page.get_by_role('button',name='Modifier le combattant',exact=True).click()
            page.locator('#combatEditName').fill('PNJ renommé')
            page.locator('#combatEditFatigue').fill('2');page.locator('#combatEditBalance').fill('-1');page.locator('#combatEditMaterials').fill('3')
            page.locator('.combat-edit-condition[value="Confus"]').check()
            page.locator('.combat-edit-status[value="pret"]').check()
            page.get_by_role('button',name='Enregistrer le combattant',exact=True).click()
            assert page.evaluate("s.fighters[0].name==='PNJ renommé'&&s.fighters[0].fatigue===2&&s.fighters[0].balance===-1&&s.fighters[0].materials===3&&s.fighters[0].conditions.includes('Confus')&&s.fighters[0].statuses.includes('pret')")
            page.reload();assert page.evaluate("s.fighters[0].name==='PNJ renommé'&&s.fighters[0].fatigue===2")
            page.get_by_role('button',name='Annuler dernière validation',exact=True).click()
            assert page.evaluate('JSON.stringify(s)')==before
            page.get_by_role('button',name='Modifier le combattant',exact=True).click()
            page.locator('#combatEditName').fill('Non sauvegardé')
            page.evaluate('persist=()=>false')
            page.get_by_role('button',name='Enregistrer le combattant',exact=True).click()
            assert 'annulée' in alerts[-1],alerts
            assert page.evaluate('JSON.stringify(s)')==before
            page.locator('#combatFighterDialog').get_by_role('button',name='Annuler',exact=True).click()
            page.reload();assert page.evaluate('JSON.stringify(s)')==before
            assert not errors,errors
            count+=1;context.close()
        browser.close()
finally:
    server.shutdown();server.server_close()
print(f'Retours recette : {count} parcours desktop/mobile, ressources, confirmations, filtres, fiches/combat, édition, stockage et undo OK')
