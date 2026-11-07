# Avatar Légendes : Compagnon — V1.13

## Changements

- `addSceneNote` refuse la création au plafond de 100 000 notes, cohérent avec `validateCombat` lors de l'import.
- La validation intervient avant toute mutation : ni compteur, ni historique, ni instantané modifiés en cas de refus.
- L'instantané est désormais pris avant l'incrément de `seq`, ce qui simplifie l'annulation et conserve les identifiants.
- Nouveau test `test_scene_note_limit_v113.cjs` : plafond, atomicité, identifiants, annulation.

## Contrôles

- 76 fichiers de tests Node.js : réussis.
- Syntaxe JavaScript : vérifiée avec `node --check`.
- Archive ZIP : test d'intégrité effectué.
- Tests navigateur : non exécutés pour cette version.

## Limites

- Cette version n'ajoute aucune technique automatisée.
- Le plafond de 100 000 notes est une limite technique de sauvegarde, pas une règle du jeu.
