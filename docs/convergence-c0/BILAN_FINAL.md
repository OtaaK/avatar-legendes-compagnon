# Préparation finale après les lots UI 1–3

**Mission d'analyse terminée pour examen ; C1 non commencée et non autorisée.**
Aucun moteur, adaptateur d'exécution, mécanisme de persistance ou fichier du dépôt UI
n'est modifié. Aucun paquet, migration, déploiement ou nouvelle PR n'est lancé.

## Références et méthode

- UI finale : `39fd4781ebf9ef0e3575b1f14926e63050c7b687`.
- UI C0 précédente : `804381ca2ae7ee9f7e9ce960591faffd534cb2e7`.
- Domaine B : `62c523c1540f01b3f331c4d980d129307f560af0`.
- C0 validée : `24df462731860dd62cdbf4499c1884bdf8af27a1`.
- Branche préparatoire : `convergence/c0-reference-finale`, issue exactement de C0.
- [SOURCES.json](SOURCES.json) : empreintes des fichiers, différentiel, observations et
  provenance. Sources UI inspectées dans une archive isolée, pas dans le dépôt de travail.

Git confirme que 39fd4781 fusionne la PR UI nº 14 et a 804381ca comme premier parent.
Le propriétaire indique les lots 1–3 validés avec réserves et déployés sur
https://al-ui.vercel.app. Les rapports Work complets n'ont pas été joints ; aucun nouvel
essai de production ne remplace leur verdict dans cette mission.

## Les huit livrables

| Livrable demandé | Résultat |
|---|---|
| 1. Matrice différentielle finale | [DIFFERENTIEL_FINAL.md](DIFFERENTIEL_FINAL.md), 11 fichiers modifiés, domaines/validations/persistance/interactions/ports. [MATRICE.md](MATRICE.md) conserve le diagnostic historique avec priorité explicite au nouveau différentiel. |
| 2. Compatibilité des groupes | [GROUPES_PNJ.md](GROUPES_PNJ.md) : profils, six résultats calculés, entraînements, ressources/absence/null/vide, conversions, archives, 13 références et écarts C1/C2/C3/C4/C7. |
| 3. Neuf fiches A01–A09 | [ARBITRAGES.md](ARBITRAGES.md), neuf rubriques chacune, options/risques/recommandation/décision attendue et phase concernée. |
| 4. Distribution du moteur | [DISTRIBUTION_FINALE.md](DISTRIBUTION_FINALE.md), comparaison concrète ; workspace après transfert unique privilégié, archive versionnée en repli. |
| 5. C1 actualisé et limité | [C1_FINAL.md](C1_FINAL.md), étapes minimales, points d'entrée UI, contrats de stockage/éligibilité, SSR, démo préservée, tests et retour arrière. |
| 6. Décisions avant autorisation C1 | A01 (démo intacte, pas de conversion), A08 (source unique/transfert), A09 (groupes non actifs en C1). Modes exclusifs et critères d'acceptation sont explicités, pas appliqués. |
| 7. Tests réellement exécutés | Tableau ci-dessous, sans confondre les contrôles de code avec la conformité officielle. Aucun test de production/mobile prétendu. |
| 8. Commit préparatoire | Branche poussable/autorisée ci-dessus ; SHA final communiqué au propriétaire à la livraison. Aucune nouvelle PR sans son autorisation. |

## Conclusions les plus importantes

**Un groupe n'est pas un individu avec une autre capacité.** Le modèle UI garde les
ressources individuelles à la racine et les collectives dans groupProfile.resources.
Il conserve aussi un profil de groupe inactif après retour à l'individuel. Les limites
recommandées lues à l'écran ne sont pas nécessairement présentes dans les sauvegardes.

**Conservation JSON ne signifie pas prise en charge métier.** Une probe Codex a montré
qu'un PNJ déjà valide conserve groupProfile dans le roundtrip, mais addToCombat utilise
la fatigue racine et ne copie ni npcType ni groupProfile. Le combat collectif ne peut
pas être déclaré fonctionnel sur cette base. C1 doit contrôler le périmètre à la lecture
et avant import, pas seulement le nom/version du format.

