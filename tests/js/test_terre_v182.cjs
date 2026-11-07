const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(name,options={}){const s=C.createCombat(),a=C.addFighter(s,'Terre','PNJ'),b=C.addFighter(s,'Cible','PNJ');const action={id:'test182',name,sourceId:a,targetId:b,options};return {s,a,b,action};}
function prep(o){o.s.actions.push(o.action);o.s.proposals=C.propose(o.s,o.action);}
for(const name of ['Colonne de pierre','Mouvements tectoniques']){
 const options=name==='Mouvements tectoniques'?{tectonicTargets:[],tectonicZone:false}:{};
 const o=setup(name,options);if(name==='Mouvements tectoniques')o.action.options.tectonicTargets=[o.b];prep(o);
 C.fighter(o.s,o.b).statuses.push('gene');
 assert.throws(()=>C.commit(o.s),/statut de la cible modifié/);
 assert.equal(C.fighter(o.s,o.b).statuses.includes('piege'),false);
 assert.equal(o.s.history.length,0);
 const decisions=Object.fromEntries(o.s.proposals.map(e=>[e.id,false]));C.commit(o.s,decisions);
 assert.equal(C.fighter(o.s,o.b).statuses.includes('piege'),false);
 const clean=setup(name,name==='Mouvements tectoniques'?{tectonicTargets:[],tectonicZone:false}:{});
 if(name==='Mouvements tectoniques')clean.action.options.tectonicTargets=[clean.b];prep(clean);C.commit(clean.s);
 assert(C.fighter(clean.s,clean.b).statuses.includes('gene'));
}
console.log('Terre V1.82 : escalades revalidées, refus total autorisé, mutations atomiques');
