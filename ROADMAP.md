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
- [x] Cadrer la refonte UI/UX dans le cahier des charges ajouté par le propriétaire.

Voir `docs/RAPPORT_RETOURS_RECETTE_V233.md`.

## Fiabilité des sauvegardes — proposition suivante

- [x] Refuser les engagements et pièges mal formés avant import.
- [x] Vérifier le rendu avant écriture des données importées et tester les échecs.
- [x] Tester export, restauration, rechargement et annulation d’un combat avec effets.
- [ ] Examiner cette nouvelle PR avant toute intégration.

Voir `docs/RAPPORT_FIABILITE_SAUVEGARDES_V233.md`. La refonte UI/UX est préparée séparément par le propriétaire.

## Refonte UI/UX progressive

Référence : `CAHIER_DES_CHARGES_UI_UX_AVATAR_COMPAGNON_CODEX.md`.
Plan et audit : `docs/PLAN_REFONTE_UI_UX.md`. Aucun lot ne doit être fusionné sans accord.

- [x] Lot 0 : vérifier la V2.33 réelle, les modèles et les tests de référence.
- [x] Lot 1 sur branche dédiée : thème, navigation six rubriques, responsive, clavier et Gestion.
- [ ] Examiner et valider visuellement le lot 1 avant intégration.
- [x] Lot 2 sur branche dépendante : cartes PJ/PNJ, importance et filtres.
- [ ] Examiner le lot 2 séparément ; il dépend de la PR nº 3 non fusionnée.
- [x] Lot 3A sur branche dépendante : fiches distinctes, consultation/édition, brouillons protégés, ressources courantes et portraits.
- [ ] Examiner le lot 3A sans fusion automatique des PR précédentes.
- [x] Lot 3B sur branche dépendante : modèle et combat compatibles avec capacités PNJ, états personnalisés et bornes à principe unique, sans écraser les anciennes valeurs.
- [ ] Examiner le lot 3B et sa procédure de retour aux données antérieures avant intégration.
- [ ] Lot 4 : Lieux hiérarchiques, liens PNJ et compatibilité des sauvegardes.
- [ ] Lot 5 : structure des Livrets ; mécanismes détaillés des dix Livrets reportés.
- [ ] Lot 6 : harmonisation et recette transversale finale.
