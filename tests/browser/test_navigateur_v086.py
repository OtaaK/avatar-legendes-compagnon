"""Test d'intégration Chromium : moteur, affichage et validation des propositions."""
from _paths import APP_DIR, APP_HTML, CHROMIUM_EXECUTABLE
from pathlib import Path
from playwright.sync_api import sync_playwright

html = APP_HTML.read_text(encoding='utf-8')
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path=CHROMIUM_EXECUTABLE, args=['--no-sandbox', '--disable-dev-shm-usage'])
    page = browser.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.set_content(html, wait_until='load', timeout=30000)
    assert page.evaluate('typeof CombatCore') == 'object'
    result = page.evaluate('''() => {
      const combat=CombatCore.createCombat();
      const a=CombatCore.addFighter(combat,'Inventrice','PNJ');
      const b=CombatCore.addFighter(combat,'Gardien','PNJ');
      CombatCore.declare(combat,a,'attaquer');
      CombatCore.declare(combat,b,'defendre');
      CombatCore.reveal(combat);CombatCore.advance(combat);
      const entry=TECH_CATALOG.find(t=>t.nom==='Aveuglé par la science');
      if(!entry)throw Error('Technique absente du catalogue');
      const action=CombatCore.queueTechnique(combat,a,entry.nom,'attaquer',b,{catalogEntry:entry,scienceFatigue:1});
      CombatCore.propose(combat,action);
      const pending=combat.proposals.length;
      if(pending<2)throw Error('Propositions absentes');
      const preview=CombatCore.previewCommit(combat,{});
      if(!preview.length||combat.fighters[0].fatigue!==0)throw Error('Prévisualisation mutante');
      CombatCore.commit(combat,{});
      if(combat.fighters[0].fatigue!==1||combat.fighters[1].fatigue!==1)throw Error('Fatigue incorrecte');
      if(!combat.fighters[1].statuses.includes('gene'))throw Error('Gêné absent');
      if(combat.proposals.length!==0||combat.history.length!==1)throw Error('Journal incorrect');
      const applied={fatigue:combat.fighters.map(f=>f.fatigue),history:combat.history.length};
      CombatCore.undo(combat);
      if(combat.fighters.some(f=>f.fatigue!==0))throw Error('Annulation incorrecte');
      return {pending,preview:preview.length,applied,undone:combat.fighters.map(f=>f.fatigue)};
    }''')
    assert not errors, errors
    print('Chromium OK :', result, '— aucune erreur JavaScript')
    browser.close()
