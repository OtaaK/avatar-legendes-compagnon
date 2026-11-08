"""Profils PNJ : adoption explicite, migration réversible, combat et fichiers v2."""
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
custom="L'ombre <img src=x onerror=window.injected=1>"
labels=['Terrifié','En colère','Coupable','Fragile','Confus',custom,'Épuisé','Réticent']
try:
    with sync_playwright() as pw:
        browser=pw.chromium.launch(executable_path=CHROMIUM_EXECUTABLE,headless=True,args=['--no-sandbox'])
        for width,height in [(1280,900),(390,844),(320,640),(844,390)]:
            context=browser.new_context(viewport={'width':width,'height':height},accept_downloads=True);page=context.new_page();errors=[];alerts=[]
            choice={'accept':True,'name':'Témoin'}
            def dialog(d):
                if d.type=='alert':alerts.append(d.message);d.accept()
                elif d.type=='prompt':d.accept(custom if 'fatigue excédentaire' in d.message else choice['name'])
                elif choice['accept']:d.accept()
                else:d.dismiss()
            page.on('dialog',dialog);page.on('pageerror',lambda e:errors.append(str(e)))
            page.goto(url)
            page.evaluate("""() => {lib=Roster.createLibrary();const c=Roster.createCharacter(lib,'Légendaire de test','PNJ');Roster.updateCharacter(lib,c.id,{importance:'Légendaire',location:'Port'});s=CombatCore.createCombat();CombatCore.addFighter(s,'Opposant','PJ');if(!persistCompleteBackup(lib,s))throw Error('Préparation non sauvegardée');renderSheets();render();setView('characters');setCharacterKind('PNJ');openCharacterDetail(c.id)}""")
            baseline=page.evaluate("({library:lib,combat:s,libRaw:localStorage.getItem('avatar-roster-v020'),combatRaw:localStorage.getItem('avatar-v020')})")
            page.get_by_role('button',name='Modifier',exact=True).click();page.locator('.npc-resource-editor summary').click()
            page.get_by_role('button',name='Proposer les valeurs de l’importance',exact=True).click()
            assert page.locator('#npcConditionCount').input_value()=='8'
            assert len(page.locator('#npcConditionNames').input_value().splitlines())==5,'Aucun état inventé pour compléter les huit cases'
            page.get_by_role('button',name='Enregistrer la fiche',exact=True).click()
            assert 'exactement 8' in alerts[-1]
            assert page.evaluate("localStorage.getItem('avatar-roster-v021')") is None
            page.locator('#npcConditionNames').fill('\n'.join(labels))
            page.locator('#principleLeft').fill('Protection')
            assert page.locator('#sheetQuick .resource-cell').count()==15
            page.get_by_role('button',name='Fatigue : 14 sur 15',exact=True).click()
            assert page.evaluate('lib.characters[0].fatigue')==0
            choice['accept']=False;page.get_by_role('button',name='Enregistrer la fiche',exact=True).click();choice['accept']=True
            assert page.evaluate("localStorage.getItem('avatar-roster-v021')") is None
            # Un quota à la deuxième clé annule toute migration et laisse le brouillon disponible.
            page.evaluate("""() => {const write=Storage.prototype.setItem;let once=true;Storage.prototype.setItem=function(key,value){if(key==='avatar-v021'&&once){once=false;throw new DOMException('Quota de test','QuotaExceededError')}return write.call(this,key,value)}}""")
            page.get_by_role('button',name='Enregistrer la fiche',exact=True).click()
            assert 'annulée' in alerts[-1]
            assert page.evaluate('({library:lib,combat:s})')=={'library':baseline['library'],'combat':baseline['combat']}
            assert page.evaluate("localStorage.getItem('avatar-roster-v021')") is None
            assert page.locator('#sheetFatigue').input_value()=='14'
            page.get_by_role('button',name='Enregistrer la fiche',exact=True).click()
            assert page.evaluate("lib.version===2&&lib.characters[0].fatigue===14&&lib.characters[0].npcResources.fatigueMax===15")
            assert page.evaluate("localStorage.getItem('avatar-roster-v020')")==baseline['libRaw']
            assert page.evaluate("localStorage.getItem('avatar-v020')")==baseline['combatRaw']
            assert page.evaluate("localStorage.getItem('avatar-npc-storage-generation')")=='1'
            assert page.locator('#sheetQuick .resource-cell').count()==15
            assert page.locator('#sheetQuick .card-balance').count()==0
            page.get_by_role('button',name='Régler l’équilibre PNJ à 4',exact=True).click()
            assert page.evaluate('lib.characters[0].balance')==4
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(width,height)
            if width in [1280,390]:
                output=APP_DIR.parent/'work';output.mkdir(exist_ok=True);page.reload();page.evaluate("setView('characters');setCharacterKind('PNJ');openCharacterDetail(lib.characters[0].id);window.scrollTo(0,0)");page.screenshot(path=str(output/f'profils-pnj-{width}.png'),full_page=True)
            page.get_by_role('button',name='Ajouter au combat',exact=True).click()
            target=page.evaluate('s.fighters.find(f=>f.characterId).id')
            assert page.evaluate('s.fighters.find(f=>f.characterId).npcResources.fatigueMax')==15
            page.evaluate("s.phase='attaquer';s.fighters[0].approach='attaquer';s.fighters[0].roll='10+';render()")
            page.locator('[data-combat-nav="technique"]').click()
            page.locator('#target').select_option(target)
            page.locator('#tech').select_option(page.evaluate("TECH_CATALOG.find(t=>t.nom==='Frapper').id"))
            assert custom in page.locator('#condition option').all_text_contents()
            assert page.locator('#opts img').count()==0
            page.evaluate("CombatCore.manual(s,s.fighters[0].id,s.fighters[1].id,'fatigue',1);render();setCombatTab('approval')")
            page.get_by_role('button',name='Valider les effets cochés',exact=True).click()
            assert page.evaluate('s.fighters[1].fatigue')==15
            page.evaluate("CombatCore.manual(s,s.fighters[0].id,s.fighters[1].id,'fatigue',1);render();setCombatTab('approval')")
            page.get_by_role('button',name='Valider les effets cochés',exact=True).click()
            assert page.evaluate('s.fighters[1].fatigue')==15
            assert custom in page.evaluate('s.fighters[1].conditions')
            page.locator('[data-combat-nav="fighters"]').click()
            page.get_by_role('button',name='Reporter sur la fiche',exact=True).click()
            assert page.evaluate('lib.characters[0].fatigue')==15
            assert page.evaluate('window.injected===undefined')
            page.locator('.main-nav [data-view="characters"]').click()
            page.locator('#sheetQuick .sheet-effects summary').click()
            page.locator('#sheetQuick').get_by_role('button',name='✓ '+custom,exact=True).click()
            assert custom not in page.evaluate('lib.characters[0].conditions')
            assert custom in page.evaluate('s.fighters[1].conditions'),'La copie de combat reste indépendante'
            page.get_by_role('button',name='Annuler le dernier ajustement',exact=True).click()
            # Profil non combattant : pas de jauges fictives ni d’ajout au combat.
            page.get_by_role('button',name='← Retour aux cartes',exact=True).click()
            page.get_by_role('button',name='+ Nouveau PNJ',exact=True).click()
            page.get_by_role('button',name='Modifier',exact=True).click();page.locator('.npc-resource-editor summary').click()
            page.get_by_role('button',name='Proposer un PNJ non combattant',exact=True).click()
            page.get_by_role('button',name='Enregistrer la fiche',exact=True).click()
            assert page.locator('#sheetQuick .resource').count()==0
            assert page.locator('#sheetQuick .sheet-effects').is_hidden()
            assert page.get_by_role('button',name='PNJ non combattant',exact=True).is_disabled()
            assert 'Témoin' not in page.locator('#combatSheetSelect').inner_text()
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(width,height)
            # Export v2 et copie de retour v1 sont tous les deux accessibles sans commande.
            page.locator('.main-nav [data-view="management"]').click()
            with page.expect_download() as pending:page.get_by_role('button',name='Exporter la sauvegarde complète',exact=True).click()
            raw=Path(pending.value.path()).read_bytes();backup=json.loads(raw)
            assert backup['version']==2 and backup['library']['version']==2
            with page.expect_download() as pending:page.get_by_role('button',name='Exporter le combat privé',exact=True).click()
            combat=json.loads(Path(pending.value.path()).read_bytes());assert combat['format']=='avatar-compagnon-combat' and combat['version']==2
            with page.expect_download() as pending:page.get_by_role('button',name='Exporter l’état avant les profils PNJ',exact=True).click()
            oldraw=Path(pending.value.path()).read_bytes();old=json.loads(oldraw)
            assert old['version']==1 and old['library']==baseline['library'] and old['combat']==baseline['combat']
            page.locator('#backupImportFile').set_input_files({'name':'retour-v1.json','mimeType':'application/json','buffer':oldraw})
            page.wait_for_function("document.getElementById('backupImportFile').value===''")
            assert page.evaluate('lib')==baseline['library']
            page.locator('#backupImportFile').set_input_files({'name':'profils-v2.json','mimeType':'application/json','buffer':raw})
            page.wait_for_function("document.getElementById('backupImportFile').value===''")
            page.reload()
            assert page.evaluate('({library:lib,combat:s})')=={'library':backup['library'],'combat':backup['combat']}
            assert page.evaluate("localStorage.getItem('avatar-roster-v020')")==baseline['libRaw']
            assert page.evaluate("localStorage.getItem('avatar-v020')")==baseline['combatRaw']
            assert page.evaluate("localStorage.getItem('avatar-complete-import-journal-v1')") is None
            assert not errors,errors
            context.close()
        browser.close()
finally:server.shutdown();server.server_close()
print('Profils PNJ : 4 formats, 15 cases, états sûrs, quota, combat, report, non-combattant, formats v1/v2 et copie de retour conservée OK')
