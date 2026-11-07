# V1.12 — Édition du journal narratif

- Ajout des boutons Modifier et Supprimer sur chaque note du journal de scène.
- `editSceneNote` et `removeSceneNote` : opérations atomiques, historisées et annulables.
- Validation des notes (1 à 1000 caractères), refus pendant des propositions en attente et absence d’instantané en cas de modification identique.
- Les notes conservent leur scène, leur passe et leur titre historiques lors des corrections.
- Nouveau test `test_scene_note_edit_v112.cjs`.
- Les techniques officielles ne sont pas modifiées dans cette livraison.
