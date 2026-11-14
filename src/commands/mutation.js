// Enveloppe synchrone : aucun DOM ou stockage global ; les ports restent explicites.
function createMutationCommand({read,restore,save,onRollback=()=>{},nested=false,saveUnchanged=true,failureMessage}){
 let depth=0;
 return function executeMutation(change){
  if(nested&&depth>0)return change();
  const previous=JSON.stringify(read());
  depth++;
  try{
   const result=change();
   if((saveUnchanged||JSON.stringify(read())!==previous)&&!save())throw Error(failureMessage);
   return result;
  }catch(error){
   restore(previous);
   onRollback();
   throw error;
  }finally{depth--;}
 };
}
