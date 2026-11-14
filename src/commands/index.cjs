'use strict';
// Entrée Node réservée aux outils et tests ; absente du HTML distribué.
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'mutation.js'),'utf8');
const createMutationCommand=vm.runInNewContext(source+'\ncreateMutationCommand;',{}, {timeout:2000});
module.exports={createMutationCommand};
