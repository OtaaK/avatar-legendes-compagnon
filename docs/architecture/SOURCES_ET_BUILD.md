# Modifier les sources et livrer un seul HTML

Étape 3B, base `3059eff`, 14 novembre 2026. **La source d’édition est désormais `src/`.**
`app/simulateur.html` reste le fichier distribué, généré, à ouvrir sans installation,
connexion ou serveur. Sa première génération est identique à la version précédente.

## Organisation

| Emplacement | Rôle |
|---|---|
| `src/assembly.json` | Ordre explicite des fragments et rôles ; unique plan d’assemblage |
| `src/domain/combat.js` | Corps du moteur et export `CombatCore`, sans réécriture |
| `src/domain/combat-rules.js` | Disponibilité, maîtrise et coûts de posture existants |
| `src/domain/roster.js` | Modèles de fiches, validation et liens de combat |
| `src/domain/playbooks.js` | Fonctions de préréglage des Livrets |
| `src/data/playbooks.js` | Données statiques des dix Livrets, syntaxe originale conservée |
| `src/data/techniques.json` | 111 entrées du catalogue existant, désormais lisibles en JSON indenté |
| `src/data/technique-audit.json` | Données d’assistance/audit existantes, sans texte ajouté |
| `src/interface/template.html` | Balisage existant avec deux emplacements d’insertion |
| `src/interface/styles.css` | CSS existant, sans remise en forme |
| `src/interface/globals.js`, `application-before-validation.js`, `application-after-validation.js` | Fragments UI provisoires gardant leur ordre et portée d’origine |
| `src/legacy/validation.js` | Validation historique |
| `src/persistence/storage.js`, `index.cjs` | Service injectable sans DOM ; entrée Node séparée |
| `src/legacy/persistence.js` | Pont navigateur : signatures historiques, avertissements et accès tardif au stockage |
| `src/commands/mutation.js`, `index.cjs` | Commande synchrone injectable, entrée Node séparée |
| `src/interface/commands.js` | Pont entre état courant, commandes et stockage |
| `src/persistence/preferences.js`, `src/interface/preferences.js` | Préférences silencieuses, séparées des sauvegardes métier |
| `src/interface/exports.js` | Exports privés/publics et import de fiches existants |
| `src/interface/startup-state.js` | Reprise, chargement et façade de rendu sans sauvegarde métier |
| `src/interface/combat-command-bindings.js` | Protection des actions de combat existantes |
| `src/interface/events.js`, `bootstrap.js` | Distribution des événements et installation/premier affichage |
| `src/domain/index.cjs` | Façade Node de chargement des sources pour les tests et outils |
| `scripts/build.cjs`, `scripts/architecture/assemble.cjs` | Génération/contrôle par bibliothèques standard Node |
| `scripts/architecture/domain-context.cjs` | Adaptateur Node partagé d’exécution en VM des corps métier |

Les fragments navigateur sont des **scripts classiques**, pas des modules ES chargés
à l’ouverture. Le générateur les concatène dans l’ordre exact du manifeste, dans un seul
script et une seule portée. Les exports `window` et l’ordre d’initialisation sont conservés.
Cette décision de packaging évite de modifier les corps du moteur pendant leur déplacement.
Les fragments d’interface provisoires ne sont pas présentés comme une séparation finale
affichage/commandes : cela reste 3D. Aucun fichier vide ou moteur alternatif ajouté.

## Procédure de développement

1. Modifier le fichier concerné dans `src/`, pas le HTML généré.
2. Régénérer puis relire le diff de source **et** celui de l’artefact :

```bash
node scripts/build.cjs
node scripts/build.cjs --check
python scripts/test.py --suite js
python scripts/test.py --suite browser
```

La commande peut être lancée depuis n’importe quel dossier : les chemins sont résolus
par rapport au projet. Elle ne lit jamais `app/simulateur.html` pour reconstituer des sources.
Il n’existe pas de synchronisation inverse qui écraserait une source depuis un HTML édité.
Les fichiers de source et l’artefact doivent être versionnés ensemble lorsqu’ils changent.
Aucun npm, transpileur, framework ni nouvelle bibliothèque à installer.

`--check` ne crée et ne modifie aucun fichier. Une sortie absente ou différente provoque
un code non nul et invite à reconstruire. La CI exécute ce contrôle avant chacune des
suites : elle **ne régénère pas automatiquement** un fichier périmé pour masquer l’écart.

La génération normale vérifie tout avant de remplacer l’artefact : UTF-8/LF, JSON, ordre,
syntaxe JS et gabarit. Une erreur laisse l’ancien HTML intact. L’écriture passe par un
fichier temporaire propre au build, puis un remplacement final ; aucun fichier source
ni sauvegarde de campagne n’est modifié. Si le HTML est déjà conforme, il n’est pas réécrit.

## Déterminisme et données embarquées

- Aucune date, valeur aléatoire, dépendance réseau ou minification n’entre dans le résultat.
- Les fragments JS sont repris tels quels, espaces et commentaires compris. Les déclarations
  JSON sont reproduites de façon canonique, avec l’ordre de leurs propriétés conservé.
