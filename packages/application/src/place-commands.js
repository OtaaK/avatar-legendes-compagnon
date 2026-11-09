import { PlaceRules } from "../../domain/src/places.js";
import { safeSheetPortrait } from "../../domain/src/character-fields.js";
function illustration(patch) {
  if (
    Object.hasOwn(patch, "portrait") &&
    patch.portrait &&
    safeSheetPortrait(patch.portrait) !== patch.portrait
  )
    throw Error("Illustration invalide : PNG, JPEG ou WebP local attendu.");
}
/** PlaceRules sur le brouillon transactionnel : aucune autre donnée de fiche ou de combat. */
export function createPlaceCommands(store) {
  return {
    async create(revision, fields) {
      let id;
      illustration(fields);
      await store.execute(revision, (d) => {
        id = PlaceRules.create(d.library, fields.name, fields.parentId ?? null);
        const { name, parentId, ...extra } = fields;
        if (Object.keys(extra).length) PlaceRules.update(d.library, id, extra);
      });
      return id;
    },
    async edit(revision, id, patch) {
      illustration(patch);
      await store.execute(revision, (d) => {
        PlaceRules.update(d.library, id, patch);
      });
    },
    async remove(revision, id, strategy) {
      await store.execute(revision, (d) => {
        PlaceRules.remove(d.library, id, strategy);
      });
    },
    async links(revision, id, patch) {
      await store.execute(revision, (d) => {
        PlaceRules.setLinks(d.library, id, patch);
      });
    },
  };
}
