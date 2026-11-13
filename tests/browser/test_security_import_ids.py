"""Régression injection : import réel refusé et données de rendu toujours inertes."""
from _paths import APP_DIR, CHROMIUM_EXECUTABLE
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from threading import Thread
import json
from playwright.sync_api import sync_playwright

class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(APP_DIR)))
Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_port}/simulateur.html'
count=0
try:
    with sync_playwright() as pw:
        browser=pw.chromium.launch(executable_path=CHROMIUM_EXECUTABLE,args=['--no-sandbox'])
        context=browser.new_context();context.add_init_script('window.__auditXss=0;')
        page=context.new_page();alerts=[];errors=[]
        page.on('dialog',lambda d:(alerts.append(d.message) if d.type=='alert' else None,d.accept()))
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto(url)
        page.evaluate("""()=>{lib=Roster.createLibrary();const c=Roster.createCharacter(lib,'Fiche conservée','PJ');c.conditions=['Terrifié'];c.future={keep:42};s=CombatCore.createCombat();Roster.addToCombat(lib,s,c.id);persistCompleteBackup(lib,s);renderSheets();render();setView('characters');setCharacterKind('PJ');}""")
        def snapshot():return page.evaluate("({library:lib,combat:s,libraryRaw:localStorage.getItem('avatar-roster-v020'),combatRaw:localStorage.getItem('avatar-v020')})")
        original=snapshot()
        payloads=["char-1');window.__auditXss=1;//",'char-1" autofocus onfocus="window.__auditXss=1','char-1&#39;);window.__auditXss=1;//']
        # Les trois véritables voies de restauration : fiches seules, sauvegarde complète, combat seul.
        for mode in ['roster','complete','character-link','trap','proposal']:
            for payload in payloads:
                before=snapshot();library=json.loads(json.dumps(before['library']));combat=json.loads(json.dumps(before['combat']))
                if mode in ['roster','complete']:library['characters'][0]['id']=payload
                elif mode=='character-link':combat['fighters'][0]['characterId']=payload
                elif mode=='trap':combat['traps']=[{'id':payload,'ownerId':combat['fighters'][0]['id'],'zone':'Zone synthétique','round':1}]
                else:combat['proposals']=[{'id':payload,'targetId':combat['fighters'][0]['id'],'kind':'fatigue','amount':1}]
                if mode=='roster':selector='#rosterFile';value=library
                elif mode=='complete':selector='input[onchange="importCompleteBackup(event)"]';value={'format':'avatar-compagnon-backup','version':1,'library':library,'combat':combat}
                else:selector='#importFile';value=combat
                prior_alerts=len(alerts)
                page.locator(selector).set_input_files({'name':'test-synthetique.json','mimeType':'application/json','buffer':json.dumps(value).encode()})
                page.wait_for_function('(selector)=>document.querySelector(selector).value===""',arg=selector)
                assert len(alerts)>prior_alerts,(mode,alerts)
                assert snapshot()==before,mode
                assert page.evaluate('window.__auditXss')==0,mode
                page.locator('#pjDirectory .character-card').click()
                assert page.locator('#sheetName').input_value()=='Fiche conservée'
                page.get_by_role('button',name='← Retour aux cartes',exact=True).click()
                assert page.evaluate('window.__auditXss')==0
                count+=1
        # Le clavier et les contrôles imbriqués gardent le fonctionnement précédent.
        card=page.locator('#pjDirectory .character-card');card.focus();page.keyboard.press('Enter')
        assert page.locator('#sheetName').input_value()=='Fiche conservée'
        page.get_by_role('button',name='← Retour aux cartes',exact=True).click()
        page.locator('#pjDirectory .card-chip').click();assert not page.locator('#characterDetailView').is_visible()
        page.locator('#pjDirectory .character-card').focus();page.keyboard.press('Space')
        assert page.locator('#characterDetailView').is_visible();page.get_by_role('button',name='← Retour aux cartes',exact=True).click();count+=1
        # Défense indépendante de l’import : simule une donnée ancienne non validée déjà en mémoire.
        for payload in payloads:
            page.evaluate("""payload=>{const c=JSON.parse(JSON.stringify(lib.characters[0]));c.id=payload;document.getElementById('pjDirectory').innerHTML=characterCard(c)}""",payload)
            card=page.locator('#pjDirectory .character-card');assert card.get_attribute('onclick') is None
            assert card.get_attribute('data-id')==payload
            card.click();card.focus();page.keyboard.press('Enter');page.keyboard.press('Space')
            assert page.evaluate('window.__auditXss')==0
            page.evaluate('renderCharacterCards()');count+=1
        # Autres interpolations : e.id et amount, f.id/kind/ressources. Aucun fragment HTML créé.
        page.evaluate("""()=>{const f=s.fighters[0];f.id=`p-1');window.__auditXss=1;//`;f.kind='<img src=x onerror="window.__auditXss=1">';f.materials='<img src=x onerror="window.__auditXss=1">';s.proposals=[{id:'e-1" onmouseover="window.__auditXss=1',targetId:f.id,kind:'fatigue',amount:'<img src=x onerror="window.__auditXss=1">'}];s.traps=[{id:`trap-1');window.__auditXss=1;//`,ownerId:f.id,zone:'Zone synthétique'}];render()}""")
        assert page.locator('#fighters img,#proposals img').count()==0
        assert page.evaluate('window.__auditXss')==0
        assert page.locator('#proposals input').count()==1
        assert page.locator('#proposals input').get_attribute('onmouseover') is None
        assert page.locator('#fighters [data-ui-click="triggerTrapUI"]').get_attribute('onclick') is None
        page.evaluate('s.proposals=[];render()')
        page.locator('#fighters [data-ui-click="editCombatFighter"]').evaluate('(node)=>node.click()')
        assert page.evaluate('window.__auditXss')==0
        assert page.locator('#combatFighterDialog').is_visible();page.evaluate("document.getElementById('combatFighterDialog').close()")
        count+=1
        # Stockage ancien piégé : refus à la lecture, sans effacer sa valeur.
        bad=json.loads(json.dumps(original['library']));bad['characters'][0]['id']=payloads[0];raw=json.dumps(bad)
        page.evaluate("raw=>localStorage.setItem('avatar-roster-v020',raw)",raw);page.reload()
        assert page.evaluate("localStorage.getItem('avatar-roster-v020')")==raw
        assert page.evaluate('window.__auditXss')==0
        assert page.locator('#recoveryWarning').is_visible()
        assert not errors,errors
        count+=1
        browser.close()
finally:server.shutdown()
print(f'Chromium : {count} scénarios de sécurité/import/rendu/clavier réussis')
