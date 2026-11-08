import { readdirSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));
mkdirSync(root+'work/parity',{recursive:true});
const results=[];
for(const file of readdirSync(root+'tests/js').filter(f=>/^test.*\.cjs$/.test(f)).sort()) {
 const countFile=root+'work/parity/'+file+'.json';
 const p=spawnSync(process.execPath,['--require',root+'tests/parity/extracted-preload.cjs',root+'tests/js/'+file],{cwd:root,encoding:'utf8',timeout:120000,env:{...process.env,PARITY_COUNT_FILE:countFile}});
 let calls=0;try{calls=JSON.parse(readFileSync(countFile)).calls;}catch{}
 results.push({file,code:p.status,calls,output:p.status ? p.stdout+p.stderr : undefined});
}
writeFileSync(root+'work/parity/results.json',JSON.stringify(results,null,2));
for(const r of results.filter(r=>r.code)) console.error(r.file,r.output?.slice(0,1600));
console.log(JSON.stringify({scripts:results.length,passed:results.filter(r=>r.code===0).length,scriptsCallingExtractedAPI:results.filter(r=>r.calls>0).length,publicCalls:results.reduce((a,r)=>a+r.calls,0)}));
if(results.some(r=>r.code))process.exitCode=1;
