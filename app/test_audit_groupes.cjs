const assert=require('node:assert/strict'),fs=require('node:fs');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8');
const audits=JSON.parse(html.match(/const TECH_AUDIT=(\{[^\n]*\});/)[1]);
const cat=JSON.parse(html.match(/const TECH_CATALOG=(\[[^\n]*\]);/)[1]);
const groupes=cat.filter(t=>t.famille==='groupe_pnj');
assert.equal(groupes.length,13);
for(const t of groupes){const a=audits[t.id];assert.ok(a,t.id);assert.equal(a.page,287);assert.equal(a.automatisation,'non_validee');assert.ok(a.resume_verifie.length>=55);}
assert.ok(html.includes('TECH_AUDIT[t.id].page'));
console.log('13 techniques de groupe documentées, automatisation non validée');
