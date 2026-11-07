# Avatar Légendes : Compagnon — V0.94

## Modification fonctionnelle

- Technique **Maintenance** (technologie, p. 293) : proposition de 1 fatigue pour le lanceur, retrait d'un état effectivement coché et réservation de 3 matériels.
- Sélecteur d'état dans le panneau de technique, avec contrôle de validité avant création des propositions.
- Les trois effets passent par les décisions de validation du MJ, la prévisualisation transactionnelle et l'annulation existantes.
- Le remplacement de fatigue par des matériels reste à développer ; cette version n'implémente pas cette substitution.

## Vérifications

- 58 fichiers `test_*.cjs` : réussis.
- Nouveau `test_maintenance_v094.cjs` : effets, prévisualisation, état absent, validation partielle et annulation.
- `node --check` sur le JavaScript extrait : réussi.
- Test d'interface Chromium `test_interface_v087.py` : réussi.
- Pas de nouveau test Chromium spécifique à Maintenance dans cette livraison.

## Prochaines étapes

- Dépense de matériel à la place de fatigue avec restrictions d'éligibilité et décision du MJ.
- Puissance maximale et interdiction de regagner du matériel pendant la scène.
