// Extrait de a9079fa, app/simulateur.html. Voir extraction.json.

const PlaceRules=(()=>{
 const clone=x=>JSON.parse(JSON.stringify(x)),idOk=x=>typeof x==='string'&&x.length>0&&x.length<=120;
 const all=lib=>lib.places||[],find=(lib,id)=>all(lib).find(p=>p.id===id);
 function links(c){return {homeId:null,currentId:null,associatedIds:[],...(c.placeLinks||{})};}
 function validate(lib){
  if(lib.placeSeq!==undefined&&(!Number.isSafeInteger(lib.placeSeq)||lib.placeSeq<1))throw Error('Compteur de lieux invalide');
  if(lib.places!==undefined&&!Array.isArray(lib.places))throw Error('Liste de lieux invalide');
  const map=new Map();
  for(const p of all(lib)){
   if(!p||!idOk(p.id)||map.has(p.id))throw Error('Identifiant de lieu invalide ou dupliqué');
   if(typeof p.name!=='string'||!p.name.trim()||p.name.length>120)throw Error('Nom de lieu requis (120 caractères maximum)');
   if(p.description!==undefined&&(typeof p.description!=='string'||p.description.length>2000))throw Error('Description de lieu invalide');
   if(p.parentId!==null&&!idOk(p.parentId))throw Error('Parent de lieu invalide');
   if(p.portrait!==undefined&&p.portrait!==null&&(typeof p.portrait!=='string'||p.portrait.length>360000))throw Error('Illustration de lieu invalide');
   map.set(p.id,p);
  }
  // Parcours itératif : aucune limite de profondeur ni récursion de pile.
  const done=new Set();
  for(const p of all(lib)){const path=new Set();let node=p;while(node&&!done.has(node.id)){if(path.has(node.id))throw Error('Cycle dans les lieux');path.add(node.id);node=map.get(node.parentId);}for(const id of path)done.add(id);}
  for(const c of lib.characters||[]){if(c.placeLinks===undefined)continue;const l=c.placeLinks;
   if(c.kind!=='PNJ'||!l||typeof l!=='object'||Array.isArray(l)||!(l.homeId===null||idOk(l.homeId))||!(l.currentId===undefined||l.currentId===null||idOk(l.currentId))||!Array.isArray(l.associatedIds)||l.associatedIds.some(x=>!idOk(x))||new Set(l.associatedIds).size!==l.associatedIds.length)throw Error('Liens PNJ–lieux invalides');
  }
  return lib;
 }
 function issues(lib){const known=new Set(all(lib).map(p=>p.id)),out=[];
  for(const p of all(lib))if(p.parentId&&!known.has(p.parentId))out.push({type:'parent',id:p.id,missing:p.parentId});
  for(const c of lib.characters||[])if(c.placeLinks)for(const id of new Set([c.placeLinks.homeId,c.placeLinks.currentId,...c.placeLinks.associatedIds].filter(Boolean)))if(!known.has(id))out.push({type:'character',id:c.id,missing:id});return out;
 }
 function transact(lib,change){const next=clone(lib),result=change(next);validate(next);next.version=2;Object.assign(lib,next);return result;}
 function create(lib,name,parentId=null){return transact(lib,next=>{if(parentId&&!find(next,parentId))throw Error('Parent absent');const reserved=new Set([...all(next).map(p=>p.id),...issues(next).map(x=>x.missing)]);let seq=Number.isSafeInteger(next.placeSeq)?next.placeSeq:1;while(reserved.has('place-'+seq))seq++;next.placeSeq=seq+1;const p={id:'place-'+seq,name:name.trim(),description:'',parentId};next.places=[...all(next),p];return p.id;});}
 function update(lib,id,patch){return transact(lib,next=>{const p=find(next,id);if(!p)throw Error('Lieu absent');if(Object.keys(patch).some(k=>!['name','description','parentId','portrait'].includes(k)))throw Error('Champ de lieu protégé');if(patch.parentId&&!find(next,patch.parentId))throw Error('Parent absent');Object.assign(p,clone(patch));});}
 function setLinks(lib,id,patch){return transact(lib,next=>{const c=next.characters.find(c=>c.id===id&&c.kind==='PNJ');if(!c)throw Error('PNJ absent');if(Object.keys(patch).some(k=>!['homeId','currentId','associatedIds'].includes(k)&&(!Object.hasOwn(c.placeLinks||{},k)||JSON.stringify(patch[k])!==JSON.stringify(c.placeLinks[k]))))throw Error('Lien inconnu');const before=links(c),l={...before,...clone(patch)};if(!Object.hasOwn(patch,'currentId')&&!Object.hasOwn(c.placeLinks||{},'currentId'))delete l.currentId;for(const key of Object.keys(patch).filter(k=>['homeId','currentId','associatedIds'].includes(k))){const ids=key==='associatedIds'?l[key]:[l[key]];if(!Array.isArray(ids))throw Error('Liens invalides');for(const value of ids)if(value&&!find(next,value)&&!(key==='associatedIds'?before.associatedIds.includes(value):before[key]===value))throw Error('Lieu absent : '+value);}c.placeLinks=l;});}
 function descendants(lib,id){const children=new Map();for(const p of all(lib)){if(!children.has(p.parentId))children.set(p.parentId,[]);children.get(p.parentId).push(p.id);}const result=new Set(),queue=[id];while(queue.length){const current=queue.pop();if(result.has(current))continue;result.add(current);for(const child of children.get(current)||[])queue.push(child);}return result;}
 function path(lib,id){const map=new Map(all(lib).map(p=>[p.id,p])),out=[],seen=new Set();let p=map.get(id);while(p&&!seen.has(p.id)){seen.add(p.id);out.push(p);p=map.get(p.parentId);}return out.reverse();}
 function people(lib,id,recursive=false){const ids=recursive?descendants(lib,id):new Set([id]),npcs=(lib.characters||[]).filter(c=>c.kind==='PNJ');return {present:npcs.filter(c=>ids.has(links(c).currentId)),associated:npcs.filter(c=>links(c).associatedIds.some(x=>ids.has(x))),domiciled:npcs.filter(c=>ids.has(links(c).homeId))};}
 function dependencies(lib,id){return {children:all(lib).filter(p=>p.parentId===id),characters:(lib.characters||[]).filter(c=>{const l=links(c);return l.homeId===id||l.currentId===id||l.associatedIds.includes(id);})};}
 function remove(lib,id,strategy){return transact(lib,next=>{const p=find(next,id);if(!p)throw Error('Lieu absent');const dep=dependencies(next,id);if(strategy!=='promote-unlink'&&(dep.children.length||dep.characters.length))throw Error('Choisis explicitement le traitement des dépendances');if(strategy!==undefined&&strategy!=='promote-unlink')throw Error('Stratégie inconnue');for(const child of dep.children)child.parentId=p.parentId;for(const c of dep.characters){const l=c.placeLinks;c.placeLinks={...l,homeId:l.homeId===id?null:l.homeId,associatedIds:l.associatedIds.filter(x=>x!==id)};if(l.currentId===id)c.placeLinks.currentId=null;}next.places=all(next).filter(x=>x.id!==id);});}
 function currentName(lib,c){if(c.placeLinks&&Object.hasOwn(c.placeLinks,'currentId'))return c.placeLinks.currentId?(find(lib,c.placeLinks.currentId)?.name||'Lieu absent : '+c.placeLinks.currentId):'';return c.location||'';}
 return {all,find,links,validate,issues,create,update,setLinks,descendants,path,people,dependencies,remove,currentName};
})();

export { PlaceRules };
