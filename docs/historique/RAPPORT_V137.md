# V1.37 — Feinte (Armes, p. 292)

- Technique **Feinte** ajoutée au moteur et à l'interface.
- Le MJ confirme la liste exhaustive des assaillants de la passe ; un état valide est choisi par assaillant.
- Coût de 1 fatigue et états infligés en un groupe atomique, avec annulation.
- Validation des doublons, des cibles et des états ; aucune détection automatique d'attaques n'est prétendue.
- Test Node `test_armes_v137.cjs` et test Chromium `test_chromium_v137.py`.

## Vérifications
- 97/97 tests Node.js réussis.
- Test Chromium V1.37 réussi (moteur et formulaire, localStorage simulé).
- Syntaxe JS vérifiée avec `node --check`.

## Limites
- L'identification des assaillants est une décision du MJ ; le moteur ne reconstruit pas automatiquement toutes les attaques.
- Les exports partageables exigent toujours la relecture des notes libres.
- Persistance réelle après fermeture du navigateur non vérifiée.
