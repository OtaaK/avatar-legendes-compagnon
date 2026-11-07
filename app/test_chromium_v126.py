"""Parcours Chromium V1.26. Stockage mémoire simulé, pas de test de persistance réelle."""
from pathlib import Path
from playwright.sync_api import sync_playwright
html=Path(__file__).with_name('simulateur.html').read_text(encoding='utf8')
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1280,'height':900})
 errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.evaluate('''() => {const store={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>Object.hasOwn(store,k)?store[k]:null,setItem:(k,v)=>store[k]=String(v),removeItem:k=>delete store[k],clear:()=>{for(const k of Object.keys(store))delete store[k]}}})}''')
 page.set_content(html,wait_until='load')
 assert 'V1.34' in page.title()
 page.get_by_text('Ouvrir les personnages').click()
 page.get_by_role('button',name='+ Nouveau PJ').click()
 page.evaluate("setView('combat')")
 page.get_by_role('button',name='+ PJ').click()
 page.get_by_role('button',name='+ PNJ').click()
 page.evaluate("s.phase='defendre';s.fighters[0].approach='defendre';render();setCombatTab('technique')")
 # Contrôle du DOM et des options des deux nouvelles techniques.
 for name,selector in [('Vague d’air','#airWaveMode'),('Sphère d’air','#airSphereConfirmed')]:
  found=page.evaluate('''name => {const source=document.querySelector('#source');const tech=document.querySelector('#tech');const entry=TECH_CATALOG.find(x=>x.nom===name);if(!entry)return false;const opt=document.createElement('option');opt.value=entry.id;opt.textContent=name;tech.appendChild(opt);tech.value=entry.id;syncOptions();return true}''',name)
  assert found, f'Technique absente : {name}'
  assert page.locator(selector).count()==1, f'Options absentes : {name}'
 # Vérification du moteur dans le contexte réel Chromium, y compris validation et annulation.
 result=page.evaluate('''() => {const C=window.CombatCore;const state=C.createCombat();const a=C.addFighter(state,'Air'),b=C.addFighter(state,'Cible');const act={id:'browser-126',round:state.round,sourceId:a,targetId:b,name:'Vague d’air',approach:'defendre',options:{airWaveConfirmed:true,airWaveMode:'blast',airWaveTargets:[b]}};state.actions.push(act);const events=C.propose(state,act);C.commit(state);const after=C.fighter(state,b).fatigue;C.undo(state);return {after,undone:C.fighter(state,b).fatigue,events:events.length}}''')
 assert result['after']==2 and result['undone']==0 and result['events']>=2,result
 assert not errors,errors
 print('CHROMIUM OK : navigation, PJ/PNJ, options Vague/Sphère, moteur validation/annulation, aucune exception JS')
 browser.close()
