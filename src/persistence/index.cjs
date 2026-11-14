'use strict';
// Entrée Node explicite : le navigateur assemble storage.js sans cet adaptateur.
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'storage.js'),'utf8');
const createPersistence=vm.runInNewContext(source+'\ncreatePersistence;',{}, {timeout:2000});
module.exports={createPersistence};
