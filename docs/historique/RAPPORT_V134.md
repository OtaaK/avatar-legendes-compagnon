# V1.34 — Export de compte rendu sans prédiction secrète

- Nouveau bouton **Exporter un compte rendu partageable (sans pari secret)**.
- Le format de consultation est explicitement distinct d’une sauvegarde importable.
- Retire `reedPrediction` et `airReedPrediction` de tous les objets, y compris les actions et instantanés d’annulation.
- Les trois exports privés restent intacts et restaurables.
- **Limite :** les notes libres et les noms saisis par les utilisateurs ne sont pas filtrés ; les vérifier avant partage. Les exports privés contiennent toujours les paris.

## Tests
- 95/95 tests Node.js réussis.
- 9/9 tests Chromium réussis, y compris le nouvel export.
- Vérification de syntaxe JavaScript réussie.
- ZIP vérifié sans erreur CRC.
