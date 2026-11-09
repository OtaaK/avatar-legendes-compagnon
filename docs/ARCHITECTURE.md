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


## Profils PNJ et générations de stockage — lot 3B

`ResourceRules` centralise les limites et validations partagées par Roster, CombatCore et
l’interface. Le champ optionnel `npcResources` (format `avatar-npc-resources`, version 1)
porte combattant, capacité de fatigue, borne positive d’équilibre et noms d’états.
Sans profil, les limites historiques restent strictement conservées. L’importance est
indépendante : seule une proposition explicitement enregistrée crée un profil.
Les combattants et les instantanés transportent leur propre copie du profil et du principe.
Les limites varient ; les quantités fixes des effets et coûts des techniques sont conservées.

Après activation, `persist` route vers `avatar-roster-v021` et `avatar-v021` ; le marqueur
`avatar-npc-storage-generation` maintient ce canal. Les clés v020 restent intactes.
La première écriture est une sauvegarde complète journalisée des deux modèles. Le journal
historique v1 reste récupérable ; le v2 contrôle les clés autorisées et restaure aussi le
marqueur. Échec de récupération ou données v021 illisibles : écritures ordinaires bloquées.
Une restauration complète explicitement demandée et validée permet de réparer le chargement.

Bibliothèque et sauvegarde complète passent en version 2 si nécessaire ; le combat isolé
utilise alors l’enveloppe `avatar-compagnon-combat`, version 2. Les formats historiques
restent lisibles. Gestion peut exporter le point v020 précédant l’activation. Revenir au code
ancien retrouve ce point, sans fusion automatique avec les modifications récentes.
Voir [les garanties, limites et tests](RAPPORT_UI_UX_LOT3B.md).


## Lieux — lot 4

`PlaceRules` est un module pur dans le HTML autonome, exporté pour les tests. La bibliothèque
porte `places` et un compteur `placeSeq` seulement après utilisation ; les nouvelles données
activent la version 2 et le canal v021 existant, sans nouvelles clés concurrentes.
Un lieu possède un identifiant stable, un nom, une description, `parentId` et une illustration
raster locale facultative. Le parcours des parents et descendants est itératif ; les cycles
et doublons sont refusés, les références manquantes sont conservées et signalées.

Les PNJ référencent les mêmes identifiants via `placeLinks` : domicile `homeId`, position
`currentId`, associations `associatedIds`. Les anciens textes `location` restent conservés. `currentId` absent conserve la position
textuelle ; `currentId: null` représente une position explicitement vide. Un domicile ou
une association seuls ne modifient pas la position.
Les listes Personnages résolvent la position pour filtrer et afficher le lieu actualisé.
Le lieu de session historique demeure une indication textuelle, sans déplacement de PNJ.
Les copies de combat ne portent aucun modèle de lieux parallèle.

Les formulaires de lieux ont leur propre brouillon protégé ; ceux des PNJ réutilisent le
brouillon de fiche. La position rapide ne modifie que la position. Les mutations passent par
`commitLibraryMutation`, y compris la première activation journalisée dans v021. Suppression :
promotion des enfants au parent et retrait des seuls liens concernés, après présentation des
dépendances et confirmation ; aucune suppression en cascade de fiches ni de sous-lieux.
Voir [la recette et les limites](RAPPORT_UI_UX_LOT4.md).


## Structure des Livrets — lot 5

`BookState` est un helper pur partagé par la validation Roster et le formulaire PJ.
Le champ optionnel `playbookState` (format `avatar-playbook-state`, version 1) contient
une liste `entries`, indexée par nom exact du Livret. Chaque entrée porte `book`,
`progress` (0…4), `moment` (unknown/locked/unlocked), `notes` et `evolutions`.
Les champs inconnus restent conservés lors des patches. Navigation et édition sans
changement ne créent pas de suivi. Les entrées sont conservées lors d’un changement
de Livret ; le suivi du nouveau Livret ne copie pas celui de l’ancien.

`bookAdapter` décrit la référence réellement intégrée et le panneau de spécificité.
Il ne fournit aucun texte de manœuvre ni automatisme réglementaire. `playbookMoves`
reste la liste historique de la fiche, sans attribution automatique au Livret choisi.
Les réglages du suivi sont réservés à Modifier, avec le brouillon et la transaction
existants ; changer simultanément de Livret et son suivi est refusé pour éviter une
attribution ambiguë. Les quatre cases restent affichées à 4 jusqu’à correction manuelle.
Les notes d’évolution et le déblocage déclaré du moment d’équilibre n’affectent pas le moteur.

