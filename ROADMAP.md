# Feuille de route

## V2.33 — audit et corrections de Terre

- [x] Comparer les 13 techniques au PDF fourni et distinguer anomalies et arbitrages.
- [x] Corriger A1–A7 et ajouter les scénarios de régression correspondants.
- [x] Ajouter les parcours navigateur des 13 techniques avec stockage réel, rechargement et annulation.
- [x] Corriger la validation des effets mécaniques au rechargement (A8).
- [x] Actualiser catalogue, matrice de couverture et aides utilisateur.
- [x] Conserver les tests et rapports historiques ; retirer les métadonnées macOS inutiles.

## À poursuivre

- [ ] Trancher les décisions ouvertes dans `docs/DECISIONS.md` avant de modifier les comportements concernés.
- [ ] Vérifier les anciennes sauvegardes présentant une provenance d'Avantagé ambiguë avec le MJ.
- [ ] Auditer séparément les coûts volontaires des autres familles.
- [ ] Élargir les combats combinés ; les tests actuels ne certifient pas toutes les interactions possibles.
- [x] Évaluer le découpage progressif du HTML ; recommandation documentée dans `docs/ARCHITECTURE.md`.
- [ ] Décider séparément du périmètre d’une extraction modulaire avec génération du HTML autonome.

## Références

Base historique : `docs/AUDIT_V232.md`. Changements : `docs/RAPPORT_V233.md`.
Validation et périmètre actuel : `docs/AUDIT_V233.md`.

## Maintenance de structure V2.33

- [x] Sécuriser le travail local et récupérer AGENTS.md depuis GitHub.
- [x] Inventorier les fichiers, doublons, dépendances et candidats inutilisés.
- [x] Séparer application, données, tests, scripts et documentation.
- [x] Conserver les tests et archives ; ajouter un index historique.
- [x] Vérifier les suites avant et après les déplacements, sans changer les règles.
- [x] Ajouter une procédure commune de test et un contrôle de fonctionnement hors connexion.
- [ ] Examiner la Pull Request, puis décider explicitement de son intégration.

Voir `docs/maintenance/RAPPORT_REORGANISATION_V233.md` et `docs/maintenance/INVENTAIRE.csv`.

## Retours de recette manuelle

- [x] Synchroniser immédiatement le récapitulatif de la fiche avec fatigue/équilibre saisis.
- [x] Confirmer l'enregistrement réussi sans faux succès en cas d'échec de stockage.
- [x] Corriger l'affichage des cartes PJ dans l'onglet PNJ.
- [x] Rendre visibles l'ajout des fiches au combat et l'édition des combattants en préparation.
- [x] Vérifier persistance, erreurs et annulation avec des parcours desktop/mobile.
- [ ] Faire retester les correctifs sur Chrome/macOS avant toute fusion.
- [ ] Cadrer une future refonte UI/UX, séparément des correctifs et des règles.

Voir `docs/RAPPORT_RETOURS_RECETTE_V233.md`.
