'use strict';
// Preuve ponctuelle 3E.2 ; pas un verrou CI sur les futurs scénarios.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'../..'),args=process.argv.slice(2);
if(args.length>1||(args.length&&args[0]!=='--compare-base'))throw Error('Usage : node scripts/architecture/verify-service-test-migration.cjs [--compare-base]');
const proof=JSON.parse(fs.readFileSync(path.join(root,'docs/architecture/MIGRATION_SERVICES_3E2.json'),'utf8'));
assert.equal(proof.format,'avatar-service-test-migration-proof');assert.equal(proof.version,1);
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const assertionLines=s=>s.split(/\r?\n/).filter(x=>/\bassert\s*[.(]/.test(x)).join('\n');
const moduleName=s=>s.match(/assert\s*=\s*require\('([^']+)'\)/)[1];
const git=(...rest)=>execFileSync('git',rest,{cwd:root,maxBuffer:4000000});
function region(source,row){
 const start=source.indexOf(row.start);assert.ok(start>=0&&start===source.lastIndexOf(row.start),'Début de région absent ou ambigu');
 const end=row.end===null?source.length:source.indexOf(row.end,start);assert.ok(end>=start,'Fin de région absente');return source.slice(start,end);
}
for(const row of proof.migrated){
 assert.match(row.path,/^tests\/js\/test[a-zA-Z0-9_-]+\.cjs$/);
 const current=fs.readFileSync(path.join(root,row.path),'utf8');assert.equal(moduleName(current),row.assertModule);assert.equal(current.trimStart().startsWith("'use strict';"),row.strict);
 assert.equal(hash(assertionLines(current)),row.assertionLinesSha256,row.path+' : assertion changée');
 for(const r of row.regions)assert.equal(hash(region(current,r)),r.sha256,row.path+' : scénario changé');
 if(args.length){const old=git('show',proof.baseCommit+':'+row.path).toString('utf8');assert.equal(assertionLines(old),assertionLines(current));assert.equal(moduleName(old),row.assertModule);assert.equal(old.trimStart().startsWith("'use strict';"),row.strict);for(const r of row.regions)assert.equal(region(old,r),region(current,r));}
}
if(args.length){
 const migrated=new Set(proof.migrated.map(x=>x.path));
 const previous=git('ls-tree','-r','--name-only',proof.baseCommit,'tests/js').toString('utf8').trim().split('\n').filter(x=>/\/test.*\.cjs$/.test(x));
 const current=fs.readdirSync(path.join(root,'tests/js')).filter(x=>/^test.*\.cjs$/.test(x)).map(x=>'tests/js/'+x).sort();assert.deepEqual(current,[...previous,...proof.added].sort());
 const retained=previous.filter(x=>!migrated.has(x));assert.equal(retained.length,proof.retainedJs);
 for(const file of retained)assert.ok(fs.readFileSync(path.join(root,file)).equals(git('show',proof.baseCommit+':'+file)),file+' : ancien test changé');
 for(const area of ['src','app','data','tests/browser','.github']){
  const files=git('ls-tree','-r','--name-only',proof.baseCommit,area).toString('utf8').trim().split('\n').filter(Boolean);
  for(const file of files)assert.ok(fs.readFileSync(path.join(root,file)).equals(git('show',proof.baseCommit+':'+file)),file+' : changement hors migration');
 }
}
console.log('8 séquences d’assertions et 9 régions de scénarios conservées'+(args.length?' ; 189 autres tests JS et application comparés à Git':''));
