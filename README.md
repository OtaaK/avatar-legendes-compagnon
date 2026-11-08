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
| `tests/js/` | 197 scripts de régression JavaScript |
| `tests/browser/` | 43 scripts navigateur, dont un contrôle hors connexion |
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

La réorganisation conserve les 223 tests existants. Son contrôle d'identité du HTML porte
sur le commit de maintenance `67273e0`. Les [correctifs après recette](docs/RAPPORT_RETOURS_RECETTE_V233.md)
modifient ensuite l'interface à la demande du propriétaire, sans changer les règles du jeu.
Résultats et inventaire détaillé : [rapport de réorganisation](docs/maintenance/RAPPORT_REORGANISATION_V233.md).

Les [améliorations de fiabilité des imports](docs/RAPPORT_FIABILITE_SAUVEGARDES_V233.md)
protègent les données existantes en cas de fichier invalide ou d’échec pendant la restauration.

## Refonte UI/UX progressive

La branche de refonte suit le [cahier des charges](CAHIER_DES_CHARGES_UI_UX_AVATAR_COMPAGNON_CODEX.md).
Le [plan de livraison](docs/PLAN_REFONTE_UI_UX.md) distingue le socle visuel/navigation des
évolutions de cartes, fiches, Lieux et Livrets. Le [bilan du premier lot](docs/RAPPORT_UI_UX_LOT1.md)
précise ce qui est livré et propose une courte vérification dans le navigateur.
Le [lot 2, galerie et cartes Personnages](docs/RAPPORT_UI_UX_LOT2.md), dépend du lot 1
et ajoute filtres, tri et classification PNJ sans modifier leurs ressources.
Le [lot 3A, fiches détaillées](docs/RAPPORT_UI_UX_LOT3.md), sépare consultation et édition,
protège les brouillons et ajoute les portraits locaux. Le [lot 3B, ressources PNJ](docs/RAPPORT_UI_UX_LOT3B.md), ajoute les capacités variables,
les états personnalisés et une activation explicite qui préserve les données antérieures.
Les exports comportant ces profils nécessitent cette nouvelle version.
Le [lot 4, Lieux](docs/RAPPORT_UI_UX_LOT4.md), ajoute une arborescence, les liens PNJ
et les filtres de présence, sans convertir automatiquement les anciens textes.
Le [lot 5, Livrets](docs/RAPPORT_UI_UX_LOT5.md), organise les manœuvres enregistrées,
les notes et le suivi manuel de progression, sans automatiser les évolutions.

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
