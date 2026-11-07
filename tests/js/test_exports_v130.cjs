'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const s=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const current=(s.match(/<title>[^<]*V(\d+)\.(\d+)/)||[]);const version=current.length?'v'+current[1]+'-'+current[2]:'v1-30';
for(const name of ['avatar-sauvegarde-complete-'+version+'.json','avatar-fiches-'+version+'.json','avatar-combat-'+version+'.json']) assert(s.includes(name),'Nom export absent : '+name);
for(const name of ['avatar-sauvegarde-complete-v0-39.json','avatar-fiches-v0-39.json','avatar-combat-v0-39.json']) assert(!s.includes(name),'Nom obsolète : '+name);
console.log('OK V1.30 : trois noms exports cohérents');
