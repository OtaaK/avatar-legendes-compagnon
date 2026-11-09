# Feuille de route

## Orientation active — convergence vers l’interface v0

La référence visuelle devient `OtaaK/avatar-legendes-ui`. Le métier et la compatibilité
viennent de la version Codex complète, PR nº 3 à 10 incluses. Les lots HTML ci-dessous
restent l’historique et les acquis fonctionnels, pas le design cible de la nouvelle application.

- [x] Examiner les deux dépôts et relever leurs SHA ; vérifier la chaîne des PR récentes.
- [x] Identifier les fonctions métier, couplages DOM, écarts des modèles et contraintes hors ligne.
- [x] Préparer un rapport et des contrats proposés sur une branche isolée, sans code migré.
- [x] Plan validé par le propriétaire ; v0 corrigé figé à `8b8924d`.
- [x] Lot 1 implémenté : architecture, 11 modules extraits, contrats, shell v0 et prototype portable.
- [x] Lot 1 validé par le propriétaire après essai sur Mac ; lot 2 autorisé.
- [x] Lot 2 implémenté : Personnages, ressources, portraits et reprise explicite Codex dans v0.
- [ ] Recette et validation propriétaire du lot 2 avant tout nouveau lot.
- [ ] Lot indépendant **Bibliothèque de techniques**, après validation du lot 2 : catalogue seul, branche et PR propres.
- [ ] Lot 3 : Lieux et liens PNJ.
- [ ] Lot 4 : Livrets, attribution de techniques et maîtrise individuelle.
- [ ] Lot 5 : intégralité des capacités de combat existantes dans v0.
- [ ] Lot 6 : Gestion, annulations, compatibilité et distribution hors ligne qualifiée.
- [ ] Lot 7 : recette visuelle/fonctionnelle/responsive et validation avant toute fusion.

Critères d’acceptation, risques et retours arrière :
`docs/migration/FAISABILITE_CONVERGENCE_V0.md`. Résultats et réserves dans
[le bilan du lot 1](docs/migration/BILAN_LOT_1.md). Aucun déploiement ni fusion automatique.


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
- [x] Lot 4 sur branche dépendante : Lieux hiérarchiques, liens PNJ et compatibilité des sauvegardes.
- [ ] Examiner le lot 4 et effectuer sa recette navigateur avant intégration.
- [x] Lot 5 sur branche dépendante : structure des Livrets et suivi manuel ; mécanismes détaillés des dix Livrets reportés.
- [ ] Examiner le lot 5, les limites explicites du Palmarès et la recette des sauvegardes avant intégration.
- [x] Lot 6 sur branche dépendante : harmonisation et recette transversale automatisée.
- [ ] Effectuer la recette personnelle Chrome macOS sur la branche complète, puis traiter les retours.
- [ ] Examiner les PR dépendantes et autoriser explicitement leur intégration avant toute fusion.


Bilan des critères : `docs/BILAN_REFONTE_UI_UX.md`. Recette actuelle sans commandes :
`docs/RECETTE_REFONTE_UI_UX.md`. Les mécanismes propres aux dix Livrets et la refonte
fonctionnelle de Combats restent des demandes séparées ; le lot 6 ne les déclare pas terminés.


## Retours de recette du socle UI/UX

- [x] Clarifier dès le choix d’importance la préparation du profil, dont 15 fatigues légendaires.
- [x] Rafraîchir cartes et filtres après renommage d’un lieu lié.
- [x] Ajouter un retrait de combattant protégé, confirmé et annulable, sans supprimer sa fiche.
- [x] Tester erreurs de stockage, imports et rechargements pour ces corrections.
- [ ] Faire revalider les points 3, 4 et 6 par le propriétaire avant toute fusion.

Les autres parcours ont été signalés comme fonctionnels par le propriétaire. Voir
`docs/RAPPORT_RETOURS_UI_UX.md` ; aucune intégration automatique dans main.


## Lot indépendant après le lot 2 — Bibliothèque de techniques

Périmètre validé : remplacer les dix exemples fictifs par les **111 techniques Codex**
dans la rubrique Techniques v0, en conservant ses cartes, navigation et ergonomie.
Aucune règle, description ou mécanique ajoutée ; aucune commande de combat ni attribution
à un personnage. Le lot 4 conserve attribution et maîtrise individuelle, le lot 5 le combat.

Critères de validation :

1. Exactement 111 entrées, identifiants et références conservés, aucune technique fictive.
2. Recherche, filtres existants adaptés aux données réelles, compte des résultats et
   réinitialisation fiables ; aucune modification du catalogue lors de la consultation.
3. Cartes et fiches détaillées v0 présentant uniquement les champs disponibles ; données
   absentes signalées sans texte inventé. Pages, accès, rareté et indications d'assistance
   ou de validation existantes conservés, sans surestimer l'automatisation.
4. Aucun état de maîtrise global, changement de ressource, attribution ou effet de combat.
5. Catalogue identique après export/réimport des sauvegardes ; consultation sans écriture,
   démarrage hors ligne et ressources embarquées.
6. Recette clavier, tactile et quatre résolutions ; régressions historiques et tests React.
7. Branche indépendante issue du lot 2 validé, PR en brouillon et prototype portable propres.
   **Ne pas commencer avant la validation explicite du lot 2**, ni ouvrir le lot 3 sans accord.
