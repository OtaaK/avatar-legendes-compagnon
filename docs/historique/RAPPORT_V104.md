# Avatar Légendes : Compagnon — V1.04

## Fonctionnalités
- Provenance des effets temporaires : décision MJ, technique nommée, ou personnage existant.
- Affichage de la provenance dans la liste des effets.
- Sauvegardes anciennes compatibles : champs d'origine facultatifs.
- Validation des références de personnage, des types et des libellés à la création et à l'import.
- Expiration, annulation et durée des effets inchangées.

## Tests
- 67 tests Node.js réussis.
- Tests Chromium `test_interface_effects_v103.py` et `test_interface_origin_v104.py` réussis.
- Syntaxe JavaScript valide (`node --check`).
- Intégrité de l'archive ZIP vérifiée.

## Limites
- Les origines sont des métadonnées déclarées par le MJ : les techniques ne créent pas encore automatiquement ces effets.
- Les effets restent narratifs et ne changent pas les statistiques mécaniques.
