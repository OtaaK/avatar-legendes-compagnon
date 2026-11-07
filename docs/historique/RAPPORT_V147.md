# V1.47 — Persistance transactionnelle de À contretemps

- Correction du bouton **Arbitrer impossibilité (MJ)** : l’appel à `save()` (fonction inexistante) empêchait la validation effective et déclenchait une alerte après mutation mémoire.
- `waiveCountertimeUI` passe désormais par `commitCombatMutation` : sauvegarde obligatoire, retour à l’état précédent si le stockage échoue.
- `revealCountertimeUI` utilise le même mécanisme : l’approche révélée et le journal sont enregistrés immédiatement, sans dépendre d’une opération ultérieure.
- Tests Node et Chromium ciblés ajoutés.

## Limites

Les tests navigateur utilisent un stockage simulé dans Chromium ; la conservation après fermeture réelle du navigateur reste à vérifier.
