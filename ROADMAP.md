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
- [x] Examiner et intégrer la PR nº 1 après validation explicite du propriétaire.

Voir `docs/maintenance/RAPPORT_REORGANISATION_V233.md` et `docs/maintenance/INVENTAIRE.csv`.

## Retours de recette manuelle

- [x] Synchroniser immédiatement le récapitulatif de la fiche avec fatigue/équilibre saisis.
- [x] Confirmer l'enregistrement réussi sans faux succès en cas d'échec de stockage.
- [x] Corriger l'affichage des cartes PJ dans l'onglet PNJ.
- [x] Rendre visibles l'ajout des fiches au combat et l'édition des combattants en préparation.
- [x] Vérifier persistance, erreurs et annulation avec des parcours desktop/mobile.
- [x] Obtenir la validation du propriétaire pour les correctifs avant fusion.
- [ ] Cadrer une future refonte UI/UX, séparément des correctifs et des règles.

Voir `docs/RAPPORT_RETOURS_RECETTE_V233.md`.

## Fiabilité des sauvegardes — proposition suivante

- [x] Refuser les engagements et pièges mal formés avant import.
- [x] Vérifier le rendu avant écriture des données importées et tester les échecs.
- [x] Tester export, restauration, rechargement et annulation d’un combat avec effets.
- [ ] Examiner cette nouvelle PR avant toute intégration.

Voir `docs/RAPPORT_FIABILITE_SAUVEGARDES_V233.md`. La refonte UI/UX est préparée séparément par le propriétaire.

## Priorité de maintenance — 13 novembre 2026

Mission 0 : formaliser les consignes. Mission 1 : vérifier et corriger les injections à l’import/rendu sans changer les règles ni l’interface. Mission 2 : inventaire et accord avant suppression ; mission 3 et refonte UI en attente des accords demandés.

## Mission 1 — correctif préparé sur branche dédiée

Correctif d’injection aux imports/rendu préparé, tests de non-régression ajoutés ; aucune fusion. Voir [le bilan de sécurité](docs/securite/IMPORTS_IDENTIFIANTS.md). Le report vers les branches de convergence doit être vérifié avant intégration. Mission 2 : étiquette et inventaire à présenter avant suppression ; mission 3 et UI toujours en attente des accords requis.