Première utilisation : bibliothèque version 2 et canal v021 journalisé existant ; le point
v020 reste conservé. Les imports anciens restent lisibles ; un suivi mal formé est refusé.
Aucun format de combat, nouvelle clé parallèle ou dépendance n’est ajouté. Voir
[le rapport, les limites et la recette](RAPPORT_UI_UX_LOT5.md).


## Harmonisation et recette transversale — lot 6

`collapsedSheetResources` est un état d’affichage en mémoire, indexé par identifiant de fiche.
Il n’est écrit ni dans `lib`, ni dans `s`, ni dans une nouvelle clé locale. Les ressources sont
affichées par défaut, repliables jusqu’à 900 px et toujours visibles au-delà. Le bouton
n’apparaît pas sur une fiche sans ressource/statut. Les contrôles et transactions existants
restent les seuls moyens d’appliquer des modifications de ressources.

Le raccourci `targetOpponent` appelle `syncTargetOptions` après changement de cible, comme
le select manuel. Il ne réinitialise pas les autres paramètres de technique. Les libellés
évidents sont reliés à leurs champs identifiés, sans mécanisme de formulaire parallèle.
Le nom générique de l’export du point antérieur remplace son libellé PNJ : son format et son
origine de données ne changent pas. Voir [la recette et les limites](RAPPORT_UI_UX_LOT6.md).


## Retours de recette : profils, cache de cartes et retrait

`npcImportanceChanged` propose un profil dans le brouillon, après confirmation. Le refus
conserve la classification seule. Les valeurs UI sont centralisées dans `NPC_PROFILE_PRESETS` ;
les validations de profil et formats restent inchangés. Un écart de fatigue sur une fiche
classée ouvre le panneau de configuration et distingue capacités proposées/enregistrées.

Entrer dans Personnages depuis un autre espace rafraîchit galerie, filtres et fiche consultée.
`followRenamedPlaceFilter` suit un nom devenu obsolète seulement après réussite de la transaction,
si aucune position n’utilise encore ce nom. Aucun texte historique ni lien n’est réécrit.

`CombatCore.fighterRemovalBlock` vérifie la phase, les actions/propositions et les dépendances
mécaniques en cours. `removeFighter` prépare un nouvel état, retire la copie et ses engagements,
conserve l’historique et ajoute un instantané compatible avec l’undo existant. Le rendu expose
les motifs de refus ; la commande UI utilise `commitCombatMutation` pour les erreurs de stockage.
La bibliothèque reste indépendante. Ni migration ni effacement de mécanique implicite.


## Nouvelle cible proposée : interface React v0

La décision du 8 novembre 2026 change la cible de rendu : les composants, la navigation et
le design viennent désormais de `avatar-legendes-ui`. Les sections précédentes décrivent
l’application HTML et ses acquis conservés ; elles n’imposent pas de reproduire ce HTML
pour la suite. La convergence attend le plan validé et le v0 corrigé.

Le [rapport](migration/FAISABILITE_CONVERGENCE_V0.md) recommande React/Vite, modules métier
sans DOM, service de commandes et repository local isolé. Les
[contrats](migration/CONTRATS_CIBLES.md) préservent les formats, copies de combat, décisions
MJ et historique. Le [relevé des sources](migration/SOURCES.json) fixe les références
provisoires inspectées. Aucun changement de code applicatif n’est effectué par cette étude.


## Convergence — socle effectivement réalisé au lot 1

Le plan ci-dessus a ensuite été validé par le propriétaire. Le lot 1 se trouve sur
`convergence/react-v0`, sans intégration des écrans métier des lots 2–5.

- `apps/companion/src/shell` : structure/onglets de navigation et styles v0, accueil,
  boîte modale. `v0.css` est figé, correctifs locaux dans `lot1.css`.
- `apps/companion/src/App.tsx` : routage hash des six rubriques et laboratoire technique ;
  aucune fiche ou technique fictive n'est chargée.
- `packages/domain/src` : ressources, combat, règles de choix, roster, lieux, livrets,
  catalogue, validations et export public. Aucun DOM, stockage ou import React.
