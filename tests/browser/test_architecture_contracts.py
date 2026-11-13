"""Même scénario contractuel dans le vrai HTML et la VM Node, sans écriture implicite."""
from _paths import ROOT, APP_DIR, CHROMIUM_EXECUTABLE
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from threading import Thread
import json
import subprocess
from playwright.sync_api import sync_playwright

class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(APP_DIR)))
Thread(target=server.serve_forever,daemon=True).start()
try:
    bundle=json.loads(subprocess.check_output(['node',str(ROOT/'tests/support/contract-scenario.cjs')],cwd=ROOT,text=True))
    with sync_playwright() as pw:
        browser=pw.chromium.launch(executable_path=CHROMIUM_EXECUTABLE,args=['--no-sandbox'])
        for width,height in [(1280,900),(390,844)]:
            context=browser.new_context(viewport={'width':width,'height':height});page=context.new_page();errors=[]
            page.on('pageerror',lambda e:errors.append(str(e)))
            page.goto(f'http://127.0.0.1:{server.server_port}/simulateur.html')
            before=page.evaluate('({lib,s,storage:{...localStorage}})')
            # Le texte exécuté est uniquement la fonction statique de test issue du dépôt.
            # Aucun identifiant ou contenu importé n’est interpolé dans le code exécuté.
            result=page.evaluate('('+bundle['scenarioSource']+')({CombatCore,CombatRules,Roster,Playbooks,catalog:TECH_CATALOG,validators:{validateCombat,validateBackupLinks}})')
            assert result==bundle['expected'],'Divergence du scénario Node/HTML'
            assert page.evaluate('({lib,s,storage:{...localStorage}})')==before
            assert page.evaluate('typeof window.__contractMarker')=='undefined'
            assert not errors,errors
            page.reload()
            assert page.evaluate('({lib,s,storage:{...localStorage}})')==before
            context.close()
        browser.close()
finally:server.shutdown()
print('Contrats Node/HTML identiques en 1280×900 et 390×844 ; aucun état ni stockage modifié, rechargement conservé')
