const assert=require('node:assert/strict'),fs=require('node:fs');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const audits=JSON.parse(html.match(/const TECH_AUDIT=(\{[^\n]*\});/)[1]);
const cat=JSON.parse(html.match(/const TECH_CATALOG=(\[[^\n]*\]);/)[1]);
const tech=cat.filter(t=>t.famille==='technologie');assert.equal(tech.length,12);
for(const t of tech){const a=audits[t.id];assert.ok(a,t.id);assert.equal(a.page,293);assert.equal(a.automatisation,'non_validee');assert.ok(a.resume_verifie.length>=65);assert.ok(a.mecaniques.length>=2);}
assert.equal(Object.keys(audits).length,102);
const csv=fs.readFileSync(require('../support/paths.cjs').MATRIX_CSV,'utf8');
for(const t of tech)assert.ok(csv.includes(t.id+','),t.id);
assert.ok(html.includes('102 effets avancés documentés'));
console.log('12 techniques Technologie documentées ; aucune automatisation nouvelle validée');
