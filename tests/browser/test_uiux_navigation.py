"""Lot 1 UI/UX : six destinations, clavier, responsive et sauvegardes inchangées."""
from _paths import APP_DIR, CHROMIUM_EXECUTABLE
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from threading import Thread
from pathlib import Path
import json
from playwright.sync_api import sync_playwright

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

server=ThreadingHTTPServer(('127.0.0.1',0),partial(QuietHandler,directory=str(APP_DIR)))
Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_port}/simulateur.html'
views=['home','characters','places','combat','catalog','management']
labels=['Accueil','Personnages','Lieux','Combats','Techniques','Gestion']
viewports=[(1440,1000),(1280,800),(1024,768),(768,1024),(390,844),(844,390),(320,640)]
try:
    with sync_playwright() as pw:
        browser=pw.chromium.launch(executable_path=CHROMIUM_EXECUTABLE,headless=True,args=['--no-sandbox'])
        for width,height in viewports:
            context=browser.new_context(viewport={'width':width,'height':height},accept_downloads=True)
            page=context.new_page();errors=[];requests=[]
            page.on('pageerror',lambda e:errors.append(str(e)))
            page.on('request',lambda r:requests.append(r.url))
            page.on('dialog',lambda d:d.accept())
            page.goto(url)
            assert page.locator('.row[hidden]:visible').count()==0
            # Des données synthétiques, dont un nom long et du contenu à échapper.
            page.evaluate("""() => {
                lib=Roster.createLibrary();const c=Roster.createCharacter(lib,'Voyageuse <test> '+ 'nom très long '.repeat(5),'PNJ');
                Roster.updateCharacter(lib,c.id,{location:'Port du test',notes:'Données conservées'});
                s=CombatCore.createCombat();Roster.addToCombat(lib,s,c.id);CombatCore.addFighter(s,'Autre combattant','PNJ');
                CombatCore.setEngagement(s,s.fighters[0].id,s.fighters[1].id,true);
                if(!persistCompleteBackup(lib,s))throw Error('Préparation non enregistrée');
                renderSheets();render();
            }""")
            baseline=page.evaluate("({lib,s,libraryRaw:localStorage.getItem('avatar-roster-v020'),combatRaw:localStorage.getItem('avatar-v020')})")
            nav=page.get_by_role('navigation',name='Navigation principale',exact=True)
            assert nav.get_by_role('button').all_text_contents()==labels
            for view in views:
                button=nav.locator(f'[data-view="{view}"]');button.click()
                assert button.get_attribute('aria-current')=='page'
                assert page.locator('.main-nav [aria-current="page"]').count()==1
                assert page.locator('.app-view:visible').count()==1
                assert page.locator(f'#view-{view}').is_visible()
                assert page.evaluate("document.activeElement===document.querySelector('#view-'+currentView+' h2')")
                if view=='characters':page.locator('[data-character-kind="PNJ"]').click()
                assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(width,height,view,'Débordement horizontal')
                box=button.bounding_box();assert box['height']>=44
                assert page.evaluate("({lib,s,libraryRaw:localStorage.getItem('avatar-roster-v020'),combatRaw:localStorage.getItem('avatar-v020')})")==baseline
            # Alt+1…6 suit l'ordre visuel ; aucun raccourci ne détourne une saisie.
            for i,view in enumerate(views,1):
                page.keyboard.press(f'Alt+{i}')
                assert page.locator(f'#view-{view}').is_visible()
            page.evaluate("setView('catalog')")
            page.locator('#catalogSearch').fill('terre')
            page.keyboard.press('Alt+1')
            assert page.locator('#view-catalog').is_visible()
            page.locator('#catalogSearch').blur()
            page.keyboard.press('Alt+6')
            page.reload()
            assert page.locator('#view-management').is_visible()
            assert page.evaluate("({lib,s,libraryRaw:localStorage.getItem('avatar-roster-v020'),combatRaw:localStorage.getItem('avatar-v020')})")==baseline
            # Les outils de Gestion utilisent les vrais chemins d'export/import existants.
            with page.expect_download() as download:
                page.get_by_role('button',name='Exporter la sauvegarde complète',exact=True).click()
            raw=Path(download.value.path()).read_bytes();backup=json.loads(raw)
            assert backup['library']==baseline['lib'] and backup['combat']==baseline['s']
            with page.expect_file_chooser() as chooser:
                page.get_by_role('button',name='Restaurer une sauvegarde complète',exact=True).click()
            chooser.value.set_files({'name':'test-uiux.json','mimeType':'application/json','buffer':raw})
            page.wait_for_function("document.getElementById('backupImportFile').value===''")
            assert page.locator('#view-characters').is_visible()
            assert page.evaluate('({lib,s})')=={'lib':baseline['lib'],'s':baseline['s']}
            page.reload()
            assert page.evaluate('({lib,s})')=={'lib':baseline['lib'],'s':baseline['s']}
            # Navigation complète au clavier : focus visible puis activation par Entrée.
            page.evaluate("setView('home');document.activeElement.blur()")
            page.keyboard.press('Control+Home');page.keyboard.press('Tab')
            assert page.locator('.skip-link').evaluate('el=>el===document.activeElement')
            page.keyboard.press('Enter')
            assert page.locator('#appContent').evaluate('el=>el===document.activeElement')
            page.locator('.main-nav [data-view="places"]').focus()
            assert page.locator('.main-nav [data-view="places"]').evaluate("el=>getComputedStyle(el).outlineStyle==='solid'")
            page.keyboard.press('Enter')
            assert page.locator('#view-places').is_visible()
            assert 'sera intégrée' in page.locator('#view-places').inner_text()
            assert all(r.startswith(url.rsplit('/',1)[0]) for r in requests),requests
            assert not errors,errors
            if width in [1440,390]:
                page.evaluate("setView('home')")
                output=APP_DIR.parent/'work';output.mkdir(exist_ok=True)
                page.screenshot(path=str(output/f'uiux-lot1-{width}.png'),full_page=True)
            context.close()
        browser.close()
finally:
    server.shutdown();server.server_close()
print('UI/UX lot 1 : 7 formats, 6 destinations, clavier/focus, aucun débordement, modèles et stockage conservés, export/restauration Gestion OK')
