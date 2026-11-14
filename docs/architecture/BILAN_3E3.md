# Bilan 3E.3 — Derniers chargements moteur et frontières finales

14 novembre 2026 — branche `architecture/tests-imports-final`, base
`49ed8a2b0a72aa1fed707d0af7144afba641e11b` (PR 25).
Autorisation : « Continue », sans fusion implicite des PR précédentes.

## Changements

28 scripts supplémentaires chargent le domaine depuis `src/domain/index.cjs` au lieu
d’exécuter un extrait du HTML. Un alias de contexte conserve les expressions historiques
`ctx.window.CombatCore` ; les scénarios n’ont pas à être réécrits. Dix de ces scripts
ne lisent plus du tout le HTML ; les dix-huit autres conservent les contrôles du rendu,
des données embarquées ou des chaînes de code présentes dans la distribution.

Toutes les lignes d’assertion restent identiques. Les corps après l’ancien chargement
sont identiques octet pour octet ; le module d’assertion et le mode strict sont conservés.
Les assertions placées avant le chargement sont également conservées, notamment les
trois vérifications HTML de `test_terre_v197.cjs` exclues volontairement du premier lot.
Quatre extraits textuels du moteur restent lus pour des assertions structurelles :
`test_terre_v148`, `v151`, `v152`, `v153`. Ces chaînes ne sont plus exécutées en VM.

Aucun fichier de `src/`, `app/`, `data/`, du générateur, de la CI ou des anciens tests
navigateur n’est modifié. Le HTML reste de 446 142 octets, SHA-256
`41a5e5fe1a226bb5c621c753411e70ef3145d2dfbee61e9d613a9b267622609e`.
Aucune règle, sauvegarde, interface ou donnée utilisateur ne change.

## Vérifications exécutées

| Contrôle | Avant | Après |
|---|---:|---:|
| Scripts JS | 198/198 | 198/198 |
| Scripts Chromium | 40/40 | 40/40 |
| Total | 238/238 | 238/238 |
| Échecs | 0 | 0 |

Les 28 sorties sont identiques avant/après. La comparaison Git vérifie leurs corps et
affirmations, les 170 autres scripts JS intacts ainsi que les fichiers de l’application.
Dix tests supplémentaires réussissent dans un dossier temporaire sans `app/`, interface
ou anciens helpers. L’outil existant étendu avec `--final` conserve aussi son contrôle
d’origine : les 145 scripts du premier lot ont été réexécutés isolément avec succès.
Aucun test n’est supprimé, déplacé, renommé ou désactivé ; aucun scénario n’est ajouté
pour masquer une perte. Le contrôle de génération reste réussi sans réécrire le HTML.

```bash
node scripts/architecture/verify-final-test-migration.cjs
node scripts/architecture/verify-final-test-migration.cjs --compare-base
node scripts/architecture/audit-test-boundaries.cjs
python scripts/architecture/check-source-only-tests.py --final
```

La comparaison Git nécessite `49ed8a2` dans l’historique local, sans téléchargement.
`MIGRATION_FINALE_3E3.json` contient les empreintes du lot. Ces preuves ponctuelles ne
verrouillent pas les futures modifications légitimes des tests en CI.

## Inventaire final des 198 scripts JS

| Rôle principal | Nombre | Pourquoi le conserver |
|---|---:|---|
| Sources sans lecture du HTML distribué | 159 | Scénarios métier, ports et fixtures |
| Sources avec contrôles HTML | 25 | Scénarios sur sources et assertions de raccord/présence dans la distribution |
| Structure ou données HTML uniquement | 11 | Catalogue embarqué, audits d’assistance, intégrité, exports et raccords d’armes |
| Parité sources/HTML | 2 | Comparaison indépendante et refus explicites du chargeur de référence |
| Générateur HTML | 1 | Déterminisme, divergence, syntaxe et refus avant remplacement |

Chaque fichier figure dans `INVENTAIRE_TESTS_FINAL.csv`. La classification désigne le
rôle principal d’un script, pas le nombre d’assertions. Le relevé textuel a été revu sur
cet état ; il n’est pas une analyse de sécurité générale du JavaScript.
Les 40 scripts Chromium complètent l’ensemble et restent inchangés.

Les six appels VM directs encore présents dans les scripts JS exécutent des sources
ou une constante fixe de préparation : commandes, persistance, validation, factory de
préférences et indicateur de reprise. Le helper de fixtures charge les fichiers source
complets, jamais un morceau du HTML. Les JSON du catalogue embarqué restent des données.

**Exception volontaire :** `tests/support/legacy-application.cjs` lit/exécute encore des
blocs du HTML pour les deux scripts de parité et le scénario commun Node/Chromium.
Ses marqueurs uniques/ordonnés et leurs refus sont testés. Ce chargeur est l’oracle
indépendant de la distribution, pas le chargeur ordinaire des scénarios métier.
Le retirer ferait perdre une vérification utile. Les outils ponctuels comparant les
anciens commits Git gardent eux aussi cette lecture historique explicite.

La migration des chargements ordinaires prévue en 3E est donc préparée ; cela ne
signifie ni absence de lecture HTML dans tous les tests, ni intégration des PR dans main.

## Limites et retour arrière

La politique cloud bloque `file://` : tests hors réseau après chargement local réussis,
mais double-clic sur Mac non exécuté ici. Le défaut préexistant du sous-onglet combat
au rechargement reste inchangé. Aucune conformité exhaustive aux règles n’est revendiquée.

Les preuves des lots précédents restent des instantanés historiques ; l’inventaire final
ci-dessus décrit l’état courant. Les sources restent des scripts classiques ; la façade
Node fs/vm n’est pas un paquet destiné à être importé tel quel dans React.

La PR doit dépendre de PR 25. Les PR 22 à 25 ont été vérifiées ouvertes, en brouillon et
non fusionnées le 14 novembre. Aucun déploiement, nouveau paquet, fichier ancien supprimé
ou migration de données. Revenir à 3E.2 ou annuler le commit après intégration autorisée
restaure les préparations antérieures sans toucher aux utilisateurs.

Suite : [revue de la chaîne et recette](BILAN_MISSION_3.md), avant toute fusion ou reprise UI.
