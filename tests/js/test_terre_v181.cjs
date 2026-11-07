const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
// La transition doit pouvoir être annulée sans effacer une opération antérieure.
{const s=C.createCombat(),id=C.addFighter(s,'Terre');const f=C.fighter(s,id);
 s.phase='fin';f.statuses=['avantage','en_danger'];f.fatigue=5;
 s.temporaryEffects=[{id:'lava',targetId:id,originLabel:'Étoile de lave',lavaMaintainedRound:0,lavaExternalAdvantage:false}];
 const previous=JSON.stringify({...s,snapshots:[]});
 C.nextRound(s,{[id]:'Confus'});
 assert.equal(s.round,2);assert.equal(f.conditions[0],'Confus');assert.equal(s.temporaryEffects.length,0);
 assert.equal(s.history.at(-1).events[0].kind,'next_round');
 C.undo(s);assert.equal(JSON.stringify({...s,snapshots:[],reedProtections:undefined}),JSON.stringify({...JSON.parse(previous),reedProtections:undefined}));
}
// Une validation impossible ne doit pas ajouter de snapshot.
{const s=C.createCombat(),id=C.addFighter(s,'Terre');const f=C.fighter(s,id);
 s.phase='fin';f.statuses=['en_danger'];f.fatigue=5;
 assert.throws(()=>C.nextRound(s,{}),/état libre/);assert.equal(s.snapshots.length,0);assert.equal(s.round,1);
}
// Une étoile entretenue et une armure conservent leurs avantages après la transition et après Annuler.
{const s=C.createCombat(),id=C.addFighter(s,'Terre');const f=C.fighter(s,id);
 s.phase='fin';f.statuses=['avantage'];s.temporaryEffects=[{id:'lava',targetId:id,originLabel:'Étoile de lave',lavaMaintainedRound:1,lavaExternalAdvantage:false},{id:'armor',targetId:id,originLabel:'Armure de terre',armorPoints:2}];
 C.nextRound(s);assert(f.statuses.includes('avantage'));assert.equal(s.temporaryEffects.length,2);
 C.undo(s);assert.equal(s.round,1);assert.equal(s.phase,'fin');assert.equal(s.temporaryEffects.length,2);
}
console.log('V1.81 : transition de passe annulable, expiration et En danger OK');
