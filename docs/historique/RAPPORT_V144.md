# V1.44 — Contre-attaque : validation tardive sécurisée

- Recontrôle de l’engagement et de l’approche Avancer et attaquer au moment de la validation des effets.
- Recontrôle des états cochés et statuts négatifs du riposteur au même moment.
- Un refus intégral reste possible même si la situation a changé ; une validation devenue illégale est rejetée sans effet.
- Nouveau test de régression `test_armes_v144.cjs` ; compatibilité avec les tests historiques à vérifier.
- Les changements de statut et d’approche hors des opérations contrôlées par le moteur restent soumis au MJ.

## Vérifications réalisées
- 103/103 tests Node.js réussis.
- `node --check` sur le JavaScript intégré : réussi.
- Tests Chromium ciblés V1.42 et V1.43 : voir résultats d’exécution ; suite complète non rejouée.
- Persistance après fermeture réelle du navigateur : non vérifiée.
