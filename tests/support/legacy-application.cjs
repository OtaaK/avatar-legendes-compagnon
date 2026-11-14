'use strict';
// Pont de test transitoire : aucun de ces blocs n’est une seconde implémentation métier.
const fs = require('node:fs');
const {evaluateDomainBlocks}=require('../../scripts/architecture/domain-context.cjs');
const crypto = require('node:crypto');
const { APP_HTML } = require('./paths.cjs');

function uniqueIndex(source, marker) {
  const first = source.indexOf(marker);
  if (first < 0 || source.indexOf(marker, first + marker.length) >= 0)
    throw Error('Repère absent ou ambigu : ' + marker);
  return first;
}
function readLegacyBlocks(html = fs.readFileSync(APP_HTML, 'utf8')) {
  const tags = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)];
  if (tags.length !== 1 || tags[0][1].trim())
    throw Error('Un unique script inline sans attribut est attendu');
  const source = tags[0][2];
  const between = (start, end) => {
    const a = start === null ? 0 : uniqueIndex(source, start);
    const b = uniqueIndex(source, end);
    if (b <= a) throw Error('Ordre de repères invalide');
    return source.slice(a, b);
  };
  return {
    core: between(null, 'let s;'),
    models: between('const rosterClone=', 'let lib=Roster.createLibrary();'),
    validators: between('function validateCombat(', 'let storageWarningShown='),
    persistence: between('let storageWarningShown=', 'function importCombat('),
    htmlSha256: crypto.createHash('sha256').update(html).digest('hex'),
  };
}
function loadLegacyApplication({ html, storage, recoveryOk = true } = {}) {
  return evaluateDomainBlocks(readLegacyBlocks(html),{storage,recoveryOk});
}
function observeContracts(application) {
  const { CombatCore: C, Roster: R, persistence: P } = application;
  const sample = R.makeCharacter('char-1','Personnage synthétique','PJ');
  return {
    exports: Object.fromEntries(['CombatCore','CombatRules','Roster','Playbooks'].map(name => [name,
      Object.fromEntries(Object.entries(application[name]).sort(([a],[b])=>a.localeCompare(b,'en')).map(([key,value])=>[key,typeof value === 'function'?'function':Array.isArray(value)?'array':typeof value]))])),
    defaults: { combatFields: Object.keys(C.createCombat()).sort(), libraryFields: Object.keys(R.createLibrary()).sort(), characterFields: Object.keys(sample).sort() },
    references: { catalogIds: application.catalog.map(t=>t.id), playbookIds: application.Playbooks.PLAYBOOKS.map(p=>p.id) },
    storage: P ? { libraryKeys:[...P.ROSTER_KEYS], combatKeys:[...P.COMBAT_KEYS], journalKey:P.COMPLETE_IMPORT_JOURNAL } : null,
  };
}
module.exports = { readLegacyBlocks, loadLegacyApplication, observeContracts };
