# V1.40 — Chronologie de À contretemps : clôture de déclaration

- Correction : la clôture globale des déclarations (`reveal`) refuse désormais toute révélation différée de **À contretemps** encore en attente, y compris lorsque le bénéficiaire est Étourdi ou Piégé et donc exempté du choix normal d’approche.
- Le refus intervient **avant** toute mutation de phase, de statuts actifs ou de fatigue ; le MJ doit d’abord révéler l’approche adverse.
- Nouveau test Node `test_armes_v140.cjs` : cas Étourdi/Piégé, absence de mutation partielle, révélation puis clôture autorisée.
- Aucun nouveau pouvoir inventé ; arbitrage MJ et confidentialité de l’écran restent inchangés.
- Persistance après fermeture réelle du navigateur non vérifiée.

## Validation effectuée
- 100/100 scripts Node.js réussis.
- `node --check` réussi.
- Chromium V1.38, V1.39 et V1.40 réussis.
