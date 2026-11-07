from pathlib import Path
from playwright.sync_api import sync_playwright
html=Path(__file__).with_name('simulateur.html').read_text()
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=browser.new_page()
 page.set_content(html,wait_until='load')
 result=page.evaluate("""() => {const C=window.CombatCore,s=C.createCombat(),a=C.addFighter(s,'A'),b=C.addFighter(s,'B');C.setEngagement(s,a,b,true);s.phase='esquiver';C.fighter(s,a).approach='esquiver';const act={id:'v139',sourceId:a,targetId:b,name:'À contretemps',round:s.round,options:{countertimeConfirmed:true}};s.actions.push(act);C.propose(s,act);C.commit(s);const e=s.temporaryEffects.find(e=>e.originLabel==='À contretemps');s.phase='fin';C.nextRound(s);let before=false,after=false;try{C.declare(s,a,'defendre')}catch(err){before=true}C.declare(s,b,'attaquer');C.revealCountertime(s,e.id,true);try{C.declare(s,b,'defendre')}catch(err){after=true}C.declare(s,a,'defendre');return {before,after,approach:C.fighter(s,b).approach}}""")
 assert result=={'before':True,'after':True,'approach':'attaquer'},result
 browser.close()
print('CHROMIUM V1.39 OK')
