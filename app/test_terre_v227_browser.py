from playwright.sync_api import sync_playwright
from pathlib import Path
h=Path('/mnt/data/avatar_compagnon_v2_27/simulateur.html').read_text()
with sync_playwright() as w:
 b=w.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=b.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(h,wait_until='load')
 setup='''s=CombatCore.createCombat();const a=CombatCore.addFighter(s,'Terre');const b=CombatCore.addFighter(s,'Ennemi');s.temporaryEffects.push({id:'armor',originLabel:'Armure de terre',targetId:a,armorPoints:1});for(const detail of ['fragile','terrifié']){const id='e'+s.seq++;s.proposals.push({id,actionId:'attack',sourceId:b,targetId:a,kind:'condition',amount:0,detail,reason:'Attaque',round:s.round});}render();'''
 page.evaluate(setup+';persist=(key,value)=>{if(value!==undefined)window.savedCombat=JSON.parse(JSON.stringify(value));return true};')
 result=page.evaluate('''() => {let prompts=[];window.prompt=(msg,def)=>{prompts.push(msg);return '1'};window.alert=(msg)=>{throw Error(msg)};approve();return {prompts,conditions:s.fighters[0].conditions,armor:s.temporaryEffects.find(e=>e.id==='armor')?.armorPoints??0,stored:window.savedCombat.fighters[0].conditions}}''')
 print('BROWSER',result,'ERRORS',errors)
 assert len(result['prompts'])==1,result
 assert result['conditions']==['terrifié'],result
 assert result['stored']==result['conditions']
 page.evaluate('back()')
 assert page.evaluate('s.fighters[0].conditions.length')==0
 b.close()
