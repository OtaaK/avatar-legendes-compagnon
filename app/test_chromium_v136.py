from pathlib import Path
from playwright.sync_api import sync_playwright
html=Path(__file__).with_name('simulateur.html').read_text()
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=browser.new_page()
 page.evaluate("""() => {const d={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>d[k]??null,setItem:(k,v)=>d[k]=String(v),removeItem:k=>delete d[k]}})}""")
 page.set_content(html,wait_until='load')
 result=page.evaluate("""() => {
  const s=CombatCore.createCombat(),a=CombatCore.addFighter(s,'A'),b=CombatCore.addFighter(s,'B');
  const cases=[['Estocade précise',{weaponPiercingConfirmed:true,weaponMoveExtra:false}],['Clouer une mouche contre un tronc d’arbre',{weaponArrowsConfirmed:true,weaponArrowCost:3}],['Position surélevée',{weaponHighGroundConfirmed:true}]];
  return cases.map(([name,options],i)=>{const act={id:'browser-'+i,sourceId:a,targetId:b,round:s.round,name,approach:'attaquer',options};s.actions.push(act);const es=CombatCore.propose(s,act);if(!es.length)throw Error(name+' sans effet');CombatCore.commit(s);return name});
 }""")
 assert len(result)==3,result
 browser.close()
print('CHROMIUM V1.36 OK : trois techniques proposées et validées dans le navigateur')
