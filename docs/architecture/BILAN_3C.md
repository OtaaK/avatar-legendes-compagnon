# Bilan 3C — Persistance injectable

14 novembre 2026 — branche `architecture/persistance-adaptateur`.
Base : `a8cbd38cdc73bfe93ee4d0106da38e9760b309cb`, fusion autorisée de PR 21.

## Ce qui change

Le stockage des fiches et combats est isolé dans `src/persistence/storage.js`.
Le service reçoit le stockage, l’autorisation d’écriture après récupération et trois
notifications ; il ignore le DOM. Sa création ne lit ni n’écrit rien. L’entrée Node
`src/persistence/index.cjs` permet de le charger sans navigateur. Les fonctions publiques
historiques restent dans `src/legacy/persistence.js`, qui relie le service au navigateur
et conserve les messages, la notification d’erreur unique et les signatures existantes.

Les clés, versions JSON, champs inconnus et chaînes du journal restent inchangés.
Le service conserve l’ordre lecture des valeurs antérieures → journal → bibliothèque →
combat → retrait du journal. Lors d’un refus, il tente la même restauration et garde
le journal si celle-ci échoue. Il ne transforme ni les données ni les règles du jeu.
Les validateurs et enveloppes de commandes existants restent en place.

Le HTML est régénéré : 445 276 octets (+1 069), SHA-256
`317e491c1f2d37f3b1f5ce1f2b4d900ae9c15b20d728a4e5c8a8a8c94c1b3ec6`.
Il reste autonome ; sa différence de code est attendue à cette étape. L’empreinte de
build courante est dans `BUILD_REFERENCE.json`. La référence contractuelle 3A n’est
pas réécrite ; le test indique explicitement que ses octets HTML ne sont plus identiques.

## Contrôles exécutés

| Contrôle | Avant | Après |
|---|---:|---:|
| Scripts JavaScript | 195/195 | 196/196 |
| Scripts Chromium | 39/39 | 39/39 |
| Total | 234/234 | 235/235 |
| Échecs | 0 | 0 |

Le nouveau script couvre 17 scénarios sans DOM : absence d’accès à la création,
ordre exact et données inconnues, écritures bloquées, refus ponctuel des six opérations
de l’import, quota persistant et reprise avec une nouvelle instance, valeurs antérieures
absentes, journal invalide, lecture refusée, repli vers ancienne version, validation et
sérialisation impossible.

`node scripts/architecture/compare-persistence.cjs` exécute 58 comparaisons exactes
entre le code Git de la base et les nouvelles sources : contenu final, ordre et valeurs
des accès, résultats, erreurs et notifications sont identiques pour ces scénarios.
Le script utilise Git localement, sans téléchargement ; il nécessite la base disponible
dans l’historique. Il n’est pas lancé dans le clone superficiel de la CI.

Aucun test n’est supprimé ou déplacé. Les assertions des deux anciens tests de stockage
sont conservées, leur préparation charge le service extrait. Deux autres contrôles sont
adaptés explicitement pour distinguer empreinte courante et empreinte historique.
Les 191 autres scripts JS existants et les 39 scripts navigateur restent identiques à
la base. Les données du catalogue, modèles et moteur sont inchangés. Le contrôle de
build est passé ; les tests Chromium comparent aussi les comportements Node/HTML,
le rechargement et l’absence de mutation de la session réelle.

## Limites et risques

La politique cloud bloque `file://` : hors réseau testé après chargement HTTP local,
mais ouverture par double-clic sur Mac non exécutée ici. Les tests vérifient des
comportements couverts ; aucune nouvelle conformité au PDF n’est revendiquée.

Les préférences visuelles (`avatar-ui-view`, `avatar-combat-tab`,
`avatar-session-location`) restent dans l’interface pour 3D. Le pont conserve des
variables globales ; cette étape n’isole pas encore l’ensemble des commandes ou rendus.
Le journal n’apporte pas de verrouillage multi-onglets ni de transaction atomique entre
deux clés. Les ports fournis au service sont de confiance et les notifications doivent
rester sans exception. Aucune garantie supplémentaire n’est annoncée.

## Retour arrière et suite

Aucun déploiement, suppression d’ancien fichier ou migration de données. Aucun paquet
ni framework ajouté. Avant fusion, revenir à main restitue la version précédente.
Après une fusion autorisée, un commit inverse suffit à retirer cette étape ; les formats
étant inchangés, les sauvegardes ne nécessitent pas de migration inverse.

Examiner la PR 3C avant fusion. L’étape suivante proposée est 3D (affichage et commandes),
sur sa propre branche ; la refonte UI reste en attente de la fin de la mission 3.
