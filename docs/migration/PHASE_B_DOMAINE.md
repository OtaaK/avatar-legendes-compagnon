# Phase B — Réconciliation et sécurisation du domaine métier

Date : 14 novembre 2026. Travail limité au dépôt `OtaaK/avatar-legendes-compagnon`.

## Résultat et périmètre

Le domaine de la convergence avancée est conservé et sécurisé, avec des contrats
TypeScript et un point d'entrée utilisable ultérieurement par Next.js. Les services
fonctionnent sans écran, sans réseau et sans accès implicite au navigateur.

- Branche : `convergence/phase-b-domaine`.
- Parent exact : `convergence/preparation-livrets`,
  `84f39e4cb3fa2a187bcaaa82a983bab89206106d`, également vérifié sur GitHub.
- Référence historique des corps extraits : `a9079fa5b1babc560ee11a8d28430504df8704fc`.
- Protection d'identifiants portée depuis `main` :
  `a8cbd38cdc73bfe93ee4d0106da38e9760b309cb`.
- Aucun fichier de `avatar-legendes-ui`, `apps/companion` ou `app/simulateur.html`
  modifié. Aucun fichier ancien ni test supprimé ou déplacé. Aucune dépendance ajoutée.
- Aucun déploiement, aucune fusion, aucune ancienne PR fermée ou modifiée.

La cible définitive reste **une seule application React/TypeScript + Next.js dans
`avatar-legendes-ui`**. Le shell Vite hérité n'est pas une deuxième cible de produit.
Les tests de ce prototype servent uniquement de vérification de non-régression.

## 1. Protections transférées et complétées

| Frontière | Protection | Compatibilité |
|---|---|---|
| Fiches | ID obligatoire, ASCII de 1 à 120 caractères, premier caractère alphanumérique, suite alphanumérique/tiret/underscore | `char-N`, UUID et IDs historiques sûrs conservés exactement ; aucun réadressage silencieux |
| Import et normalisation | Même contrôle avant toute normalisation et avant la copie des objets | Import texte et objet ; doublons toujours refusés |
| Combat | Liens `characterId`, IDs de propositions/pièges contrôlés ; actions identifiées contrôlées également | Références historiques orphelines conservées ; présence des liens actifs toujours contrôlée |
| Identifiants spécialisés | Fin de chaîne stricte pour `p-N`, `temp-N`, `scene-note-N` | Refuse notamment un retour à la ligne terminal que `$` pouvait laisser passer |
| Instantanés | Contrôle des identités des combattants et des collections identifiées dans les snapshots imbriqués | Pas de réduction des données historiques à la structure du combat courant |
| JSON importé | Refus de `__proto__` et de `constructor.prototype` imbriqués | `constructor` textuel, champ `prototype` ordinaire et extensions JSON inoffensives conservés |
| Objets fournis par code | Vérification avant sérialisation : getters/setters, `toJSON`, prototypes personnalisés et données non JSON refusés | Pas d'exécution de ces conversions ; objets natifs inter-contextes, références partagées et `undefined` internes compatibles |
| Lecture du stockage | Validation aussi pour un repository injecté, pas seulement pour le stockage local standard | Un chargement invalide bloque l'écriture et les exports ; aucune remise à zéro écrite |
| Banque privée | Même frontière JSON ; export d'objet vérifié avant lecture de ses valeurs | Texte intégral synthétique, paragraphes, format texte/markdown-lite et IDs inchangés |

Le test comparatif charge l'oracle figé : l'ancien import accepte l'ID piégé ; le
nouveau le refuse. Les chemins sûrs conservent leur parité fonctionnelle.

Le domaine et les services ne construisent aucun attribut `onclick` ni fragment HTML.
La suppression des anciens handlers HTML de `main` n'a donc pas à être reproduite dans
ces modules. L'ancien HTML oracle n'est **pas** remis en production par cette phase et
reste figé ; ce livrable sécurise le domaine ESM, pas une nouvelle livraison HTML.
Le futur rendu React devra conserver des handlers React et afficher les textes comme
contenu, sans transformer les données importées en code ou HTML exécutable.

