# Avatar Légendes : Compagnon — V0.38

## Modification

L’import d’une bibliothèque de fiches seule vérifie désormais la compatibilité avec les combattants actifs (`validateBackupLinks`). Il est refusé si un combattant référence une fiche absente. Les modifications passent par `commitLibraryMutation`, avec restauration de l’état en mémoire si la sauvegarde échoue. L’import réinitialise également le champ fichier après succès ou erreur de lecture.

## Vérification

- 10 fichiers de tests Node.js exécutés, tous réussis.
- 6 nouveaux scénarios de contrôle des liens et de restauration.
- Chromium headless toujours non validé dans cet environnement (tentative expirée après 9 secondes).

## Limites et suite

- La persistance dans un navigateur réel reste à valider.
- Les 102 techniques avancées doivent encore être contrôlées une par une avec les règles officielles.
- Conserver un export JSON avant de remplacer une bibliothèque ou d’utiliser une version de test.
