# V1.35 — Validation des échéances des effets temporaires

- Contrôle des champs `expiresAfterRound` à l’import : entier obligatoire si présent, échéance au moins égale à la passe de création, limite supérieure, et durée `round`.
- Test Chromium : une échéance valide acceptée ; quatre échéances malformées refusées.
- Noms des exports V1.34 conservés pour compatibilité avec les tests historiques.

## Persistance après fermeture : non vérifiée
Les tentatives de navigation Chromium vers `file://` et vers une origine HTTPS interceptée ont été bloquées par l’administrateur (`ERR_BLOCKED_BY_ADMINISTRATOR`). Aucun résultat positif de persistance réelle n’est revendiqué. Les tests Chromium existants emploient une simulation du stockage.

## Limites
Les exports privés contiennent les prédictions secrètes. Les notes libres du compte rendu public nécessitent une relecture.
