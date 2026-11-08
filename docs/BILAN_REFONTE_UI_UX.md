# État des critères de la refonte UI/UX

État proposé au lot 6, le 8 novembre 2026. Le cahier des charges original reste inchangé.
Cette grille distingue les contrôles automatiques de la recette du propriétaire : elle ne
certifie ni toute l’accessibilité ni toutes les règles du jeu. Les PR restent à examiner.

| Critère du cahier des charges | État et preuves principales |
|---|---|
| Six rubriques desktop/mobile | Implémenté ; `test_uiux_navigation.py`, parcours clavier et sept formats |
| Galerie PJ/PNJ, + et accès aux fiches | Implémenté ; `test_galerie_personnages.py` et retours de recette |
| Pastille, légende, filtre et tri d’importance | Implémenté ; tests galerie JS/navigateur |
| Importance sans écrasement des ressources | Implémenté ; classification indépendante et adoption explicite des profils |
| PNJ : trois onglets, désir, principe et lieu | Implémenté ; tests fiches et ressources ; anciennes limites conservées sans adoption de profil |
| PJ : quatre onglets, progression dans Livret | Implémenté ; tests fiches et Livrets ; manœuvres détaillées différées explicitement |
| Ressources disponibles sur desktop, mobile maîtrisé | Panneau permanent desktop ; option de repli mobile testée sans mutation de données ; confort à valider par le propriétaire |
| Fatigue 3/5/10/15, clic et boutons, absence de capacité | Profils optionnels, modèles et parcours PNJ ; quatre segmentations vérifiées dans le parcours transversal |
| Équilibre PJ, centre distinct et PNJ à principe unique | Affichage testé ; échelle PNJ étendue après activation volontaire, pas de réinterprétation des anciennes sauvegardes |
| États/statuts distincts, respect du combat | Tests fiches, protections, 13 techniques Terre et annulation ; aucun contournement du moteur par le nouveau repli |
| Hiérarchie de lieux, liens et identifiants stables | Tests de domaine (profondeur 12 000), navigateur et liens croisés ; cette profondeur ne garantit pas le confort d’affichage de 12 000 cartes |
| Présence et associations séparées, descendants récursifs | Tests Lieux et recette transversale ; groupe Domiciliés séparé également |
| Retours, confirmations et erreurs | Brouillons fiches/lieux, suppression explicite, quota injecté et rollback testés |
| Imports/exports anciens et données nouvelles | Suites sauvegardes/profils/Lieux/Livrets et restauration complète combinée ; point antérieur distinct de l’export récent |
| Tests JavaScript existants | Conservés et exécutés ; les chiffres V2.32 restent historiques |
| Régressions ciblées | Suites pour ressources, importance, galerie, liens, progression et sauvegardes |
| Tests desktop/tablette/mobile/clavier | Chromium automatisé ; recette Chrome macOS du propriétaire encore attendue |
| Hors connexion, aucune dépendance réseau applicative | Chargement local puis réseau coupé, export/restauration combinés ; ouverture file:// bloquée dans le cloud |
| Survie à la navigation et au rechargement | Comparaison des modèles et des chaînes de stockage, puis rechargement et restauration |
| Pas de PDF ni d’art protégé ajouté | Aucun nouvel actif commercial versionné ; icônes locales existantes et portraits utilisateur |
| Décisions et bilan | Rapports par lot, architecture, tests, ROADMAP, présente grille et recette sans commandes |

## Ce qui reste explicitement à faire

- Recette personnelle sur Chrome macOS, dont double-clic et confort réel de lecture.
- Textes/déclencheurs, actions, Palmarès complet et choix d’évolution spécifiques aux dix Livrets,
  selon une spécification distincte ; les composants actuels ne les prétendent pas intégrés.
- Refonte fonctionnelle de Combats, explicitement hors périmètre du cahier des charges actuel.
- Audit réglementaire exhaustif des combinaisons, audit complet d’accessibilité et vérifications
  Safari/Firefox : non certifiés par les parcours Chromium.
- Examen des PR dépendantes et autorisation explicite avant intégration dans main.

Commencer la validation personnelle par [la recette globale](RECETTE_REFONTE_UI_UX.md).
Voir [le rapport du lot 6](RAPPORT_UI_UX_LOT6.md) pour les changements et résultats exacts.
