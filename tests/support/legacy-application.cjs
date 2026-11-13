'use strict';
// Pont de test transitoire : aucun de ces blocs n’est une seconde implémentation métier.
const fs = require('node:fs');
const vm = require('node:vm');
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
  const blocks = readLegacyBlocks(html);
  const warnings = [];
  const notices = new Map();
  const sandbox = {};
  sandbox.window = sandbox; // Dans un navigateur les exports window sont aussi des noms globaux.
  const forbid = name => { throw Error('Accès interdit dans le contexte métier : ' + name); };
  Object.defineProperties(sandbox, {
    document: { get() { return storage ? {
      getElementById(id) {
        if (!['storageWarning','recoveryWarning'].includes(id)) return forbid('document.' + id);
        if (!notices.has(id)) notices.set(id, { hidden: true, textContent: '' });
        return notices.get(id);
      },
    } : forbid('document'); } },
    localStorage: { get() { return storage ?? forbid('localStorage'); } },
    fetch: { get() { return forbid('fetch'); } },
  });
  sandbox.console = { error: (...args) => warnings.push(String(args.at(-1)?.message ?? args.at(-1))), warn: message => warnings.push(String(message)) };
  sandbox.alert = message => warnings.push(String(message));
  const context = vm.createContext(sandbox, { codeGeneration: { strings: false, wasm: false } });
  function run(source) { return vm.runInContext(source, context, { timeout: 2000 }); }
  run(blocks.core);
  run(blocks.models);
  run(blocks.validators);
  const api = run('({CombatCore,CombatRules,Roster,Playbooks})');
  const references = run('({catalog:TECH_CATALOG,audit:TECH_AUDIT})');
  const validators = run('({validateCombat,validateBackupLinks})');
  let persistence = null;
  if (storage) {
    sandbox.completeImportRecoveryOk = recoveryOk; // État de reprise explicitement choisi par le test.
    run(blocks.persistence);
    persistence = run('({persist,loadSaved,recoverIncompleteImport,persistCompleteBackup,ROSTER_KEYS,COMBAT_KEYS,COMPLETE_IMPORT_JOURNAL})');
  }
  return { ...api, ...references, validators, persistence, warnings, notices, htmlSha256: blocks.htmlSha256 };
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
