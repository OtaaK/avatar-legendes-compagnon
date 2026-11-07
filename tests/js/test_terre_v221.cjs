const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function init(){const s=C.createCombat(),a=C.addFighter(s,'Maître de Terre A'),b=C.addFighter(s,'Maître de Terre B'),c=C.addFighter(s,'Ennemi','PNJ');return {s,a,b,c};}
// Trois manières de se libérer : fatigue, état, coût mixte, avec retour exact.
for(const [fatigue,conditions] of [[3,[]],[0,['Terrifié','En colère','Confus']],[1,['Fragile','Coupable']]]){
 const {s,a}=init();const f=C.fighter(s,a);f.statuses.push('piege');f.fatigue=1;const before=JSON.stringify(s);
 if(fatigue===3){f.fatigue=0;}const prior=JSON.stringify(s);
 C.escapeTrap(s,a,fatigue,conditions,true);
 assert(!f.statuses.includes('piege'));assert.equal(f.fatigue,(fatigue===3?0:1)+fatigue);assert.equal(s.snapshots.length,1);assert.equal(s.history.at(-1).events[0].kind,'trap_escape');
 assert(C.undo(s));assert.equal(JSON.stringify(s),prior);assert.equal(s.snapshots.length,0);
}
// Tous les refus sont sans effet et ne créent ni historique ni sauvegarde.
for(const [fatigue,conditions,confirmed] of [[3,[],false],[2,[],true],[0,['Fragile','Fragile','Confus'],true],[4,[],true]]){
 const {s,a}=init();C.fighter(s,a).statuses.push('piege');const prior=JSON.stringify(s);
 assert.throws(()=>C.escapeTrap(s,a,fatigue,conditions,confirmed));assert.equal(JSON.stringify(s),prior);
}
// Combat multi-passes : Piégé au milieu du combat, libération, progression,
// puis annulation en chaîne à travers les deux passes et la libération.
{const {s,a,b,c}=init();for(const id of [a,b,c])C.fighter(s,id).approach='defendre';
 C.reveal(s);C.advance(s);C.advance(s);C.endRound(s);C.nextRound(s);
 C.fighter(s,c).statuses.push('piege');const prior=JSON.stringify(s);
 C.escapeTrap(s,c,1,['Terrifié','Confus'],true);assert(!C.fighter(s,c).statuses.includes('piege'));
 for(const id of [a,b,c])C.fighter(s,id).approach='esquiver';
 C.reveal(s);C.advance(s);C.advance(s);C.endRound(s);C.nextRound(s);
 assert.equal(s.round,3);assert(C.undo(s));assert(C.undo(s));assert(C.undo(s));
 assert.equal(JSON.stringify(s),prior,'annuler passe 2 et libération restaure le combat antérieur');
 assert(C.undo(s));assert(C.undo(s));assert.equal(s.round,1);
}
console.log('V2.21 : libération Piégé réversible, refus atomiques et combat multi-passes OK');
