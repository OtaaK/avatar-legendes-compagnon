# V0.32 — Stabilisation ciblée (5 novembre 2026)

## Modifications effectuées
- Validation atomique des effets simultanés : le moteur calcule d'abord sur une copie et ne valide les modifications qu'après réussite complète. Les objets combattants restent référencés par l'interface et les tests existants.
- Plusieurs reports de fatigue sur une même cible : les états choisis sont réservés entre propositions pour éviter les doublons ; un choix invalide annule la validation.
- Statut **En danger** au début d'une nouvelle passe : à fatigue 5, le MJ doit choisir explicitement un état disponible ; la fatigue n'est plus plafonnée silencieusement. La passe n'avance pas si le choix est invalide ou annulé.
- Aucune automatisation supplémentaire des techniques avancées sans vérification des règles.

## Vérifications exécutées
- 6 tests des statuts (hérités de V0.30) : réussis.
- 6 tests des règles (hérités de V0.29) : réussis.
- 5 tests d'intégration (hérités de V0.31) : réussis.
- 6 nouveaux tests d'effets simultanés et d'En danger : réussis.
- Vérification syntaxique de l'intégralité du script : réussie.
- Chromium headless : commande interrompue après 12 s, sans sortie DOM ; **aucun test navigateur validé**.

## Limites importantes
- Les réactions dérivées de Riposter / Protection peuvent encore entraîner un dépassement de fatigue qui nécessite un choix d'état non proposé directement par l'interface ; la transaction est refusée plutôt que de perdre de la fatigue.
- L'ensemble des 102 techniques avancées demeure non documenté mécaniquement et sous arbitrage MJ.
- Persistance après fermeture/réouverture d'un navigateur réel non validée.
- Les effets narratifs et situations de mise hors combat nécessitent toujours l'arbitrage du MJ.

## Recommandation
Utiliser V0.32 comme version de test, après export préalable de la campagne. Ne pas la considérer comme version de production tant que les tests navigateur et les réactions dérivées ne sont pas terminés.
