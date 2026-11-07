# V0.73 — Suivi des engagements

- Ajout de `engagements` au modèle de combat (paires non orientées).
- API `isEngaged` / `setEngagement` avec validation des combattants, refus des auto-engagements et blocage en cas de propositions non résolues.
- Panneau MJ pour cocher les engagements confirmés, sans déduire les positions.
- Glissade rompt les engagements du lanceur avec les ennemis déplacés ; les résistants restent engagés.
- Les ruptures sont des événements atomiques soumis à validation, prévisualisation et annulation.
- Limite : aucune grille, distance ni création automatique de nouveaux engagements ; arbitrage du MJ indispensable.

## Contrôles

45 fichiers `test_*.cjs` exécutés avec Node.js : 45 réussites. 8 nouveaux scénarios d’engagements. Syntaxe JavaScript vérifiée avec `node --check`. Tests en navigateur réel non réalisés.
