'use strict';
// Inventaire de maintenance, classification des points de chargement connus.
// Ce relevé textuel n’est pas une analyse de sécurité générale du JavaScript.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
const vmReasons={
 'test_combat_transactions.cjs':'segment = readFixture(commands)',
 'test_transactions.cjs':'helper = readFixture(commands)',
 'test_persistance.cjs':'segment = readFixture(validation-persistence)',
 'test_security_import_ids.cjs':'vcode = readFixture(validation)',
 'test_complete_import.cjs':'constante fixe de reprise ; service chargé par runFixture',
 'test_command_ports.cjs':'fichier source preferences.js + référence de factory fixe'
};
function auditTests(){
 const rows=fs.readdirSync(path.join(root,'tests/js')).filter(x=>/^test.*\.cjs$/.test(x)).sort().map(name=>{
  const file='tests/js/'+name,text=fs.readFileSync(path.join(root,file),'utf8');const html=text.includes('APP_HTML')||/['"]app\/simulateur\.html['"]/.test(text);
  const source=/src\/(?:domain|commands|persistence)\/index\.cjs|support\/source-fixtures\.cjs/.test(text);
  let category;
  if(/loadLegacyApplication|readLegacyBlocks|checkContracts/.test(text))category='parite_source_html';
  else if(name==='test_generated_html.cjs')category='generateur_html';
  else if(source)category=html?'sources_et_controles_html':'sources';
  else if(html)category='structure_ou_donnees_html';
  else category='a_examiner';
  const vmCalls=text.split('\n').filter(line=>/vm\.(?:runInContext|runInNewContext)\(/.test(line));
  return {file,category,html,vmDirect:vmCalls.length>0,vmReason:vmCalls.length?(vmReasons[name]||'a_examiner'):''};
 });
 const categories={};for(const row of rows)categories[row.category]=(categories[row.category]||0)+1;
 return {total:rows.length,categories,vmDirect:rows.filter(x=>x.vmDirect),reviewRequired:rows.filter(x=>x.category==='a_examiner'||x.vmReason==='a_examiner'),rows};
}
module.exports={auditTests};
if(require.main===module){
 const args=process.argv.slice(2);if(args.length>1||(args.length&&args[0]!=='--csv'))throw Error('Usage : node scripts/architecture/audit-test-boundaries.cjs [--csv]');
 const result=auditTests();
 if(args.length)console.log(['fichier,categorie,lecture_html_directe,vm_directe,motif_vm',...result.rows.map(x=>[x.file,x.category,x.html,x.vmDirect,x.vmReason].join(','))].join('\n'));
 else console.log(JSON.stringify({total:result.total,categories:result.categories,vmDirect:result.vmDirect,reviewRequired:result.reviewRequired},null,2));
 if(result.reviewRequired.length)process.exitCode=1;
}
