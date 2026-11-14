# Bilan 3E.2 — Préparations des tests de services

14 novembre 2026 — branche `architecture/tests-imports-services`, base
`3bfd3f359415ee9c9379a77755d6d8d7beff31d6` (PR 24).
Après « Continue », étape dépendante du lot précédent. Les PR 22, 23 et 24 restent
non fusionnées ; aucun accord de fusion n’est déduit de la poursuite du travail.

## Changements

Le helper de tests `tests/support/source-fixtures.cjs` charge des ensembles fixes de
fichiers sources complets, sans extraire de fonctions du HTML. Il ne remplace aucune
implémentation métier et n’exécute ni événements ni démarrage de l’application.
Les contextes de test restent isolés ; certains doubles sont conservés explicitement
après chargement des ponts complets (stockage, avertissement, rafraîchissement).

| Script migré | Code exécuté depuis les sources | Vérification HTML conservée |
|---|---|---|
| `test_transactions.cjs` | Commande et pont bibliothèque | Fonctions critiques transactionnelles |
| `test_combat_transactions.cjs` | Commande et pont combat | Rendu sans sauvegarde, actions protégées, ressources rapides |
| `test_roster_links.cjs` | Validation, commandes, exports | Validation avant transaction, remise à zéro du sélecteur |
| `test_sync_sheet_transaction.cjs` | Commandes et fonctions de fiche complètes | Synchronisation explicitement transactionnelle |
| `test_persistance.cjs` | Validation, service et pont stockage | Validation des liens d’import, premier rendu sans écriture métier |
| `test_complete_import.cjs` | Service et pont stockage, avertissement simulé conservé | Import complet passant par le journal |
| `test_validite_sauvegardes.cjs` | Domaine et validateur via façade Node existante | Aucune lecture du HTML encore nécessaire |
| `test_security_import_ids.cjs` | Modèle de fiches et validateur | Données inertes dans les événements, dispatcher à liste fixe |

Les découpes HTML restantes dans ces scripts servent uniquement à des assertions
structurelles ; elles ne sont plus évaluées comme programme. Elles sont conservées
avec leurs cibles d’origine pour ne pas affaiblir l’intégration du fichier distribué.
Les tests exécutés en VM chargent les véritables fichiers sources, pas une copie de
fonctions réécrites. Le mode strict et le module d’assertion de chaque script sont inchangés.

Aucun fichier de `src/`, `app/`, `data/`, du générateur ou de la CI n’est modifié.
Le HTML reste de 446 142 octets, SHA-256
`41a5e5fe1a226bb5c621c753411e70ef3145d2dfbee61e9d613a9b267622609e`.
Aucun changement de règle, format, sauvegarde, interface ou navigation.

## Vérifications exécutées

| Contrôle | Avant | Après |
|---|---:|---:|
| Scripts JS | 197/197 | 198/198 |
| Scripts Chromium | 40/40 | 40/40 |
| Total | 237/237 | 238/238 |
| Échecs | 0 | 0 |

Les huit scripts couvrent les mêmes 92 scénarios/contrôles historiques et produisent
les mêmes sorties avant/après. Toutes leurs lignes d’assertion sont identiques et neuf
régions complètes de scénarios sont conservées octet pour octet ; les régions séparent
les changements de préparation des vérifications exécutées. Les jeux de données et
doubles existants restent en place, avec conservation explicite des doubles lorsque
le chargement d’un fichier entier les redéfinit.

Le nouveau `test_source_fixtures.cjs` couvre neuf cas : noms inconnus refusés,
chargement sans HTML/DOM/état, persistance sans accès préalable au stockage, doubles
conservés, ports invalides refusés, isolation des instances, source absente sans repli
vers le HTML, syntaxe invalide et écran complet sans démarrage.

Les 189 autres anciens scripts JS et les 40 scripts navigateur sont identiques à la
base. Les 145 tests moteur de 3E.1 ne sont pas retouchés. Aucun test supprimé, déplacé,
renommé, ignoré ou sorti de la découverte ordinaire. Le contrôle de génération passe
sans régénération ; les parcours navigateur et la parité sources/HTML restent actifs.

Preuve ponctuelle :

```bash
node scripts/architecture/verify-service-test-migration.cjs
node scripts/architecture/verify-service-test-migration.cjs --compare-base
```

Le second mode nécessite le commit `3bfd3f3` localement, sans téléchargement, et compare
aussi les anciens tests non concernés et les fichiers de l’application à Git.
`MIGRATION_SERVICES_3E2.json` garde les empreintes et régions de ce lot seulement.
Ces preuves sont datées et ne verrouillent pas la CI contre de futures modifications
légitimes des tests. L’inventaire conservé de 3E.1 devient historique pour les huit
fichiers modifiés et le nouveau test ; ne pas le réécrire pour prétendre qu’ils sont
encore tous identiques à PR 24.

## Limites et suite

Ce lot ne termine pas toute 3E : d’autres tests moteur/mélangés conservent leur ancien
chargement. Le prochain lot proposé est 3E.3, suivi d’un inventaire final des contrôles
structurels et de parité qui doivent continuer à lire le HTML distribué.

Le helper est réservé aux sources de confiance du dépôt et n’est pas un bac sécurisé
pour des données importées. Lors d’un échec, abandonner son contexte : il restaure les
doubles explicitement demandés, pas toute propriété définie avant une exception.
Les sources restent des scripts classiques chargés en VM pour certains tests ; il ne
s’agit pas d’une conversion de toute l’application en modules natifs.

La politique cloud bloque `file://` : fonctionnement hors réseau après chargement local
contrôlé, ouverture par double-clic sur Mac non exécutée ici. Le défaut préexistant de
retour à Combattants au rechargement reste inchangé. Aucune conformité exhaustive aux
règles officielles supplémentaire n’est revendiquée.

## Retour arrière

La PR doit avoir pour base la branche de PR 24. Aucun déploiement, paquet ajouté,
suppression d’ancien fichier ou migration de données. Avant intégration, revenir à
3E.1 restitue les préparations antérieures ; après une éventuelle fusion autorisée,
un commit inverse suffit. Les utilisateurs et leurs sauvegardes ne sont pas affectés.
La refonte UI reste en attente de la fin de la mission d’architecture.
