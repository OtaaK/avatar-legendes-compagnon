"""Phase B : vrais modules ESM et stockage Chromium, sans écran React ni ancien HTML."""
import json, os, shutil
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'work/phase-b'
OUT.mkdir(parents=True, exist_ok=True)
(OUT / 'browser-harness.html').write_text('<!doctype html><meta charset="utf-8"><title>Test métier phase B</title>', encoding='utf-8')
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass
server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=str(ROOT)))
Thread(target=server.serve_forever, daemon=True).start()
url = f'http://127.0.0.1:{server.server_port}/work/phase-b/browser-harness.html'
try:
    with sync_playwright() as pw:
        browser = pw.chromium.launch(executable_path=os.environ.get("CHROMIUM_PATH") or shutil.which("chromium"), headless=True, args=["--no-sandbox"])
        context = browser.new_context()
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(url)
        page.evaluate("""async () => {
          const {createCompanionServices}=await import('/packages/application/src/companion-services.js');
          const {createBusinessRepository}=await import('/packages/persistence/src/business-repository.js');
          const {Roster}=await import('/packages/domain/src/roster.js');
          const {privateDescriptionRepository,parsePrivateDescriptions}=await import('/packages/reference/src/private-descriptions.js');
          const {TECHNIQUE_LIBRARY}=await import('/packages/reference/src/technique-library.js');
          window.harness={createCompanionServices,createBusinessRepository,Roster,privateDescriptionRepository,parsePrivateDescriptions,TECHNIQUE_LIBRARY};
          window.makeServices=()=>createCompanionServices({repository:createBusinessRepository({storage:localStorage})});
        }""")
        context.set_offline(True)
        result = page.evaluate("""async () => {
          const check=(v,m)=>{if(!v)throw Error(m)};
          const {Roster,privateDescriptionRepository,parsePrivateDescriptions,TECHNIQUE_LIBRARY}=harness;
          const api=makeServices();check(localStorage.length===0,'Écriture au montage');
          await api.session.execute(0,d=>{Roster.createCharacter(d.library,'PJ local','PJ')});
          const before=api.session.getSnapshot(),token=localStorage.getItem('avatar-compagnon-react-session-v1');
          window.__attack=false;
          const bad=JSON.parse(JSON.stringify(before.session.library));
          bad.characters[0].id="x');window.__attack=true;//";
          let refused=false;try{api.session.prepareImport(JSON.stringify(bad))}catch{refused=true}
          check(refused&&!window.__attack&&api.session.getSnapshot()===before,'Identifiant malveillant');
          check(localStorage.getItem('avatar-compagnon-react-session-v1')===token,'État écrasé');
          const original=Storage.prototype.setItem;
          Storage.prototype.setItem=function(){throw new DOMException('Quota synthétique','QuotaExceededError')};
          let quota=false;try{await api.session.execute(1,d=>{d.library.characters[0].name='Perdu'})}catch{quota=true}finally{Storage.prototype.setItem=original}
          check(quota&&api.session.getSnapshot()===before,'Quota non atomique');
          const privateRepo=privateDescriptionRepository(localStorage);
          privateRepo.save(parsePrivateDescriptions(JSON.stringify({format:'avatar-technique-descriptions-privees',version:1,techniques:TECHNIQUE_LIBRARY.map(t=>({id:t.id,description:'PRIVE_SYNTHETIQUE '+t.id}))})));
          check(Object.keys(privateRepo.load().descriptions).length===111,'Import groupé privé');
          check(!api.exports.campaign().includes('PRIVE_SYNTHETIQUE'),'Fuite privée');
          window.backup=api.exports.campaign();
          return {noMountWrite:true,maliciousIdRefused:true,quotaAtomic:true,offlineCommands:true,private111Separate:true};
        }""")
        # Rechargement du harnais HTTP ; on ne prétend pas qualifier le démarrage Next hors ligne.
        context.set_offline(False)
        page.reload()
        page.evaluate("""async()=>{
          const {createCompanionServices}=await import('/packages/application/src/companion-services.js');
          const {createBusinessRepository}=await import('/packages/persistence/src/business-repository.js');
          const {privateDescriptionRepository}=await import('/packages/reference/src/private-descriptions.js');
          window.api=createCompanionServices({repository:createBusinessRepository({storage:localStorage})});
          window.privateRepo=privateDescriptionRepository(localStorage);
        }""")
        context.set_offline(True)
        assert page.evaluate("api.session.getSnapshot().session.library.characters[0].name") == 'PJ local'
        assert page.evaluate("Object.keys(privateRepo.load().descriptions).length") == 111
        result['reloadPersistence'] = True
        assert not errors, errors
        (OUT / 'browser-results.json').write_text(json.dumps(result, indent=2)+'\n', encoding='utf-8')
        print(json.dumps(result))
        browser.close()
finally:
    server.shutdown()
