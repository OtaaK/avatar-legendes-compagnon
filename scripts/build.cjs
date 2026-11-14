#!/usr/bin/env node
'use strict';
const {build}=require('./architecture/assemble.cjs');
const args=process.argv.slice(2);
if(args.length>1 || (args.length===1 && args[0]!=='--check')) {
  console.error('Usage : node scripts/build.cjs [--check]');process.exitCode=2;
} else {
  try {
    const result=build({check:args[0]==='--check'});
    if(!result.matches) {console.error('Divergence sources/HTML : régénérer avec node scripts/build.cjs, puis relire le diff.');process.exitCode=1;}
    else console.log(JSON.stringify({status:result.changed?'generated':'matching',bytes:result.bytes,sha256:result.sha256}));
  } catch(error) {console.error(error.message);process.exitCode=1;}
}
