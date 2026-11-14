# Architecture et organisation

## Structure actuelle

```text
AGENTS.md                    Instructions de travail
README.md                    Démarrage et commandes essentielles
ROADMAP.md                   Travaux réalisés et priorités
app/
  simulateur.html             Application autonome générée, à ouvrir dans un navigateur
src/                          Sources éditables, assemblées selon assembly.json
data/
  MATRICE_TECHNIQUES.csv       Matrice documentaire utilisée par les tests
tests/
  js/test*.cjs                 Régressions JavaScript sous Node.js
  support/paths.cjs            Chemins des fichiers pour ces tests
  browser/test*.py             Contrôles Chromium sous Playwright
  browser/_paths.py            Chemins et localisation de Chromium
scripts/
  test.py                     Commande commune de tests
  inventory.py                Inventaire avant/après depuis une référence Git
  verify_reorganisation.py    Contrôle de conservation de cette réorganisation
docs/
  DECISIONS.md                Arbitrages du propriétaire
  ARCHITECTURE.md             Ce document
  TESTS.md                    Procédures et limites de validation
  AUDIT_*.md / RAPPORT_*.md    Audits et rapports des versions récentes
  maintenance/                Rapport de réorganisation et inventaire détaillé
  maintenance/nettoyage/      Inventaire, plan approuvé et preuves de nettoyage
CHANGELOG.md                  Changements ; originaux sous une étiquette Git
.github/workflows/tests.yml   Vérifications proposées sur les Pull Requests
requirements-dev.txt          Dépendance de test navigateur uniquement
```

Les tests historiques restent à plat dans deux dossiers : leur classement par version
est déjà dans leurs noms et ils peuvent couvrir plusieurs fonctionnalités. Un découpage
immédiat par élément du jeu rendrait leur classement arbitraire. Aucun dossier de code
source vide ou gestionnaire de paquets JavaScript n’est ajouté. Depuis l’étape 3B,
les sources réelles sont dans `src/` et le générateur sans dépendance
`node scripts/build.cjs` produit le HTML. Voir [Sources et génération](architecture/SOURCES_ET_BUILD.md).

## Fonctionnement et dépendances

| Élément | Dépend de | Utilisation |
|---|---|---|
| `app/simulateur.html` | Navigateur et stockage local | CSS, moteur, catalogue et interface embarqués ; aucune ressource externe nécessaire |
| Moteur `CombatCore` | Fonctions et données du même script | Combat, propositions, protections, transitions, historique et annulation |
| `CombatRules` | Catalogue et données des combattants | Disponibilité des techniques, postures et degrés d'apprentissage |
| `Roster` | Modèles de fiches et stockage | Personnages, validation et liens avec le combat |
| Interface et persistance | Ces trois ensembles et le DOM | Formulaires, décisions MJ, imports/exports et sauvegarde |
| Matrice CSV | Aucun code à exécuter | Référence de suivi ; elle n'est pas chargée par l'application |
| Tests JavaScript | Node.js, bibliothèques standard, HTML et parfois CSV | Extraction du script, exécution isolée et assertions |
| Tests navigateur | Python, Playwright, Chromium, HTML | Contrôles réels, téléchargements et stockage ; certains utilisent un stockage simulé |
| Scripts de maintenance | Python standard ; Git pour l'inventaire et la comparaison | Découverte des tests, bilans, inventaire et invariants |

