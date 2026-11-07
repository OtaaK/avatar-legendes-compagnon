'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const match=html.match(/const TECH_CATALOG=(\[[^\n]*\]);/);
assert.ok(match,'Catalogue embarqué trouvé');
const catalog=JSON.parse(match[1]);
const approaches=new Set(['Défendre et prendre à revers','Avancer et attaquer','Esquiver et analyser']);
assert.equal(catalog.length,111,'9 bases et 102 avancées');
assert.equal(catalog.filter(x=>x.famille==='base').length,9);
assert.equal(new Set(catalog.map(x=>x.id)).size,catalog.length,'Identifiants uniques');
for(const t of catalog){
 assert.ok(t.id&&t.nom&&t.famille,`Métadonnées obligatoires : ${t.id}`);
 assert.ok(approaches.has(t.approche),`Approche : ${t.nom}`);
 assert.ok(Number.isInteger(t.page)&&t.page>=1,`Page : ${t.nom}`);
 assert.equal(typeof t.rare,'boolean',`Rareté : ${t.nom}`);
 if(t.famille==='groupe_pnj')assert.equal(t.accessible_pj,false,`Réservé aux PNJ : ${t.nom}`);
}
const csv=fs.readFileSync(require('../support/paths.cjs').MATRIX_CSV,'utf8').replace(/^\uFEFF/,'');
const ids=csv.trim().split(/\r?\n/).slice(1).map(line=>line.split(',')[0]);
assert.equal(ids.length,102,'Matrice complète');
assert.equal(new Set(ids).size,102,'Matrice sans doublons');
assert.deepEqual(new Set(ids),new Set(catalog.filter(t=>t.famille!=='base').map(t=>t.id)),'Catalogue et matrice synchronisés');
assert.ok(html.includes('Validation des règles en attente'),'Avertissement explicite sur les techniques avancées');
console.log('✓ Catalogue : 111 entrées, 102 avancées, identifiants, familles, approches, pages et avertissement vérifiés');
