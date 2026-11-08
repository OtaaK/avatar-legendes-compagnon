import { Roster } from "../../domain/src/roster.js";
import { CombatCore } from "../../domain/src/combat.js";
import {
  validateCombat,
  validateBackupLinks,
} from "../../domain/src/validation.js";
import { profileStorageRequired } from "../../domain/src/storage-version.js";
export const copy = (value) => JSON.parse(JSON.stringify(value));
export function emptySession() {
  return {
    library: Roster.createLibrary(),
    combat: CombatCore.createCombat(),
    backupMetadata: {},
  };
}
export function validateSession(input) {
  const session = copy(input);
  session.library = Roster.importLibrary(session.library);
  validateCombat(session.combat);
  validateBackupLinks(session.library, session.combat);
  return session;
}
/** Lecture seule. La normalisation est celle du client historique, sur une copie. */
export function inspectImport(text, current = emptySession()) {
  const data = JSON.parse(text);
  if (!data || typeof data !== "object" || Array.isArray(data))
    throw Error("Document JSON invalide.");
  if (data.format === "avatar-compagnon-compte-rendu-public")
    throw Error(
      "Compte rendu public : consultation uniquement, pas une sauvegarde.",
    );
  let session, kind;
  if (
    data.format === "avatar-compagnon-backup" &&
    [1, 2].includes(data.version)
  ) {
    const { library, combat, ...backupMetadata } = data;
    session = { library, combat, backupMetadata };
    kind = "Sauvegarde complète";
  } else if (data.format === "avatar-compagnon-combat" && data.version === 2) {
    const { combat, ...combatMetadata } = data;
    session = { ...copy(current), combat, combatMetadata };
    kind = "Combat privé";
  } else if (
    !data.format &&
    [1, 2].includes(data.version) &&
    Array.isArray(data.characters)
  ) {
    session = { ...copy(current), library: data };
    kind = "Bibliothèque";
  } else if (
    !data.format &&
    Array.isArray(data.fighters) &&
    typeof data.phase === "string"
  ) {
    session = { ...copy(current), combat: data, combatMetadata: {} };
    kind = "Combat historique";
  } else
    throw Error(
      "Format non reconnu. Utilisez un export Codex ; le format de démonstration v0 n’est pas une sauvegarde métier.",
    );
  session = validateSession(session);
  return {
    kind,
    session,
    summary: {
      characters: session.library.characters.length,
      fighters: session.combat.fighters.length,
      snapshots: session.combat.snapshots.length,
      places: session.library.places?.length ?? 0,
    },
  };
}
export function exportBackup(session) {
  const valid = validateSession(session);
  return JSON.stringify(
    {
      ...valid.backupMetadata,
      format: "avatar-compagnon-backup",
      version: profileStorageRequired(valid.library, valid.combat) ? 2 : 1,
      createdAt: new Date().toISOString(),
      library: valid.library,
      combat: valid.combat,
    },
    null,
    2,
  );
}
/** Export privé du combat : les champs d'une enveloppe importée sont conservés. */
export function exportPrivateCombat(session) {
  const valid = validateSession(session);
  return JSON.stringify(
    valid.combatMetadata?.format === "avatar-compagnon-combat" ||
      profileStorageRequired(null, valid.combat)
      ? {
          ...valid.combatMetadata,
          format: "avatar-compagnon-combat",
          version: 2,
          combat: valid.combat,
        }
      : valid.combat,
    null,
    2,
  );
}
