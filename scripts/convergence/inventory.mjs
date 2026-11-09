/** Inventaire complémentaire exhaustif des API publiques métier et entrées UI HTML. */
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));
const groups={'character-fields':[2,'Personnages → édition/portraits'],'npc-presets':[2,'Personnages → profils PNJ'],resources:[2,'Personnages → ressources / Combats → ressources'],combat:[5,'Combats'], 'combat-rules':[4,'Techniques / Combats → choix de technique'],books:[4,'Personnages → Livret'],places:[3,'Lieux / Personnages → Lieux'],roster:[2,'Personnages / Combats → participants'],playbooks:[4,'Personnages → Livret'],catalog:[4,'Techniques'],validation:[6,'Gestion → examiner/importer'], 'public-report':[6,'Combats → exports'], 'storage-version':[6,'Gestion → sauvegardes']};
const rows=[];
for(const [file,[lot,target]] of Object.entries(groups)){
 const module=await import(`../../packages/domain/src/${file}.js`);
 for(const [name,value] of Object.entries(module)){
  if(value && typeof value==='object'&&!Array.isArray(value)) {
   for(const [member,entry] of Object.entries(value))if(typeof entry==='function')rows.push({api:`${name}.${member}`,module:`packages/domain/src/${file}.js`,target,lot,status:'extrait ; à raccorder à React',scenario:`Parité et régressions ${name} ; scénario utilisateur à compléter au lot ${lot}`});
  }else if(typeof value==='function')rows.push({api:name,module:`packages/domain/src/${file}.js`,target,lot,status:'extrait ; à raccorder à React',scenario:'Contrats de sauvegarde et parité'});
 }
}
const html=readFileSync(root+'app/simulateur.html','utf8');
const handlers=[...new Set([...html.matchAll(/\bon(?:click|change|input|keydown|submit)=["']([^"']+)/g)].flatMap(m=>[...m[1].matchAll(/\b([A-Za-z_$][\w$]*)\s*\(/g)].map(m=>m[1])).filter(n=>!['if','for','getElementById','click','Number','String'].includes(n)))].sort();
const output={businessCommit:'a9079fa5b1babc560ee11a8d28430504df8704fc',note:'Complément technique à MATRICE_FONCTIONNELLE.md ; aucune API listée ne prouve une intégration UI. Les handlers dynamiquement construits sont couverts par la matrice et les tests historiques.',publicFunctions:rows,htmlStaticHandlers:handlers};
const text=JSON.stringify(output,null,2)+'\n',file=root+'docs/migration/INVENTAIRE_API_CONVERGENCE.json';
if(process.argv.includes('--check')){if(readFileSync(file,'utf8')!==text)throw Error('Inventaire divergent');}else writeFileSync(file,text);
console.log(`${rows.length} fonctions publiques extraites ; ${handlers.length} handlers HTML statiques recensés.`);
