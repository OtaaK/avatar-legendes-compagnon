import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';
const root=new URL('../../',import.meta.url),read=p=>fs.readFileSync(new URL(p,root),'utf8');
test('styles v0 figés et navigation fidèle ; correctifs séparés',()=>{
 const ref=JSON.parse(read('docs/migration/V0_PROVENANCE.json'));
 assert.equal(createHash('sha256').update(read(ref.copiedStyles.path)).digest('hex'),ref.copiedStyles.sha256);
 const nav=read('apps/companion/src/shell/navigation.ts');assert.deepEqual([...nav.matchAll(/name: "([^"]+)"/g)].map(m=>m[1]),ref.navigation);
});
test('domaine sans navigateur et sans dépendance React/persistance',()=>{
 for(const file of fs.readdirSync(new URL('packages/domain/src/',root))){if(!file.endsWith('.js'))continue;const s=read('packages/domain/src/'+file);assert(!/\b(window|document|localStorage)\s*[.[]|\b(alert|confirm|prompt)\s*\(/.test(s),file);assert(!/from ['"].*(react|persistence|application)/.test(s),file)}
});
test('aucune clé historique ou donnée fictive v0 dans le runtime React',()=>{
 for(const dir of ['apps/companion/src/','packages/persistence/src/','packages/application/src/']){
  for(const path of fs.readdirSync(new URL(dir,root),{recursive:true})){if(!/\.(?:js|tsx|ts)$/.test(path))continue;const s=read(dir+path);assert(!/avatar-roster-v02|avatar-v02|avatar-legendes-compagnon-demo|lib\/demo-data|initialCharacters|v0\/analytics/.test(s),dir+path)}
 }
});
