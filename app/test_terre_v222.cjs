const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
const clean=s=>JSON.stringify(s);
const s=C.createCombat(),id=C.addFighter(s,'Maître de Terre');const f=C.fighter(s,id);
f.statuses.push('piege');s.notes.push('Avant');s.history.push({round:1,phase:'test',events:[]});
const base=clean(s);s.proposals.push({id:'attente'});
assert.throws(()=>C.escapeTrap(s,id,3,[],true),/propositions en attente/);
assert.equal(f.fatigue,0);s.proposals=[];
C.escapeTrap(s,id,2,['Fragile'],true);
assert.equal(f.fatigue,2);assert(f.conditions.includes('Fragile'));assert(!f.statuses.includes('piege'));
assert.equal(s.snapshots.length,1);C.undo(s);assert.equal(clean(s),base);
// Erreur injectée tardivement dans le journal : aucun effet partiel ne subsiste.
const original=s.history;s.history=new Proxy(original,{get(t,k){if(k==='push')return ()=>{throw Error('journal indisponible')};return Reflect.get(t,k)}});
const before=clean(s);assert.throws(()=>C.escapeTrap(s,id,3,[],true),/journal indisponible/);
assert.equal(clean(s),before);assert.equal(C.fighter(s,id).fatigue,0);
console.log('V2.22 : libération atomique, propositions, annulation et échec tardif OK');
