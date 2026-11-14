

'use strict';
const APPROACH_NAME={defendre:'Défendre et prendre à revers',attaquer:'Avancer et attaquer',esquiver:'Esquiver et analyser'};
const LIVRETS=['L’Audacieuse / L’Audacieux','La Fripouille','La Gardienne / Le Gardien','L’Héritière / L’Héritier','L’Icône','L’Idéaliste','L’Inflexible','Le Marteau','Le Pilier','Le Prodige'];
function masteryFor(f,tech){
 if(tech.famille==='base')return 'base';
 return (f.techniques||[]).find(t=>t.name===tech.nom)?.mastery||null;
}
function available(f,tech,phase){
 if(tech.approche!==APPROACH_NAME[phase])return {ok:false,reason:'Autre approche'};
 if(f.kind==='PJ'&&tech.accessible_pj===false)return {ok:false,reason:'Réservée aux PNJ'};
 if(f.kind==='PJ'&&tech.famille!=='base'&&!masteryFor(f,tech))return {ok:false,reason:'Non apprise'};
 if(f.kind==='PJ'&&f.roll==='6-'&&tech.famille!=='base')return {ok:false,reason:'Échec : technique de base uniquement'};
 if(f.kind==='PJ'&&f.roll==='7-9'&&tech.famille!=='base'&&masteryFor(f,tech)!=='maitrisee')return {ok:false,reason:'Sur 7–9 : technique de base ou maîtrisée'};
 return {ok:true,reason:''};
}
function postureCost(f,tech,options={}){
 const level=masteryFor(f,tech);
 if(f.kind!=='PJ')return {kind:'none',amount:0};
 if(f.roll==='6-')return {kind:'balance',amount:1};
 if(f.roll==='10+'&&level==='acquise')return {kind:'fatigue',amount:1};
 return {kind:'none',amount:0};
}
function validateChoice(f,tech,phase,options={}){
 const a=available(f,tech,phase);if(!a.ok)throw Error(a.reason);
 if(f.kind==='PJ'&&f.roll==='10+'&&tech.famille!=='base'&&masteryFor(f,tech)==='pratiquee'&&options.mode==='double')throw Error('Deux techniques : de base ou maîtrisées uniquement');
 if(f.kind==='PJ'&&f.roll==='10+'&&tech.famille!=='base'&&masteryFor(f,tech)==='acquise'&&options.mode==='double')throw Error('Technique acquise : choisir une seule technique avec coût de fatigue');
 return true;
}
window.CombatRules={APPROACH_NAME,LIVRETS,masteryFor,available,postureCost,validateChoice};


