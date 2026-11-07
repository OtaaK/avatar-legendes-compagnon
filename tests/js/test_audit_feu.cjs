const assert=require('node:assert/strict'),fs=require('node:fs');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const audits=JSON.parse(html.match(/const TECH_AUDIT=(\{[^\n]*\});/)[1]);
const cat=JSON.parse(html.match(/const TECH_CATALOG=(\[[^\n]*\]);/)[1]);
const feu=cat.filter(t=>t.famille==='feu');assert.equal(feu.length,13);
for(const t of feu){const a=audits[t.id];assert.ok(a,t.id);assert.equal(a.page,290);assert.equal(a.automatisation,'non_validee');assert.ok(a.resume_verifie.length>=60);assert.ok(a.mecaniques.length>=2);}
assert.equal(Object.keys(audits).length,102);
const csv=fs.readFileSync(require('../support/paths.cjs').MATRIX_CSV,'utf8');
for(const t of feu)assert.ok(csv.includes(t.id+','),t.id);
console.log('13 techniques Feu documentées, aucune automatisation nouvelle validée');