**Les groupes tolèrent des archives plus larges que leurs formulaires actifs.** Les
containers absent/null/{} sont préservés par les outils d'édition explicite. Le validateur
complet d'import accepte aussi un effectif chaîne "5", des références de technique
inconnues et certaines ressources dépassant leur capacité. Cela est confirmé par probes
sans stockage ni montage UI. Ces tolérances ne deviennent ni des règles, ni des données
à corriger automatiquement ; elles restent à signaler avant activation métier.

**Les treize noms concordent, pas tous les IDs.** Chacun correspond à une technique
de la famille groupe_pnj du catalogue Codex. Quatre IDs nécessitent plus qu'un ajout de
préfixe. Le catalogue Codex de 111 contient déjà ces 13 références. Leurs effets officiels
n'ont pas été vérifiés ici et ne sont pas complétés par les textes fictifs de démonstration.

**Le canal de partage doit rester simple pour un produit unique.** La nouvelle
recommandation est un package workspace interne dans le dépôt React après transfert
unique et explicite de la responsabilité du moteur. Ancien dépôt/branches conservés en
référence, sans développement d'une deuxième copie du moteur transféré. Repli : archive
versionnée/intègre produite depuis l'unique source Codex. Registre privé possible, mais
non privilégié pour ce consommateur unique. Aucun de ces choix n'est mis en œuvre.

## Périmètre C1 à faire approuver

Préparer et consommer le paquet, initialiser une seule session canonique par espace,
brancher le seul parcours Gestion nécessaire aux imports/exports/restaurations Codex,
avec SSR/hydratation et refus fiables. Les données de démo restent dans leur clé originale,
jamais aspirées comme personnages par défaut. Proposition de modes exclusifs dans la
même application : démonstration historique ou espace métier, sans synchronisation de
copies ni deux autorités d'écriture pour la même campagne.

Aucune conversion réelle v0, individuel/groupe, entraînements, états/statuts, modificateurs,
relations, compteurs, évolutions ou combat n'entre dans ce C1 limité. Les fichiers Codex
avec un contexte de groupe actif non approuvé doivent être diagnostiqués/bloqués sans
supprimer les extensions ou réinitialiser les valeurs. Les archives ne sont pas activées
par leur seule présence. Un import partiel qui supprimerait les groupes du fichier n'est
pas proposé comme raccourci.

Les trois décisions préalables et l'autorisation C1 elle-même restent à obtenir. Accepter
la présente préparation n'autorise pas une fusion, un transfert de code ou un déploiement.

## Tests et contrôles réellement exécutés pour cette préparation

| Contrôle | Résultat | Portée exacte |
|---|---|---|
| Tests Node Codex de convergence | **117/117**, zéro échec | Suites B/C0 inchangées, sécurité, extensions, présence, stockage et imports sans DOM. |
| Scripts historiques JS Codex | **198/198**, zéro échec | `python scripts/test.py --suite js --jobs 2` ; pas la suite navigateur historique complète. |
| Corpus de parité ESM | **198/198**, 171 scripts appelants, **8 111 appels** | Aucune modification des corps ou assertions. |
| Extraction/inventaire | **13 modules**, **112 fonctions / 112 handlers**, contrôles réussis | Protections et empreintes B inchangées. |
| TypeScript B/C0 sans bibliothèque DOM | **Réussi** | Aucun type métier nouveau ou contrat d'exécution modifié. |
| Tests UI source finale | **26/26**, zéro échec | Quatre suites : storage, evolutions, npc-edit, npc-groups, en archive isolée 39fd4781. |
| Calculs de groupes observés | Six combinaisons exécutées via le helper existant | Résultats documentés ; pas un deuxième moteur et pas une preuve du PDF. |
| Comparaison catalogue groupe | **13/13 noms**, quatre IDs non déductibles d'un simple préfixe | Métadonnées seulement ; pas de vérification d'effets officiels. |
| Probes de validation/persistance | isNpcGroupProfile et huit cas au validateur d'import complet ; roundtrip et copie combat Codex observés | Résultats consignés dans SOURCES.json ; ce ne sont pas des parcours navigateur. |
| Différence de code autorisé | **Documents seulement** | Sources/tests/runtime, persistance, packages/lockfiles, UI et ancien HTML inchangés. |

Commandes principales :

```sh
node --test tests/convergence/*.test.mjs
python scripts/test.py --suite js --jobs 2
node scripts/convergence/test-parity.mjs
node scripts/convergence/extract-domain.mjs --check
node scripts/convergence/inventory.mjs --check
tsc -p tests/convergence/tsconfig.phase-b.json
```

