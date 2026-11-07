from pathlib import Path
from playwright.sync_api import sync_playwright
html=Path(__file__).with_name('simulateur.html').read_text()
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=browser.new_page()
 page.evaluate("""() => {const store={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=String(v),removeItem:k=>delete store[k]}})}""")
 page.set_content(html,wait_until='load')
 result=page.evaluate("""() => {const C=window.CombatCore,s=C.createCombat(),a=C.addFighter(s,'A'),b=C.addFighter(s,'B');C.setEngagement(s,a,b,true);s.phase='esquiver';C.fighter(s,a).approach='esquiver';const act={id:'v138',sourceId:a,targetId:b,name:'À contretemps',round:s.round,options:{countertimeConfirmed:true}};s.actions.push(act);C.propose(s,act);C.commit(s);const e=s.temporaryEffects.find(e=>e.originLabel==='À contretemps');s.phase='fin';C.nextRound(s);C.declare(s,b,'attaquer');const approach=C.revealCountertime(s,e.id,true);return {approach,ready:C.fighter(s,a).statuses.includes('pret'),marker:!!e}}""")
 assert result=={'approach':'attaquer','ready':True,'marker':True},result
 browser.close()
print('CHROMIUM V1.38 OK : À contretemps, statut Prêt et révélation différée')
