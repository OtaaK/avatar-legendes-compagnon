from pathlib import Path
from playwright.sync_api import sync_playwright
html=Path(__file__).with_name('simulateur.html').read_text()
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=browser.new_page()
 page.evaluate("""() => {const d={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>d[k]??null,setItem:(k,v)=>d[k]=String(v),removeItem:k=>delete d[k]}})}""")
 page.set_content(html,wait_until='load')
 result=page.evaluate("""() => {
  const scene=CombatCore.createCombat(),a=CombatCore.addFighter(scene,'Héros'),b=CombatCore.addFighter(scene,'Ennemi');
  const act={id:'feinte-browser',sourceId:a,targetId:b,round:scene.round,name:'Feinte',approach:'analyser',options:{weaponFeintConfirmed:true,weaponFeintAttackers:[b],weaponFeintConditions:{[b]:'Confus'}}};
  scene.actions.push(act);CombatCore.propose(scene,act);CombatCore.commit(scene);
  if(!CombatCore.fighter(scene,b).conditions.includes('Confus'))throw Error('état manquant');
  const uiA=CombatCore.addFighter(s,'UI Héros'),uiB=CombatCore.addFighter(s,'UI Ennemi');
  const source=document.querySelector('#source');source.innerHTML='<option value="'+uiA+'">Héros</option>';source.value=uiA;
  const tech=document.querySelector('#tech');const entry=TECH_CATALOG.find(x=>x.nom==='Feinte');tech.innerHTML='<option value="'+entry.id+'">Feinte</option>';tech.value=entry.id;
  syncOptions();return {checkbox:!!document.querySelector('#weaponFeintConfirmed'),selects:document.querySelectorAll('.weapon-feint-condition').length};
 }""")
 assert result['checkbox'] and result['selects']>=1,result
 browser.close()
print('CHROMIUM V1.37 OK : Feinte moteur et formulaire')
