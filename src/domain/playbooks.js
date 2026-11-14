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
window.Playbooks={PLAYBOOKS,KEYS,byName,initialStats,applyPreset};



