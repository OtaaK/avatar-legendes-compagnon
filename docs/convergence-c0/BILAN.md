# C0 — Préparation de la convergence React

15 novembre 2026. **C0 préparée pour validation, sans démarrage de C1.**

Le diagnostic repose exclusivement sur Codex B `62c523c1540f01b3f331c4d980d129307f560af0`
et v0 `804381ca2ae7ee9f7e9ce960591faffd534cb2e7`. Le code du lot 3 n'a pas servi de
référence. Le dépôt UI de travail n'a pas été modifié ni mis à jour ; le SHA demandé a
été récupéré et inspecté dans un cache isolé. [Références et empreintes](SOURCES.json).

## Ce qui est livré

| Livrable | Document / module |
|---|---|
| Matrice actualisée, 17 domaines et dix axes par domaine | [MATRICE.md](MATRICE.md) |
| Arbitrages A01–A09, invariants acquis distingués des décisions ouvertes | [ARBITRAGES.md](ARBITRAGES.md) |
| Architecture de lecture/commandes, champs facultatifs, refus/confirmation/transactions, SSR et hydratation | [ADAPTATEURS.md](ADAPTATEURS.md) |
| Comparaison du partage et versionnement du moteur | [PARTAGE_MOTEUR.md](PARTAGE_MOTEUR.md) |
| Lots C1–C7 : préconditions, fichiers, interactions v0, risques, acceptation, tests et retour arrière | [PLAN_C1_C7.md](PLAN_C1_C7.md) |
| Contrat et aperçu pur non raccordé | `packages/application/src/external-field-preview.js` et `.d.ts` |
| Tests ciblés et contrôles de types | `tests/convergence/c0-preview.test.mjs`, `c0.typecheck.ts` et commande `npm run test:c0` |

README, ROADMAP, AGENTS et documents d'architecture/décisions ont été actualisés sur
la seule branche C0. Aucun contrat persistant ou validateur B n'est changé. Aucune
bibliothèque, dépendance, composant ou deuxième store n'est ajouté.

## Constats importants pour le propriétaire

**Les ressources non renseignées restent un obstacle à une conversion automatique.**
v0 a corrigé le patch PNJ neutre : absence, null, zéro et capacité personnalisée sont
conservés. Le domaine B exige néanmoins des ressources numériques sur une fiche active.
Le module C0 garde ces différences dans un aperçu externe ; il ne crée pas une fiche en
lui donnant zéro fatigue ou cinq cases par défaut. A01 doit définir la conservation
persistante et la résolution explicite avant toute conversion effective.

**La plage v0 a évolué depuis la matrice provisoire.** À 804381ca, les caractéristiques
v0 vont de −1 à +3, pas seulement de 0 à +3. Codex accepte aussi −2 et −3, qui restent
à préserver lors du futur raccordement. La signification des modificateurs n'est pas
résolue par une addition ou une décomposition automatique.

**L'historique des évolutions v0 est maintenant structuré.** Il possède corrections,
annulations et dépendances transitives. Les anciennes entrées sont conservées, mais
les liens peuvent être réadressés. Ce n'est ni un texte à aplatir ni un ensemble de
gains à rejouer. L'annulation d'une entrée n'annule pas automatiquement une ressource.
Un futur contrat doit préserver provenance, liens, événements inconnus et décisions,
avec un historique avant/après pour les nouvelles transitions.

**Les références de Livrets concordent sur les métadonnées comparées.** Le contrôle
exécuté retrouve les dix mêmes IDs, bases de caractéristiques, principes et 50 noms de
manœuvres, cinq par Livret. Cela ne certifie ni les effets des manœuvres ni les compteurs
réels des spécificités. Les réserves Work sont conservées.

**Le partage doit garder une source unique.** Recommandation soumise à décision :
package métier versionné, consommé par Next, avec version exacte et intégrité verrouillée.
Canal privé ou archive générée à choisir après accord. Une dépendance Git vers la racine
actuelle importerait aussi le contexte du prototype Vite ; elle n'est pas prête à être
utilisée comme package métier. Un transfert unique vers un workspace du dépôt cible
reste une alternative à décider, pas une copie active supplémentaire.

## Module préparatoire : ce qu'il fait et ne fait pas

