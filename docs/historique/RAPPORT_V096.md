# Avatar Légendes : Compagnon — V0.96

## Fonctionnalité
- Automatisation de **Puissance maximale** (technologie, livre de règles p. 293).
- Statut Gêné pour l'utilisateur, 2 fatigues à l'adversaire, +1 par matériel de la réserve dépensé, +2 si 3 matériels ou plus.
- Dépense de toute la réserve et blocage de tout nouveau gain de matériels jusqu'à la fin de la scène (nouveau combat = nouvelle scène).
- Approbation MJ indivisible pour les effets de cette technique ; prévisualisation et annulation.
- Affichage de l'équipement hors service et validation des nouvelles propriétés dans les sauvegardes.

## Contrôles
- 60/60 tests Node.js réussis, dont `test_puissance_v096.cjs`.
- Test Chromium `test_interface_v087.py` réussi.
- Syntaxe JavaScript vérifiée.
- Archive ZIP vérifiée.

## Limites
- Les dommages dépassant 5 fatigues demandent toujours l'arbitrage des états excédentaires du MJ.
- Pas encore de test Chromium dédié au formulaire Puissance maximale.
- La fin de scène est actuellement matérialisée par la création d'un nouveau combat, pas par un bouton de réparation.
