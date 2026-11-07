# Reprise du projet — V2.04
Priorité : terminer les 13 techniques de Terre avant Feu. Préférence utilisateur : lots substantiels, moins de versions. V2.04 renforce les validations différées de Gantelet de terre, Projection tellurique, Mouvements tectoniques et Mords la poussière. Voir RAPPORT_V204.md et test_terre_v204.cjs.


V2.05 : validation d’intégrité de cinq techniques Terre, tests de non-régression.


## V2.06
Renouvellement des statuts temporaires et provenance indépendante. Voir RAPPORT_V206.md.


## V2.07
Chronologie Étoile de lave : activation avant attaque dans la même passe, UI filtrée ; test_terre_v207.cjs.

## V2.08
Filtrage offensif réel du Fracasser Étoile de lave ; test_terre_v208.cjs. Continuer priorité 13 Terre, valider parcours combat Chromium.

## V2.09
Transfert des provenances indépendantes entre entraves multiples lors de la libération. Voir RAPPORT_V209.md et test_terre_v209.cjs. Terre encore à valider intégralement.


V2.10 : statut temporaire + application indépendante ultérieure, conservation à expiration, test_terre_v210.cjs.


## V2.11
Bouclier de roche : préservation de Gêné avec source temporaire ou entraves de métal lors de la révocation et consommation. Nouveau test `test_terre_v211.cjs`.


## V2.12
Fin de passe désormais annulable et atomique. Voir RAPPORT_V212.md.


## V2.13
Transition nextRound atomique ; test_terre_v213.cjs multi-passes.


## V2.14
Enfouissement exige désormais coût 2 + Piégé indissociables ; Gantelet valide les montants exacts et refuse les effets additionnels. 172/172 tests ; syntaxe et chargement Chromium validés. Voir RAPPORT_V214.md.


## V2.15
Correction de l’expiration simultanée de sources d’un même statut, en préservant la provenance extérieure sans dépendre de l’ordre. Test `test_terre_v215.cjs`.


## V2.16
Fin de combat et nouvelle scène atomiques ; validation préalable des références des Entraves de métal. Test `test_terre_v216.cjs`.

## V2.17 — 2026-11-06

- Interaction Bouclier de roche / Entraves de métal / Enfouissement : statut Gêné préservé lors de la consommation simultanée et retiré après libération lorsqu'aucune source extérieure ne demeure.
- Correction de la provenance `metalExternalGene` lorsque Gêné provenait seulement du bouclier.
- 175/175 tests Node ; syntaxe et Chromium OK.
- Prochaine priorité : scénarios complets de combat multi-passes et validation des 13 techniques de Terre, avant le Feu.

## V2.18
Rollback intégral de endRound, endCombat et newScene (snapshots antérieurs préservés). Test `test_terre_v218.cjs`.


## V2.19
22 commandes MJ supplémentaires protégées par transaction de sauvegarde ; vérifier le rapport V219.


## V2.20
Révélation atomique Gêné + combat trois passes/trois combattants et six annulations. Voir RAPPORT_V220.md.

## V2.21
Libération de Piégé annulable avec historique ; progression UI transactionnelle ; test_terre_v221.cjs. Priorité : couverture complète des 13 techniques de Terre avant le Feu.


## V2.22
# V2.22 — transactions de combat et libération de Piégé

- Libération de Piégé : refus explicite en présence de propositions non résolues.
- Libération atomique : une erreur pendant l’écriture du journal restaure combattants, notes, historique et pile d’annulation.
- Interface : les transactions imbriquées (notamment commandes enveloppées appelant déjà `commitCombatMutation`) ne déclenchent plus de sauvegardes intermédiaires ; une seule écriture est effectuée au niveau externe.
- Nouveau test `test_terre_v222.cjs` : refus, coût mixte, annulation et panne tardive simulée.

Les 13 techniques de Terre restent intégrées, sans certification exhaustive. La priorité reste la validation de combats multi-techniques.

## V2.23
Statuts de passe : ne pas classer les sources persistantes de Terre comme applications permanentes externes. Test `test_terre_v223.cjs`. Continuer les scénarios multi-techniques avant le Feu.


## V2.24
Armure de terre : dialogue de choix pour les attaques à plusieurs états sans fatigue, y compris réserve de 1. Voir RAPPORT_V224.md.

## V2.25
Correction du préfiltre UI Armure de terre : ignorer les notes de fatigue neutralisées par d’autres protections. Nouveau test test_terre_v225.cjs.

V2.26 : correction armure condition absorbée par attaque, pas par cible ; test_terre_v226.cjs.

V2.27 : allocation Armure de terre sans dialogues après épuisement de réserve ; tests navigateur et régression.

## V2.28
Changement de scène : révocation métier des effets de durée scène, nettoyage des statuts et undo unique. Entraves conservées. Voir RAPPORT_V228.md.

## V2.29
Six transactions de Terre restaurent désormais toutes les piles de snapshots en cas d’échec tardif. Voir RAPPORT_V229.md et test_terre_v229.cjs.


## V2.30
Transactions atomiques pour spendEarthArmor et removeTemporaryEffect, cinq scénarios de régression ; voir RAPPORT_V230.md.


## V2.31
Création/édition de repères et libération d’Entraves de métal atomiques, y compris historique ; test_terre_v231.cjs.
