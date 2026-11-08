// Extrait de a9079fa, app/simulateur.html. Voir extraction.json.

// Profils PNJ explicites. L'absence de profil conserve strictement la V2.33 historique.
function npcResourceProfile(entity){
 const p=entity.npcResources;if(p===undefined||p===null)return null;
 if(entity.kind!=='PNJ'||!p||typeof p!=='object'||Array.isArray(p)||p.version!==1||p.format!=='avatar-npc-resources'||typeof p.combatant!=='boolean')throw Error('Profil de ressources PNJ invalide ou non pris en charge');
 if(!Number.isInteger(p.fatigueMax)||p.fatigueMax<0||p.fatigueMax>15||!Number.isInteger(p.balanceMax)||p.balanceMax<0||p.balanceMax>4||!Array.isArray(p.conditions)||p.conditions.length>8||p.conditions.some(x=>typeof x!=='string'||!x.trim()||x!==x.trim()||x.length>80)||new Set(p.conditions).size!==p.conditions.length)throw Error('Capacités ou états du profil PNJ invalides');
 if(p.combatant?(p.fatigueMax<1||p.conditions.length<1):(p.fatigueMax!==0||p.conditions.length!==0))throw Error('Profil de PNJ combattant/non combattant incohérent');
 return p;
}
function resourceLimits(entity){const p=npcResourceProfile(entity);return p?{fatigueMax:p.fatigueMax,balanceMin:0,balanceMax:p.balanceMax,conditions:p.conditions,combatant:p.combatant,explicit:true}:{fatigueMax:5,balanceMin:-3,balanceMax:3,conditions:['Terrifié','En colère','Coupable','Fragile','Confus'],combatant:true,explicit:false};}
function fatigueLimit(entity){return resourceLimits(entity).fatigueMax;}
function resourceConditionNames(entity){return resourceLimits(entity).conditions;}
function balanceValue(entity,value,strict=false){const r=resourceLimits(entity);if(strict&&r.explicit&&(value>r.balanceMax||r.balanceMax===0&&value!==entity.balance))throw Error('Dépassement ou absence d’équilibre PNJ : arbitrage du MJ requis avant de poursuivre.');if(r.explicit&&!strict&&value>r.balanceMax)return value;return Math.max(r.balanceMin,Math.min(r.balanceMax,value));}
function validateResourceValues(entity){const r=resourceLimits(entity);if(!Number.isInteger(entity.fatigue)||entity.fatigue<0||entity.fatigue>r.fatigueMax||!Number.isInteger(entity.balance)||entity.balance<r.balanceMin||entity.balance>r.balanceMax)throw Error('Ressources incompatibles avec le profil : ajuste explicitement les valeurs avant d’enregistrer.');if(r.explicit&&r.balanceMax>0&&(!Array.isArray(entity.principles)||entity.principles.length!==2||typeof entity.principles[0]!=='string'||!entity.principles[0].trim()||entity.principles[0].length>80))throw Error('Renseigne le principe du PNJ avant d’activer sa jauge d’équilibre.');if(r.explicit&&(!Array.isArray(entity.conditions)||entity.conditions.some(x=>!r.conditions.includes(x))||new Set(entity.conditions).size!==entity.conditions.length))throw Error('États cochés incompatibles avec le profil : aucune suppression automatique.');return r;}
function hasNpcResourceProfiles(library,combat){return !!library?.characters?.some(c=>c.npcResources)||!!combat?.fighters?.some(f=>f.npcResources)||!!combat?.snapshots?.some(s=>hasNpcResourceProfiles(null,s));}
const ResourceRules={profile:npcResourceProfile,limits:resourceLimits,validate:validateResourceValues,fatigueMax:fatigueLimit,conditions:resourceConditionNames,balance:balanceValue,hasProfiles:hasNpcResourceProfiles};
export { ResourceRules, npcResourceProfile, resourceLimits, validateResourceValues, fatigueLimit, resourceConditionNames, balanceValue };
