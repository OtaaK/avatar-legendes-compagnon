# V0.34 — Sécurisation des imports et tests de persistance

## Modifications
- Import d’un combat : contrôle des liens avec les fiches de personnages avant remplacement.
- Au démarrage, le premier affichage n’écrase plus immédiatement les données du stockage (utile si la dernière sauvegarde est illisible).
- Noms des exports actualisés à la V0.34, sans changer les clés de stockage pour maintenir la compatibilité.

## Tests
- 26 tests de règles, intégration, simultanéité et réactions existants, exécutés avec succès.
- 8 nouveaux tests de persistance et validation d’import exécutés avec succès.
- **34 tests réussis** au total, sans test navigateur validé.
- Chromium headless essayé sur la V0.33 : délai de 12 s dépassé, aucun DOM retourné. Ce résultat ne prouve ni réussite ni échec de l’application.

## Limites
- Les nouveaux tests simulent le stockage local : ils ne prouvent pas la persistance après fermeture d’un vrai navigateur.
- Le rendu sur téléphone et les parcours navigateur restent à valider.
- Les 102 techniques avancées ne sont pas encore vérifiées individuellement.
- Les erreurs de stockage lors de modifications manuelles restent un risque à auditer.