`externalResourceState` conserve l'état propre de fatigue, capacité et équilibre.
`previewExternalResourceEdits` prépare une copie gelée avec intentions keep/set/remove.
Sans intention, rien n'est initialisé. Null reste null, zéro reste présent, remove
supprime seulement la propriété explicitement choisie. Le document source est inchangé.

Le module réutilise les protections JSON/ID B, refuse les intentions ambiguës et ne
contient aucun accès au DOM, navigateur, réseau ou stockage. Il conserve les champs
JSON compatibles inconnus, relations provisoires, historiques et maîtrises comme données.
Il ne valide pas ces archives comme des règles et n'applique aucune transition.

Un aperçu porte `canonical:false` et `effectsApplied:false` ; l'import de session le
refuse. Il peut préserver une capacité externe supérieure à 15 sans la déclarer valide
comme profil Codex. Il n'existe aucune commande d'enregistrement ou connexion React.
Aucune archive persistante nouvelle n'est créée : sa stratégie relève de A01/C1.

## Tests réellement exécutés

| Contrôle local | Avant C0 | Après C0 |
|---|---:|---:|
| Suite historique complète, `python scripts/test.py --jobs 2` | 243/243 | 243/243 |
| Tests Node de convergence | 108/108 | 117/117, dont neuf nouveaux C0 |
| Parité des scripts JS avec le domaine ESM | Référence B : 198/198 | 198/198, 171 scripts appellent les API, 8 111 appels |
| Extraction du domaine | Référence B conservée | 13 modules contrôlés, écarts sécurité B inchangés |
| Inventaire métier | Référence B conservée | 112 fonctions et 112 handlers historiques, contrôle réussi |
| Contrats TypeScript B et nouveaux cas C0, sans DOM | Référence B conservée | Réussi |
| Tests et déclarations préparatoires Livrets | Référence B conservée | Réussis |
| Build/typecheck du prototype hérité, sans changement d'écran | Non relancé avant C0 | Réussi après C0 |
| Parcours métier Chromium B, six contrôles | Référence B conservée | Réussi après C0 |
| Suites v0 storage/evolutions/npc-edit de 804381ca, copie isolée | Non exécutées ici auparavant | 19/19 |
| Comparaison métadonnées des Livrets | Ancienne référence 4f70dfe remplacée pour ce diagnostic | Dix IDs, principes, bases et 50 noms de manœuvres concordants |

Les nouveaux tests couvrent 64 combinaisons d'absence/null/zéro/positif, keep/set/remove,
absence d'initialisation, refus d'undefined, conservation des extensions, trois degrés,
relations provisoires, événements inconnus et graphe archivé sans application. Ils
couvrent les données piégées, absence de mutation/stockage et refus du format externe
comme session. Les tests B d'import avec globals navigateur interdits incluent le nouveau
module par leur découverte de tous les modules applicatifs JS.

Le parcours Chromium B vérifie absence d'écriture au montage, ID piégé refusé, quota
atomique, commandes hors réseau après chargement, 111 descriptions privées séparées et
rechargement. C0 n'a pas une interface à recetter. Les quatre parcours visuels React du
prototype n'ont pas été relancés : aucune de leurs sources ou dépendances n'est modifiée,
et le nouveau module n'entre pas dans leur graphe d'import.

Limite préexistante : le cloud bloque `file://`, signalé comme une limite et zéro échec
par la suite historique. Pas de nouvel essai Mac/Safari, de recette mobile v0, de build
Next consommant le futur paquet, de démarrage Next hors ligne à froid ni de déploiement.
Les tests proposés dans la matrice/plan pour les futurs raccordements ne sont pas tous
exécutés par C0. Le rapport Work complet n'était pas joint : verdict et réserves sont
ceux transmis par le propriétaire, non une nouvelle certification de notre part.
Les avertissements Node sur les modules TS de v0 sans type de package explicite n'ont
pas empêché ses 19 tests ; aucune configuration v0 n'a été modifiée pour les masquer.

Commandes depuis la racine Codex :

```sh
python scripts/test.py --jobs 2
npm run test:contracts
npm run test:c0
npm run test:business-types
npm run test:playbooks
npm run test:parity
npm run test:extraction
npm run test:inventory
npm run build
npm run test:business-browser
```

