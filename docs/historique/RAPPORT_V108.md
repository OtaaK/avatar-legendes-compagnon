# Avatar Légendes : Compagnon — V1.08

## Correction : effets temporaires utilisables pendant la passe

Les opérations `addTemporaryEffect`, `editTemporaryEffect` et `removeTemporaryEffect` ne sont plus bloquées par la simple présence d'actions déclarées ou résolues dans `s.actions`. Elles restent interdites tant que `s.proposals` contient des propositions à valider.

Cette correction concerne les repères narratifs uniquement. Elle ne modifie pas les règles des techniques ni les effets mécaniques. Les modifications continuent de produire des instantanés annulables et des événements dans l'historique.

## Contrôles

- 71 tests Node.js (`test_*.cjs`) exécutés avec succès, dont `test_effect_midround_v108.cjs`.
- Syntaxe JavaScript vérifiée avec `node --check`.
- Chromium : tests des effets V1.03, de leur modification V1.05, des origines V1.04 et des scènes V0.98 exécutés avec succès.
- Archive ZIP vérifiée à la création.

## Limites

Les repères restent narratifs. L'association automatique avec les techniques officielles demeure limitée à Projection tellurique (V1.07). Les tests automatisés ne remplacent pas une validation complète en partie réelle.
