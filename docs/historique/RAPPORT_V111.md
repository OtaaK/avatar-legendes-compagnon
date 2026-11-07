# Avatar Légendes : Compagnon — V1.11

## Correction du moteur

- `newScene` refuse désormais de dépasser 100 000 scènes, limite déjà imposée à l'import des sauvegardes.
- `nextRound` refuse désormais de dépasser 100 000 passes, limite déjà imposée à l'import des sauvegardes.
- Les vérifications sont effectuées avant toute mutation, sans perdre effets temporaires, propositions ou instantanés.
- Aucun changement des règles officielles ni nouvelle technique automatisée.

## Tests

- 74 tests Node.js réussis, dont `test_boundaries_v111.cjs` (bornes, absence de mutation, expiration, annulation).
- Chromium : `test_interface_effect_filters_v109.py` et `test_interface_scene_v098.py` réussis.
- Vérification syntaxique du JavaScript et intégrité de l'archive ZIP.

## Suite envisagée

Étudier une nouvelle technique dans le livre officiel avant de proposer un repère automatique, uniquement si son déclencheur et sa durée sont sans ambiguïté.