Pour reproduire les tests v0 : extraire le seul commit 804381ca dans une copie isolée,
puis y exécuter `node --experimental-strip-types --test lib/demo-storage.test.mjs lib/evolution-history.test.mjs lib/npc-edit.test.mjs`.
Cela ne nécessite aucune modification de son dépôt de travail.
Les logs locaux sont ignorés sous `work/c0` ; les tests ne contiennent que des données
synthétiques. Le workflow C0 conserve les contrôles historiques hérités et ajoute la
commande ciblée ; son résultat GitHub doit être distingué des exécutions locales.

## Risques non résolus et prochaine décision

Les points A01–A09 restent des décisions préparées, pas des migrations déjà faites.
En particulier : ressources inconnues/hors plage, sémantique des modificateurs, table
états/statuts, représentation structurée des principes externes, compteurs de Livrets,
relations/lieux PJ, graphe d'évolution et canal/version du package.

La référence des groupes de PNJ lot 3 n'est pas supposée. À réception d'un commit
validé, il faudra un diagnostic différentiel avant de brancher les périmètres touchés.
Le démarrage Next hors ligne, la concurrence sans Web Locks, les accès CI/Vercel et les
droits de distribution restent à qualifier ; aucun paquet n'est publié. Le layout v0
inclut Analytics en production : son comportement réseau devra être examiné pour la
qualification privée/hors ligne, sans changement dans cette phase.

La prochaine décision attendue est la validation de C0 et le périmètre d'un éventuel
C1, avec les arbitrages qui le conditionnent. Aucune fusion ne résulte de cette validation.

## Branche, réversibilité et état conservé

Branche : `convergence/phase-c0-preparation`, issue exactement du commit B 62c523c.
Le commit final est indiqué dans le message de livraison ; la branche est poussée.
La tentative de création d'une PR C0 en brouillon a été refusée par le contrôle
automatique d'approbation, qui a invoqué l'ancienne consigne d'attendre avant la phase C.
Aucune PR C0 n'a été créée et aucune tentative de contournement n'a été faite.
Une autorisation explicite sera demandée pour cette seule action. Les contrôles locaux
restent disponibles ; le workflow sur événement pull_request n'a pas été déclenché
par une PR C0 inexistante.
La PR 27 est restée ouverte en brouillon au commit 62c523c, contrôle GitHub en lecture
seule effectué pendant C0. Aucune ancienne PR n'a été fusionnée, fermée ou modifiée.
Le dépôt UI de travail est resté propre à son ancien HEAD 8b8924d, sans checkout du
commit de comparaison, qui a été lu dans une archive isolée.

Le domaine, la persistance, les références et protections B, les sources d'application,
les tests historiques et les formats sont inchangés. Revenir à la branche B retrouve
le socle validé. Aucune migration de données réelles à annuler, aucune branche ou ancien
code supprimé, aucun historique réécrit. **Arrêt en fin de C0 ; C1 non commencé.**

## Liste exacte des fichiers de C0

| Fichier | Statut |
|---|---|
| `.github/workflows/convergence.yml` | Modifié |
| `AGENTS.md` | Modifié |
| `README.md` | Modifié |
| `ROADMAP.md` | Modifié |
| `docs/ARCHITECTURE.md` | Modifié |
| `docs/DECISIONS.md` | Modifié |
| `docs/convergence-c0/ADAPTATEURS.md` | Ajouté |
| `docs/convergence-c0/ARBITRAGES.md` | Ajouté |
| `docs/convergence-c0/BILAN.md` | Ajouté |
| `docs/convergence-c0/MATRICE.md` | Ajouté |
| `docs/convergence-c0/PARTAGE_MOTEUR.md` | Ajouté |
| `docs/convergence-c0/PLAN_C1_C7.md` | Ajouté |
| `docs/convergence-c0/SOURCES.json` | Ajouté |
| `package.json` | Modifié |
| `packages/application/src/external-field-preview.d.ts` | Ajouté |
| `packages/application/src/external-field-preview.js` | Ajouté |
| `tests/convergence/c0-preview.test.mjs` | Ajouté |
| `tests/convergence/c0.typecheck.ts` | Ajouté |
| `tests/convergence/tsconfig.phase-b.json` | Modifié |
