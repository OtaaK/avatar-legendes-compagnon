# V0.76 — Réinitialisation transactionnelle du terrain

- Nouvelle fonction `CombatCore.clearEngagements(s)` : rompt toutes les paires engagées en une seule transaction, enregistrée dans l'historique et annulable via `undo`.
- Aucun snapshot ni événement ajouté lorsque le terrain est déjà libre.
- Opération interdite tant que des propositions de combat sont en attente.
- Interface : bouton « Rompre tous les engagements », désactivé lorsque le terrain est libre, avec confirmation du MJ.
- Six scénarios de régression supplémentaires (`test_terrain_reset_v076.cjs`).
- Vérifications : 48 fichiers de tests Node.js réussis ; syntaxe JavaScript vérifiée ; archive ZIP vérifiée.
- Limites : les positions et distances restent déclarées par le MJ ; 13 techniques avancées sur 102 entièrement automatisées ; aucun test en navigateur réel.
