// Les assertions et sources historiques restent intactes. Les API publiques sont
// redirigées vers les vrais modules ESM après chargement dans le contexte VM.
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const domain = path.resolve(__dirname, '../../packages/domain/src');
const api = Object.assign({}, ...['resources','combat','combat-rules','books','places','roster','playbooks','catalog','validation','public-report'].map(name => require(`${domain}/${name}.js`)));
let calls = 0;
const publicNames = ['ResourceRules','CombatCore','CombatRules','BookState','PlaceRules','Roster','Playbooks'];
const redirected = Object.fromEntries(publicNames.map(name => [name, Object.fromEntries(Object.entries(api[name]).map(([key,value]) => [key,typeof value === 'function' ? (...args) => { calls++; return value(...args); } : value]))]));
const original = vm.runInContext;
vm.runInContext = function(source, context, ...args) {
 const result = original.call(this, source, context, ...args);
 if(typeof source === 'string' && source.includes('window.CombatCore=')) {
  for(const name of publicNames) if(context.window?.[name]) context.window[name] = redirected[name];
 }
 return result;
};
process.on('exit', () => {
 if(process.env.PARITY_COUNT_FILE) fs.writeFileSync(process.env.PARITY_COUNT_FILE, JSON.stringify({calls}));
});
