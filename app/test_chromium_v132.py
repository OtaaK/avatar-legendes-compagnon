"""V1.32 : bouton de révélation MJ et confidentialité du pari dans Chromium."""
from pathlib import Path
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=browser.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('dialog',lambda d:d.accept())
 page.evaluate("""() => {const data={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=v,removeItem:k=>delete data[k]}})}""")
 page.set_content((Path(__file__).parent/'simulateur.html').read_text(),wait_until='load')
 page.evaluate("""() => {const a=CombatCore.addFighter(s,'Air'),b=CombatCore.addFighter(s,'Ennemi');const act={id:'reed-browser',round:s.round,sourceId:a,targetId:b,name:'Souple comme un roseau',approach:'esquiver',options:{airReedConfirmed:true,airReedPrediction:'attaquer'}};s.actions.push(act);CombatCore.propose(s,act);CombatCore.commit(s);s.phase='fin';CombatCore.nextRound(s);CombatCore.declare(s,a,'esquiver');CombatCore.declare(s,b,'attaquer');CombatCore.reveal(s);render()}""")
 assert page.locator('#temporaryEffects').get_by_text('prédiction scellée',exact=False).count()>0
 assert 'pari sur attaquer' not in page.locator('#temporaryEffects').inner_text()
 page.locator('#temporaryEffects button').filter(has_text='Révéler (MJ)').evaluate("el=>el.click()")
 assert page.evaluate("s.temporaryEffects[0].reedResolved") is True
 assert page.evaluate("s.fighters[0].activeStatuses.includes('avantage')") is True
 assert page.locator('#temporaryEffects').get_by_role('button',name='Révéler (MJ)').count()==0
 assert not errors,errors
 browser.close()
print('CHROMIUM V1.32 OK : pari scellé, révélation MJ, effet immédiat')
