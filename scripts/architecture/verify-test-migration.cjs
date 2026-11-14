'use strict';
// Preuve ponctuelle du lot 3E.1, pas un verrou CI sur l’évolution future des tests.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'../..');
const proof=JSON.parse(fs.readFileSync(path.join(root,'docs/architecture/MIGRATION_TESTS_3E.json'),'utf8'));
const args=process.argv.slice(2);
if(args.length>1||(args.length===1&&args[0]!=='--compare-base'))throw Error('Usage : node scripts/architecture/verify-test-migration.cjs [--compare-base]');
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
assert.equal(proof.format,'avatar-test-migration-proof');assert.equal(proof.version,1);
const all=[...proof.migrated,...proof.retained];assert.equal(new Set(all.map(x=>x.path)).size,197);
const files=fs.readdirSync(path.join(root,'tests/js')).filter(x=>/^test.*\.cjs$/.test(x)).map(x=>'tests/js/'+x).sort();
assert.deepEqual(all.map(x=>x.path).sort(),files,'Inventaire des scripts incomplet');
for(const row of all){
 assert.match(row.path,/^tests\/js\/test[a-zA-Z0-9_-]+\.cjs$/);
 const current=fs.readFileSync(path.join(root,row.path));
 if(row.bodySha256){
  assert.ok(['assert','node:assert/strict'].includes(row.assertModule));
  const prefix=(row.strict?"'use strict';\n":'')+"const assert=require('"+row.assertModule+"');\nconst {CombatCore:C}=require('../../src/domain/index.cjs').loadDomain();";
  assert.ok(current.subarray(0,Buffer.byteLength(prefix)).equals(Buffer.from(prefix)),row.path+' : import modifié');
  const body=current.subarray(Buffer.byteLength(prefix));assert.equal(hash(body),row.bodySha256,row.path+' : scénario modifié');
  if(args.length){
   const old=execFileSync('git',['show',proof.baseCommit+':'+row.path],{cwd:root,maxBuffer:2000000});
   const marker=Buffer.from('const C=ctx.window.CombatCore;');const start=old.indexOf(marker);
   assert.ok(start>=0,row.path+' : repère historique absent');
   assert.ok(old.subarray(start+marker.length).equals(body),row.path+' : scénario différent de la base');
   assert.doesNotMatch(old.subarray(0,start).toString('utf8'),/\bassert\s*[.(]/,'Assertion dans le préambule : migration interdite');
  }
 }else{
  assert.equal(hash(current),row.sha256,row.path+' : test conservé modifié');
  if(args.length)assert.ok(execFileSync('git',['show',proof.baseCommit+':'+row.path],{cwd:root,maxBuffer:2000000}).equals(current));
 }
}
console.log(proof.migrated.length+' corps de scripts identiques ; '+proof.retained.length+' scripts conservés intacts'+(args.length?' ; comparaison Git effectuée':''));
