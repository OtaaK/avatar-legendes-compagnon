# V1.80 — Conservation des avantages persistants de Terre

- Étoile de lave et Armure de terre conservent Avantagé à la fin de la passe tant que leur source demeure active.
- L’expiration d’un autre avantage temporaire ne retire pas celui de l’étoile.
- La provenance externe de l’étoile est remise à zéro quand le statut temporaire expire, pour éviter de conserver Avantagé après extinction.
- Tests de régression : test_terre_v180.cjs.
