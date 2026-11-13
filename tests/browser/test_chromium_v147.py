from _paths import APP_DIR, APP_HTML, CHROMIUM_EXECUTABLE
from pathlib import Path
from playwright.sync_api import sync_playwright
p=APP_DIR
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path=CHROMIUM_EXECUTABLE,headless=True,args=['--no-sandbox'])
 page=b.new_page()
 page.evaluate("""() => {const store={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=String(v),removeItem:k=>delete store[k]}})}""")
 page.set_content((p/'simulateur.html').read_text(),wait_until='load')
 page.on('dialog',lambda dialog:dialog.accept())
 def setup(status=None):
  page.evaluate("""(status)=>{s=CombatCore.createCombat();const a=CombatCore.addFighter(s,'Bénéficiaire'),b=CombatCore.addFighter(s,'Adversaire');s.round=2;s.phase='declaration';if(status)CombatCore.fighter(s,b).statuses.push(status);else CombatCore.declare(s,b,'attaquer');s.temporaryEffects.push({id:'ct',label:'Révélation différée',originType:'technique',originLabel:'À contretemps',targetId:a,countertimeOpponentId:b,countertimeResolved:false,createdRound:1,expiresAfterRound:2,duration:'round'});render()}""",status)
 setup('etourdi')
 assert page.get_by_role('button',name='Arbitrer impossibilité (MJ)',include_hidden=True).count()==1
 page.evaluate("document.querySelector('#temporaryEffects button[data-ui-click=\"waiveCountertimeUI\"]').click()")
 waived=page.evaluate("""()=>({resolved:s.temporaryEffects[0].countertimeResolved,waived:s.temporaryEffects[0].countertimeWaived,saved:JSON.parse(localStorage.getItem('avatar-v020')).temporaryEffects[0].countertimeWaived})""")
 assert waived=={'resolved':True,'waived':True,'saved':True},waived
 setup()
 page.evaluate("document.querySelector('#temporaryEffects button[data-ui-click=\"revealCountertimeUI\"]').click()")
 revealed=page.evaluate("""()=>({resolved:s.temporaryEffects[0].countertimeResolved,saved:JSON.parse(localStorage.getItem('avatar-v020')).temporaryEffects[0].countertimeResolved})""")
 assert revealed=={'resolved':True,'saved':True},revealed
 print('Chromium V1.47 : deux boutons MJ fonctionnels et persistés')
 b.close()
