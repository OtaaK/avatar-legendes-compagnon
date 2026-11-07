# Rapport V2.13 — scénarios de combat multi-passes

## Développement
- `nextRound` est désormais atomique : si une erreur survient pendant l'expiration d'effets, l'état de combat est intégralement restauré (y compris historique, snapshots et séquence).
- Nouveau test d'intégration couvrant trois passes, expiration de Gêné, Renforcé, deux annulations successives, En danger à fatigue maximale et corruption d'une étoile de lave.
- Le Feu reste en attente de la certification des 13 techniques de Terre.

## Limites
- Ces scénarios ne certifient pas encore toutes les combinaisons des 13 techniques.
- Vérification navigateur limitée au chargement et aux erreurs JavaScript, si disponible.
