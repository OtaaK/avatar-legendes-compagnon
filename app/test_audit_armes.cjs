const assert=require('node:assert/strict'),fs=require('node:fs');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8');
const audits=JSON.parse(html.match(/const TECH_AUDIT=(\{[^\n]*\});/)[1]);
const cat=JSON.parse(html.match(/const TECH_CATALOG=(\[[^\n]*\]);/)[1]);
const armes=cat.filter(t=>t.famille==='armes');assert.equal(armes.length,12);
for(const t of armes){const a=audits[t.id];assert.ok(a,t.id);assert.equal(a.page,292);assert.ok(a.automatisation==='non_validee'||/^validee_v1\d+$/.test(a.automatisation));assert.ok(a.resume_verifie.length>=65);assert.ok(a.mecaniques.length>=2);}
assert.equal(Object.keys(audits).length,102);
const csv=fs.readFileSync(__dirname+'/MATRICE_TECHNIQUES.csv','utf8');
for(const t of armes)assert.ok(csv.includes(t.id+','),t.id);
assert.ok(html.includes('102 effets avancés documentés'));
console.log('12 techniques Armes documentées ; aucune automatisation nouvelle validée');
