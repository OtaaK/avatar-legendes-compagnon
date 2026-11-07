# Avatar Légendes : Compagnon — V0.91

## Nouvelle mécanique : Pose de pièges (livre p. 293)

- La technique est accessible dans l'approche Esquiver et analyser suivant les règles de disponibilité existantes.
- La zone doit être décrite (1 à 120 caractères). Le moteur propose un coût de 1 fatigue et l'armement d'un piège. Chaque proposition reste soumise à l'approbation du MJ.
- Les pièges armés sont conservés dans `combat.traps` avec un identifiant, le propriétaire, la zone et la passe d'installation.
- L'interface affiche les pièges et un bouton **Déclencher**. Le MJ désigne explicitement le prochain adversaire entrant dans la zone, choisit un état non déjà coché et une direction d'équilibre (+1 ou −1).
- Le déclenchement applique ensemble l'état, le décentrage et la consommation du piège ; en cas de validation incorrecte, aucune mutation. L'action peut être annulée.
- Les pièges restent armés entre les passes, jusqu'à leur déclenchement ; le MJ arbitre la fiction et l'identification de l'adversaire.

## Contrôles exécutés

- 56/56 fichiers de tests Node.js réussis (55 précédents et `test_pieges_v091.cjs`).
- `node --check` du JavaScript embarqué réussi.
- Test Chromium `test_interface_v087.py` réussi sur la V0.91 : parcours d'interface préexistant.
- Intégrité de l'archive ZIP vérifiée.

## Limites

- La nouvelle interaction **Déclencher un piège** n'a pas encore de test Chromium spécifique ; son moteur est testé dans Node.js.
- Les personnages ne portent pas d'attribut de camp : le MJ confirme que la cible est bien un adversaire. Le moteur interdit seulement l'autociblage.
- Le nombre de techniques avancées entièrement automatisées n'est pas réévalué ; l'estimation historique de 14/102 demeure non auditée. Cette technique reste assistée car la détection d'entrée dans la zone dépend du MJ.
