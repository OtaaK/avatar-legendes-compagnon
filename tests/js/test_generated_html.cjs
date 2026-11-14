'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {ROOT,assemble,build}=require('../../scripts/architecture/assemble.cjs');
let count=0;
function test(name,fn){fn();count++;console.log('OK '+name);}
function fixture(fn){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'avatar-build-'));
 try {fs.cpSync(path.join(ROOT,'src'),path.join(root,'src'),{recursive:true});return fn(root);}
 finally {fs.rmSync(root,{recursive:true,force:true});}
}
function read(root,name){return fs.readFileSync(path.join(root,name),'utf8');}
function write(root,name,text){fs.writeFileSync(path.join(root,name),text);}
function manifest(root,change){const m=JSON.parse(read(root,'src/assembly.json'));change(m);write(root,'src/assembly.json',JSON.stringify(m));}
function generated(root){return read(root,'app/simulateur.html');}
test('sources assemblées identiques au HTML distribué et à la référence 3A',()=>{
 const a=assemble(),b=assemble();assert.ok(a.bytes.equals(b.bytes));assert.ok(a.bytes.equals(fs.readFileSync(path.join(ROOT,'app/simulateur.html'))));
 assert.equal(a.sha256,require('../../docs/architecture/REFERENCE.json').htmlSha256);assert.equal(build({check:true}).matches,true);
});
test('check sur sortie absente : aucun fichier ou dossier créé',()=>fixture(root=>{
 const result=build({root,check:true});assert.equal(result.matches,false);assert.equal(result.changed,false);assert.equal(fs.existsSync(path.join(root,'app')),false);
}));
test('deux générations : octets identiques, aucun fichier temporaire restant',()=>fixture(root=>{
 assert.equal(build({root}).changed,true);const first=generated(root);assert.equal(build({root}).changed,false);assert.equal(generated(root),first);
 assert.deepEqual(fs.readdirSync(path.join(root,'app')),['simulateur.html']);
}));
test('divergence manuelle : check refuse sans réécrire, build explicite restaure',()=>fixture(root=>{
 build({root});const original=generated(root),file=path.join(root,'app/simulateur.html');fs.appendFileSync(file,'\n<!-- modification directe -->');
 const altered=generated(root);assert.equal(build({root,check:true}).matches,false);assert.equal(generated(root),altered);
 assert.equal(build({root}).changed,true);assert.equal(generated(root),original);
}));
test('édition d’une source : check détecte une sortie périmée',()=>fixture(root=>{
 build({root});const before=generated(root);fs.appendFileSync(path.join(root,'src/domain/roster.js'),'\n// Commentaire synthétique\n');
 assert.equal(build({root,check:true}).matches,false);assert.equal(generated(root),before);build({root});assert.notEqual(generated(root),before);
}));
test('JSON mal formé : échec sans remplacer le HTML existant',()=>fixture(root=>{
 build({root});const before=generated(root);write(root,'src/data/techniques.json','{erreur');
 assert.throws(()=>build({root}),/JSON invalide/);assert.equal(generated(root),before);assert.deepEqual(fs.readdirSync(path.join(root,'app')),['simulateur.html']);
}));
test('source UTF-8 invalide : refus sans remplacement silencieux des caractères',()=>fixture(root=>{
 build({root});const before=generated(root);fs.appendFileSync(path.join(root,'src/domain/combat.js'),Buffer.from([255]));
 assert.throws(()=>build({root}),/UTF-8 invalide/);assert.equal(generated(root),before);
}));
test('JavaScript mal formé : erreur de compilation, ancien fichier intact',()=>fixture(root=>{
 build({root});const before=generated(root);fs.appendFileSync(path.join(root,'src/domain/combat.js'),'\nfunction (\n');
 assert.throws(()=>build({root}),/Script assemblé invalide/);assert.equal(generated(root),before);
}));
test('compilation uniquement : aucune exécution du démarrage',()=>fixture(root=>{
 fs.appendFileSync(path.join(root,'src/interface/application-after-validation.js'),'\nthrow Error("ne pas exécuter")');assert.doesNotThrow(()=>assemble({root}));
}));
for(const [name,change]of [
 ['marqueur absent',s=>s.replace('{{AVATAR_SCRIPT}}','')],
 ['marqueur dupliqué',s=>s+'{{AVATAR_STYLE}}'],
 ['ordre inversé',s=>s.replace('{{AVATAR_STYLE}}','{{TMP}}').replace('{{AVATAR_SCRIPT}}','{{AVATAR_STYLE}}').replace('{{TMP}}','{{AVATAR_SCRIPT}}')],
])test('gabarit refusé : '+name,()=>fixture(root=>{
 write(root,'src/interface/template.html',change(read(root,'src/interface/template.html')));assert.throws(()=>assemble({root}),/emplacements/);
}));
for(const [name,change]of [
 ['traversée de chemin',m=>m.scripts[0].path='src/../../exterieur.js'],
 ['doublon normalisé',m=>m.scripts.push({...m.scripts[0],path:'src/domain/./combat.js'})],
 ['groupe inconnu',m=>m.scripts[0].group='inconnu'],
 ['déclaration JSON inconnue',m=>m.scripts.find(p=>p.kind==='json').binding='CODE_EXECUTABLE()'],
 ['sortie hors projet',m=>m.output='../autre.html'],
])test('manifeste refusé : '+name,()=>fixture(root=>{
 manifest(root,change);assert.throws(()=>build({root}));assert.equal(fs.existsSync(path.join(root,'app')),false);
}));
test('données JSON inertes : fermeture script et marqueurs non interprétés',()=>fixture(root=>{
 const m=JSON.parse(read(root,'src/data/techniques.json'));const payload='</script><script>throw Error("test")</script> $& {{AVATAR_STYLE}}';m[0].synthetic=payload;
 write(root,'src/data/techniques.json',JSON.stringify(m));const html=assemble({root}).bytes.toString();
 assert.equal((html.match(/<script>/g)||[]).length,1);assert.ok(!html.includes(payload));assert.ok(html.includes('\\u003c/script>'));assert.ok(html.includes('$& {{AVATAR_STYLE}}'));
 const {loadDomain}=require('../../src/domain/index.cjs');assert.equal(loadDomain({root}).catalog[0].synthetic,payload);
}));
test('propriété JSON à effet de prototype : refus explicite sans écriture',()=>fixture(root=>{
 build({root});const before=generated(root);const list=JSON.parse(read(root,'src/data/techniques.json'));
 list[0].synthetic=JSON.parse('{"__proto__":{"polluted":true}}');write(root,'src/data/techniques.json',JSON.stringify(list));
 assert.throws(()=>build({root}),/Clé JSON non représentable/);assert.equal(generated(root),before);assert.equal({}.polluted,undefined);
}));
test('mauvaise forme JSON : tableau/objet non intervertis',()=>fixture(root=>{
 write(root,'src/data/techniques.json','{}');assert.throws(()=>assemble({root}),/Structure JSON invalide/);
}));
test('lien symbolique de source sortant : lecture refusée',()=>fixture(root=>{
 if(process.platform==='win32'){console.log('LIMITATION: création de lien symbolique non testée sous Windows.');return;}
 const outside=path.join(root,'hors-src.js');fs.writeFileSync(outside,'throw Error("hors source")');const file=path.join(root,'src/domain/combat.js');fs.unlinkSync(file);fs.symlinkSync(outside,file);
 assert.throws(()=>assemble({root}),/hors du dossier src/);
}));
console.log(count+' scénarios de génération réussis');
