from pathlib import Path
from playwright.sync_api import sync_playwright
html=Path(__file__).with_name('simulateur.html').read_text()
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=browser.new_page();page.set_content(html,wait_until='load')
 result=page.evaluate("""() => {const C=window.CombatCore,s=C.createCombat(),a=C.addFighter(s,'A'),b=C.addFighter(s,'B');C.setEngagement(s,a,b,true);s.phase='esquiver';const act={id:'v140',sourceId:a,targetId:b,name:'À contretemps',round:s.round,options:{countertimeConfirmed:true}};s.actions.push(act);C.propose(s,act);C.commit(s);const e=s.temporaryEffects.find(e=>e.originLabel==='À contretemps');s.phase='fin';C.nextRound(s);C.fighter(s,a).statuses.push('etourdi');C.fighter(s,b).statuses.push('piege');let blocked=false;try{C.reveal(s)}catch(err){blocked=err.message.includes('À contretemps')}const unchanged=s.phase==='declaration';C.fighter(s,b).statuses=[];C.declare(s,b,'attaquer');C.revealCountertime(s,e.id,true);C.reveal(s);return {blocked,unchanged,finished:s.phase==='defendre'}}""")
 assert result=={'blocked':True,'unchanged':True,'finished':True},result
 browser.close()
print('CHROMIUM V1.40 OK')
