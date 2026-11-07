from pathlib import Path
from playwright.sync_api import sync_playwright
html=Path(__file__).with_name('simulateur.html').read_text()
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=browser.new_page();page.set_content(html,wait_until='load')
 result=page.evaluate("""() => {
 const C=window.CombatCore,s=C.createCombat(),a=C.addFighter(s,'A'),b=C.addFighter(s,'B');
 C.fighter(s,b).techniques=[{name:'Estocade précise',mastery:'maitrisee'}];
 s.phase='defendre';C.fighter(s,a).approach='defendre';
 const entry=TECH_CATALOG.find(x=>x.nom==='Désarmement');
 document.getElementById('tech').innerHTML='<option value="'+entry.id+'">Désarmement</option>';
 document.getElementById('source').innerHTML='<option value="'+a+'">A</option>';
 document.getElementById('target').innerHTML='<option value="'+b+'">B</option>';
 syncOptions();
 const form=!!document.getElementById('weaponDisarmConfirmed')&&!!document.getElementById('weaponDisarmTechnique');
 document.getElementById('weaponDisarmConfirmed').checked=true;
 document.getElementById('weaponDisarmTechnique').value='Estocade précise';
 const selected=document.getElementById('weaponDisarmTechnique').value;
 const act={id:'v142',sourceId:a,targetId:b,name:'Désarmement',round:s.round,options:{weaponDisarmConfirmed:document.getElementById('weaponDisarmConfirmed').checked,weaponDisarmTechnique:selected}};
 s.actions.push(act);C.propose(s,act);C.commit(s);
 return {form,selected,blocked:C.fighter(s,b).bonuses.some(x=>x.type==='disarmed_technique'&&x.name===selected),fatigue:C.fighter(s,a).fatigue};
 }""")
 assert result=={'form':True,'selected':'Estocade précise','blocked':True,'fatigue':2},result
 browser.close()
print('CHROMIUM V1.42 OK : formulaire Désarmement, coût et restriction')
