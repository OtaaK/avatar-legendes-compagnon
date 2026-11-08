"""Fiches distinctes, brouillons, ressources transactionnelles, portraits et sauvegardes."""
from _paths import APP_DIR, CHROMIUM_EXECUTABLE
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from threading import Thread
from pathlib import Path
import base64,json
from playwright.sync_api import sync_playwright

class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(APP_DIR)))
Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_port}/simulateur.html'
png=base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=')
try:
    with sync_playwright() as pw:
        browser=pw.chromium.launch(executable_path=CHROMIUM_EXECUTABLE,headless=True,args=['--no-sandbox'])
        for width,height in [(1440,1000),(1024,768),(390,844),(844,390),(320,640)]:
            context=browser.new_context(viewport={'width':width,'height':height},accept_downloads=True)
            page=context.new_page();errors=[];alerts=[];requests=[];confirms=[]
            choice={'accept':True,'prompt':'2'}
            def dialog(d):
                if d.type=='alert':alerts.append(d.message);d.accept()
                elif d.type=='prompt':d.accept(choice['prompt'])
                elif d.message.startswith('Préparer les ressources de '):d.dismiss()
                else:
                    confirms.append(d.message)
                    if choice['accept']:d.accept()
                    else:d.dismiss()
            page.on('dialog',dialog);page.on('pageerror',lambda e:errors.append(str(e)))
            page.on('request',lambda r:requests.append(r.url))
            page.goto(url)
            page.evaluate("""() => {
                lib=Roster.createLibrary();const pj=Roster.createCharacter(lib,'Voyageuse','PJ'),npc=Roster.createCharacter(lib,'Gardien','PNJ');
                Roster.updateCharacter(lib,pj.id,{livret:Playbooks.PLAYBOOKS[0].name,training:'Maîtrise de la Terre',fatigue:1,balance:0,center:-1,principles:['Loyauté','Assurance'],conditions:['Confus'],statuses:['Avantagé'],history:'Histoire\\r\\nconservée',relationships:[' Relation conservée '],playbookMoves:[' Manœuvre mémorisée '],notes:'Notes de test '.repeat(90)});
                pj.stats.creativite=3;pj.customMetadata={preserved:true};
                Roster.updateCharacter(lib,npc.id,{importance:'Majeur',livret:'Garde',location:'Port',principles:['Protection','Ancien principe'],balance:-1});
                npc.homeLocation='Adresse historique';npc.customMetadata={preserved:true};
                s=CombatCore.createCombat();Roster.addToCombat(lib,s,npc.id);if(!persistCompleteBackup(lib,s))throw Error('Préparation non enregistrée');
                renderSheets();render();setView('characters');setCharacterKind('PJ');openCharacterDetail(pj.id);
            }""")
            original=page.evaluate('JSON.stringify(lib.characters[0])')
            combat=page.evaluate("localStorage.getItem('avatar-v020')")
            assert page.locator('#sheetNav button').all_text_contents()==['Aperçu','Livret','Techniques','Histoire et relations']
            assert page.locator('#sheetForm').is_hidden()
            for tab in ['identity','playbook','techniques','story']:
                page.locator(f'[data-sheet-tab="{tab}"]').click()
                assert page.locator('#sheetQuick').is_visible()
                assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(width,tab)
            if width==1440:
                assert page.locator('#sheetQuick').evaluate("el=>getComputedStyle(el).position==='sticky'")
                page.evaluate('window.scrollBy(0,200)');assert page.locator('#sheetQuick').bounding_box()['y']>=0
            if width<901:assert page.locator('#sheetQuick').evaluate("el=>getComputedStyle(el).position==='static'")
            # Ajustements courants immédiatement enregistrés, puis annulables.
            page.get_by_role('button',name='Fatigue : 4 sur 5',exact=True).click()
            assert page.evaluate('lib.characters[0].fatigue')==4
            page.get_by_role('button',name='Annuler le dernier ajustement',exact=True).click()
            assert page.evaluate('lib.characters[0].fatigue')==1
            page.get_by_role('button',name='Régler l’équilibre à 2',exact=True).click()
            assert page.evaluate('lib.characters[0].balance===2&&lib.characters[0].center===-1')
            page.get_by_role('button',name='Annuler le dernier ajustement',exact=True).click()
            page.locator('#sheetQuick .sheet-effects summary').click()
            page.locator('#sheetQuick').get_by_role('button',name='Terrifié',exact=True).click()
            assert page.evaluate("lib.characters[0].conditions.includes('Terrifié')")
            page.get_by_role('button',name='Annuler le dernier ajustement',exact=True).click()
            assert page.evaluate('JSON.stringify(lib.characters[0])')==original
            page.evaluate('window.realSave=saveLibrary;saveLibrary=()=>false')
            page.get_by_role('button',name='Ajouter une fatigue',exact=True).click()
            assert 'annulée' in alerts[-1] and page.evaluate('JSON.stringify(lib.characters[0])')==original
            page.evaluate('saveLibrary=realSave')
            # Un brouillon ne fuit jamais dans les données, y compris via les ressources.
            page.get_by_role('button',name='Modifier',exact=True).click()
            page.locator('[data-sheet-tab="identity"]').click()
            page.locator('#sheetName').fill('Brouillon')
            page.get_by_role('button',name='Ajouter une fatigue',exact=True).click()
            assert page.evaluate('JSON.stringify(lib.characters[0])')==original
            page.locator('[data-sheet-tab="story"]').click()
            page.locator('#sheetHistory').fill('Récit en brouillon')
            page.locator('#sheetRelations').fill('Relation en brouillon')
            assert page.evaluate("() => {const e=new Event('beforeunload',{cancelable:true});window.dispatchEvent(e);return e.defaultPrevented}")
            choice['accept']=False
            page.locator('.main-nav [data-view="management"]').click()
            assert page.locator('#view-characters').is_visible() and page.locator('#sheetName').input_value()=='Brouillon'
            choice['accept']=True
            page.get_by_role('button',name='Annuler les modifications',exact=True).click()
            assert page.evaluate('JSON.stringify(lib.characters[0])')==original
            page.get_by_role('button',name='Modifier',exact=True).click()
            page.locator('[data-sheet-tab="identity"]').click()
            page.locator('#sheetName').fill('Voyageuse modifiée')
            page.get_by_role('button',name='Fatigue : 3 sur 5',exact=True).click()
            page.locator('[data-sheet-tab="techniques"]').click()
            page.locator('#sheetTechnique').select_option(index=0)
            page.get_by_role('button',name='Ajouter / actualiser',exact=True).click()
            assert page.evaluate('lib.characters[0].techniques.length')==0
            page.get_by_role('button',name='Enregistrer la fiche',exact=True).click()
            assert page.locator('#sheetEditButton').evaluate('el=>el===document.activeElement')
            saved=page.evaluate('lib.characters[0]');expected=json.loads(original)
            assert saved['name']=='Voyageuse modifiée' and saved['fatigue']==3 and len(saved['techniques'])==1
            for key in ['stats','principles','center','history','notes','relationships','playbookMoves','customMetadata']:assert saved[key]==expected[key],key
            # Centre : action séparée, choix confirmé à l'enregistrement, sans toucher la position.
            page.get_by_role('button',name='Modifier',exact=True).click()
            page.get_by_role('button',name='Modifier le centre…',exact=True).click()
            assert page.evaluate('lib.characters[0].center')==-1
            choice['accept']=False
            page.get_by_role('button',name='Enregistrer la fiche',exact=True).click()
            assert page.evaluate('lib.characters[0].center')==-1
            choice['accept']=True
            page.get_by_role('button',name='Enregistrer la fiche',exact=True).click()
            assert page.evaluate('lib.characters[0].center===2&&lib.characters[0].balance===0')
            # Portrait local et persistance ; aucune ressource distante n'est acceptée.
            page.get_by_role('button',name='Modifier',exact=True).click()
            page.locator('[data-sheet-tab="identity"]').click()
            page.locator('#sheetPortraitFile').set_input_files({'name':'portrait.png','mimeType':'image/png','buffer':png})
            page.wait_for_function("document.getElementById('sheetPortrait').value.startsWith('data:image/png;base64,')")
            page.get_by_role('button',name='Enregistrer la fiche',exact=True).click()
            assert page.locator('#sheetQuick img').get_attribute('src').startswith('data:image/png;base64,')
            page.wait_for_function("document.querySelector('#sheetQuick img').naturalWidth>0")
            # PNJ : trois onglets, lecture minimale, anciennes données conservées.
            page.get_by_role('button',name='← Retour aux cartes',exact=True).click()
            assert page.locator('#pjDirectory .card-avatar img').count()==1
            page.locator('[data-character-kind="PNJ"]').click()
            page.get_by_role('button',name='Ouvrir la fiche de Gardien',exact=True).click()
            assert page.locator('#sheetNav button').all_text_contents()==['Aperçu','Techniques','Lieux']
            assert page.locator('#sheetRead .sheet-stat-grid').count()==0
            assert page.locator('#sheetQuick .card-balance').count()==0
            assert 'Port' in page.locator('#sheetRead').inner_text()
            npc=page.evaluate('JSON.stringify(lib.characters[1])')
            page.get_by_role('button',name='Modifier',exact=True).click()
            page.locator('#sheetDesire').fill('Préserver le port')
            page.locator('#sheetDescription').fill('Texte <img src=x onerror=window.injected=1>')
            page.locator('#sheetImportance').select_option('Champion')
            # Quota : le brouillon reste disponible, le modèle est restauré et aucun faux succès.
            page.evaluate('saveLibrary=()=>false')
            page.get_by_role('button',name='Enregistrer la fiche',exact=True).click()
            assert page.evaluate('JSON.stringify(lib.characters[1])')==npc
            assert page.locator('#sheetDesire').input_value()=='Préserver le port' and page.locator('#sheetForm').is_visible()
            page.evaluate('saveLibrary=realSave')
            page.get_by_role('button',name='Enregistrer la fiche',exact=True).click()
            actual=page.evaluate('lib.characters[1]');expected=json.loads(npc)
            expected.update(desire='Préserver le port',description='Texte <img src=x onerror=window.injected=1>',importance='Champion')
            assert actual==expected
            assert page.locator('#sheetRead img').count()==0 and page.evaluate('window.injected===undefined')
            page.locator('[data-sheet-tab="places"]').click()
            assert 'Port' in page.locator('#sheetRead').inner_text()
            # Aller-retour intégral : fiche + ressources + nouvelles métadonnées + portrait.
            page.locator('.main-nav [data-view="management"]').click()
            with page.expect_download() as pending:page.get_by_role('button',name='Exporter la sauvegarde complète',exact=True).click()
            raw=Path(pending.value.path()).read_bytes();backup=json.loads(raw)
            page.locator('#backupImportFile').set_input_files({'name':'fiches.json','mimeType':'application/json','buffer':raw})
            page.wait_for_function("document.getElementById('backupImportFile').value===''")
            page.reload();assert page.evaluate('({library:lib,combat:s})')=={'library':backup['library'],'combat':backup['combat']}
            assert page.evaluate("localStorage.getItem('avatar-v020')")==combat
            page.evaluate("setView('characters');setCharacterKind('PJ');openCharacterDetail(lib.characters[0].id)")
            if width==1440:
                # Lecture asynchrone tardive : elle ne doit pas contaminer une autre fiche.
                page.get_by_role('button',name='Modifier',exact=True).click();page.locator('[data-sheet-tab="identity"]').click()
                page.evaluate("() => {window.RealReader=FileReader;window.FileReader=class{readAsDataURL(){window.delayedPortrait=()=>{this.result='data:image/png;base64,iVBORw0KGgo=';this.onload()}}};}")
                page.locator('#sheetPortraitFile').set_input_files({'name':'retard.png','mimeType':'image/png','buffer':png})
                page.get_by_role('button',name='Enregistrer la fiche',exact=True).click()
                assert 'Lecture du portrait en cours' in alerts[-1]
                page.get_by_role('button',name='Annuler les modifications',exact=True).click()
                page.get_by_role('button',name='← Retour aux cartes',exact=True).click();page.locator('[data-character-kind="PNJ"]').click();page.get_by_role('button',name='Ouvrir la fiche de Gardien',exact=True).click();page.get_by_role('button',name='Modifier',exact=True).click()
                page.evaluate('() => {delayedPortrait();FileReader=RealReader;}')
                assert page.locator('#sheetPortrait').input_value()==''
                page.locator('#sheetPortraitFile').set_input_files({'name':'trop-grand.png','mimeType':'image/png','buffer':b'x'*262145})
                assert 'volumineux' in alerts[-1]
                page.get_by_role('button',name='Annuler les modifications',exact=True).click()
                page.get_by_role('button',name='← Retour aux cartes',exact=True).click();page.locator('[data-character-kind="PJ"]').click();page.get_by_role('button',name='Ouvrir la fiche de Voyageuse modifiée',exact=True).click()
            # État de consultation au rechargement et capture avec avatar neutre pour la recette.
            page.get_by_role('button',name='Modifier',exact=True).click();page.locator('[data-sheet-tab="identity"]').click();page.get_by_role('button',name='Retirer le portrait',exact=True).click();page.get_by_role('button',name='Enregistrer la fiche',exact=True).click()
            page.evaluate('window.scrollTo(0,0)')
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(width,height)
            if width in [1440,390]:
                output=APP_DIR.parent/'work';output.mkdir(exist_ok=True);page.screenshot(path=str(output/f'uiux-lot3-{width}.png'),full_page=True)
            assert not errors,errors
            assert all(r.startswith(url.rsplit('/',1)[0]) or r.startswith('data:') for r in requests),requests
            context.close()
        browser.close()
finally:server.shutdown();server.server_close()
print('Fiches UI/UX : 5 formats, PJ/PNJ distincts, brouillons protégés, jauges/undo, centre confirmé, portraits locaux, quota, données anciennes et sauvegarde complète OK')
