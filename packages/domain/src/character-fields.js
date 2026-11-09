// Extrait de a9079fa, app/simulateur.html. Voir extraction.json.
import { npcResourceProfile, resourceLimits, validateResourceValues, fatigueLimit, resourceConditionNames, balanceValue } from './resources.js';
import { Roster } from './roster.js';
import { BookState } from './books.js';
function safeSheetPortrait(value){
 if(typeof value!=='string'||value.length>360000)return '';
 const m=value.match(/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/);if(!m)return '';
 try{const bytes=atob(m[2]);return (m[1]==='png'&&bytes.slice(0,8)==='\x89PNG\r\n\x1a\n'||m[1]==='jpeg'&&bytes.slice(0,3)==='\xff\xd8\xff'||m[1]==='webp'&&bytes.slice(0,4)==='RIFF'&&bytes.slice(8,12)==='WEBP')?value:''}catch(e){return ''}
}
function sheetPatchFromFields(c,initial,fields,conditions,statuses,techniques){
 const patch={},changed=id=>Object.hasOwn(fields,id)&&fields[id]!==initial[id];
 const strings={sheetName:'name',sheetLivret:'livret',sheetLocation:'location',sheetImportance:'importance',sheetTraining:'training',sheetHistory:'history',sheetNotes:'notes',sheetDesire:'desire',sheetDescription:'description',sheetPortrait:'portrait'};
 for(const [id,key] of Object.entries(strings))if(changed(id))patch[key]=fields[id];
 for(const [id,key] of [['sheetFatigue','fatigue'],['sheetBalance','balance'],['sheetCenter','center']])if(changed(id))patch[key]=Number(fields[id]);
 for(const key of Roster.STATS)if(changed('stat-'+key)){patch.stats={...(patch.stats||c.stats),[key]:Number(fields['stat-'+key])};}
 if(changed('principleLeft')||changed('principleRight'))patch.principles=[fields.principleLeft,fields.principleRight];
 for(const [id,key] of [['sheetRelations','relationships'],['sheetMoves','playbookMoves']])if(changed(id))patch[key]=fields[id].split('\n').map(x=>x.trim()).filter(Boolean);
 for(const [key,value] of [['conditions',conditions],['statuses',statuses],['techniques',techniques]])if(JSON.stringify(c[key])!==JSON.stringify(value))patch[key]=JSON.parse(JSON.stringify(value));
 if(Object.hasOwn(fields,'npcProfileMode')&&['npcProfileMode','npcCombatant','npcFatigueMax','npcBalanceMax','npcConditionCount','npcConditionNames'].some(changed)){const rawProfile=npcProfileFromFields(fields),profile=rawProfile?{...(c.npcResources||{}),...rawProfile}:null;if(JSON.stringify(profile)!==JSON.stringify(c.npcResources??null))patch.npcResources=profile;}
 if(['sheetHomePlace','sheetCurrentPlace','sheetAssociatedPlaces'].some(changed)){patch.placeLinks={homeId:null,associatedIds:[],...(c.placeLinks||{})};if(changed('sheetHomePlace'))patch.placeLinks.homeId=fields.sheetHomePlace||null;if(changed('sheetCurrentPlace'))patch.placeLinks.currentId=fields.sheetCurrentPlace||null;if(changed('sheetAssociatedPlaces'))patch.placeLinks.associatedIds=JSON.parse(fields.sheetAssociatedPlaces||'[]');}
 if(['sheetBookProgress','sheetBookMoment','sheetBookNotes','sheetBookEvolutions'].some(changed)){if(changed('sheetLivret'))throw Error('Enregistre séparément le changement de Livret et les modifications de son suivi. Les suivis antérieurs restent conservés.');const values={};for(const [id,key] of [['sheetBookProgress','progress'],['sheetBookMoment','moment'],['sheetBookNotes','notes'],['sheetBookEvolutions','evolutions']])if(changed(id)){if(key==='progress'&&!String(fields[id]).trim())throw Error('Renseigne de 0 à 4 cases de progression.');values[key]=key==='progress'?Number(fields[id]):fields[id];}patch.playbookState=BookState.patch(c,c.livret,values);}
 if(patch.desire!==undefined&&patch.desire.length>240)throw Error('Désir trop long (240 caractères maximum).');
 if(patch.description!==undefined&&patch.description.length>2000)throw Error('Description trop longue (2 000 caractères maximum).');
 if(patch.portrait&&safeSheetPortrait(patch.portrait)!==patch.portrait)throw Error('Portrait invalide : image PNG, JPEG ou WebP locale attendue.');
 return patch;
}
// Configuration volontaire : aucune déduction automatique à partir de l'importance.
function npcProfileFromFields(fields){
 if(fields.npcProfileMode!=='explicit')return null;
 const count=Number(fields.npcConditionCount),conditions=fields.npcConditionNames.split('\n').map(x=>x.trim()).filter(Boolean);
 if(!Number.isInteger(count)||count<0||count>8||conditions.length!==count)throw Error('Renseigne exactement '+count+' noms d’états distincts pour ce profil.');
 const p={format:'avatar-npc-resources',version:1,combatant:fields.npcCombatant==='yes',fatigueMax:Number(fields.npcFatigueMax),balanceMax:Number(fields.npcBalanceMax),conditions};npcResourceProfile({kind:'PNJ',npcResources:p});return p;
}
export { safeSheetPortrait, sheetPatchFromFields, npcProfileFromFields };
