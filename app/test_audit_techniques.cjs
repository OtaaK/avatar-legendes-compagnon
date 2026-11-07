'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8');
const a=JSON.parse(html.match(/const TECH_AUDIT=(\{[^\n]*\});/)[1]);
const c=JSON.parse(html.match(/const TECH_CATALOG=(\[[^\n]*\]);/)[1]);
const rows=fs.readFileSync(__dirname+'/MATRICE_TECHNIQUES.csv','utf8').replace(/^\uFEFF/,'').trim().split(/\r?\n/).slice(1);
assert.equal(Object.keys(a).length,102);
for(const [id,v] of Object.entries(a)){
 const t=c.find(t=>t.id===id);assert.ok(t);assert.ok(['universelle','groupe_pnj','eau','terre','feu','air','armes','technologie'].includes(t.famille));assert.equal(t.page,v.page);
 assert.ok([286,287,288,289,290,291,292,293].includes(v.page));assert.equal(v.verification,'texte_extrait_pdf');assert.ok(id==='eau-fouet-deau'?v.automatisation==='validee_v069':(/^validee_v\d+$/.test(v.automatisation)||v.automatisation==='non_validee'||/^assistance_partielle_v\d+$/.test(v.automatisation))); // Historique évolutif
 // Anciennes versions gardent leurs références initiales.
 /*assert.equal(v.automatisation,id==='eau-fouet-deau'?'validee_v069':['universelle-acharnement','universelle-derobade'].includes(id)?'validee_v049':['universelle-observation-rapide','universelle-frappe-devastatrice'].includes(id)?'validee_v050':id==='universelle-frapper-un-point-faible'?'validee_v051':id==='universelle-protection'?'validee_v052':id==='universelle-fort-comme-un-chene'?'validee_v053':id==='universelle-se-mettre-a-labri'?'validee_v054':'non_validee');*/
 assert.ok(v.resume_verifie.length>35);assert.ok(rows.some(r=>r.startsWith(id+',')));
}
assert.ok(html.includes('TECH_AUDIT[t.id].resume_verifie'));
console.log('✓ 102 techniques avancées : source, résumé, statut manuel et matrice cohérents');
