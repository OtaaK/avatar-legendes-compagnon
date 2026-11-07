const assert=require('node:assert/strict'),fs=require('node:fs');
const html=fs.readFileSync(require('../support/paths.cjs').APP_HTML,'utf8');
const audits=JSON.parse(html.match(/const TECH_AUDIT=(\{[^\n]*\});/)[1]);
const cat=JSON.parse(html.match(/const TECH_CATALOG=(\[[^\n]*\]);/)[1]);
const eau=cat.filter(t=>t.famille==='eau');assert.equal(eau.length,13);
for(const t of eau){const a=audits[t.id];assert.ok(a,t.id);assert.equal(a.page,288);assert.equal(a.automatisation,t.id==='eau-fouet-deau'?'validee_v069':'non_validee');assert.ok(a.resume_verifie.length>=50);assert.ok(a.mecaniques.length>=1);}
assert.equal(Object.keys(audits).length,102);
console.log('13 techniques Eau documentées, Fouet d’eau automatisé V0.69');
