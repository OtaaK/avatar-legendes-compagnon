# V0.77 — Désengagement individuel transactionnel

- Nouvelle fonction `CombatCore.disengageFighter(s,id)` : rompt tous les liens d’un combattant sans toucher aux engagements entre les autres.
- Une transaction et un historique groupé ; restauration intégrale par `undo`.
- Aucun historique créé en l’absence de liens ; refus si des propositions attendent validation.
- Interface : bouton « Désengager [combattant] », désactivé lorsque celui-ci n’est engagé avec personne, et confirmation du MJ.
- Sept nouveaux scénarios de régression (`test_desengager_combattant_v077.cjs`).
- Les distances et déplacements demeurent déclarés par le MJ ; pas de test en navigateur réel.
- Vérification : **49/49 fichiers de tests Node.js réussis**, syntaxe JavaScript valide, **161 fichiers** dans l'archive ZIP et intégrité vérifiée.
- Couverture inchangée : **13/102 techniques avancées entièrement automatisées**.
