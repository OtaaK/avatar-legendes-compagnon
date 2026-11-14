'use strict';
// Point d’entrée Node uniquement. Le navigateur utilise les mêmes corps JS, assemblés sans ce fichier.
const {ROOT,readGroups}=require('../../scripts/architecture/assemble.cjs');
const {evaluateDomainBlocks}=require('../../scripts/architecture/domain-context.cjs');
function loadDomain({root=ROOT,storage,recoveryOk=true}={}) {
  const groups=['core','models','validators'];
  if(storage)groups.push('persistence');
  return evaluateDomainBlocks(readGroups({root,groups}),{storage,recoveryOk});
}
module.exports={loadDomain};
