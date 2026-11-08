// Extrait de a9079fa, app/simulateur.html. Voir extraction.json.

const BookState=(()=>{
 const FORMAT='avatar-playbook-state',MOMENTS=['unknown','locked','unlocked'];
 function validate(c){
  const state=c.playbookState;if(state===undefined||state===null)return;
  if(c.kind!=='PJ'||state.format!==FORMAT||state.version!==1||!Array.isArray(state.entries))throw Error('Suivi de Livret invalide');
  const seen=new Set();
  for(const e of state.entries){
   if(!e||typeof e.book!=='string'||!e.book.trim()||e.book.length>120||seen.has(e.book))throw Error('Livret de suivi invalide ou dupliqué');
   if(!Number.isInteger(e.progress)||e.progress<0||e.progress>4)throw Error('Progression : de 0 à 4 cases');
   if(!MOMENTS.includes(e.moment))throw Error('Suivi du moment d’équilibre invalide');
   for(const [key,max] of [['notes',2000],['evolutions',4000]])if(typeof e[key]!=='string'||e[key].length>max)throw Error('Notes de Livret invalides');
   seen.add(e.book);
  }
 }
 function entry(c,book=c.livret){return c.playbookState?.entries?.find(e=>e.book===book)||{book,progress:0,moment:'unknown',notes:'',evolutions:''};}
 function patch(c,book,changes){
  if(c.kind!=='PJ'||typeof book!=='string'||!book.trim())throw Error('Choisis et enregistre d’abord un Livret pour ce PJ.');
  if(Object.keys(changes).some(k=>!['progress','moment','notes','evolutions'].includes(k)))throw Error('Champ de suivi protégé');
  const state=JSON.parse(JSON.stringify(c.playbookState||{format:FORMAT,version:1,entries:[]})),i=state.entries.findIndex(e=>e.book===book),next={...entry(c,book),...changes};
  if(i<0)state.entries.push(next);else state.entries[i]=next;
  validate({...c,playbookState:state});return state;
 }
 return {FORMAT,MOMENTS,validate,entry,patch};
})();

export { BookState };
