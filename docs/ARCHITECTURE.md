# Architecture et organisation

## Structure actuelle

```text
AGENTS.md                    Instructions de travail
README.md                    Démarrage et commandes essentielles
ROADMAP.md                   Travaux réalisés et priorités
app/
  simulateur.html             Application autonome à ouvrir dans un navigateur
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
  historique/                 Notices et rapports anciens conservés
.github/workflows/tests.yml   Vérifications proposées sur les Pull Requests
requirements-dev.txt          Dépendance de test navigateur uniquement
```

Les tests historiques restent à plat dans deux dossiers : leur classement par version
est déjà dans leurs noms et ils peuvent couvrir plusieurs fonctionnalités. Un découpage
immédiat par élément du jeu rendrait leur classement arbitraire. Aucun dossier de code
source vide, gestionnaire de paquets JavaScript ou système de compilation n'est ajouté.

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
d’interface demandés après recette sont décrits dans `RAPPORT_RETOURS_RECETTE_V233.md`.
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

La recherche statique ne trouve pas d'appel à `openNpc` et `showPlaybookReference` en
plus de leur déclaration. Ce sont des candidats à examiner, pas une preuve suffisante
pour supprimer des points d'entrée d'interface. Ils restent conservés.

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

## Socle UI/UX progressif

Le lot 1 conserve le HTML autonome. Un bloc CSS balisé « UI/UX lot 1 » définit les variables
de thème et les composants communs, après les styles historiques : leur réécriture complète
n’est pas mélangée à cette livraison. La palette sémantique des familles reste conservée.
`VIEWS` ajoute `places` et `management` sans changer les quatre identifiants historiques.
`setView` peut donner le focus au titre après une action de navigation explicite ; les appels
existants conservent leur comportement de focus par défaut. Aucune modification du modèle.

Le plan des étapes suivantes et les dépendances de données figurent dans
[PLAN_REFONTE_UI_UX.md](PLAN_REFONTE_UI_UX.md). La première page Lieux est un état d’attente
explicite, sans arbre ni nouvelles références. Gestion appelle les imports/exports existants
et leurs champs de fichier uniques, ce qui conserve la validation et les transactions.

## Galerie Personnages — lot 2

`Roster.listNpcs` accepte désormais entraînement, rôle (champ PNJ `livret` existant), importance
et tri, en conservant ses paramètres et sa recherche historiques. La requête filtre une
nouvelle liste et ne trie pas la bibliothèque en place. `NPC_IMPORTANCE` définit l’ordre,
`npcImportance` lit seulement les catégories reconnues. L’import reste tolérant envers
les anciennes valeurs inconnues ; `updateCharacter` contrôle les nouvelles classifications.

Le rendu des cartes utilise des boutons natifs indépendants, des avatars/icônes SVG locaux et
un transport des identifiants via `data-character-id`. Le formulaire existant n’ajoute
`importance` que si sa valeur a été modifiée. Les critères de filtre restent dans le DOM,
sans écrire dans les modèles ni créer une préférence de stockage parallèle.

## Consultation et brouillons de fiche — lot 3A

`lib` reste la seule bibliothèque persistée. `renderLegacySheetEditor` réemploie les champs
existants ; `showSheet` construit le rendu de consultation et initialise le brouillon DOM.
`sheetPatchFromFields` compare les champs à leur état initial et ne réécrit que les valeurs
modifiées. Les états, statuts et techniques en édition restent dans des tableaux de brouillon.
La navigation interne et beforeunload détectent les modifications non sauvegardées.

En consultation, les ajustements rapides passent par `commitLibraryMutation`. Leur dernière
annulation vérifie la référence de bibliothèque et les ressources avant de restaurer un patch ;
elle n’annule pas le combat. Les portraits utilisent des données raster locales, limitées et
vérifiées ; une révision d’édition empêche les lectures tardives de toucher une autre fiche.
Les formats/clés de sauvegarde et le moteur sont conservés. Le [rapport](RAPPORT_UI_UX_LOT3.md)
distingue ce socle de la future adaptation des capacités PNJ dans le modèle et le combat.
