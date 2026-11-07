const assert=require('node:assert/strict'),fs=require('node:fs');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8');
const audits=JSON.parse(html.match(/const TECH_AUDIT=(\{[^\n]*\});/)[1]);
const cat=JSON.parse(html.match(/const TECH_CATALOG=(\[[^\n]*\]);/)[1]);
const air=cat.filter(t=>t.famille==='air');assert.equal(air.length,13);
for(const t of air){const a=audits[t.id];assert.ok(a,t.id);assert.equal(a.page,291);assert.equal(a.automatisation,t.id==='air-boulet-de-canon'?'validee_v122':t.id==='air-coussin-dair'?'validee_v123':['air-cone-dair','air-onde-de-choc'].includes(t.id)?'validee_v124':'non_validee');assert.ok(a.resume_verifie.length>=55);assert.ok(a.mecaniques.length>=2);}
assert.equal(Object.keys(audits).length,102);
const csv=fs.readFileSync(__dirname+'/MATRICE_TECHNIQUES.csv','utf8');
for(const t of air)assert.ok(csv.includes(t.id+','),t.id);
assert.ok(html.includes('102 effets avancés documentés'));
console.log('13 techniques Air documentées, Boulet de canon validé en V1.22');
