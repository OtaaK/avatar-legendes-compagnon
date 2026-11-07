# V2.12 — Fin de passe annulable

- `endRound` sauvegarde désormais un instantané avant l’application de **Confiant** (protection réussie), la récupération de fatigue de **Renforcé** et le passage à la phase `fin`. L’opération est enregistrée dans l’historique et peut être annulée intégralement.
- Une exception pendant la résolution restaure l’état précédent au lieu de laisser une passe partiellement modifiée.
- Nouveau test `test_terre_v212.cjs` : protection réussie/attaquée, Renforcé, undo, double résolution, propositions en attente.
- Limite : les parcours complets d’interface doivent encore être vérifiés sur navigateur.