Les IDs de lieux gardent le contrat historique libre de PlaceRules (Unicode et
ponctuation compris). Ils sont utilisés comme valeurs et clés de Map, pas comme code.
Il n'y a pas de nouvelle contrainte ASCII sur les lieux ou sur un champ `id` d'une
extension inconnue. Aucun texte narratif n'est corrigé, échappé ou résumé à l'import.

Le contrôle des extractions reste actif. L'oracle conserve son SHA-256
`69f8ddb8e86f01bcc7138c3c2cb9645742aaff2f7b3d6081267b612b11c491bb`.
`security-overlays.mjs` déclare les seules substitutions autorisées, avec ancres uniques.
`extraction.json` garde les empreintes d'origine et celles des modules produits, la
référence du transfert et l'empreinte du module de sécurité. Toute divergence est refusée.

## 2. Contrats préparés

`packages/domain/src/contracts.ts` décrit :

- PJ et PNJ, identités, caractéristiques françaises, portraits et extensions.
- Ressources, profils PNJ explicites, états autorisés par le profil, statuts distincts.
- Principes, position d'équilibre et centre séparé ; limites calculées par ResourceRules.
- Livrets, suivi des quatre cases, moment d'équilibre, notes et évolutions existantes.
- Choix préparatoires propres aux Livrets, références de manœuvres et noms historiques.
- Techniques personnelles aux trois niveaux `acquise`, `pratiquee`, `maitrisee`.
- Catalogue de lecture distinct, sans maîtrise individuelle ni attribution automatique.
- Relations textuelles historiques, lieux hiérarchiques, domicile/position/associations.
- Évolutions proposées, décisions et événements préparatoires ; `applied:false`.
- Combattants, actions, propositions, effets temporaires, journal, snapshots et historique.
- Bibliothèques, sessions, enveloppes complètes et privées, import et banque privée séparée.

`packages/application/src/business-ports.ts` décrit les ports de stockage, le store,
les plans d'import, snapshots publiés en lecture seule et services. Les modèles de
cartes/fiches d'affichage sont distincts : une carte ne satisfait pas le type d'une
fiche persistante. Ce sont des propositions de projection, aucun composant v0 raccordé.

Les types n'inventent pas de migration. Les validations JS restent exécutées aux
frontières et contrôlent les plages numériques. Les extensions inconnues restent
opaques ; les événements et anciennes préparations non reconnus ne deviennent pas des
mécaniques exécutables. Un type TypeScript ne remplace pas une vérification de fichier.
Les anciennes déclarations larges du prototype restent en place pour compatibilité ;
les nouveaux adaptateurs doivent utiliser les contrats de phase B.

## 3. Services sans interface

`createCompanionServices({repository})` assemble le **store existant** et les commandes
existantes de lieux, Livrets, ressources et annulation. Il ne crée aucun nouveau
framework de stockage ni gestionnaire d'état.

Le service Personnages ajouté accepte des champs canoniques, sans noms de formulaire
`sheet*`. Création/édition passent par Roster et une transaction ; les portraits
utilisent la validation existante. Ajustements et annulations utilisent les commandes
éprouvées. Les confirmations utilisateur et décisions du MJ précèdent l'appel du
service ; aucune confirmation n'est acceptée automatiquement par une interface cachée.

La lecture du catalogue et des fiches renvoie des copies gelées. Modifier une maîtrise
personnelle ne modifie jamais le catalogue. Modifier la fatigue d'une fiche ne modifie
pas sa copie de combat. Un changement d'importance ne recalcule aucune ressource.

`createBusinessRepository` délègue au même repository atomique, avec des ports typés
sans types DOM. Une transaction sérialise bibliothèque et combat ensemble dans une seule
valeur de stockage ; validation/refus/quota ne publient pas un brouillon partiel.
Les plans d'import sont liés à l'instance et à une révision, puis vérifiés à l'exécution.

Les exports de campagne et combat restent explicites ; le combat refuse aussi d'exporter
un état vide de secours après une erreur de lecture initiale.

## 4. Formats et données préservés

