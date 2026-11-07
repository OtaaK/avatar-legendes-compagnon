# V1.19 — Statuts mécaniques temporaires et Mouvements tectoniques

## Référence
Annexe A du livre de règles, p. 289 : Mouvements tectoniques. Une cible ennemie ou une zone ; une zone coûte une fatigue ; les adversaires concernés deviennent Gênés pendant une passe d'armes, ou Étourdis s'ils étaient déjà Gênés.

## Implémentation
- Nouveau type d'événement `status_round`, suivi par combattant dans `roundStatuses`.
- Expiration dans `nextRound` avant les effets récurrents d'En danger.
- Préservation des statuts Gêné déjà présents ; pas de suppression des statuts non créés par la technique.
- Cible unique ou zone (coût 1 fatigue), sélection explicite des adversaires dans l'interface.
- Refus/acceptation groupés ; historique et annulation existants.

## Tests
- 82 fichiers de tests Node.js réussis.
- `node --check` du script embarqué réussi.
- Aucun test Chromium exécuté pour cette version.
- Archive ZIP vérifiée.

## Limites
- Le choix des adversaires concernés par une zone appartient au MJ ; aucune géométrie n'est déduite.
- Les autres techniques à durée limitée ne sont pas encore toutes converties au mécanisme `status_round`.
