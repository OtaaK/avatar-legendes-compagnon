'use strict';
// Adaptateur Node partagé ; exécute uniquement les blocs métier explicitement fournis.
const vm = require('node:vm');
function evaluateDomainBlocks(blocks,{storage,recoveryOk=true}={}) {
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
module.exports={evaluateDomainBlocks};
