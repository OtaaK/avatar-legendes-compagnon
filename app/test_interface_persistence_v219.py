"""Regression UI V2.19: run with python test_interface_persistence_v219.py."""
from pathlib import Path
from playwright.sync_api import sync_playwright
html=Path(__file__).with_name('simulateur.html').read_text()
with sync_playwright() as w:
    browser=w.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    page=browser.new_page()
    errors=[]
    page.on('pageerror',lambda error: errors.append(str(error)))
    page.on('dialog',lambda dialog:dialog.accept())
    page.set_content(html,wait_until='load')
    assert not errors,errors
    result=page.evaluate('''() => {
      s=CombatCore.createCombat();
      const a=CombatCore.addFighter(s,'Terre'),b=CombatCore.addFighter(s,'Ennemi');
      render();let saved=null;
      persist=(key,value)=>{saved=JSON.stringify(value);return true};
      changeEngagement(a,b,true);
      const savedEngagement=s.engagements.length===1&&JSON.parse(saved).engagements.length===1;
      persist=()=>false;
      changeEngagement(a,b,false);
      const revertedEngagement=s.engagements.length===1;
      persist=(key,value)=>{saved=JSON.stringify(value);return true};
      newSceneUI();
      const savedScene=s.scene===2&&JSON.parse(saved).scene===2;
      persist=()=>false;
      newSceneUI();
      const revertedScene=s.scene===2;
      return {savedEngagement,revertedEngagement,savedScene,revertedScene};
    }''')
    assert all(result.values()),result
    assert not errors,errors
    print('V2.19 Chromium: engagement/scène, persistance, rollback et démarrage OK')
    browser.close()
