# Avatar Légendes : Compagnon

Application compagnon non officielle pour le jeu de rôle Avatar Légendes.

## État de référence

- **Version** : V2.32 (base de reprise, 7 novembre 2026).
- **Application** : `app/simulateur.html`, fichier HTML autonome à ouvrir dans un navigateur.
- **Tests JavaScript** : 188 tests `.cjs` conservés à côté du HTML.
- **Tests Python** : 33 scripts présents, vérification navigateur à reprendre.
- **Rapports** : `docs/AUDIT_V232.md` et `docs/RAPPORT_V232.md`.
- **Historique** : `docs/historique/`.

## Exécuter les tests JavaScript

Installer Node.js (version 22 recommandée), puis depuis la racine :

```bash
for test in app/test*.cjs; do node "$test" || exit 1; done
```

Les 188 tests JavaScript passaient lors de l'audit de reprise du 7 novembre 2026. Les tests d'interface Python n'ont pas été exécutés dans cet audit.

## Principes de travail

- Préserver le fonctionnement existant, modifier progressivement et tester après chaque changement.
- Tenir à jour `ROADMAP.md` et `docs/DECISIONS.md`.
- Ne pas ajouter le PDF commercial des règles ni d'autres contenus sous droits.
- Toute nouvelle version doit inclure des tests et un compte rendu.

## Avertissement

Projet de fan non officiel, sans affiliation avec les ayants droit d'Avatar ni avec l'éditeur du jeu de rôle.
