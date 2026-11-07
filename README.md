# Avatar Légendes : Compagnon

Application compagnon non officielle pour le jeu de rôle Avatar Légendes, **V2.33**.

## Utiliser l'application

Ouvrir **`app/simulateur.html`** dans un navigateur. Elle fonctionne seule, hors connexion,
sans installation ni serveur. Les personnages et combats sont enregistrés dans le navigateur ;
utiliser les exports JSON pour conserver une copie de ses données.

## Tester la version avant intégration

Le [parcours manuel V2.33](docs/RECETTE_MANUELLE_V233.md) explique comment télécharger
le fichier de la PR et vérifier les fonctions essentielles dans son navigateur, sans commande.

## Se repérer

| Dossier | Contenu |
|---|---|
| `app/` | Application autonome |
| `data/` | Matrice documentaire des techniques |
| `tests/js/` | 189 scripts de régression JavaScript |
| `tests/browser/` | 35 scripts navigateur, dont un contrôle hors connexion |
| `scripts/` | Commandes communes de test, d'inventaire et de vérification |
| `docs/` | Architecture, tests, décisions, audits et rapports |
| `docs/historique/` | Rapports anciens conservés, avec leur contexte d'époque |

Commencer par [AGENTS.md](AGENTS.md) pour contribuer, puis par le
[guide d'architecture](docs/ARCHITECTURE.md) et les [procédures de test](docs/TESTS.md).

## Vérifier les changements

Avec Python et Node.js :

```bash
python scripts/test.py --suite js
```

Avec Playwright et Chromium installés selon le [guide de test](docs/TESTS.md) :

```bash
python scripts/test.py --suite browser
# Ou les deux suites :
python scripts/test.py --report work/tests.json
```

La réorganisation conserve les 223 tests existants. Le HTML et les règles n'ont pas été
modifiés par cette maintenance ; son identité avec la V2.33 sauvegardée est vérifiable.
Résultats et inventaire détaillé : [rapport de réorganisation](docs/maintenance/RAPPORT_REORGANISATION_V233.md).

## Règles et suivi

- [Décisions et ambiguïtés encore ouvertes](docs/DECISIONS.md).
- [Feuille de route](ROADMAP.md).
- [Audit fonctionnel V2.33](docs/AUDIT_V233.md) et [rapport V2.33](docs/RAPPORT_V233.md).
- [Base historique V2.32](docs/AUDIT_V232.md).

Les 13 techniques de Terre disposent d'une assistance partielle testée. Les choix narratifs
restent au MJ ; les tests ne certifient pas toutes les interactions ni la fidélité complète
aux règles. Les archives restent disponibles : aucun test n'est supprimé du seul fait de
son ancienneté. Ne pas ajouter le PDF commercial ou des données personnelles au dépôt.

Projet de fan non officiel, sans affiliation avec les ayants droit d'Avatar ni avec l'éditeur
du jeu de rôle.
