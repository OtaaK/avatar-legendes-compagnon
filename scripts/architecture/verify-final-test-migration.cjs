'use strict';
// Preuve ponctuelle 3E.3 : corps et assertions, sans verrouiller leur évolution future.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'../..'),args=process.argv.slice(2);
if(args.length>1||(args.length&&args[0]!=='--compare-base'))throw Error('Usage : node scripts/architecture/verify-final-test-migration.cjs [--compare-base]');
const proof=JSON.parse(fs.readFileSync(path.join(root,'docs/architecture/MIGRATION_FINALE_3E3.json'),'utf8'));
assert.equal(proof.format,'avatar-final-test-migration-proof');assert.equal(proof.version,1);
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const assertions=s=>s.split(/\r?\n/).filter(x=>/\bassert\s*[.(]/.test(x)).join('\n');
const git=(...rest)=>execFileSync('git',rest,{cwd:root,maxBuffer:4000000});
const marker="const ctx={window:require('../../src/domain/index.cjs').loadDomain()};";
for(const row of proof.migrated){
 assert.match(row.path,/^tests\/js\/test[a-zA-Z0-9_-]+\.cjs$/);
 const current=fs.readFileSync(path.join(root,row.path),'utf8');const at=current.indexOf(marker);assert.ok(at>=0&&at===current.lastIndexOf(marker));
 const body=current.slice(at+marker.length);assert.equal(hash(body),row.bodySha256,row.path+' : corps modifié');
 assert.equal(hash(assertions(current)),row.assertionLinesSha256,row.path+' : assertions modifiées');
 assert.equal(current.match(/assert\s*=\s*require\('([^']+)'\)/)[1],row.assertModule);
 assert.equal(current.trimStart().startsWith("'use strict';"),row.strict);
 assert.equal(current.includes('APP_HTML'),row.requiresHtml);
 if(args.length){
  const old=git('show',proof.baseCommit+':'+row.path).toString('utf8');
  const m=old.match(/const ctx=\{window:\{\}(?:,console)?\};(?:vm.createContext\(ctx\);)?(?:vm.runInContext\(source,ctx\)|vm.runInNewContext\(core,ctx\));/);
  assert.ok(m);assert.equal(old.slice(m.index+m[0].length),body,row.path+' : corps différent de Git');assert.equal(assertions(old),assertions(current));
  assert.equal(old.match(/assert\s*=\s*require\('([^']+)'\)/)[1],row.assertModule);assert.equal(old.trimStart().startsWith("'use strict';"),row.strict);
 }
}
if(args.length){
 const files=git('ls-tree','-r','--name-only',proof.baseCommit,'tests/js').toString('utf8').trim().split('\n').filter(x=>/\/test.*\.cjs$/.test(x));
 const current=fs.readdirSync(path.join(root,'tests/js')).filter(x=>/^test.*\.cjs$/.test(x)).map(x=>'tests/js/'+x).sort();assert.deepEqual(current,files.sort());
 const changed=new Set(proof.migrated.map(x=>x.path));const retained=files.filter(x=>!changed.has(x));assert.equal(retained.length,proof.retainedJs);
 for(const file of retained)assert.ok(fs.readFileSync(path.join(root,file)).equals(git('show',proof.baseCommit+':'+file)),file);
 for(const area of ['src','app','data','tests/browser','.github']){
  for(const file of git('ls-tree','-r','--name-only',proof.baseCommit,area).toString('utf8').trim().split('\n').filter(Boolean))assert.ok(fs.readFileSync(path.join(root,file)).equals(git('show',proof.baseCommit+':'+file)),file);
 }
}
console.log('28 corps complets et toutes leurs assertions identiques'+(args.length?' ; 170 autres tests JS et application comparés à Git':''));
