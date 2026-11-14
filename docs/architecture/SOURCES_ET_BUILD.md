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
| `src/legacy/validation.js`, `persistence.js` | Corps existants encore couplés aux variables globales/notifications ; isolation future en 3C |
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