Le compilateur TypeScript déjà installé dans l'environnement C0 a été utilisé sans
installation/changement de dépendances. Dans une archive isolée de l'UI finale :

```sh
node --experimental-strip-types --test lib/demo-storage.test.mjs lib/evolution-history.test.mjs lib/npc-edit.test.mjs lib/npc-groups.test.mjs
```

Les probes de validateDemoData ont utilisé l'extraction des fonctions de validation du
SHA final, transpilation en mémoire et dépendances réelles du même SHA. Aucune fonction
React n'a été montée ou changée ; aucun stockage n'a été écrit. Les données sont
synthétiques. Les logs/probes d'audit sont dans le cache de travail, les résultats et
empreintes durables dans SOURCES.json ; pas de code UI recopié dans le dépôt Codex.
Avertissement Node sur les fichiers TS sans type de package explicite : visible,
non bloquant, aucune modification UI pour le masquer.

## Contrôles non exécutés et réserves conservées

Pas de nouveau navigateur/mobile réel, Mac/Safari, parcours de production, build Next
consommant le futur package, restauration inter-origines, publication ou déploiement.
Les 45 tests navigateur historiques et les parcours React hérités ne sont pas relancés
pour ce changement uniquement documentaire ; leur succès antérieur B/C0 reste historique,
pas un contrôle nouveau. Aucun nouveau workflow de PR n'est demandé : nouvelle PR non
autorisée. Les PR 27/28 et leurs résultats réussis précédents ne sont pas modifiés.

Conserver les réserves Work : vrai mobile, dix techniques ordinaires fictives face au
catalogue réel, compteurs/effets de Livrets, conformité officielle des groupes et autres
réserves C0 (dont portrait PJ tant que sa levée n'est pas documentée). Un risque de perte
d'extensions lors de reconstruction du groupProfile est identifié par lecture du
formulaire, mais non reproduit en UI ici : ne pas le présenter comme incident de
production démontré. Les tests de patch ne prouvent pas toute la chaîne formulaire.

La possibilité de transférer le moteur, les permissions des futurs développeurs, la
reproductibilité du build workspace, la politique de previews Vercel, les droits de
distribution et le démarrage Next hors ligne restent à qualifier lors d'une phase
explicitement autorisée. Aucun secret, réglage Vercel ou dépendance externe n'est ajouté.

## Réversibilité et arrêt

La branche a pour parent C0 24df462. Revenir à cette référence retrouve les documents
précédents ; historique et code sont conservés. Aucun retour de données à effectuer
puisqu'aucune sauvegarde réelle n'a été migrée ou réécrite. Les branches B/C0 et le dépôt
UI de travail restent intacts. Aucun nouveau moteur de groupe n'a été créé.

Le propriétaire peut examiner le commit de cette branche sans PR. **Arrêt à la fin de
cette préparation et attente de validation ; aucune intégration C1 effective.**

## Fichiers exacts de cette préparation

| Fichier | Statut |
|---|---|
| `AGENTS.md` | Modifié |
| `README.md` | Modifié |
| `ROADMAP.md` | Modifié |
| `docs/ARCHITECTURE.md` | Modifié |
| `docs/DECISIONS.md` | Modifié |
| `docs/convergence-c0/ADAPTATEURS.md` | Modifié |
| `docs/convergence-c0/ARBITRAGES.md` | Modifié |
| `docs/convergence-c0/BILAN.md` | Modifié |
| `docs/convergence-c0/BILAN_FINAL.md` | Ajouté |
| `docs/convergence-c0/C1_FINAL.md` | Ajouté |
| `docs/convergence-c0/DIFFERENTIEL_FINAL.md` | Ajouté |
| `docs/convergence-c0/DISTRIBUTION_FINALE.md` | Ajouté |
| `docs/convergence-c0/GROUPES_PNJ.md` | Ajouté |
| `docs/convergence-c0/MATRICE.md` | Modifié |
| `docs/convergence-c0/PARTAGE_MOTEUR.md` | Modifié |
| `docs/convergence-c0/PLAN_C1_C7.md` | Modifié |
| `docs/convergence-c0/SOURCES.json` | Modifié |
