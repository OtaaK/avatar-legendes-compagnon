# Avatar Légendes : Compagnon — V1.16

## Modification fonctionnelle

Automatisation de **Colonne de pierre** (livre de règles français, annexe A, p. 289), approche *Avancer et attaquer*.

- Cible sans Gêné/Piégé : propose le statut Gêné.
- Cible Gênée : propose le statut Piégé.
- Cible Piégée : propose le statut En danger (prioritaire si la cible possède aussi Gêné).
- Refus d'une cible identique au personnage source.
- Validation MJ, refus et annulation via les mécanismes existants.

La technique n'ajoute aucun coût de fatigue, déplacement ou effet temporaire narratif absent de son texte. Les statuts déjà présents ne sont pas automatiquement retirés : la gestion générale des statuts du moteur est conservée.

## Contrôles exécutés

- 79 fichiers `test_*.cjs` : réussis.
- `node --check` sur le JavaScript extrait du simulateur : réussi.
- `test_interface_effects_v103.py` sous Chromium : réussi.
- Test spécifique : `test_colonne_pierre_v116.cjs` (trois niveaux, priorité Piégé, refus, annulation, cible invalide).
- Intégrité de l'archive ZIP : vérifiée.

## Limite connue

L'état de la cible est évalué lors de la préparation des propositions ; plusieurs techniques affectant la même cible avant une validation commune peuvent nécessiter un arbitrage du MJ. Les règles de durée et de retrait des statuts restent celles du moteur existant.
