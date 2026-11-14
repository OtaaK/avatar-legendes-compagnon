'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const {TextDecoder}=require('node:util');
const ROOT = path.resolve(__dirname,'../..');
const GROUPS = new Set(['core','models','validators','persistence','commands','ui']);
const BINDINGS = new Set(['TECH_CATALOG','TECH_AUDIT']);
function within(root, target) {
  const relative = path.relative(root,target);
  return relative !== '..' && !relative.startsWith('..'+path.sep) && !path.isAbsolute(relative);
}
function sourcePath(root, name, { existing = true } = {}) {
  if (typeof name!=='string' || !name.startsWith('src/') || name.includes('\\') || name.split('/').includes('..'))
    throw Error('Chemin de source interdit');
  const base = fs.realpathSync(root),file = path.resolve(base,name);
  if (!within(base,file)) throw Error('Source hors du projet');
  if (existing) {
    const real=fs.realpathSync(file);
    if (!within(base,real) || !path.relative(base,real).startsWith('src'+path.sep)) throw Error('Lien de source hors du dossier src');
  }
  return file;
}
function readSource(root,name) {
  const bytes=fs.readFileSync(sourcePath(root,name));
  let text;
  try {text=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(bytes);}
  catch {throw Error('Source UTF-8 invalide : '+name);}
  if (text.includes('\r')) throw Error('Source attendue en UTF-8/LF : '+name);
  return text;
}
function readManifest(root=ROOT) {
  let manifest;
  try { manifest=JSON.parse(readSource(root,'src/assembly.json')); }
  catch { throw Error('Manifeste de sources illisible ou invalide'); }
  if (manifest?.format!=='avatar-source-assembly' || manifest.version!==1 || manifest.output!=='app/simulateur.html' || !Array.isArray(manifest.scripts) || !manifest.scripts.length)
    throw Error('Manifeste de sources incompatible');
  const names=[manifest.template,manifest.styles];
  for (const part of manifest.scripts) {
    if (!part || !['classic','json'].includes(part.kind) || !GROUPS.has(part.group)) throw Error('Fragment inconnu');
    if (part.kind==='json' && (!BINDINGS.has(part.binding) || !['array','object'].includes(part.shape))) throw Error('Déclaration de données inconnue');
    names.push(part.path);
  }
  const resolvedNames=names.map(name=>sourcePath(root,name,{existing:false}));
  if (new Set(resolvedNames).size!==names.length) throw Error('Chemin de source dupliqué');
  return manifest;
}
function renderPart(root,part) {
  const text=readSource(root,part.path);
  if (part.kind==='classic') return text;
  let value;
  try { value=JSON.parse(text); } catch { throw Error('JSON invalide : '+part.path); }
  if (part.shape==='array' ? !Array.isArray(value) : (!value || typeof value!=='object' || Array.isArray(value))) throw Error('Structure JSON invalide : '+part.path);
  // __proto__ a une sémantique spéciale dans un littéral JS, différente de JSON.parse.
  const pending=[value];
  while(pending.length) {
    const item=pending.pop();
    if(item && typeof item==='object') {
      if(Object.hasOwn(item,'__proto__')) throw Error('Clé JSON non représentable en littéral JS : '+part.path);
      pending.push(...Object.values(item));
    }
  }
  // Les données restent dans un littéral JSON, et ne peuvent fermer le script HTML.
  return 'const '+part.binding+'='+JSON.stringify(value).replace(/</g,'\\u003c')+';\n';
}
function readGroups({root=ROOT,groups=[...GROUPS]}={}) {
  const manifest=readManifest(root),result={};
  for (const group of groups) {
    if (!GROUPS.has(group)) throw Error('Groupe de sources inconnu');
    const parts=manifest.scripts.filter(p=>p.group===group);
    if (!parts.length) throw Error('Groupe de sources absent : '+group);
    result[group]=parts.map(part=>renderPart(root,part)).join('');
  }
  return result;
}
function assemble({root=ROOT}={}) {
  const manifest=readManifest(root),template=readSource(root,manifest.template),style=readSource(root,manifest.styles);
  if (template.split('{{AVATAR_STYLE}}').length!==2 || template.split('{{AVATAR_SCRIPT}}').length!==2)
    throw Error('Les deux emplacements du gabarit doivent être uniques');
  if (template.indexOf('{{AVATAR_STYLE}}')>template.indexOf('{{AVATAR_SCRIPT}}')) throw Error('Ordre des emplacements invalide');
  const script=manifest.scripts.map(part=>renderPart(root,part)).join('');
  if (/<\/script/i.test(script) || /<\/style/i.test(style)) throw Error('Fermeture HTML interdite dans une source embarquée');
  try { new vm.Script(script,{filename:'avatar-generated.js'}); }
  catch(error) { throw Error('Script assemblé invalide : '+error.name); }
  // Substitution en un passage : les marqueurs/$& contenus dans les données restent inertes.
  const html=template.replace(/\{\{AVATAR_(STYLE|SCRIPT)\}\}/g,(_,kind)=>kind==='STYLE'?style:script);
  if ((html.match(/<script\b/gi)||[]).length!==1 || (html.match(/<style\b/gi)||[]).length!==1) throw Error('Un script et un style embarqués sont attendus');
  const bytes=Buffer.from(html,'utf8');
  return {bytes,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),manifest};
}
function build({root=ROOT,check=false}={}) {
  const assembled=assemble({root}),base=fs.realpathSync(root),output=path.join(base,assembled.manifest.output),directory=path.dirname(output);
  if (fs.existsSync(directory) && !within(base,fs.realpathSync(directory))) throw Error('Dossier de sortie hors du projet');
  if (fs.existsSync(output) && fs.lstatSync(output).isSymbolicLink()) throw Error('La sortie ne peut pas être un lien symbolique');
  const matches=fs.existsSync(output) && fs.readFileSync(output).equals(assembled.bytes);
  if (check || matches) return {matches,changed:false,sha256:assembled.sha256,bytes:assembled.bytes.length};
  fs.mkdirSync(directory,{recursive:true});
  const temporary=path.join(directory,'.avatar-build-'+crypto.randomUUID()+'.tmp');
  try {
    fs.writeFileSync(temporary,assembled.bytes,{flag:'wx',mode:0o644});
    fs.renameSync(temporary,output);
  } finally { if(fs.existsSync(temporary))fs.unlinkSync(temporary); }
  return {matches:true,changed:true,sha256:assembled.sha256,bytes:assembled.bytes.length};
}
module.exports={ROOT,readManifest,readGroups,assemble,build};
