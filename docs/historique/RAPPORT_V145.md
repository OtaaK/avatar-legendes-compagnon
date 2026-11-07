# V1.45 — Contre-attaque : contrôle conjoint des statuts

- Corrige la vérification des statuts négatifs dans la proposition et la validation tardive de Contre-attaque.
- Auparavant, un tableau `activeStatuses` présent mais vide masquait les valeurs de `statuses` ; le contrôle examine désormais les deux tableaux.
- Nouveau test `test_armes_v145.cjs` : rejet à la proposition, rejet à la validation et cas positif.
- Les statuts positifs et les états continuent de suivre les contrôles existants ; aucun changement de règle.

## Limites
- La suite Chromium historique et la persistance réelle après fermeture du navigateur ne sont pas certifiées dans cette livraison.