| Format | Comportement |
|---|---|
| Bibliothèque brute v1 / v2 | Lecture et conservation ; normalisations historiques seulement ; v2 non rétrogradée |
| Sauvegarde `avatar-compagnon-backup` v1 / v2 | Champs d'enveloppe et contenus enrichis conservés ; une enveloppe explicitement v2 reste v2 à l'export |
| Combat brut historique | Lecture sans conversion vers un modèle de démonstration |
| Combat privé `avatar-compagnon-combat` v2 | Métadonnées de son enveloppe conservées dans son export privé |
| Session locale `avatar-compagnon-react-session` v1 | Même format et même clé `avatar-compagnon-react-session-v1`, contenu métier v1/v2 |
| Profil `avatar-npc-resources` v1 | Capacités 3/5/10/15, autres capacités déjà autorisées, non-combattants et états personnalisés conservés |
| Suivi `avatar-playbook-state` v1 | Entrées, quatre cases, notes et évolutions conservées, sans récompense automatique |
| Préparation `avatar-playbook-preparation` v1 | Choix, historiques et extensions conservés ; inconnus non écrasés |
| Descriptions privées v1 / v2 | Même clé `avatar-compagnon-private-technique-texts-v1`, import groupé de 111 IDs, export/restauration séparé |

L'ancien emplacement des sauvegardes HTML n'est jamais lu ni réécrit automatiquement.
La session atomique ne contient pas la banque privée gérée séparément. Les exports et
rapports existants ne reçoivent aucun texte privé provenant de cette banque. Aucun
nouveau texte PDF n'a été introduit : tous les tests ajoutés utilisent du texte synthétique.

## 5. Vérifications exécutées localement

| Contrôle | Avant B | Après B |
|---|---:|---:|
| Suite historique `python scripts/test.py --jobs 2` | 243/243 | 243/243 |
| Tests Node de convergence | 86/86 | 108/108, dont 22 nouveaux |
| Corpus JS redirigé vers le domaine ESM | Référence A : 198/198 | 198/198 ; 171 scripts appellent les API, 8 111 appels |
| Extraction contrôlée | 13 modules | 13 modules, écarts sécurité déclarés et contrôlés |
| Inventaire des fonctions publiques du domaine | 107 | 112, cinq fonctions de sécurité ajoutées |
| TypeScript des contrats B, sans bibliothèque DOM | Non présent | Réussi, y compris cas volontairement interdits |
| Tests/typecheck préparatoire Livrets | Inclus dans les 86 | Réussis, anciennes assertions conservées |
| Typecheck et build du prototype hérité | Référence A : réussis | Réussis, aucun écran changé |
| Parcours navigateur hérités | Référence A : réussis | Navigation/Gestion, Personnages, Bibliothèque, Lieux : réussis |
| Nouveau parcours métier Chromium | Non présent | Six contrôles réussis, sans écran React |

Les quatre parcours hérités ont été exécutés à **1440×1024, 1280×800, 768×1024 et
390×844**. Ils comprennent leurs contrôles de quota/refus, imports/exports, navigation,
états persistés et conflits entre fenêtres selon le parcours.

Les nouveaux contrôles couvrent notamment : ID piégé et fin de ligne, refus avant
normalisation, instantanés, pollution de prototype, absence d'exécution des getters,
roundtrip enrichi multi-niveaux, `pratiquee`, version 2 sans rétrogradation, quota atomique,
aperçu abandonné/étranger/périmé, stockage illisible, restauration, renommage PNJ,
catalogue indépendant, portrait refusé, ressources annulables, import de tous les modules
métier/application/persistance avec globals navigateur interdits et aucune fonction réseau.

Le nouveau parcours Chromium vérifie : aucune écriture au montage, ID piégé refusé,
quota atomique, commandes hors réseau après chargement des modules, 111 textes privés
isolés et persistance après rechargement. Le harnais est rechargé par HTTP local avant
les dernières lectures hors réseau : **ce n'est pas une preuve de démarrage Next hors ligne**.

