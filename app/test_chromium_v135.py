"""V1.35: contrôle strict des expirations lors d'une restauration JSON."""
from pathlib import Path
from playwright.sync_api import sync_playwright
html=(Path(__file__).parent/'simulateur.html').read_text()
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=browser.new_page()
 page.evaluate("""() => {const store={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=String(v),removeItem:k=>delete store[k]}})}""")
 page.set_content(html,wait_until='load')
 result=page.evaluate('''() => {
  const f=CombatCore.addFighter(s,'Test V135');
  const base=JSON.parse(JSON.stringify(s));
  base.temporaryEffects=[{id:'temp-999',targetId:f,label:'Test',duration:'round',createdRound:1,createdScene:1,expiresAfterRound:2}];
  const check=(value)=>{const x=JSON.parse(JSON.stringify(base));x.temporaryEffects[0].expiresAfterRound=value;try{validateCombat(x);return true}catch(e){return false}};
  return {valid:check(2),fraction:check(1.5),negative:check(-1),text:check('2'),distant:check(999999)};
 }''')
 assert result=={'valid':True,'fraction':False,'negative':False,'text':False,'distant':False},result
 browser.close()
print('CHROMIUM V1.35 OK : import valide et expirations malformées refusées')
