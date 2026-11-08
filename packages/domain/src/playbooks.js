// Extrait de a9079fa, app/simulateur.html. Voir extraction.json.

const PLAYBOOKS=[
 {id:'audacieux',name:'L’Audacieuse / L’Audacieux',principles:['Loyauté','Assurance'],stats:[1,1,0,-1],page:171},
 {id:'fripouille',name:'La Fripouille',principles:['Amitié','Survie'],stats:[1,0,-1,1],page:175},
 {id:'gardien',name:'La Gardienne / Le Gardien',principles:['Indépendance','Confiance'],stats:[-1,1,0,1],page:179},
 {id:'heritier',name:'L’Héritière / L’Héritier',principles:['Tradition','Progrès'],stats:[1,1,-1,0],page:183},
 {id:'icone',name:'L’Icône',principles:['Rôle','Liberté'],stats:[0,1,1,-1],page:187},
 {id:'idealiste',name:'L’Idéaliste',principles:['Pardon','Action'],stats:[0,-1,1,1],page:191},
 {id:'inflexible',name:'L’Inflexible',principles:['Résultats','Retenue'],stats:[0,1,-1,1],page:195},
 {id:'marteau',name:'Le Marteau',principles:['Force','Délicatesse'],stats:[1,-1,0,1],page:199},
 {id:'pilier',name:'Le Pilier',principles:['Soutien','Commandement'],stats:[1,0,1,-1],page:203},
 {id:'prodige',name:'Le Prodige',principles:['Excellence','Communauté'],stats:[-1,2,0,0],page:207}
];
const KEYS=['creativite','concentration','harmonie','enthousiasme'];
function byName(name){return PLAYBOOKS.find(p=>p.name===name)||null}
function initialStats(playbook,bonusKey){
 const p=typeof playbook==='string'?byName(playbook):playbook;
 if(!p)throw Error('Livret inconnu');
 if(!KEYS.includes(bonusKey))throw Error('Choisir une caractéristique à augmenter');
 const stats=Object.fromEntries(KEYS.map((key,i)=>[key,p.stats[i]+(key===bonusKey?1:0)]));
 if(Math.max(...Object.values(stats))>2)throw Error('Maximum +2 à la création');
 return stats;
}
function applyPreset(lib,id,livret,bonusKey){
 const p=byName(livret);if(!p)throw Error('Livret inconnu');
 const stats=initialStats(p,bonusKey);
 const c=lib.characters.find(x=>x.id===id);if(!c||c.kind!=='PJ')throw Error('PJ introuvable');
 // Do not change fatigue, conditions, techniques, notes, etc.
 return {livret:p.name,stats,principles:[...p.principles],balance:0,center:0};
}
const Playbooks={PLAYBOOKS,KEYS,byName,initialStats,applyPreset};
export { Playbooks };
