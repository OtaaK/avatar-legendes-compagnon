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

Base historique : `docs/AUDIT_V232.md`. Changements : `CHANGELOG.md`.
Validation et périmètre actuel : `docs/AUDIT_V233.md`.

## Maintenance de structure V2.33

- [x] Sécuriser le travail local et récupérer AGENTS.md depuis GitHub.
- [x] Inventorier les fichiers, doublons, dépendances et candidats inutilisés.
- [x] Séparer application, données, tests, scripts et documentation.
- [x] Conserver les tests et archives ; ajouter un index historique.
- [x] Vérifier les suites avant et après les déplacements, sans changer les règles.
- [x] Ajouter une procédure commune de test et un contrôle de fonctionnement hors connexion.
- [x] Examiner et intégrer la PR nº 1 après validation explicite du propriétaire.

Voir `docs/maintenance/RAPPORT_REORGANISATION_V233.md` et [son inventaire archivé](https://github.com/OtaaK/avatar-legendes-compagnon/blob/avant-nettoyage-2026-11-13/docs/maintenance/INVENTAIRE.csv).

## Retours de recette manuelle

- [x] Synchroniser immédiatement le récapitulatif de la fiche avec fatigue/équilibre saisis.
- [x] Confirmer l'enregistrement réussi sans faux succès en cas d'échec de stockage.
- [x] Corriger l'affichage des cartes PJ dans l'onglet PNJ.
- [x] Rendre visibles l'ajout des fiches au combat et l'édition des combattants en préparation.
- [x] Vérifier persistance, erreurs et annulation avec des parcours desktop/mobile.
- [x] Obtenir la validation du propriétaire pour les correctifs avant fusion.
- [ ] Cadrer une future refonte UI/UX, séparément des correctifs et des règles.

Voir `CHANGELOG.md` et [le rapport de recette archivé](https://github.com/OtaaK/avatar-legendes-compagnon/blob/avant-nettoyage-2026-11-13/docs/RAPPORT_RETOURS_RECETTE_V233.md).

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

## Mission 2 — étape d’inventaire soumise à accord

Missions 0 et 1 fusionnées dans main (PR 17 et 18). Sauvegarde `avant-nettoyage-2026-11-13` publiée. [Plan et preuves](docs/maintenance/nettoyage/PLAN.md), 532 fichiers classés, CHANGELOG proposé, aucun fichier existant retiré/déplacé. Attendre l’accord sur les 278 chemins à archiver et les deux helpers ; conserver les 230 scripts sans regroupement physique. Après réalisation et comparaison des contrôles, demander séparément l’accord de fusion. Mission 3/refonte UI non commencées.

## Exécution approuvée de la mission 2

Plan accepté par Alex le 13 novembre 2026. Nettoyage dans la même PR 19, sans fusion :
278 chemins archivés, deux helpers retirés, liens corrigés et 230 scripts conservés.
Résultats et limites : [bilan](docs/maintenance/nettoyage/BILAN.md). L’accord de fusion
reste distinct ; aucune mission 3 ni refonte UI commencée.

## Mission 3 — architecture sans changement de fonctionnement

Missions 0/1/2 fusionnées ; mission 3 autorisée. [Plan en cinq PR](docs/architecture/PLAN_MISSION_3.md). 3A préparée : contrats et contrôles, HTML et anciens tests inchangés. 3B : extraction et HTML généré déterministe ; 3C : persistance ; 3D : affichage/commandes ; 3E : migration progressive des tests vers des imports. Aucun nouveau paquet/framework, aucune refonte UI. Les étapes sont livrées et examinées séparément, sans fusion automatique.

## Étape 3B — sources et HTML généré

3A fusionnée (PR 20), 3B autorisée. Sources déplacées sans réécriture ; assemblage déterministe et contrôle de divergence ; façade Node et parité sources/HTML/Chromium. L’HTML reste autonome et identique à la référence. [Guide](docs/architecture/SOURCES_ET_BUILD.md), [bilan](docs/architecture/BILAN_3B.md). Prochaines étapes distinctes : isoler persistance, puis affichage/commandes, puis migrer les anciens tests. Aucun framework ou refonte UI.
