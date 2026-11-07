# Avatar Légendes : Compagnon — V0.95

## Évolution du simulateur

La substitution des matériels aux coûts de fatigue personnelle est disponible pour les techniques technologiques. Pour les techniques de base, une confirmation explicite du MJ atteste que la technique mobilise l'entraînement technologique.

- Le formulaire permet de choisir une quantité de matériels à dépenser.
- La quantité ne peut dépasser ni la réserve courante ni la fatigue personnelle proposée par la technique.
- La fatigue substituée est remplacée par une proposition `materials_spend`, acceptée ou refusée par le MJ.
- La validation vérifie à nouveau la réserve et applique la dépense de manière transactionnelle.
- Prévisualisation et annulation préservent les ressources initiales.

## Vérifications

- 59/59 fichiers de tests Node.js réussis.
- Chromium : `test_interface_v087.py` et `test_interface_pieges_v092.py` réussis.
- Vérification de syntaxe JavaScript : réussie.

## Limites et suite

La substitution ne couvre que les coûts de fatigue directement proposés par les techniques dans le moteur, et non les réactions ou arbitrages manuels. `Puissance maximale` reste à automatiser. La confirmation de l'utilisation technologique pour les techniques de base relève du MJ.
