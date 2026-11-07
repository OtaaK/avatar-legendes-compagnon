# Avatar Légendes : Compagnon

Application compagnon non officielle pour le jeu de rôle Avatar Légendes.

## État de référence

- **Version** : V2.33 (corrections après audit Terre, 7 novembre 2026).
- **Application** : `app/simulateur.html`, fichier HTML autonome à ouvrir dans un navigateur.
- **Tests JavaScript** : 189 scripts `.cjs` conservés dans `tests/js/`.
- **Tests Python** : 34 scripts, dont les parcours Terre desktop/mobile avec stockage local réel.
- **Rapports** : `docs/AUDIT_V233.md` et `docs/RAPPORT_V233.md` ; base historique V2.32 conservée.
- **Historique** : `docs/historique/`.

## Exécuter les tests JavaScript

Installer Node.js (version 22 recommandée), puis depuis la racine :

```bash
python scripts/test.py --suite js
```

La suite V2.33 comprend les 188 scripts historiques et `test_terre_v233.cjs` (26 scénarios supplémentaires). **189/189 scripts JavaScript et 34/34 scripts Python réussis**. Résultats et limites : `docs/AUDIT_V233.md`.

## Exécuter les tests navigateur

Nécessite Python, Playwright et Chromium (`/usr/bin/chromium` dans l'environnement de validation) :

```bash
python scripts/test.py --suite browser
```

Le parcours `test_terre_v233_browser.py` sert le HTML sur une origine HTTP locale et vérifie le stockage réel après rechargement. Plusieurs scripts historiques utilisent un stockage simulé ; ils ne prouvent pas la persistance disque.

## État des règles

Les 13 techniques de Terre ont été comparées au livre et disposent d'une assistance partielle testée. Les décisions encore ouvertes sont listées dans `docs/DECISIONS.md`. La disponibilité narrative des matériaux, les zones et les capacités de déplacement restent arbitrées par le MJ. Une sauvegarde ancienne dont les sources d'Avantagé sont ambiguës peut nécessiter une vérification manuelle.

## Principes de travail

- Préserver le fonctionnement existant, modifier progressivement et tester après chaque changement.
- Tenir à jour `ROADMAP.md` et `docs/DECISIONS.md`.
- Ne pas ajouter le PDF commercial des règles ni d'autres contenus sous droits.
- Toute nouvelle version doit inclure des tests et un compte rendu.

## Avertissement

Projet de fan non officiel, sans affiliation avec les ayants droit d'Avatar ni avec l'éditeur du jeu de rôle.