La phase de réorganisation (`67273e0`) conserve le HTML octet pour octet. Les correctifs
d’interface demandés après recette sont décrits dans [le rapport archivé](https://github.com/OtaaK/avatar-legendes-compagnon/blob/avant-nettoyage-2026-11-13/docs/RAPPORT_RETOURS_RECETTE_V233.md).
Ils conservent les clés de stockage, les formats de sauvegarde, les noms des exports,
les règles et les catalogues embarqués.

## Difficultés de maintenance constatées

- Au point de réorganisation, le fichier de 429 500 octets contenait un seul script et 197 déclarations
  de fonctions nommées. Le CSS, l'état, les règles, les données, le rendu et la persistance
  restent fortement liés dans le même fichier.
- Le catalogue et les synthèses d'audit sont stockés dans de longues lignes JSON : une
  petite modification peut produire un diff difficile à lire.
- Les tests JavaScript répètent leur préparation de la machine virtuelle et découpent le
  script à l'aide de marqueurs textuels. Déplacer ces marqueurs ferait échouer des tests
  même si le comportement de l'application était préservé.
- Les noms et rappels de règles existent dans plusieurs structures embarquées et dans
  la matrice CSV ; les tests contrôlent une partie de leur cohérence, pas toute la fidélité
  au livre.
- Les tests d'interface historiques n'utilisent pas tous le même mode de stockage ou le
  même type de préparation. Leur réussite ne certifie pas toutes les interactions.
- L'ancien placement des tests à côté du HTML imposait des chemins relatifs dispersés.
  Les chemins de lecture sont maintenant centralisés dans les deux modules de support.

Après accord d’Alex, les deux helpers `openNpc` et `showPlaybookReference` sans appel
statique identifié sont retirés. Les parcours PNJ et Livrets utilisent leurs autres
points d’entrée existants ; aucune donnée ni fonction du moteur n’est modifiée.

## Modularisation : recommandation et limites

**Conserver le HTML autonome pendant cette mission.** Le supprimer comme point d'entrée,
introduire des modules ES chargés séparément ou exiger un serveur casserait potentiellement
l'ouverture en `file://`. La séparation physique du code est donc reportée à une tâche
spécifique avec tests de comportement et accord sur son périmètre.

Une progression raisonnable serait :

1. Consolider les contrats des interfaces moteur/règles/fiches et le chargement des tests.
2. Extraire les données et fonctions pures vers des sources maintenables, sans changer
   leurs valeurs ni leur ordre d'évaluation.
3. Assembler ces sources dans **un seul HTML distribué**, avec une génération déterministe
   et un contrôle empêchant la divergence entre les sources et le HTML.
4. Séparer ensuite la persistance et le rendu, seulement avec des scénarios de reprise,
   sauvegarde et annulation suffisants.

Il n'est pas nécessaire de choisir un framework ni d'ajouter des dépendances pour cette
progression. Une refonte générale et une modification des règles restent hors périmètre.

## Mission 0 — cadre de maintenance

Cette PR est documentaire : aucun changement du HTML autonome, des tests ou des formats. Les futures extractions nécessitent leur mission et leur accord ; les branches React existantes ne sont ni supprimées ni intégrées. Base examinée : main `42b306f`, distinct des branches de convergence.

## Mission 1 — frontière données/événements

Les identifiants sont contrôlés dans la normalisation et la validation de fiches, puis à l’import combat pour les références exposées. Le HTML reste autonome et sans dépendance : attributs `data-ui-click`, `data-ui-change`, `data-ui-keydown` et paramètres échappés, puis écouteur à liste fixe d’actions. Aucune donnée importée interprétée en JavaScript ; gestionnaires statiques conservés. Persistance, règles et moteur inchangés. Voir [le contrôle détaillé](securite/IMPORTS_IDENTIFIANTS.md).

## Mission 2 — photographie et limites de l’inventaire

Base main `38943c5` : un HTML autonome de 444 841 octets, 206 déclarations nommées repérées, tests encore extraits par marqueurs et découverts par globs non récursifs. Aucun changement de cette structure pendant l’inventaire. `scripts/audit_cleanup.py` lit une référence Git pour produire classement, empreintes, références statiques et index de thèmes ; il ne modifie pas les fichiers inventoriés. Les thèmes ne sont pas un graphe exhaustif ni une mesure de couverture. Aucune nouvelle dépendance, aucun contrat/extraction/build de mission 3 engagé. [Plan proposé](maintenance/nettoyage/PLAN.md).

## Mission 2 — exécution approuvée

Seuls deux helpers d’affichage sans appel identifié sont retirés du HTML. Les 278 chemins
archivés restent sous `avant-nettoyage-2026-11-13`. Aucun nouveau découpage physique du
moteur, aucune persistance modifiée ni test migré. Le runner, ses globs et les points
d’entrée conservés restent identiques. [Bilan et preuves](maintenance/nettoyage/BILAN.md).

## Mission 3A — référence et frontières préparées

Le main de départ `55d56f6` garde le HTML comme oracle. [Contrats](architecture/CONTRATS.md) et [plan](architecture/PLAN_MISSION_3.md). Un helper de test charge les corps existants en VM isolée : moteur/règles, modèles/références, validation puis persistance facultative. Les marqueurs sont vérifiés uniques et ordonnés ; pas d’édition ni de second moteur. REFERENCE.json observe 80 entrées publiques, 111 identifiants de techniques, dix Livrets et les clés de stockage. Cette étape ne réalise pas encore l’extraction ou la génération. La future séparation devra préserver les transactions UI et le journal multi-clés ; les propriétés supplémentaires des modèles ne sont pas un schéma fermé.

## Étape 3B — source d’édition et artefact

`src/assembly.json` fixe l’ordre des scripts classiques ; les corps ne changent pas. Les deux JSON de techniques sont sérialisés avec protection de leur contexte script. Gabarit et styles sont insérés en un passage. `node scripts/build.cjs` compile sans exécuter, puis écrit l’artefact de façon contrôlée ; `--check` compare seulement et échoue si divergence. Les fichiers source sont lus en UTF-8/LF, sans remplacement silencieux de caractères. `src/domain/index.cjs` fournit la façade Node et n’est pas embarqué dans le navigateur. Les modules de src/legacy restent couplés ; l’extraction physique n’est pas une isolation déjà terminée de la persistance. [Organisation et limites](architecture/SOURCES_ET_BUILD.md).


## 3C — stockage séparé des notifications

Le service `src/persistence/storage.js` ignore le DOM et reçoit ses ports explicitement. Le pont `src/legacy/persistence.js` conserve les fonctions publiques, avertissements et accès tardif au navigateur. Aucun accès à la création. Les clés, journal et ordre des opérations restent inchangés ; les préférences UI restent à traiter en 3D. [Bilan](architecture/BILAN_3C.md).
