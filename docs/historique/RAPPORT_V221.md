# Avatar Légendes : Compagnon — V2.21

## Modifications
- Libération de **Piégé** : les coûts en fatigue et états, la suppression du statut et la note sont désormais inscrits dans une transaction annulable via `CombatCore.undo`.
- Historique de la libération (`trap_escape`) et validation intégrale des coûts avant mutation.
- Interface : la libération de Piégé passe par `commitCombatMutation`, assurant la restauration en cas d’échec de sauvegarde.
- Le bouton de progression des phases (`step`) enregistre transactionnellement la révélation, l’avancement, la fin de passe et le passage à la passe suivante.
- Nouveau test de libération, refus sans mutation, annulations sur plusieurs passes.

## Limites
Les 13 techniques de Terre sont intégrées, mais leur couverture exhaustive en combat combiné reste à compléter avant les techniques de Feu.
