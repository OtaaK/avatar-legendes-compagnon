"""V2.33 : 13 formulaires, validation, stockage réel, rechargement et undo.
Lancer : python tests/browser/test_terre_v233_browser.py (Playwright et Chromium requis).
"""
from _paths import APP_DIR, APP_HTML, CHROMIUM_EXECUTABLE
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

root = APP_DIR
server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(root)))
thread = Thread(target=server.serve_forever, daemon=True)
thread.start()
url = f'http://127.0.0.1:{server.server_port}/simulateur.html'
count = 0
try:
    with sync_playwright() as pw:
        browser = pw.chromium.launch(executable_path=CHROMIUM_EXECUTABLE, headless=True, args=['--no-sandbox'])
        for viewport in [{'width':1280,'height':900}, {'width':390,'height':844}]:
            context = browser.new_context(viewport=viewport)
            page = context.new_page()
            errors, alerts = [], []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.on('dialog', lambda dialog: (alerts.append(dialog.message), dialog.accept()))
            page.goto(url)
            entries = page.evaluate("TECH_CATALOG.filter(t=>t.famille==='terre').map(t=>({id:t.id,nom:t.nom,approche:t.approche}))")
            assert len(entries) == 13
            for entry in entries:
                alerts.clear()
                page.evaluate("""entry => {
                    localStorage.clear();s=CombatCore.createCombat();
                    const a=CombatCore.addFighter(s,'Terre'),b=CombatCore.addFighter(s,'Adversaire','PNJ');
                    const phase=Object.entries(CombatRules.APPROACH_NAME).find(([key,label])=>label===entry.approche)[0];
                    CombatCore.fighter(s,a).techniques=[{name:entry.nom,mastery:'maitrisee'}];
                    CombatCore.setEngagement(s,a,b,true);
                    CombatCore.declare(s,a,phase,'10+');CombatCore.declare(s,b,phase,'10+');CombatCore.reveal(s);
                    while(s.phase!==phase)CombatCore.advance(s);
                    render();setView('combat');setCombatTab('technique');
                }""", entry)
                page.locator('#source').select_option('p-1')
                page.locator('#target').select_option('p-2')
                page.locator('#tech').select_option(entry['id'])
                for selector in ['#earthArmorConfirmed','#earthShieldConfirmed','#earthSeismicConfirmed','#earthLavaConfirmed','#earthMudConfirmed','#earthMetalConfirmed','#earthStairsConfirmed']:
                    if page.locator(selector).count():
                        page.locator(selector).check()
                for selector in ['.earth-mud-attacker','.tectonic-target','.earth-air-unable']:
                    if page.locator(selector).count():
                        page.locator(selector).first.check()
                page.get_by_role('button', name='Préparer les effets', exact=True).click()
                assert page.evaluate('s.proposals.length') > 0, (entry, page.locator('#message').inner_text())
                before = page.evaluate('JSON.stringify(s)')
                page.locator('[data-combat-nav="approval"]').click()
                page.get_by_role('button', name='Valider les effets cochés', exact=True).click()
                assert not alerts, (entry, alerts)
                assert page.evaluate('s.proposals.length') == 0
                assert page.evaluate("""name=>{
                    const a=s.fighters[0],b=s.fighters[1],has=(f,x)=>f.statuses.includes(x);
                    switch(name){
                    case 'Armure de terre':return s.temporaryEffects.some(e=>e.armorPoints===3)&&has(a,'avantage')&&a.fatigue===0;
                    case 'Bouclier de roche':return s.temporaryEffects.some(e=>e.originLabel===name)&&has(a,'gene')&&a.fatigue===1;
                    case 'Boue gluante':return has(b,'gene')&&a.bonuses.some(e=>e.type==='earth_mud_strike'&&e.round===2);
                    case 'Colonne de pierre':return has(b,'gene');
                    case 'Détection du pas lourd':return has(a,'pret')&&a.bonuses.some(e=>e.type==='earth_seismic_interrupt');
                    case 'Enfouissement':return has(b,'piege')&&a.fatigue===2;
                    case 'Entraves de métal':return has(b,'gene')&&has(a,'avantage')&&s.temporaryEffects.some(e=>e.originLabel===name);
                    case 'Escalier de poussière':return has(a,'pret')&&has(a,'avantage');
                    case 'Étoile de lave':return has(a,'avantage')&&a.fatigue===1&&s.temporaryEffects.some(e=>e.originLabel===name);
                    case 'Gantelet de terre':return a.fatigue===1&&b.fatigue===2;
                    case 'Mords la poussière':return has(b,'gene')&&b.bonuses.some(e=>e.approach==='defendre'&&e.round===2);
                    case 'Mouvements tectoniques':return has(b,'gene')&&b.roundStatuses.some(e=>e.expiresAfterRound===2);
                    case 'Projection tellurique':return has(a,'avantage')&&a.fatigue===1&&!CombatCore.isEngaged(s,a.id,b.id);
                    default:return false;
                    }
                }""", entry['nom']), entry
                assert page.evaluate('''() => {
                    const raw=JSON.parse(JSON.stringify(s));
                    const e=raw.temporaryEffects.find(e=>e.originSourceId);
                    if(!e)return true;
                    e.originSourceId='absent';
                    try{validateCombat(raw);return false;}catch(error){return true;}
                }'''), entry
                after = page.evaluate('JSON.stringify(s)')
                assert page.evaluate("JSON.stringify(JSON.parse(localStorage.getItem('avatar-v020')))===JSON.stringify(s)"), entry
                page.reload()
                assert page.evaluate('JSON.stringify(s)') == after, entry
                page.evaluate("setView('combat')")
                page.get_by_role('button', name='Annuler dernière validation', exact=True).click()
                assert page.evaluate('JSON.stringify(s)') == before, entry
                page.reload()
                assert page.evaluate('JSON.stringify(s)') == before, entry
                count += 1
            assert not errors, errors
            context.close()
        # Commande de Boue réelle : cible à fatigue pleine, mais attaque entièrement bloquée.
        page = browser.new_page()
        page.goto(url)
        page.evaluate("""() => {
            s=CombatCore.createCombat();const a=CombatCore.addFighter(s,'Terre'),b=CombatCore.addFighter(s,'Cible');
            s.phase='defendre';s.round=2;CombatCore.fighter(s,a).bonuses.push({type:'earth_mud_strike',targetId:b,round:2});
            CombatCore.fighter(s,b).fatigue=5;CombatCore.fighter(s,b).statuses.push('gene');
            s.temporaryEffects.push({id:'temp-100',createdRound:2,createdScene:1,originLabel:'Bouclier de roche',originType:'technique',originSourceId:b,targetId:b,label:'Bouclier',duration:'manual',shieldBlockedRound:0,shieldGrantedGene:true});
            render();setView('combat');setCombatTab('round');
        }""")
        dialogs = []
        def answer(dialog):
            dialogs.append((dialog.type, dialog.message))
            dialog.accept('fatigue' if dialog.type == 'prompt' else None)
        page.on('dialog', answer)
        page.get_by_role('button', name='Frapper (MJ)', exact=True).click()
        assert [kind for kind, _ in dialogs] == ['prompt', 'confirm'], dialogs
        assert page.evaluate('s.fighters[1].fatigue') == 5
        assert page.evaluate("s.temporaryEffects[0].shieldBlockedRound") == 2
        assert page.evaluate('s.fighters[0].bonuses.length') == 0
        page.reload()
        assert page.evaluate('s.fighters[0].bonuses.length') == 0
        page.evaluate("setView('combat')")
        page.get_by_role('button', name='Annuler dernière validation', exact=True).click()
        assert page.evaluate('s.fighters[0].bonuses.length') == 1
        assert page.evaluate('s.temporaryEffects[0].shieldBlockedRound') == 0
        count += 1
        # Annulation du choix de débordement : aucune consommation du droit.
        page.evaluate("s.temporaryEffects=[];render();setCombatTab('round')")
        before = page.evaluate('JSON.stringify(s)')
        page.remove_listener('dialog', answer)
        answers = ['fatigue', None]
        def cancel(dialog):
            if dialog.type == 'prompt':
                value = answers.pop(0)
                if value is None: dialog.dismiss()
                else: dialog.accept(value)
            else: dialog.accept()
        page.on('dialog', cancel)
        page.get_by_role('button', name='Frapper (MJ)', exact=True).click()
        assert not answers
        assert page.evaluate('JSON.stringify(s)') == before
        count += 1
        page.close()
        browser.close()
finally:
    server.shutdown()
    server.server_close()
print(f'V2.33 Chromium : {count} parcours (13 techniques desktop/mobile + Boue protégée), stockage réel, rechargement et annulation OK')
