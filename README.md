# Avatar Légendes : Compagnon

Application compagnon non officielle pour le jeu de rôle Avatar Légendes, **V2.33**.

## Orientation : interface v0 et métier Codex

La nouvelle interface de référence est [avatar-legendes-ui](https://github.com/OtaaK/avatar-legendes-ui).
Le [rapport de faisabilité et les sept lots](docs/migration/FAISABILITE_CONVERGENCE_V0.md)
préparent son raccordement au moteur et aux sauvegardes de ce dépôt. Les
[contrats de référence](docs/migration/CONTRATS_CIBLES.md) précisent les frontières.
Le propriétaire a validé React/TypeScript/Vite et les sept lots. Le **lot 1** est préparé
sur `convergence/react-v0`, avec le v0 corrigé `8b8924d` et le métier `a9079fa`.
Voir le [bilan du lot 1](docs/migration/BILAN_LOT_1.md), le
[guide sans commande](docs/migration/TESTER_LOT_1.md) et la
[matrice fonctionnelle](docs/migration/MATRICE_FONCTIONNELLE.md).
Le lot 1 a été validé après essai sur Mac. Le **lot 2 Personnages et ressources** est
préparé sur `convergence/lot2-personnages` : [bilan](docs/migration/BILAN_LOT_2.md) et
[recette sans commande](docs/migration/TESTER_LOT_2.md). La bibliothèque de techniques
aura ensuite son propre lot et sa PR, après validation du lot 2 ; les autres lots attendent leur accord.
L’application HTML ci-dessous reste disponible ; aucune PR précédente n’est fusionnée
ou supprimée par ce changement d’orientation.

## Utiliser l'application

Ouvrir **`app/simulateur.html`** dans un navigateur. Elle fonctionne seule, hors connexion,
sans installation ni serveur. Les personnages et combats sont enregistrés dans le navigateur ;
utiliser les exports JSON pour conserver une copie de ses données.

## Tester la version avant intégration

Le [parcours global de la refonte UI/UX](docs/RECETTE_REFONTE_UI_UX.md) indique le fichier
exact à télécharger et les vérifications essentielles, sans commande.
Le [bilan des critères](docs/BILAN_REFONTE_UI_UX.md) distingue ce qui est livré et ce qui reste différé.
L’[ancienne recette V2.33](docs/RECETTE_MANUELLE_V233.md) est conservée comme archive de la PR nº 1.

## Se repérer

| Dossier | Contenu |
|---|---|
| `app/` | Application autonome |
| `data/` | Matrice documentaire des techniques |
| `tests/js/` | 198 scripts de régression JavaScript |
| `tests/browser/` | 45 scripts navigateur, dont un contrôle hors connexion |
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
Le [lot 6](docs/RAPPORT_UI_UX_LOT6.md) harmonise les repères et vérifie les données combinées ;
la refonte reste en attente de recette personnelle et d’autorisation avant fusion.
Les [correctifs issus de la recette](docs/RAPPORT_RETOURS_UI_UX.md) guident le profil légendaire,
rafraîchissent les cartes après renommage de lieu et ajoutent le retrait protégé de combattants.

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

## Développer et vérifier la convergence React

L'utilisateur final n'installe rien : la CI fournit un fichier HTML portable.
Pour les développeurs uniquement : Node ≥ 22.12, `npm ci --ignore-scripts`, puis
`npm run build` (sortie `dist/companion/index.html`) ou `npm run dev`.

- `npm run test:extraction` : contrôle des corps extraits et de l'oracle figé.
- `npm run test:contracts` : contrats de données, erreurs/conflits, parité différentielle et frontières.
- `npm run test:parity` : scripts JS historiques redirigés vers les API extraites.
- `npm run test:inventory` : cohérence de l'inventaire technique.
- `npm run test:react` : shell compilé, navigateur, quatre tailles et essais hors réseau
  (prérequis Python/Playwright de `requirements-dev.txt`, Chromium).
- `npm run test:characters` : parcours des personnages, ressources, profils, portraits et import/export réels.
- `python scripts/test.py` : régressions historiques sur le HTML conservé.

Aucune de ces commandes ne déploie ou ne fusionne le projet. Le workflow
`Convergence React — Lots 1 et 2` compile, teste et propose uniquement des artefacts à télécharger.
