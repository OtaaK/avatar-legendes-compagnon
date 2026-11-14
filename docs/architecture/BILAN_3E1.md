# Bilan 3E.1 — Premier lot de tests depuis les sources

14 novembre 2026 — branche `architecture/tests-imports-moteur`, base
`b337017c23c5fb52604ba6a612763337753bc093` (PR 23, dépendant de PR 22).
Autorisation : « Continue ». Aucune fusion des étapes précédentes déduite de cet accord.

## Changements

145 scripts homogènes du moteur importent maintenant la façade Node existante :
`require('../../src/domain/index.cjs').loadDomain()`.
Ils ne recherchent plus des balises ou des noms de fonctions dans le HTML pour extraire
le moteur. Seul le préambule de chargement est remplacé ; après la définition de `C`,
le contenu est conservé **octet pour octet**, fonctions de préparation, scénarios,
boucles et assertions compris. Le module d’assertion choisi à l’origine (`assert` ou
`node:assert/strict`) et la présence du mode strict sont conservés.

La façade charge les mêmes sources métier dans un contexte indépendant, sans démarrer
l’interface. Elle n’est ni réécrite ni copiée dans ce lot. Aucun fichier de `src/`,
`app/`, `data/`, du générateur ou de la CI n’est modifié. Le HTML reste de 446 142 octets,
SHA-256 `41a5e5fe1a226bb5c621c753411e70ef3145d2dfbee61e9d613a9b267622609e`.
Aucun changement de règle, de format, de sauvegarde, de rendu ou de navigation.

## Inventaire et périmètre conservé

`MIGRATION_TESTS_3E.json` inventorie chacun des 197 scripts JS : 145 migrés, 52 intacts.
Il garde les empreintes des corps migrés, le module d’assertion et le mode strict,
ainsi que les empreintes et motifs de conservation des autres fichiers.

- 48 scripts conservent des contrôles HTML, une préparation mixte ou des responsabilités
  qui nécessitent une analyse distincte. Ils continuent à être exécutés.
- 4 scripts sont déjà des contrôles source/outillage autonomes sans préambule éligible.
- Les 40 scripts navigateur restent identiques à la base et actifs.

Cas volontairement exclu : `test_terre_v197.cjs` contient trois assertions HTML avant
le chargement du moteur. Remplacer naïvement son préambule les aurait supprimées :
le fichier est conservé intégralement pour une migration distincte. Aucun test n’est
supprimé, déplacé, renommé, désactivé ou sorti de la découverte ordinaire.

## Vérifications exécutées

| Contrôle | Avant | Après |
|---|---:|---:|
| Scripts JS | 197/197 | 197/197 |
| Scripts Chromium | 40/40 | 40/40 |
| Total | 237/237 | 237/237 |
| Échecs | 0 | 0 |

Les 145 sorties de scripts migrés sont également identiques avant/après. Le contrôle
Git confirme que tous leurs corps sont identiques à la base et les 52 autres scripts
intacts. Une exécution isolée des 145 scripts réussit dans un dossier temporaire sans
`app/`, sans `src/interface/` et sans helpers historiques : leur dépendance au HTML
est effectivement retirée. Le contrôle de génération passe sans régénérer l’application.
Les parcours Chromium et la parité sources/HTML restent dans la suite complète.

Outils ponctuels reproductibles :

```bash
node scripts/architecture/verify-test-migration.cjs
node scripts/architecture/verify-test-migration.cjs --compare-base
python scripts/architecture/check-source-only-tests.py
```

Le mode `--compare-base` nécessite le commit `b337017` dans l’historique local, sans
accès réseau. Le contrôle source seul utilise Node et Python déjà présents, et ne
retire que son propre dossier temporaire. Ces outils prouvent ce lot figé : ils ne sont
pas ajoutés à la CI comme verrou sur les futures évolutions légitimes des tests.
La CI ordinaire garde les mêmes commandes et tous ses contrôles.

## Limites et risques

Ce premier lot **ne termine pas toute 3E**. Les tests mixtes, validations, transactions
UI et contrôles structurels demandent des lots ciblés. Une partie devra continuer à
tester le HTML distribué : remplacer toute intégration par des tests source ferait
perdre une protection utile. L’ancien chargeur HTML de parité est conservé.

La politique cloud bloque toujours `file://`. Les contrôles hors réseau après chargement
local passent ; l’ouverture par double-clic sur Mac n’est pas vérifiée ici. Ce lot
n’ajoute pas de validation exhaustive des règles officielles.
Le défaut d’onglet de combat au rechargement signalé en 3D reste inchangé.

Le principal risque de migration est de perdre une assertion dans un préambule ;
la sélection conservatrice, les empreintes et la comparaison Git le contrôlent ici.
Les preuves sont datées : une future modification légitime des scénarios peut les rendre
obsolètes, sans signifier que l’application régresse.

## Retour arrière et suite

La PR de ce lot doit avoir pour base la branche de PR 23, pas main. Les PR 22 et 23
restent non fusionnées ; leur revue et leur éventuelle intégration gardent leur ordre.
Aucun déploiement ou migration de données. Avant fusion, revenir à 3D suffit ; après
une éventuelle intégration autorisée, un commit inverse restaure les préambules de tests.
Les utilisateurs et leurs sauvegardes ne sont pas affectés.

Suite proposée : 3E.2, tests de persistance, commandes et validation, puis contrôles
mixtes en préservant les vérifications HTML nécessaires. La refonte UI reste en attente
de la fin de la mission d’architecture.
