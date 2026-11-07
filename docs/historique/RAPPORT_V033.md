# V0.33 — Réactions et dépassements de fatigue

## Modifications
- Prévisualisation sans mutation des effets validés, incluant les réactions Riposter et Protection.
- L'interface propose le choix d'un état pour la fatigue excédentaire issue d'une réaction dérivée.
- Validation atomique : une erreur de choix empêche toute modification partielle.
- Conservation de l'ergonomie et des données de la V0.32.

## Vérifications
- 26 tests exécutés avec succès (6 statuts, 6 règles, 5 intégration, 6 simultanéité, 3 réactions).
- Syntaxe du script vérifiée avec `node --check`.
- Chromium headless : nouvelle tentative interrompue après 8 secondes, aucune page DOM produite. Test navigateur non validé.

## Limites
- Le comportement dans un navigateur réel et la persistance après fermeture/réouverture restent à vérifier.
- Les 102 techniques avancées demandent encore une validation individuelle contre le livre de règles.
- Les règles narratives et les mises hors combat exigent toujours l'arbitrage du MJ.
