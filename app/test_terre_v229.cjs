const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8');
const source=html.split('<script>')[1].split('window.CombatCore=')[0]+html.match(/window\.CombatCore=\{[^;]+;/)[0];
const ctx={window:{},console};vm.createContext(ctx);vm.runInContext(source,ctx);const C=ctx.window.CombatCore;
function setup(){const s=C.createCombat(),a=C.addFighter(s,'Maître de Terre'),b=C.addFighter(s,'Adversaire');C.renameScene(s,'Historique antérieur');return {s,a,b};}
function atomic(s,run){const before=JSON.stringify(s),snapshots=s.snapshots.length;assert(snapshots>0);assert.throws(run);assert.equal(JSON.stringify(s),before,'échec atomique : historique et snapshots conservés');assert.equal(s.snapshots.length,snapshots);assert(C.undo(s),'undo précédent conservé');assert.equal(s.sceneTitle,'');}
// L'entretien de l'étoile déborde de fatigue : refus après création de l'événement.
{const {s,a}=setup();s.phase='fin';C.fighter(s,a).fatigue=5;s.temporaryEffects.push({id:'lava',originLabel:'Étoile de lave',targetId:a,originSourceId:a,label:'Étoile',duration:'scene',lavaExternalAdvantage:false});atomic(s,()=>C.resolveEarthLava(s,'lava','maintain',true));}
// Une Frappe supplémentaire de boue qui déborde doit conserver les annulations précédentes.
{const {s,a,b}=setup();s.phase='attaquer';C.fighter(s,b).fatigue=5;C.fighter(s,a).bonuses.push({type:'earth_mud_strike',targetId:b,round:s.round});atomic(s,()=>C.resolveEarthMudStrike(s,a,b,'fatigue','',true));}
// Une absorption manuelle d'armure qui laisse une fatigue excessive doit être entièrement annulée.
{const {s,a}=setup();C.fighter(s,a).fatigue=5;s.temporaryEffects.push({id:'armor',originLabel:'Armure de terre',targetId:a,originSourceId:a,label:'Armure',armorPoints:3,duration:'scene'});atomic(s,()=>C.resolveEarthArmorHit(s,'armor','fatigue',4,1,true));}
// L'interruption sismique fait payer trois fatigues à l'ennemi : débordement non arbitré.
{const {s,a,b}=setup();s.phase='defendre';C.fighter(s,b).fatigue=5;C.fighter(s,a).statuses.push('pret');C.fighter(s,a).bonuses.push({type:'earth_seismic_interrupt',round:s.round});atomic(s,()=>C.resolveEarthSeismicInterrupt(s,a,b,'pay',true));}
// Un bouclier dont l'historique est invalide doit restaurer sa fiche et les snapshots.
{const {s,a,b}=setup();s.temporaryEffects.push({id:'shield',originLabel:'Bouclier de roche',targetId:b,originSourceId:a,label:'Bouclier',duration:'scene',shieldGrantedGene:true});C.fighter(s,b).statuses.push('gene');s.history=null;const before=JSON.stringify(s);assert.throws(()=>C.mutateEarthShield(s,'shield','revoke',true));assert.equal(JSON.stringify(s),before);assert.equal(s.snapshots.length,1);}
console.log('V2.29 : cinq scénarios de rollback tardif, conservation intégrale des snapshots et undo OK');