La première tentative de ce nouveau parcours cherchait le navigateur Playwright absent.
Le script utilise maintenant la même sélection du Chromium installé que les autres
parcours ; la relance est réussie. Aucun échec final n'est masqué.

Limite préexistante conservée : le cloud bloque `file://`. La suite historique signale
une limite, zéro échec. Le double-clic Mac n'a pas été rejoué dans cette phase.
Le navigateur a testé le document portable embarqué hors réseau ; cela ne qualifie ni
le futur Next.js ni un Safari Mac qui n'a pas été exécuté ici.

Commandes reproductibles depuis la racine :

```sh
python scripts/test.py --jobs 2
npm run test:contracts
npm run test:business-types
npm run test:playbooks
npm run test:extraction
npm run test:inventory
npm run test:parity
npm run build
npm run test:business-browser
npm run test:react
npm run test:characters
npm run test:library
npm run test:places
```

Installer au préalable les dépendances déjà déclarées et Chromium pour Playwright.
Les rapports d'exécution sont sous `work/phase-b/` et `work/*-browser/`, ignorés par Git.
Le workflow de convergence reprend les contrôles B en complément des contrôles hérités.
Son résultat GitHub est distinct des exécutions locales ; ne pas annoncer une CI verte
avant la fin effective du workflow.

## 6. Incompatibilités et limites restantes

1. Un ancien fichier contenant un identifiant désormais dangereux est refusé, sans
   modification du fichier original. Pas de réparation automatique des références.
2. Les extensions doivent être des données JSON sûres. Getters, fonctions, prototypes
   personnalisés, cycles, valeurs non finies et chaînes de pollution de prototype ne sont
   pas des extensions compatibles. Le contrôle n'est pas un bac à sable pour objets Proxy
   fournis par du code hostile, ni une protection générale contre les fichiers démesurés.
3. Web Locks offre la sérialisation entre fenêtres quand le port est fourni. Sans lui,
   le contrôle reste optimiste : une écriture exactement simultanée peut rester une course.
   Aucune promesse de rollback d'un système de stockage externe défaillant après écriture.
4. La structure v0 ne correspond pas encore aux sauvegardes Codex : noms de champs,
   PJ/PNJ, états/statuts, équilibre/centre, profils PNJ, lieux et trois maîtrises devront
   être adaptés écran par écran, sans changer les formats persistants.
5. Les interfaces de cartes/fiches sont des projections proposées. Aucune parité avec le
   lot 2 v0 en cours n'est affirmée avant sa validation et le gel de son commit.
6. Le moteur de combat complet reste conservé, avec ses tests et historique. Son portage
   dans les écrans et ses décisions séquentielles ne sont pas réalisés par B. Les branches
   d'architecture HTML ne sont pas fusionnées pour cela.
7. Les Livrets/manœuvres/évolutions restent au niveau préparatoire de la branche source :
   pas de formule passive automatique, gain, consommation des quatre cases, accès à une
   technique ou changement de Livret déclenché silencieusement. Les événements inconnus
   restent des archives, pas des commandes. Les incertitudes de règles déjà documentées
   restent ouvertes ; aucune nouvelle vérification exhaustive du PDF n'est revendiquée.
8. Le fonctionnement Next hors ligne à froid et une éventuelle distribution HTML unique
   restent à étudier ; les tests du prototype Vite ne répondent pas à cette question.
9. Ce socle utilise des modules ESM JS existants et des contrats TypeScript, pas une
   réécriture intégrale du moteur en TypeScript. Les déclarations anciennes restent
   présentes pour le prototype ; les nouveaux ports sont la référence pour l'intégration.

## 7. Recommandations pour la prochaine phase Next.js

Attendre l'accord sur B et la recette du lot 2 v0. Figer ensuite un commit v0 explicite.
Importer les services et contrats par un adaptateur dans le dépôt UI, sans copier le
shell Vite. Il faudra choisir et documenter le mécanisme de partage/version des modules
avant toute copie afin de ne pas maintenir deux moteurs divergents.

