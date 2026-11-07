# Rapport V2.14 — intégrité des propositions de Terre

## Corrections
- **Enfouissement** : validation indivisible du coût de 2 fatigues et de Piégé sur la cible choisie ; suppression de l’exception qui permettait un coût isolé.
- **Gantelet de terre** : validation exacte du coût de 1 fatigue, des 2 fatigues sur la cible lorsque ce choix est retenu, et du nombre d’états ; rejet des statuts supplémentaires.
- Adaptation du test historique V1.60 pour utiliser une proposition Enfouissement complète et cohérente.
- Nouveau test V2.14 de rejets atomiques, de résolution et d’annulation.

## Vérifications
- 172 fichiers de tests Node : 172 réussis.
- Syntaxe JavaScript : `node --check` réussi.
- Chromium : chargement HTML via `set_content`, aucune erreur JavaScript au chargement.
- Archive ZIP : test d’intégrité réussi.

## Limites
- Les tests ne couvrent pas encore exhaustivement les 13 techniques de Terre dans tous les scénarios de combat.
- Le chargement Chromium ne constitue pas un test manuel complet de l’interface.
- Les autres familles restent hors priorité.
