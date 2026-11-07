# V1.30 — Vérification Chromium des sauvegardes et noms d'exports

## Modifications
- Les trois fichiers JSON exportés portent désormais la version `v1-30` : sauvegarde complète, fiches, combat.
- Nouveau test `test_chromium_v130.py` : lancement de Chromium, création de personnages et combattants, téléchargement réel des trois exports via Blob, lecture et vérification de leur JSON, mutation en mémoire, puis import de la sauvegarde complète et vérification de la restauration.
- Nouveau test `test_exports_v130.cjs` : régression sur les trois noms de fichiers.
- Aucun changement des règles des techniques ni du format JSON de sauvegarde ; compatibilité conservée.

## Vérifications
- 92 tests Node.js réussis sur 92.
- `node --check` du JavaScript embarqué réussi.
- `test_chromium_v130.py` réussi dans Chromium, avec stockage simulé en mémoire.
- Le test historique `test_chromium_v129.py` n'est pas réexécuté avec succès contre V1.30 car il exige explicitement un titre V1.29 ; le test V1.30 le remplace pour cette livraison.
- Intégrité de l'archive vérifiée.

## Limites
- Le navigateur de l'environnement bloque les navigations directes vers une origine locale ou externe. La persistance réelle de `localStorage` après rechargement ou fermeture n'a pas été testée ; le test injecte un stockage en mémoire.
- Le test Chromium V1.30 couvre l'export/import, mais pas encore le parcours complet des clics d'approbation MJ.
- Cette version améliore la fiabilité des sauvegardes et la couverture navigateur ; elle n'ajoute pas de nouvelles techniques.
