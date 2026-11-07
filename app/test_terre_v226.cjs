const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(points=2){const s=C.createCombat(),a=C.addFighter(s,'Terre'),b=C.addFighter(s,'Adversaire');s.temporaryEffects.push({id:'arm',originLabel:'Armure de terre',targetId:a,armorPoints:points});return {s,a,b};}
function hit(s,b,a,attack,detail){const id='e'+s.seq++;s.proposals.push({id,actionId:attack,sourceId:b,targetId:a,kind:'condition',amount:0,detail,reason:'Attaque',round:s.round});return id;}
// Le même état, absorbé à l'attaque A, DOIT rester applicable à l'attaque B.
{const {s,a,b}=setup(1);const c1=hit(s,b,a,'A','fragile'),c2=hit(s,b,a,'B','fragile');C.commit(s,{['armor:'+c1]:1});assert(C.fighter(s,a).conditions.includes('fragile'),'La seconde attaque doit infliger Fragile');assert(!s.temporaryEffects.find(x=>x.id==='arm')?.armorPoints);C.undo(s);assert.equal(C.fighter(s,a).conditions.length,0);}
// Deux occurrences de la même condition dans UNE attaque restent absorbées ensemble.
{const {s,a,b}=setup(1);hit(s,b,a,'A','fragile');hit(s,b,a,'A','fragile');C.commit(s);assert(!C.fighter(s,a).conditions.includes('fragile'));}
// L'armure peut absorber les deux attaques distinctes, au prix de deux points.
{const {s,a,b}=setup();const c1=hit(s,b,a,'A','fragile'),c2=hit(s,b,a,'B','fragile');C.commit(s,{['armor:'+c1]:1,['armor:'+c2]:1});assert(!C.fighter(s,a).conditions.includes('fragile'));assert(!s.temporaryEffects.find(x=>x.id==='arm')?.armorPoints);}
console.log('V2.26 : absorption limitée à une attaque, répétitions, deux attaques et annulation OK');
