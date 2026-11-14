// Préférences d’interface : erreurs silencieuses comme auparavant, sans toucher aux campagnes.
function createPreferences(storage){
 return {
  read(key,fallback=''){try{return storage().getItem(key)||fallback}catch{return fallback}},
  write(key,value){try{storage().setItem(key,value)}catch{}},
  remove(key){try{storage().removeItem(key)}catch{}}
 };
}
