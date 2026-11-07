from _paths import APP_DIR, APP_HTML, CHROMIUM_EXECUTABLE
from pathlib import Path
from playwright.sync_api import sync_playwright
p=APP_DIR
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path=CHROMIUM_EXECUTABLE,headless=True,args=['--no-sandbox'])
 page=b.new_page()
 page.evaluate("""() => {const store={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=String(v),removeItem:k=>delete store[k]}})}""")
 page.set_content((p/'simulateur.html').read_text(),wait_until='load')
 result=page.evaluate("""() => {
  const e=TECH_CATALOG.find(x=>x.nom==='Contre-attaque');
  if(!e)throw Error('Catalogue manquant');
  const x=CombatCore.createCombat(),a=CombatCore.addFighter(x,'A'),b=CombatCore.addFighter(x,'B');
  x.phase='defendre';CombatCore.fighter(x,a).approach='defendre';CombatCore.fighter(x,b).approach='attaquer';CombatCore.setEngagement(x,a,b,true);
  const act={id:'ui143',round:x.round,sourceId:a,targetId:b,name:'Contre-attaque',options:{weaponCounterConfirmed:true,choice:'condition',condition:'Confus'}};
  CombatCore.propose(x,act);
  return {catalogue:e.approche,events:x.proposals.map(e=>e.kind),help:document.body.textContent.includes('Avatar')};
 }""")
 assert result['catalogue']=='Défendre et prendre à revers',result
 assert result['events']==['condition'],result
 print('Chromium V1.43 : catalogue, moteur et DOM chargés')
 b.close()
