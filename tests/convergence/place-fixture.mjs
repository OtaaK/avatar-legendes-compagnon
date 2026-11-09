import {
  emptySession,
  exportBackup,
} from "../../packages/persistence/src/codecs.js";
import { Roster } from "../../packages/domain/src/roster.js";
import { PlaceRules } from "../../packages/domain/src/places.js";
import { writeFileSync } from "node:fs";
const s = emptySession(),
  root = PlaceRules.create(s.library, "Région du test"),
  child = PlaceRules.create(s.library, "Cité du port", root),
  grand = PlaceRules.create(s.library, "Quartier de Jade", child),
  other = PlaceRules.create(s.library, "Racine isolée");
PlaceRules.find(s.library, root).portrait =
  "https://invalid.example.org/ancienne.png";
PlaceRules.find(s.library, child).future = { keep: 42 };
const guide = Roster.createCharacter(s.library, "Guide lié", "PNJ");
guide.portrait =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jFWQAAAAASUVORK5CYII=";
guide.livret = "Guide";
guide.history = "Historique conservé";
guide.future = { keep: true };
guide.techniques = [
  { name: "Technique ancienne", mastery: "maitrisee", future: 12 },
];
PlaceRules.setLinks(s.library, guide.id, {
  homeId: root,
  currentId: grand,
  associatedIds: [child, grand],
});
const guard = Roster.createCharacter(s.library, "Gardien du port", "PNJ");
guard.livret = "Garde";
PlaceRules.setLinks(s.library, guard.id, {
  homeId: child,
  currentId: child,
  associatedIds: [child],
});
const legacy = Roster.createCharacter(s.library, "Voyageur historique", "PNJ");
legacy.location = "Route ancienne";
const orphan = Roster.createCharacter(s.library, "Référence absente", "PNJ");
orphan.placeLinks = {
  homeId: "missing-home",
  currentId: "missing-current",
  associatedIds: ["missing-assoc"],
  future: "keep",
};
const pj = Roster.createCharacter(s.library, "PJ témoin", "PJ");
pj.fatigue = 1;
pj.livret = "Livret ancien";
s.library.places.push({
  id: "orphelin/île?x",
  name: "Lieu orphelin",
  description: "Données conservées",
  parentId: "missing-parent",
  future: 31,
});
s.library.future = { keep: true };
Roster.addToCombat(s.library, s.combat, guide.id);
s.combat.future = { keep: true };
s.backupMetadata = { future: "keep" };
writeFileSync(process.argv[2], exportBackup(s));
