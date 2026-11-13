'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {ROOT} = require('../../tests/support/paths.cjs');
const {loadLegacyApplication,observeContracts} = require('../../tests/support/legacy-application.cjs');
function checkContracts() {
  const reference=JSON.parse(fs.readFileSync(path.join(ROOT,'docs/architecture/REFERENCE.json'),'utf8'));
  const forbidden=()=>{throw Error('Le chargement de contrats ne doit pas accéder au stockage');};
  const application=loadLegacyApplication({storage:{getItem:forbidden,setItem:forbidden,removeItem:forbidden}});
  const actual=JSON.parse(JSON.stringify(observeContracts(application)));
  assert.deepEqual(actual,reference.contracts,'Les contrats publics observés ont changé : examen explicite requis');
  return {referenceCommit:reference.baseCommit,htmlIdenticalToReference:application.htmlSha256===reference.htmlSha256,
    exportedEntries:Object.values(actual.exports).reduce((n,v)=>n+Object.keys(v).length,0),
    catalogEntries:actual.references.catalogIds.length,playbooks:actual.references.playbookIds.length};
}
module.exports={checkContracts};
if(require.main===module)console.log(JSON.stringify(checkContracts()));
