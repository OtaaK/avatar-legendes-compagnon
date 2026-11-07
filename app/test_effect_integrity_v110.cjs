const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);
const C=ctx.window.CombatCore;
const s=C.createCombat(),id=C.addFighter(s,'Toph');
assert.throws(()=>C.addTemporaryEffect(s,id,'Lien','scene',{type:'personnage'}),/Personnage d’origine requis/);
assert.equal(s.temporaryEffects.length,0);
const effectId=C.addTemporaryEffect(s,id,'Lien','scene',{type:'personnage',sourceId:id});
assert.equal(s.temporaryEffects[0].id,effectId);
C.undo(s);assert.equal(s.temporaryEffects.length,0);
// La création automatique ne peut pas franchir le plafond, et la validation échoue sans perdre les propositions.
s.temporaryEffects=Array.from({length:10000},(_,i)=>({id:'temp-'+(i+100),targetId:id,label:'repère',duration:'manual',createdRound:1,createdScene:1}));
s.actions.push({id:'a-test',round:1,sourceId:id,targetId:id,name:'Projection tellurique',approach:'defendre',options:{}});
s.proposals.push({id:'e-test',actionId:'a-test',sourceId:id,targetId:id,kind:'status_add',amount:0,detail:'avantage',reason:'Projection tellurique : devient Avantagé',round:1});
assert.throws(()=>C.commit(s),/Limite de 10 000 effets temporaires/);
assert.equal(s.temporaryEffects.length,10000);
assert.equal(s.proposals.length,1);
console.log('OK : provenance personnage obligatoire, undo, plafond atomique pour technique');
