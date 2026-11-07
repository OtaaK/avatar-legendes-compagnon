"""Imports sans perte : données invalides, panne de rendu/stockage et round-trip complet."""
from _paths import APP_DIR, CHROMIUM_EXECUTABLE
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from threading import Thread
import json
from playwright.sync_api import sync_playwright

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self,*args):
        pass

server=ThreadingHTTPServer(('127.0.0.1',0),partial(QuietHandler,directory=str(APP_DIR)))
Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_port}/simulateur.html'
count=0
try:
    with sync_playwright() as pw:
        browser=pw.chromium.launch(executable_path=CHROMIUM_EXECUTABLE,headless=True,args=['--no-sandbox'])
        for mode in ['engagements','trap','combat_render','complete_render','roster_render','combat_storage','roster_storage','complete_storage','complete_cancel','complete_read']:
            context=browser.new_context();page=context.new_page();alerts=[];errors=[];confirmations=[]
            def dialog(d):
                if d.type=='alert':alerts.append(d.message)
                if d.type=='confirm':confirmations.append(d.message)
                if d.type=='confirm' and mode=='complete_cancel':d.dismiss()
                else:d.accept()
            page.on('dialog',dialog);page.on('pageerror',lambda e:errors.append(str(e)))
            page.goto(url)
            page.evaluate("""() => {
                lib=Roster.createLibrary();const c=Roster.createCharacter(lib,'Fiche précédente','PNJ');
                s=CombatCore.createCombat();Roster.addToCombat(lib,s,c.id);CombatCore.addFighter(s,'Autre','PNJ');
                CombatCore.setEngagement(s,s.fighters[0].id,s.fighters[1].id,true);
                if(!persistCompleteBackup(lib,s))throw Error('Préparation non enregistrée');
                renderSheets();render();setView('combat');setCombatTab('fighters');
            }""")
            before=page.evaluate("({library:lib,combat:s,libraryRaw:localStorage.getItem('avatar-roster-v020'),combatRaw:localStorage.getItem('avatar-v020')})")
            backup=page.evaluate("({format:'avatar-compagnon-backup',version:1,library:JSON.parse(JSON.stringify(lib)),combat:JSON.parse(JSON.stringify(s))})")
            backup['library']['characters'][0]['name']='Fiche importée'
            backup['combat']['fighters'][0]['name']='Combat importé'
            if mode=='engagements':backup['combat']['engagements']={'invalid':True}
            if mode=='trap':backup['combat']['traps']=[{'id':'trap-e-1','ownerId':'absent','zone':'Passage','round':1}]
            if mode.endswith('_render'):
                page.evaluate("""() => {
                    const original=render;let once=true;window.modelWrites=[];
                    const write=Storage.prototype.setItem;
                    Storage.prototype.setItem=function(key,value){if(['avatar-roster-v020','avatar-v020'].includes(key))modelWrites.push(key);return write.call(this,key,value)};
                    render=function(){if(once){once=false;throw Error('Rendu interrompu pour test')}return original()};
                }""")
            if mode in ['complete_storage','combat_storage','roster_storage']:
                page.evaluate("""targetKey => {
                    const write=Storage.prototype.setItem;let once=true;
                    Storage.prototype.setItem=function(key,value){if(key===targetKey&&once){once=false;throw new DOMException('Stockage interrompu pour test','QuotaExceededError')}return write.call(this,key,value)};
                }""", 'avatar-roster-v020' if mode=='roster_storage' else 'avatar-v020')
            if mode=='complete_read':
                page.evaluate("""() => {
                    window.readTarget={value:'test',files:[{text:()=>Promise.reject(Error('Lecture interrompue pour test'))}]};
                    importCompleteBackup({target:readTarget});
                }""")
                page.wait_for_function("readTarget.value===''")
            else:
                if mode in ['engagements','combat_render','combat_storage']:
                    selector='#importFile';payload=backup['combat']
                elif mode in ['roster_render','roster_storage']:
                    selector='#rosterFile';payload=backup['library']
                else:
                    selector='input[onchange="importCompleteBackup(event)"]';payload=backup
                page.locator(selector).set_input_files({'name':'test-import.json','mimeType':'application/json','buffer':json.dumps(payload).encode()})
                page.wait_for_function("selector=>document.querySelector(selector).value===''",arg=selector)
            after=page.evaluate("({library:lib,combat:s,libraryRaw:localStorage.getItem('avatar-roster-v020'),combatRaw:localStorage.getItem('avatar-v020')})")
            assert after==before,(mode,after,before)
            if mode=='complete_cancel':
                assert not alerts,alerts
                assert len(confirmations)==1,confirmations
            else:assert alerts,(mode,'Erreur attendue non signalée')
            if mode in ['engagements','trap']:assert not confirmations,(mode,confirmations)
            if mode.endswith('_render'):
                assert 'Rendu interrompu' in alerts[-1],alerts
                assert page.evaluate('modelWrites')==[],(mode,'Écriture avant validation du rendu')
            if mode=='complete_read':assert 'Lecture de la sauvegarde impossible' in alerts[-1],alerts
            assert page.evaluate("localStorage.getItem('avatar-complete-import-journal-v1')") is None
            assert not errors,(mode,errors)
            page.reload()
            assert page.evaluate('({library:lib,combat:s})')=={'library':before['library'],'combat':before['combat']},mode
            count+=1;context.close()
        # Export/restauration d'un vrai combat comportant des effets, liens, piège et instantanés.
        context=browser.new_context(accept_downloads=True);page=context.new_page();errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto(url)
        page.evaluate("""() => {
            lib=Roster.createLibrary();const a=Roster.createCharacter(lib,'Gardien de test','PNJ'),b=Roster.createCharacter(lib,'Visiteur de test','PNJ');
            Roster.updateCharacter(lib,a.id,{location:'Lieu fictif',notes:'Test de sauvegarde',conditions:['Confus']});
            lib.fixtureMetadata={preserved:true};s=CombatCore.createCombat();s.fixtureMetadata={preserved:true};
            const source=Roster.addToCombat(lib,s,a.id).id,target=Roster.addToCombat(lib,s,b.id).id;
            CombatCore.setEngagement(s,source,target,true);
            const cast=(name,options,phase)=>{s.phase=phase;CombatCore.fighter(s,source).approach=phase;const action={id:'backup-action-'+s.seq++,sourceId:source,targetId:target,round:s.round,name,approach:phase,options};s.actions.push(action);CombatCore.propose(s,action);CombatCore.commit(s);};
            cast('Armure de terre',{earthArmorConfirmed:true},'defendre');
            cast('Étoile de lave',{earthLavaConfirmed:true},'defendre');
            cast('Pose de pièges',{trapZone:'Passage fictif'},'esquiver');
            CombatCore.endRound(s);CombatCore.resolveEarthLava(s,s.temporaryEffects.find(e=>e.originLabel==='Étoile de lave').id,'maintain',true);CombatCore.nextRound(s);
            if(!persistCompleteBackup(lib,s))throw Error('Préparation non enregistrée');
            renderSheets();render();setView('characters');
        }""")
        with page.expect_download() as pending:
            page.get_by_role('button',name='Sauvegarder tout (fiches + combat)',exact=True).click()
        raw=Path(pending.value.path()).read_bytes();backup=json.loads(raw)
        assert backup['combat']['round']==2 and len(backup['combat']['temporaryEffects'])==2 and len(backup['combat']['traps'])==1
        assert len(backup['combat']['snapshots'])>=5
        assert not errors,errors
        context.close()
        context=browser.new_context();page=context.new_page();errors=[];alerts=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.on('dialog',lambda d:(alerts.append(d.message) if d.type=='alert' else None,d.accept()))
        page.goto(url)
        page.locator('input[onchange="importCompleteBackup(event)"]').set_input_files({'name':'sauvegarde-test.json','mimeType':'application/json','buffer':raw})
        page.wait_for_function('s.round===2&&s.fighters.length===2')
        assert page.evaluate('({library:lib,combat:s})')=={'library':backup['library'],'combat':backup['combat']}
        page.reload()
        assert page.evaluate('({library:lib,combat:s})')=={'library':backup['library'],'combat':backup['combat']}
        page.get_by_role('button',name='Combats',exact=True).click()
        page.get_by_role('button',name='Annuler dernière validation',exact=True).click()
        undo=backup['combat']['snapshots'][-1].copy();undo['snapshots']=backup['combat']['snapshots'][:-1]
        assert page.evaluate('s')==undo
        page.reload();assert page.evaluate('s')==undo
        assert not alerts,alerts
        assert not errors,errors
        count+=1;context.close();browser.close()
finally:
    server.shutdown();server.server_close()
print(f'Fiabilité imports : {count} parcours, refus sans perte, panne de rendu/stockage, lecture, export-restauration et undo après rechargement OK')