- Le gabarit est substitué en **un passage** : un `$&` ou un marqueur figurant dans une
  donnée n’est pas réinterprété. Les `<` des données JSON sont encodés pour empêcher une
  fermeture du script HTML. Une propriété `__proto__` est refusée : un littéral JS lui
  donnerait une signification différente d’une propriété JSON ordinaire.
- Le manifeste refuse les chemins hors `src/`, doublons normalisés, déclarations inconnues
  et liens de sources qui sortent de ce dossier. La sortie est fixée à `app/simulateur.html`.
- `.gitattributes` impose LF aux sources et au HTML. Conserver UTF-8 et les fins de ligne ;
  ne pas ajouter automatiquement un saut de ligne final aux rares fragments qui n’en ont pas.

Les JSON contiennent uniquement le catalogue et les synthèses déjà présents dans le HTML.
Aucune description manquante, règle ou transcription n’est ajoutée. Les questions de
licence/droits restent distinctes ; aucun PDF ou fichier privé n’est incorporé au build.

## Import Node sans découpe HTML

```js
const { loadDomain } = require('./src/domain/index.cjs');
const { CombatCore, Roster, Playbooks, catalog, validators } = loadDomain();
```

Chaque appel crée un contexte indépendant à partir des sources du manifeste. La façade
ne lit pas le HTML, le gabarit, les styles ou les fragments UI ; les tests le vérifient en
leur absence. Elle exécute uniquement les sources du projet contrôlées en revue.

Il s’agit d’une façade **Node pour le développement**, utilisant fs/vm standard, pas d’un
nouveau module à injecter dans le navigateur ou d’un package React. Les fichiers JS bruts
ne doivent pas être `require` individuellement : leurs noms/exports globaux sont encore
ceux du script classique. L’adaptateur fournit les mêmes API, sans seconde implémentation.

Un stockage de test peut être fourni explicitement pour charger le fragment de persistance.
Ses couplages actuels restent visibles ; aucune injection de nouvelles règles ou garantie
de transaction n’est ajoutée. L’ancien chargeur HTML de 3A reste disponible pour la parité.
La VM est partagée comme outil, mais **les corps comparés viennent de deux lectures
indépendantes** : sources et artefact. Chromium exécute en plus le véritable document.

## Référence et suite

[EXTRACTION_3B.json](EXTRACTION_3B.json) garde le commit d’origine, les plages et empreintes
des fragments rendus. `REFERENCE.json` reste la référence contractuelle de 3A.
La première extraction garde le même SHA-256 de l’HTML :
`e9dfff872790584aabcfc282766c63764323644adf8ae22059a8c0f36a3bd468`.

Les anciens tests continuent pour la plupart de découper le HTML. Ils restent conservés,
avec toutes leurs assertions. 3E les migrera progressivement vers la façade de sources.
Avant cela, 3C isolera réellement la persistance et 3D l’affichage/démarrage, dans des PR
séparées. Aucun de ces changements n’est annoncé comme déjà réalisé ici.


## Évolution 3C

Le service de stockage reçoit `storage` (fonction donnant accès au stockage),
`recoveryAllowed`, `onError`, `onRecovery` et `onInvalid`. Sa création ne lit et n’écrit
rien. Les fonctions injectées sont de confiance ; elles doivent conserver leur contexte
et les notifications ne doivent pas lever d’exception. `src/persistence/index.cjs`
expose `createPersistence` sous Node, sans charger le pont navigateur.
Le pont conserve les variables globales historiques et les messages, sans migration.
Les préférences d’affichage (`avatar-ui-view`, `avatar-combat-tab`, `avatar-session-location`)
restent dans l’interface et feront l’objet de 3D. Le service ne promet ni transactions
multi-onglets ni verrouillage : ce sont les garanties existantes du journal, conservées.

L’identité initiale des octets reste prouvée pour 3B, mais n’est plus attendue en 3C.
`BUILD_REFERENCE.json` garde l’empreinte de génération actuelle ; `REFERENCE.json`
reste l’oracle historique des contrats. Voir [le bilan 3C](BILAN_3C.md).


## Évolution 3D

`createMutationCommand` reçoit `read`, `restore`, `save`, `onRollback` et le message
historique de refus. `nested` garde une seule transaction de combat externe ;
`saveUnchanged` conserve la différence existante entre bibliothèque (écriture même sans
changement) et combat (écriture si changement). L’enveloppe reste **synchrone** : ne
pas lui fournir une fonction asynchrone. Elle n’ajoute ni file d’attente ni transaction
atomique entre bibliothèque et combat. La création et l’import Node ne consultent
ni état, ni stockage, ni DOM. L’adaptateur UI fournit les variables globales actuelles.

`createPreferences` reçoit un accès tardif au stockage ; erreurs silencieuses et replis
restent identiques. Le rendu peut écrire des préférences visuelles comme auparavant,
mais n’écrit pas les sauvegardes métier. Toutes les inscriptions de listeners délégués
sont regroupées au démarrage, dans le même ordre relatif. Le dispatcher garde sa liste
fixe : les données importées restent des valeurs inertes, jamais du code interprété.

Les fonctions d’écran historiques continuent à lire le DOM et appeler les ponts ;
cette étape ne transforme pas chaque gestionnaire en composant pur. Le moteur, modèles,
catalogue, styles et balisage restent inchangés. [Bilan](BILAN_3D.md).
