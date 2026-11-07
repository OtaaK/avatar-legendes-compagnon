"""Lot 2 : cartes accessibles, filtres combinés, classification sans perte et sauvegardes."""
from _paths import APP_DIR, CHROMIUM_EXECUTABLE
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from threading import Thread
from pathlib import Path
import json
from playwright.sync_api import sync_playwright

class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args):pass

server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(APP_DIR)))
Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_port}/simulateur.html'
try:
    with sync_playwright() as pw:
        browser=pw.chromium.launch(executable_path=CHROMIUM_EXECUTABLE,headless=True,args=['--no-sandbox'])
        for width,height in [(1440,1000),(768,1024),(390,844),(844,390),(320,640)]:
            context=browser.new_context(viewport={'width':width,'height':height},accept_downloads=True)
            page=context.new_page();errors=[];alerts=[];requests=[]
            page.on('pageerror',lambda e:errors.append(str(e)))
            page.on('request',lambda r:requests.append(r.url))
            page.on('dialog',lambda d:(alerts.append(d.message) if d.type=='alert' else None,d.accept()))
            page.goto(url)
            page.evaluate("""() => {
                lib=Roster.createLibrary();
                const pj=Roster.createCharacter(lib,'Voyageuse aux longs récits','PJ');
                Roster.updateCharacter(lib,pj.id,{training:'Maîtrise de la Terre',principles:['Loyauté','Assurance'],balance:0,center:0});
                for(const [name,importance,location,role,training] of [
                    ['Aube','Mineur','Port','Guide','Maîtrise de l’Eau'],
                    ['Brume','Majeur','Port','Guide','Maîtrise de l’Eau'],
                    ['Cendre','Champion','Mont','Garde','Armes'],
                    ['Dune','Légendaire','Mont','Guide','Maîtrise de l’Eau'],
                    ['Ancien','','','Voyageur','']]){
                    const c=Roster.createCharacter(lib,name,'PNJ');
                    Roster.updateCharacter(lib,c.id,{location,livret:role,training,...(importance?{importance}:{})});
                }
                Roster.updateCharacter(lib,lib.characters[1].id,{conditions:['Terrifié'],statuses:['Avantagé'],fatigue:2});
                lib.fixtureMetadata={keep:true};s=CombatCore.createCombat();Roster.addToCombat(lib,s,lib.characters[1].id);
                if(!persistCompleteBackup(lib,s))throw Error('Préparation non enregistrée');
                renderSheets();render();setView('characters');setCharacterKind('PJ');
            }""")
            assert page.locator('#characterCreate').inner_text()=='+'
            assert page.locator('#characterCreate').get_attribute('aria-label')=='+ Nouveau PJ'
            pj=page.locator('#pjDirectory .character-card')
            assert pj.count()==1 and pj.locator('.card-avatar').count()==1
            assert pj.locator('.training-icon').count()==1 and pj.locator('.training-icon').inner_text()==''
            assert pj.locator('.fatigue-cells span').count()==5
            assert pj.locator('[data-balance-current="0"]').count()==1 and pj.locator('[data-balance-center="0"]').count()==1
            assert pj.locator('.balance-svg').evaluate("el=>el.querySelector('[data-balance-center]').getBBox().y<el.querySelector('[data-balance-current]').getBBox().y")
            assert 'PJ' not in pj.inner_text()
            page.locator('[data-character-kind="PNJ"]').click()
            assert page.locator('#npcDirectory .character-card').count()==5
            assert page.locator('.importance-legend').is_visible()
            assert page.locator('#npcDirectory .card-balance').count()==0,'Pas de jauge PJ sur PNJ'
            before=page.evaluate("({lib,s,libraryRaw:localStorage.getItem('avatar-roster-v020'),combatRaw:localStorage.getItem('avatar-v020')})")
            # Les contrôles d'information ne déclenchent jamais l'ouverture d'une fiche.
            card=page.locator('#npcDirectory .character-card').filter(has=page.get_by_role('button',name='Ouvrir la fiche de Aube',exact=True))
            card.locator('.importance-control').click()
            assert page.locator('#cardTooltip').is_visible() and 'Mineur' in page.locator('#cardTooltip').inner_text()
            assert page.locator('#characterListView').is_visible()
            page.keyboard.press('Escape');assert page.locator('#cardTooltip').is_hidden()
            card.locator('.training-icon').focus();assert page.locator('#cardTooltip').is_visible()
            page.locator('#npcSearch').focus();assert page.locator('#cardTooltip').is_hidden()
            card.get_by_role('button',name='Effet de Terrifié',exact=True).click()
            assert 'émotionnel' in page.locator('#cardTooltip').inner_text()
            page.keyboard.press('Escape')
            # Cinq critères cumulables et tri, sans aucune écriture des modèles.
            page.locator('#npcFilterPanel summary').click()
            page.locator('#npcSearch').fill('brume')
            page.locator('#npcLocationFilter').select_option('Port')
            page.locator('#npcTrainingFilter').select_option('Maîtrise de l’Eau')
            page.locator('#npcRoleFilter').select_option('Guide')
            page.locator('#npcImportanceFilter').select_option('Majeur')
            page.locator('#npcSort').select_option('importance-desc')
            assert page.locator('#npcDirectory .card-open').all_text_contents()==['Brume']
            assert page.locator('#npcCount').inner_text()=='1 / 5 PNJ'
            assert page.evaluate("({lib,s,libraryRaw:localStorage.getItem('avatar-roster-v020'),combatRaw:localStorage.getItem('avatar-v020')})")==before
            # Aller/retour par clavier conserve tous les critères.
            page.get_by_role('button',name='Ouvrir la fiche de Brume',exact=True).focus()
            page.keyboard.press('Enter')
            assert page.locator('#characterDetailView').is_visible()
            page.get_by_role('button',name='← Retour aux cartes',exact=True).click()
            assert page.locator('#npcDirectory .card-open').all_text_contents()==['Brume']
            assert page.locator('#npcRoleFilter').input_value()=='Guide'
            assert page.get_by_role('button',name='Ouvrir la fiche de Brume',exact=True).evaluate('el=>el===document.activeElement')
            page.locator('#npcImportanceFilter').select_option('Champion')
            assert page.locator('#npcDirectory .character-card').count()==0
            assert 'Réinitialiser' in page.locator('#npcDirectory').inner_text()
            page.get_by_role('button',name='Réinitialiser les filtres',exact=True).click()
            assert page.locator('#npcDirectory .character-card').count()==5
            page.locator('#npcSort').select_option('importance-desc')
            assert page.locator('#npcDirectory .card-open').all_text_contents()==['Dune','Cendre','Brume','Aube','Ancien']
            page.locator('#npcImportanceFilter').select_option('__unspecified__')
            assert page.locator('#npcDirectory .card-open').all_text_contents()==['Ancien']
            # Ancien sans importance reste sans propriété après simple sauvegarde.
            page.get_by_role('button',name='Ouvrir la fiche de Ancien',exact=True).click()
            page.get_by_role('button',name='Enregistrer la fiche',exact=True).click()
            assert page.evaluate("!Object.hasOwn(lib.characters.find(c=>c.name==='Ancien'),'importance')")
            resources=page.evaluate("JSON.stringify(lib.characters.find(c=>c.name==='Ancien'))")
            # Erreur de stockage : classification non retenue, pas de faux succès.
            page.locator('#sheetImportance').select_option('Champion')
            page.evaluate('window.originalSave=saveLibrary;saveLibrary=()=>false')
            page.get_by_role('button',name='Enregistrer la fiche',exact=True).click()
            assert 'annulée' in alerts[-1]
            assert page.evaluate("JSON.stringify(lib.characters.find(c=>c.name==='Ancien'))")==resources
            page.evaluate('saveLibrary=originalSave')
            page.get_by_role('button',name='Enregistrer la fiche',exact=True).click()
            current=page.evaluate("lib.characters.find(c=>c.name==='Ancien')")
            expected=json.loads(resources);expected['importance']='Champion';assert current==expected
            assert page.locator('.sheet-importance').inner_text()=='Champion'
            page.get_by_role('button',name='← Retour aux cartes',exact=True).click()
            assert page.locator('#npcDirectory .character-card').count()==0,'Filtre non précisé conservé'
            page.get_by_role('button',name='Réinitialiser les filtres',exact=True).click()
            # Métadonnée inconnue : préserver à la lecture et après édition non liée.
            page.evaluate("lib.characters.find(c=>c.name==='Ancien').importance='Catégorie historique';saveLibrary();renderSheets()")
            page.get_by_role('button',name='Ouvrir la fiche de Ancien',exact=True).click()
            assert page.locator('#sheetImportance').input_value()=='Catégorie historique'
            page.get_by_role('button',name='Enregistrer la fiche',exact=True).click()
            assert page.evaluate("lib.characters.find(c=>c.name==='Ancien').importance")== 'Catégorie historique'
            page.get_by_role('button',name='← Retour aux cartes',exact=True).click()
            assert page.evaluate("localStorage.getItem('avatar-v020')")==before['combatRaw']
            # Nom et identifiant importés ne sont jamais interpolés comme du code exécutable dans une carte.
            page.evaluate("""() => {const c=Roster.createCharacter(lib,'Nom <img src=x onerror=window.injected=1>','PNJ');c.id="char-evil');window.injected=1;//";renderSheets()}""")
            assert page.locator('#npcDirectory img').count()==0
            assert page.evaluate('window.injected===undefined')
            page.get_by_role('button',name='Ouvrir la fiche de Nom <img src=x onerror=window.injected=1>',exact=True).click()
            assert page.evaluate('window.injected===undefined')
            assert page.locator('#sheetName').input_value().startswith('Nom <img')
            # Retirer uniquement cette donnée synthétique avant le round-trip.
            page.evaluate("lib.characters=lib.characters.filter(c=>!c.name.startsWith('Nom <img'));saveLibrary();renderSheets();setView('management')")
            with page.expect_download() as pending:
                page.get_by_role('button',name='Exporter la sauvegarde complète',exact=True).click()
            raw=Path(pending.value.path()).read_bytes();backup=json.loads(raw)
            page.locator('#backupImportFile').set_input_files({'name':'galerie-test.json','mimeType':'application/json','buffer':raw})
            page.wait_for_function("document.getElementById('backupImportFile').value===''")
            page.reload()
            assert page.evaluate('({library:lib,combat:s})')=={'library':backup['library'],'combat':backup['combat']}
            page.evaluate("setView('characters');setCharacterKind('PNJ')")
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(width,height)
            if width in [1440,390]:
                output=APP_DIR.parent/'work';output.mkdir(exist_ok=True)
                page.screenshot(path=str(output/f'uiux-lot2-{width}.png'),full_page=True)
            if width==1440:
                page.evaluate("for(let i=0;i<500;i++)Roster.createCharacter(lib,'PNJ chargé '+i,'PNJ');renderSheets()")
                assert page.locator('#npcDirectory .character-card').count()==505
                page.locator('#npcSearch').fill('PNJ chargé 499')
                assert page.locator('#npcDirectory .card-open').all_text_contents()==['PNJ chargé 499']
            assert not errors,errors
            assert all(r.startswith(url.rsplit('/',1)[0]) for r in requests),requests
            context.close()
        browser.close()
finally:
    server.shutdown();server.server_close()
print('Galerie Personnages : 5 formats, cartes/clavier, filtres combinés et conservés, tri, absence de mutation, échec de stockage, anciennes métadonnées, sécurité et export/restauration OK')
