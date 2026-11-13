# Historique des changements

**Consolidation approuvée par Alex le 13 novembre 2026 — PR nº 19, non fusionnée.**
Point d’entrée des changements ; audits et guides détaillés conservés séparément.
Les anciens rapports sont archivés dans Git sous l’étiquette de sauvegarde.

Les anciennes versions et leurs limites ne doivent pas être présentées comme l’état
actuel. Les textes complets restent consultables dans
[l’étiquette avant nettoyage](https://github.com/OtaaK/avatar-legendes-compagnon/tree/avant-nettoyage-2026-11-13).
Les PR de convergence React non fusionnées ne sont pas des fonctionnalités de `main`.

## V2.33 — maintenance du 13 novembre 2026

- **PR 17, mission 0** : règles de collaboration, accords de fusion et ordre des missions.
- **PR 18, mission 1** : identifiants importés contrôlés, données séparées des gestionnaires
  JavaScript, défense du rendu. Aucun changement de règle de jeu ou dépendance ajoutée.
- Les deux PR sont fusionnées dans `main`. Base avant mission 2 : `38943c5`.
- Contrôles alors exécutés : 192 scripts JS et 38 navigateur réussis. La restriction cloud
  `file://` reste explicite ; aucun double-clic macOS n’est certifié par ces contrôles.
- Risque documenté : refus d’anciens identifiants hors format sûr, sans renommage ni migration
  silencieuse. Le report vers les branches de convergence reste à vérifier avant intégration.

Détails : [rapport de sécurité](docs/securite/IMPORTS_IDENTIFIANTS.md).

## V2.33 — maintenance et corrections du 7 novembre 2026

### Préservation et organisation — PR 1

- Travail V2.33 initialement local préservé, tests séparés de l’application, matrice dans
  `data/`, outils communs et contrôle hors connexion ajoutés.
- Les anciens rapports et tests sont conservés ; leur âge n’est pas une preuve d’inutilité.
- Les preuves d’identité du HTML du premier déplacement concernent le commit `67273e0`,
  avant les correctifs fonctionnels suivants, et ne certifient pas l’identité du HTML actuel.

Détails : [rapport de réorganisation](docs/maintenance/RAPPORT_REORGANISATION_V233.md).

### Terre — assistance partielle testée

- Correction des coûts volontaires, de la durée de Mouvements tectoniques, de la chronologie
  d’Étoile de lave et de la provenance des avantages persistants.
- Boue gluante raccordée aux protections et à l’annulation transactionnelle ; coûts de
  résistance d’Escalier et déplacement de Gantelet corrigés.
- Références de provenance des effets conservées au rechargement. Sauvegardes et formats
  maintenus ; les indicateurs anciens ambigus restent à examiner avec le MJ.
- Les choix narratifs et règles non tranchées ne sont pas certifiés par les tests ; les autres
  familles ne bénéficient pas implicitement du même niveau de vérification.

Détails techniques conservés dans [l’audit V2.33](docs/AUDIT_V233.md) et les
[décisions](docs/DECISIONS.md). Source de cette synthèse :
[rapport original V2.33](https://github.com/OtaaK/avatar-legendes-compagnon/blob/avant-nettoyage-2026-11-13/docs/RAPPORT_V233.md).

### Retours de recette Chrome sur MacBook — PR 1

- Les ajustements de ressources sont reflétés dans le récapitulatif ; confirmation après
  enregistrement réussi de la fiche uniquement.
- La carte PJ reste dans son groupe ; les PNJ des fiches peuvent être ajoutés au combat.
- Les combattants rapides sont modifiables avant révélation, sans écraser leur fiche
  permanente. Identité protégée, effets maintenus, transactions et annulation conservés.
- Les tests de ces correctifs sont distincts du retest personnel sur Mac ; leur exécution
  sous Chromium/Linux ne vaut pas validation générale de Chrome/macOS.

Guide actif : [recette manuelle](docs/RECETTE_MANUELLE_V233.md). Source complète :
[rapport des retours](https://github.com/OtaaK/avatar-legendes-compagnon/blob/avant-nettoyage-2026-11-13/docs/RAPPORT_RETOURS_RECETTE_V233.md).

### Fiabilité des sauvegardes — PR 2

- Validation avant import, conservation des données en cas de fichier invalide ou d’échec
  de rendu/stockage, restauration des écritures partielles et contrôles de liens fiche/combat.

Détails conservés : [fiabilité des sauvegardes](docs/RAPPORT_FIABILITE_SAUVEGARDES_V233.md).

## V2.32 et versions antérieures

- La base de reprise V2.32 reste documentée par [l’audit](docs/AUDIT_V232.md) et le
  [rapport conservé](docs/RAPPORT_V232.md).
- Les notices historiques retracent les ajouts progressifs de techniques, statuts,
  transactions, durée des effets et annulations. Leurs chiffres de tests et réserves sont
  propres à chaque version ; ils ne sont pas des résultats de la version actuelle.
- Les **275 fichiers originaux** restent disponibles intégralement dans
  [l’archive Git identifiée](https://github.com/OtaaK/avatar-legendes-compagnon/tree/avant-nettoyage-2026-11-13/docs/historique).
  L’[inventaire détaillé](docs/maintenance/nettoyage/INVENTAIRE.csv) donne tous leurs noms,
  tailles et identifiants Git.

Cette synthèse ne prétend pas retranscrire chaque phrase historique. L’archivage approuvé
préserve les originaux sous l’étiquette, sans réécriture d’historique. Le [plan de nettoyage approuvé](docs/maintenance/nettoyage/PLAN.md) et le
[bilan de son exécution](docs/maintenance/nettoyage/BILAN.md) donnent les preuves et limites.

## V2.33 — nettoyage approuvé, PR 19 non fusionnée

Archives historiques, ancien inventaire et deux récits de changement regroupés sous le
point de sauvegarde Git ; audits, guide de recette et rapport de fiabilité conservés.
Les deux helpers sans appel statique repéré sont retirés, sans changement des parcours.
Les tests restent à leur place ; une ancienne commande de leur commentaire est corrigée.
Aucune extraction de moteur, migration de sauvegarde, nouvelle dépendance ou refonte UI.
Les résultats finaux sont consignés dans le [bilan](docs/maintenance/nettoyage/BILAN.md).

## V2.33 — mission 3A, préparation architecturale non fusionnée

Contrats de référence et préparation centralisée des nouveaux tests ; comparaison d’un
scénario métier entre Node et le vrai HTML dans Chromium. Les anciens tests et le HTML
restent identiques ; aucun changement de règle, stockage, interface ou dépendance.
Les étapes suivantes restent distinctes ; [bilan](docs/architecture/BILAN_3A.md).
