# Rapport de maintenance — réorganisation V2.33

> Rapport historique du point `67273e0` : les états « conservé » et « aucune fusion »
> ci-dessous décrivent ce moment. Après accord ultérieur, les originaux historiques et
> l’inventaire sont archivés sous `avant-nettoyage-2026-11-13` ; voir le bilan actuel de
> [mission 2](nettoyage/BILAN.md). Le corps des preuves reste daté.

Date : 7 novembre 2026. Mission : assainissement de structure, sans modification des règles.
Branche de travail : `maintenance/organisation-v233`. Aucune fusion dans `main`.

Ce rapport décrit la maintenance achevée au commit `67273e0`. Les changements d’interface
autorisés ensuite par les retours de recette sont suivis dans le [rapport distinct](https://github.com/OtaaK/avatar-legendes-compagnon/blob/avant-nettoyage-2026-11-13/docs/RAPPORT_RETOURS_RECETTE_V233.md).
Les preuves d’identité du HTML ci-dessous concernent ce point de maintenance, pas les correctifs ultérieurs.

## Sécurisation préalable

La copie locale contenait une V2.33 non enregistrée, alors que `main` sur GitHub contenait
encore l'import V2.32 et l'ajout d'AGENTS.md. Cette différence a été constatée avant tout déplacement.

1. Archive du répertoire de travail, patch binaire, liste des fichiers non suivis et bundle
   complet de l'historique créés hors du dépôt. L'archive a été comparée aux fichiers et le bundle
   vérifié avec Git. Les empreintes sont conservées dans l'environnement de travail.
2. Création de `maintenance/organisation-v233`, puis commit de conservation `3af4225`.
3. Récupération du véritable `AGENTS.md` depuis GitHub, lecture et synchronisation avec `origin/main`.
   Le seul conflit était une ligne blanche finale dans ce fichier ; la version GitHub a été conservée.
4. Point de retour `backup/v233-before-maintenance`, commit `d247193`, publié sur GitHub.

La sauvegarde locale hors dépôt peut disparaître avec l'environnement ; le commit et la branche
de référence GitHub constituent le point de retour durable. Aucun PDF, fichier dérivé du livre,
secret ou donnée personnelle n'a été ajouté à ces commits.

La Pull Request contient donc **deux travaux distincts** : la conservation de la V2.33 déjà
préparée lors de la mission précédente, puis la maintenance non fonctionnelle. Pour examiner
uniquement cette maintenance, comparer son résultat à `d247193`, pas à l'ancien `main` V2.32.

## Inventaire initial

508 fichiers dans la référence V2.33 sécurisée :

| Ensemble | Nombre | Décision |
|---|---:|---|
| HTML autonome | 1 | Conservé dans `app/`, inchangé |
| Tests JavaScript | 189 | Déplacés vers `tests/js/`, tous conservés |
| Tests Python navigateur | 34 | Déplacés vers `tests/browser/`, tous conservés |
| Matrice CSV | 1 | Déplacée vers `data/`, inchangée |
| Documents Markdown | 282 | Conservés ; références actives actualisées ; archives intactes |
| `.gitignore` | 1 | Conservé et complété pour caches/résultats locaux |

L'inventaire détaillé [INVENTAIRE.csv](https://github.com/OtaaK/avatar-legendes-compagnon/blob/avant-nettoyage-2026-11-13/docs/maintenance/INVENTAIRE.csv) contient une ligne pour chacun des
508 fichiers d'origine : ancien emplacement, destination, décision, justification et empreintes
avant/après. Les fichiers créés pour cette maintenance sont décrits ci-dessous.

## Conservation, déplacements et suppressions

**225 fichiers déplacés, 283 conservés à leur emplacement, aucune suppression nouvelle.**

| Ancien emplacement | Destination | Nombre | Justification |
|---|---|---:|---|
| `app/test*.cjs` | `tests/js/` | 189 | Séparer les tests de l'application distribuée |
| `app/test*.py` | `tests/browser/` | 34 | Séparer les contrôles navigateur et leurs prérequis |
| `app/MATRICE_TECHNIQUES.csv` | `data/MATRICE_TECHNIQUES.csv` | 1 | Donnée documentaire utilisée par les tests, pas par le navigateur |
| `docs/historique/README.md` | `docs/historique/README_ORIGINAL_V071.md` | 1 | L'ancien accueil V0.71 était trompeur comme index ; texte original conservé |

Un nouvel index explique la portée des archives. Les noms des tests ne sont pas renommés :
leurs numéros de version restent utiles à la traçabilité et aux rapports anciens.

### Éléments suspects examinés et décision

- **Doublon strict** : `docs/RAPPORT_V232.md` et `docs/historique/RAPPORT_V232.md` sont identiques.
  Les deux sont conservés : l'un reste une référence courante, l'autre maintient la série historique.
  Le gain d'une suppression serait négligeable et obligerait à modifier les références de l'archive.
- **Notices périmées** : conservées comme archives, contextualisées par leur index. Elles ne sont
  plus présentées comme des instructions d'exécution actuelles.
- **Tests anciens** : aucun supprimé. Les 223 scripts d'origine ont été exécutés avant et après
  déplacement ; seules les lectures de fichiers et la localisation de Chromium sont adaptées.
- **Points d'entrée potentiellement inutilisés** : `openNpc` et `showPlaybookReference` apparaissent
  uniquement dans leur déclaration lors de la recherche statique dans le HTML. Aucun retrait :
  un accès externe ou un ancien usage n'est pas exclu et leur suppression demanderait une analyse dédiée.
- **Fichiers temporaires** : aucun fichier temporaire supplémentaire dans la référence sécurisée.
  `.DS_Store`, supprimé lors de la mission précédente, demeure absent et son retrait est maintenant
  enregistré dans le commit de conservation. Il s'agit de métadonnées macOS, sans rôle applicatif.
- **Caches et résultats futurs** : `__pycache__`, environnements virtuels et `work/` sont ignorés.
  Les scripts d'audit provisoires et sauvegardes restent hors du dépôt ; ils ne sont pas distribués.

## Architecture et dépendances

Le [guide d'architecture](../ARCHITECTURE.md) décrit les dépendances et les limites relevées :
un HTML de 429 500 octets, un script, 197 déclarations de fonctions nommées, données embarquées,
préparations de tests répétées et marqueurs textuels fragiles dans les tests VM.

L'application ne charge aucune ressource externe. Elle ne dépend ni de la matrice CSV, ni de
Node.js, Python ou Playwright pour fonctionner. Ces outils restent strictement des dépendances
ou auxiliaires de développement. Aucun framework ni système de compilation ajouté.

**Décision : ne pas modulariser le HTML pendant cette réorganisation.** Une extraction ultérieure
peut être progressive et produire un HTML unique ; les frontières envisagées sont documentées.
Modifier simultanément le chargement, la portée des variables et les fichiers aurait accru le risque
sans bénéfice nécessaire à cette mission.

## Nouveaux outils et documents

- `scripts/test.py` : commande commune, découverte des suites, erreurs non masquées, délais,
  exécution indépendante et rapport JSON facultatif ; restrictions de validation affichées séparément.
- `scripts/verify_reorganisation.py` : comparaison du HTML, de la matrice, des archives et des
  223 tests avec la référence Git ; refus des changements d'assertions au-delà des adaptations prévues.
- `scripts/inventory.py` : inventaire reproductible du devenir de chaque fichier d'origine.
- `tests/support/paths.cjs` et `tests/browser/_paths.py` : chemins indépendants du dossier courant ;
  navigateur configurable via `CHROMIUM_PATH`, puis navigateur système ou Playwright.
- `tests/browser/test_offline.py` : contrôle hors réseau du combat et d'un export/réimport fidèle.
- `requirements-dev.txt` : version de Playwright déclarée ; aucun paquet requis pour l'application.
- `.github/workflows/tests.yml` : vérifications proposées sur les Pull Requests et déclenchement
  manuel, droits de lecture uniquement, aucune fusion ni publication automatique.
- `docs/ARCHITECTURE.md`, `docs/TESTS.md`, ce rapport et son inventaire ; README, ROADMAP,
  AGENTS.md et références actives actualisés. Les textes des archives restent intacts.

## Vérifications par étape

| Étape | JavaScript | Navigateur | Constats |
|---|---:|---:|---|
| Référence V2.33 avant déplacement | 189/189 | 34/34 | Aucun échec préexistant observé dans ces suites |
| Après déplacement et adaptation des chemins | 189/189 | 34/34 | Aucun échec introduit par les déplacements |
| Ensemble final avec nouveau contrôle hors réseau | 189/189 | 35/35 assertions exécutées avec succès | Une restriction explicite : accès `file://` bloqué dans cet environnement |

Le premier lancement du **nouveau** test hors connexion a échoué avec
`ERR_BLOCKED_BY_ADMINISTRATOR` lors de l'accès `file://`. Il ne s'agissait pas d'une régression
applicative : le HTML était inchangé et le blocage précédait son chargement. Le test conserve une
tentative réelle en `file://`. Dans ce seul cas de restriction explicite, il annonce `LIMITATION:`,
charge le HTML via HTTP local, coupe le réseau, puis vérifie le combat et le réimport.
Le runner enregistre cette limitation dans le bilan : **le double-clic n'est pas certifié ici**.
Les autres erreurs continuent à faire échouer le test.

Les contrôles navigateur conservés couvrent notamment imports/exports complets, sauvegarde,
rechargement, décisions MJ, combat et 13 techniques de Terre en desktop/mobile. Certains utilisent
un stockage simulé ; les parcours Terre V2.33 et HTTP de persistance utilisent un vrai localStorage.

Le contrôle de conservation confirme :

- HTML identique, SHA-256 `e2b5033c645ab1e925e566047097e422526a7738fdc2af6890a32c4558f486e4` ;
- 223 tests historiques conservés avec leurs assertions ;
- matrice et archives identiques octet pour octet ;
- aucun changement des règles, clés de stockage, formats JSON ou comportements d'import/export ;
- vérification des différences Git et des références actives, sans marqueurs de conflit.

Le workflow GitHub est ajouté pour les contrôles futurs. Les résultats locaux ne doivent pas être
présentés comme des résultats de GitHub Actions avant son exécution sur la Pull Request.

## Retour arrière et suite

- Examiner la Pull Request avant intégration ; ne pas fusionner automatiquement.
- Pour revenir à la V2.33 sécurisée, créer une nouvelle branche depuis
  `backup/v233-before-maintenance`. Cela évite de réécrire `main` ou d'effacer un autre travail.
- Après intégration éventuelle, annuler les commits de maintenance par de nouveaux commits de
  réversion, en conservant leur historique, plutôt que réinitialiser la branche partagée.
- Prévoir séparément la modularisation et les arbitrages de règles déjà ouverts dans
  [DECISIONS.md](../DECISIONS.md). Aucun de ces arbitrages n'a été tranché pendant cette mission.
