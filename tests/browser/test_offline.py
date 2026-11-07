"""Application autonome : file:// hors connexion, combat, export et réimport."""
from _paths import APP_DIR, APP_HTML, CHROMIUM_EXECUTABLE
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from threading import Thread
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

with sync_playwright() as pw:
    browser = pw.chromium.launch(executable_path=CHROMIUM_EXECUTABLE, headless=True, args=['--no-sandbox'])
    context = browser.new_context(offline=True, accept_downloads=True)
    page = context.new_page()
    errors, requests, alerts = [], [], []
    page.on('pageerror', lambda error: errors.append(str(error)))
    # Les requêtes ne sont comptées qu'après le chargement initial autorisé.
    def dialog_handler(dialog):
        if dialog.type == 'alert':
            alerts.append(dialog.message)
        dialog.accept()
    page.on('dialog', dialog_handler)
    server = None
    try:
        page.goto(APP_HTML.as_uri(), wait_until='load')
        mode = 'file://'
    except Exception as error:
        if 'ERR_BLOCKED_BY_ADMINISTRATOR' not in str(error):
            raise
        print('LIMITATION: file:// bloqué par la politique du navigateur ; double-clic non vérifié. Contrôle hors réseau après chargement HTTP local.', flush=True)
        class QuietHandler(SimpleHTTPRequestHandler):
            def log_message(self, *args):
                pass
        server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(APP_DIR)))
        Thread(target=server.serve_forever, daemon=True).start()
        context.set_offline(False)
        page.goto(f'http://127.0.0.1:{server.server_port}/simulateur.html', wait_until='load')
        context.set_offline(True)
        mode = 'HTTP local puis réseau désactivé'
    page.on('request', lambda request: requests.append(request.url))
    page.get_by_role('button', name='Reprendre le combat', exact=True).click()
    page.get_by_role('button', name='+ PNJ', exact=True).click()
    page.get_by_role('button', name='+ PNJ', exact=True).click()
    page.locator('[data-combat-nav="round"]').click()
    page.locator('#declarations select').nth(0).select_option('defendre')
    page.locator('#declarations select').nth(1).select_option('attaquer')
    page.locator('#step').click()
    assert page.evaluate('s.phase') == 'defendre'
    for phase in ['attaquer','esquiver','fin','declaration']:
        page.locator('#step').click()
        assert page.evaluate('s.phase') == phase
    assert page.evaluate('s.round') == 2
    with page.expect_download() as pending:
        page.get_by_role('button', name='Exporter JSON privé', exact=True).click()
    download = pending.value
    exported = Path(download.path()).read_bytes()
    data = json.loads(exported)
    assert data['round'] == 2 and len(data['fighters']) == 2
    page.get_by_role('button', name='Réinitialiser la démonstration', exact=True).click()
    assert page.evaluate('s.fighters.length') == 0
    page.locator('#importFile').set_input_files({'name':'combat-test.json','mimeType':'application/json','buffer':exported})
    page.wait_for_function('s.round === 2 && s.fighters.length === 2')
    assert page.evaluate('JSON.stringify(s)') == json.dumps(data, ensure_ascii=False, separators=(',',':'))
    assert not [url for url in requests if url.startswith(('http://','https://'))], requests
    assert not errors, errors
    assert not alerts, alerts
    context.close()
    browser.close()
    if server:
        server.shutdown()
        server.server_close()
print(f'Hors réseau ({mode}) : cycle de combat, export JSON et réimport fidèle OK')
