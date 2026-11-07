const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
const s=C.createCombat(),id=C.addFighter(s,'Maître de lave');const f=C.fighter(s,id);
f.statuses.push('avantage');s.temporaryEffects.push({id:'lava1',originLabel:'Étoile de lave',targetId:id,duration:'manual',lavaMaintainedRound:0,lavaExternalAdvantage:false});
assert.throws(()=>C.resolveEarthLava(s,'lava1','maintain',true),/fin de passe/);
s.phase='fin';assert.strictEqual(C.resolveEarthLava(s,'lava1','maintain',true),'maintained');assert.strictEqual(f.fatigue,1);
assert.throws(()=>C.resolveEarthLava(s,'lava1','maintain',true),/une seule fois/);
C.nextRound(s);assert.strictEqual(s.round,2);assert.strictEqual(s.temporaryEffects.length,1);
s.phase='fin';C.nextRound(s);assert.strictEqual(s.temporaryEffects.length,0);assert.strictEqual(f.statuses.includes('avantage'),false);
assert.strictEqual(C.undo(s),true); // restores last transactional maintenance snapshot, not nextRound
const t=C.createCombat(),tid=C.addFighter(t,'Autre');const tf=C.fighter(t,tid);tf.statuses.push('avantage');t.temporaryEffects.push({id:'lava2',originLabel:'Étoile de lave',targetId:tid,duration:'manual',lavaMaintainedRound:0,lavaExternalAdvantage:true});
C.resolveEarthLava(t,'lava2','extinguish',true);assert.strictEqual(tf.statuses.includes('avantage'),true);assert.strictEqual(t.temporaryEffects.length,0);C.undo(t);assert.strictEqual(t.temporaryEffects.length,1);
console.log('V1.71 lava lifecycle OK');
