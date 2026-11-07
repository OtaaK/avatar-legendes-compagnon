# Avatar Légendes : Compagnon — V1.10

## Corrections de robustesse

- L'API `addTemporaryEffect` exige désormais un combattant source existant si `origin.type` vaut `personnage`, comme le faisait déjà l'API de modification.
- La validation des sauvegardes rejette un effet avec `originType: personnage` sans source valide.
- La validation des sauvegardes vérifie la forme de `originActionId` lorsque présent : chaîne non vide et provenance `technique`.
- La création automatique du repère de « Projection tellurique » ne peut plus franchir le plafond de 10 000 effets. En cas de plafond atteint, la validation échoue avec restauration de l'état initial et des propositions.

Aucune nouvelle règle officielle n'est automatisée dans cette version. Les repères restent narratifs.

## Vérifications exécutées

- 73 fichiers `test_*.cjs` : tous réussis.
- `test_interface_effect_filters_v109.py` : réussi.
- `test_interface_effects_v103.py` : réussi.
- `test_interface_origin_v104.py` : réussi.
- `node --check` sur le JavaScript intégré : réussi.
- Intégrité ZIP : vérifiée.

## Compatibilité

Les anciennes sauvegardes dépourvues de métadonnées d'origine restent acceptées. Les sauvegardes qui déclarent explicitement une provenance `personnage` incohérente sont rejetées.