Conserver les modules métier importables côté serveur, mais créer la session cliente
uniquement après hydratation, avec stockage et Web Locks injectés. Aucune lecture de
`localStorage` au niveau du module ni singleton entre utilisateurs. Un adaptateur vers
`useSyncExternalStore` peut réutiliser `subscribe/getSnapshot` ; définir un snapshot SSR
stable avant de brancher les composants. Ne pas introduire un second store concurrent.

Convertir les valeurs d'affichage v0 vers les champs canoniques dans des projections
explicites. Conserver le pipeline aperçu/confirmation/transaction et les erreurs visibles.
Les décisions de combat doivent être préparées avant la transaction synchrone ; ne pas
suspendre une transaction pendant une fenêtre de confirmation.

Qualifier ensuite stockage, quota, export de secours, restauration, mise à jour de
l'application hors ligne et démarrage à froid. Une exportation statique Next peut être
étudiée sans service externe ; le cache des fichiers nécessaires et l'absence de fonctions
serveur devront être prouvés. Le mode `file://` et un HTML unique nécessitent une étude
séparée, sans réutiliser les promesses du prototype pour le futur produit.

## 8. Retour arrière et arrêt

Aucune migration du stockage réel n'a été déclenchée par les travaux. La branche source,
les anciennes branches, PR et versions sont conservées. Avant tout essai réel futur,
exporter campagne, combat et descriptions privées dans leurs exports respectifs.

Avant fusion, revenir à la branche parent suffit pour retrouver le code précédent ;
conserver les sauvegardes privées hors du dépôt. Après une éventuelle intégration future,
un retour de code devra se faire par commit de réversion et restauration explicite,
sans réécriture d'historique. Aucune fusion n'est autorisée par la présente livraison.

**Arrêt à la fin de B.** Aucun nouveau lot, raccordement v0 ou nettoyage avant validation.

## 9. Liste exacte des fichiers de la phase B

| Fichier | Statut |
|---|---|
| `.github/workflows/convergence.yml` | Modifié |
| `AGENTS.md` | Modifié |
| `README.md` | Modifié |
| `ROADMAP.md` | Modifié |
| `docs/ARCHITECTURE.md` | Modifié |
| `docs/DECISIONS.md` | Modifié |
| `docs/migration/INVENTAIRE_API_CONVERGENCE.json` | Modifié |
| `docs/migration/PHASE_B_DOMAINE.md` | Ajouté |
| `package.json` | Modifié |
| `packages/application/src/business-ports.ts` | Ajouté |
| `packages/application/src/character-service.d.ts` | Ajouté |
| `packages/application/src/character-service.js` | Ajouté |
| `packages/application/src/companion-services.d.ts` | Ajouté |
| `packages/application/src/companion-services.js` | Ajouté |
| `packages/application/src/contracts.ts` | Modifié |
| `packages/application/src/session-store.js` | Modifié |
| `packages/domain/extraction.json` | Modifié |
| `packages/domain/src/contracts.ts` | Ajouté |
| `packages/domain/src/import-safety.d.ts` | Ajouté |
| `packages/domain/src/import-safety.js` | Ajouté |
| `packages/domain/src/roster.js` | Modifié |
| `packages/domain/src/validation.js` | Modifié |
| `packages/persistence/src/business-repository.d.ts` | Ajouté |
| `packages/persistence/src/business-repository.js` | Ajouté |
| `packages/persistence/src/codecs.js` | Modifié |
| `packages/persistence/src/local-session-repository.js` | Modifié |
| `packages/reference/src/private-descriptions.js` | Modifié |
| `scripts/convergence/extract-domain.mjs` | Modifié |
| `scripts/convergence/inventory.mjs` | Modifié |
| `scripts/convergence/security-overlays.mjs` | Ajouté |
| `tests/convergence/phase-b-domain.test.mjs` | Ajouté |
| `tests/convergence/phase-b.typecheck.ts` | Ajouté |
| `tests/convergence/phase_b_browser.py` | Ajouté |
| `tests/convergence/tsconfig.phase-b.json` | Ajouté |

Aucun fichier supprimé ou déplacé. Les rapports ignorés sous `work/` ne sont pas livrés.
