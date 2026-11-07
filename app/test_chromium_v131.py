import re
from pathlib import Path
VERSION = re.search(r'<title>[^<]*(V[0-9]+\.[0-9]+)', Path(__file__).with_name('simulateur.html').read_text()).group(1)
EXPORT_VERSION = VERSION.lower().replace('.', '-')
"""V1.31: vrai cycle de décisions MJ dans Chromium (stockage simulé)."""
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).parent
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1280,'height':900});errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('dialog',lambda d:d.accept())
 page.evaluate("""() => {const store={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>Object.hasOwn(store,k)?store[k]:null,setItem:(k,v)=>store[k]=String(v),removeItem:k=>delete store[k]}})}""")
 page.set_content((root/'simulateur.html').read_text(encoding='utf8'),wait_until='load')
 assert VERSION in page.title()
 page.evaluate("setView('combat')")
 page.get_by_role('button',name='+ PNJ').click();page.get_by_role('button',name='+ PNJ').click()
 page.evaluate("s.phase='esquiver';s.fighters[0].approach='esquiver';render();setCombatTab('technique')")
 # Vérifier le formulaire réel, même si les maîtrises du PJ filtrent normalement le catalogue.
 page.evaluate("""() => {const tech=document.querySelector('#tech'),entry=TECH_CATALOG.find(x=>x.nom==='Souple comme un roseau');if(!entry)throw Error('Technique absente');const opt=document.createElement('option');opt.value=entry.id;opt.textContent=entry.nom;tech.appendChild(opt);tech.value=entry.id;syncOptions()}""")
 assert page.locator('#airReedPrediction').count()==1
 page.locator('#airReedPrediction').select_option('attaquer');page.locator('#airReedConfirmed').check()
 # Parcours MJ : proposer, refuser, proposer, approuver, annuler.
 page.evaluate("""() => {const a={id:'ui131a',round:s.round,sourceId:s.fighters[0].id,targetId:s.fighters[1].id,name:'Souple comme un roseau',approach:'esquiver',options:{airReedConfirmed:true,airReedPrediction:'attaquer'}};s.actions.push(a);CombatCore.propose(s,a);render()}""")
 assert page.evaluate('s.proposals.length')==2
 page.evaluate('reject()');assert page.evaluate('s.proposals.length')==0
 assert page.evaluate('s.fighters[0].fatigue')==0
 page.evaluate("""() => {const a={id:'ui131b',round:s.round,sourceId:s.fighters[0].id,targetId:s.fighters[1].id,name:'Souple comme un roseau',approach:'esquiver',options:{airReedConfirmed:true,airReedPrediction:'attaquer'}};s.actions.push(a);CombatCore.propose(s,a);render()}""")
 page.evaluate('approve()');assert page.evaluate('s.fighters[0].fatigue')==2
 assert page.evaluate('s.temporaryEffects.length')==1
 page.evaluate('back()');assert page.evaluate('s.fighters[0].fatigue')==0
 assert page.evaluate('s.temporaryEffects.length')==0
 assert not errors,errors
 browser.close()
print('CHROMIUM V1.31 OK : formulaire, refus MJ, approbation MJ, annulation')
