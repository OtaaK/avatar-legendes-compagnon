const assert=require('node:assert/strict'),fs=require('node:fs');
const html=fs.readFileSync(__dirname+'/simulateur.html','utf8');
const audits=JSON.parse(html.match(/const TECH_AUDIT=(\{[^\n]*\});/)[1]);
const cat=JSON.parse(html.match(/const TECH_CATALOG=(\[[^\n]*\]);/)[1]);
const terre=cat.filter(t=>t.famille==='terre');assert.equal(terre.length,13);
for(const t of terre){const a=audits[t.id];assert.ok(a,t.id);assert.equal(a.page,289);assert.equal(a.automatisation,['terre-entraves-de-metal','terre-escalier-de-poussiere'].includes(t.id)?'validee_v148':(['terre-detection-du-pas-lourd','terre-etoile-de-lave'].includes(t.id)?'assistance_partielle_v151':'non_validee'));assert.ok(a.resume_verifie.length>=50);assert.ok(a.mecaniques.length>=1);}
assert.equal(Object.keys(audits).length,102);
console.log('13 techniques Terre documentées, aucune automatisation nouvelle validée');
