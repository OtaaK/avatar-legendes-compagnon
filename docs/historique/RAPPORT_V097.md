# Rapport V0.97 — Gestion des scènes

## Évolutions de production
- `createCombat` initialise `scene: 1`.
- `CombatCore.newScene(s)` incrémente le numéro de scène et réactive les équipements désactivés par *Puissance maximale*.
- Les pièges de la scène précédente sont retirés ; fatigue, états, équilibre, matériels et numéro de passe sont conservés.
- Transaction annulable et journalisée ; refus si propositions en attente ou approche en cours de résolution.
- Bouton MJ de confirmation et affichage du numéro de scène dans l'interface.
- Validation du numéro de scène à l'import ; compatibilité avec les sauvegardes antérieures dépourvues de ce champ.

## Contrôles
- 61 fichiers de tests Node.js exécutés : tous réussis.
- `test_scene_v097.cjs` : transition, conservation, réactivation, retrait des pièges, annulation, refus des transitions interdites.
- `test_interface_v087.py` : réussi sous Chromium.
- Vérification syntaxique `node --check` : réussie.

## Limites
- La transition de scène ne termine pas automatiquement une passe ni ne réinitialise tous les statuts de combat : le MJ conserve le contrôle de ces effets.
- Pas encore de test Chromium spécifique au bouton « Nouvelle scène ».