- `packages/application/src` : contrats TypeScript et store transactionnel mutable en
  interne / snapshots figés à l'extérieur, consommés avec `useSyncExternalStore`.
- `packages/persistence/src` : codecs JSON sans I/O et adaptateur localStorage injecté.
  Le couple canonique est enregistré dans une enveloppe interne atomique distincte des
  formats d'export historiques. Aucune lecture/écriture des anciennes clés depuis React.
- `tests/convergence`, `tests/parity` : contrats, frontières, comparaison différentielle,
  réexécution de scripts historiques via les API extraites, recette navigateur du build.
- `scripts/convergence` : extraction contrôlée, inventaire et pilote de parité.

Les décisions MJ complexes ne sont pas connectées à React : leur port est décrit, leur
collecteur DOM reste à extraire au lot combat. Leurs commandes moteur sont conservées et
réexécutées dans les régressions, sans nouvelle interprétation réglementaire.

L'oracle HTML garde son hash. Les modules extraits sont la base de développement future ;
pas de double évolution silencieuse du métier. Toute correction du métier pendant la
transition demande une référence et un corpus de parité mis à jour explicitement.

Build : `npm run build` produit `dist/companion/index.html` seul. La CI livre ce fichier en
artefact téléchargeable, sans déployer. Le fonctionnement natif file:// et les limites de
stockage Safari/Chrome Mac restent à qualifier. [Bilan détaillé](migration/BILAN_LOT_1.md).


## Lot 2 — Personnages et ressources

`apps/companion/src/features/characters` contient les composants v0 raccordés : projections
canoniques en lecture, cartes/liste, fiche, formulaire et navigation. `ProjectData` porte
l'aperçu/import/export explicite nécessaire à la reprise de données réelles. La note de test
lot 1 reste indépendante. La cascade de styles charge les correctifs après le CSS v0 figé.

Les commandes sont dans `packages/application/src/character-commands.js`. Création et
édition appliquent les champs réellement modifiés grâce au helper Codex extrait ; aucune
sérialisation des projections visuelles. Les lieux, techniques, livrets et inconnus non
édités restent inchangés. La fatigue et l'équilibre permanents ne sont pas liés aux copies
CombatCore. L'undo temporaire est gardé par révision/profil/ressources ; aucun effet React
ne sauvegarde. Les formats et le repository du lot 1 sont conservés.

Deux modules supplémentaires, `character-fields` et `npc-presets`, sont extraits sans
réécriture de corps (13 au total). Les types de frontière ne modifient pas leur comportement.
La rubrique Techniques reste en attente du lot Bibliothèque indépendant, après validation
du lot 2. Voir [bilan](migration/BILAN_LOT_2.md) et [recette](migration/TESTER_LOT_2.md).


## Bibliothèque — projection informative et contenu privé

`packages/reference/src/technique-library.js` projette seulement ID/nom/famille/approche et
filtre sans mutation. `private-descriptions.js` valide un fichier fourni explicitement et
utilise une clé distincte ; aucun couplage au store canonique. `features/techniques` reprend
cartes/styles v0, boutons, icônes et AppModal. Le chargement privé est placé dans Gestion ;
la consultation des techniques ne déclenche aucune écriture de session.

La matrice `docs/reference/CONTROLE_TECHNIQUES_PDF.json` ne contient que métadonnées et
empreintes, sans texte officiel intégral. Le PDF et les extractions locales restent exclus
Git/CI. La banque privée n'est pas distribuée et n'est jamais exportée avec le projet.
Voir le bilan et les limites éditoriales dans `docs/reference/BILAN_BIBLIOTHEQUE.md`.

La préparation privée des descriptions utilise PDF.js, embarqué avec son worker dans le HTML. `packages/reference/src/pdf-layout.json` décrit les seules coordonnées de lecture de l’édition reconnue, sans texte. `pdf-text.js` est une fonction pure de reconstruction ; `features/techniques/read-private-pdf.ts` adapte PDF.js. Le PDF et les passages restent locaux ; seule une confirmation appelle le dépôt privé, jamais le store de campagne. Un export privé versionné permet de restaurer cette banque indépendamment. Voir `docs/reference/DESCRIPTIONS_PRIVEES.md`.
