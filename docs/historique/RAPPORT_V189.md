# V1.89 — Annulation fidèle des transitions de passe

Correction de `CombatCore.undo` : supprime les clés apparues après la sauvegarde avant de restaurer les valeurs. Empêche les propriétés résiduelles, notamment `reedProtections`, après annulation d’une transition de passe. Deux scénarios de non-régression couvrent une et plusieurs transitions.
