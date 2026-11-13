from _paths import APP_DIR, APP_HTML, CHROMIUM_EXECUTABLE
from pathlib import Path
from playwright.sync_api import sync_playwright
p=APP_DIR
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path=CHROMIUM_EXECUTABLE,headless=True,args=['--no-sandbox'])
 page=b.new_page()
 errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.evaluate("""() => {const store={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=String(v),removeItem:k=>delete store[k]}})}""")
 page.set_content((p/'simulateur.html').read_text(),wait_until='load')
 page.on('dialog',lambda dialog:dialog.accept())
 for kind,status in [('Bouclier de roche','gene'),('Armure de terre','avantage')]:
  page.evaluate("""({kind,status})=>{s=CombatCore.createCombat();const a=CombatCore.addFighter(s,'Maître Terre');const b=CombatCore.addFighter(s,'Allié');CombatCore.fighter(s,b).statuses.push(status);s.temporaryEffects.push({id:'test-mech',targetId:b,originSourceId:a,originLabel:kind,label:kind,duration:'manual',originType:'technique',shieldGrantedGene:true,armorPoints:3});render()}""",{'kind':kind,'status':status})
  page.evaluate("document.querySelector('#temporaryEffects button[data-ui-click=\"removeTemporaryEffectUI\"]').click()")
  result=page.evaluate("""({status})=>({remaining:s.temporaryEffects.length,hasStatus:s.fighters[1].statuses.includes(status),saved:JSON.parse(localStorage.getItem('avatar-v020')).temporaryEffects.length,history:s.history.length})""",{'status':status})
  assert result=={'remaining':0,'hasStatus':False,'saved':0,'history':1},(kind,result)
 assert not errors,errors
 print('Chromium V1.61 : boutons Retirer Bouclier/Armure, statut, historique, sauvegarde locale OK')
 b.close()
