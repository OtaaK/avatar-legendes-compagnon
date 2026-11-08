# Exécuter et comprendre les tests

## Application seule

Ouvrir `app/simulateur.html` directement. Aucun serveur, Node.js, Python ou téléchargement
n'est nécessaire pour utiliser l'application. Ces outils servent seulement au développement.

## Régressions JavaScript

Installer Node.js (22 recommandé ; validation locale également sous 24) et Python 3.10 ou
plus récent pour la commande commune, puis depuis la racine :

```bash
python scripts/test.py --suite js
```

Les 197 scripts sont lancés séparément. Le runner utilise la bibliothèque standard de
Python, sans Playwright pour cette suite. Pour un test isolé :

```bash
node tests/js/test_terre_v233.cjs
```

## Contrôles navigateur

Dans un environnement de développement, installer la dépendance de test et Chromium :

```bash
python -m venv .venv
# Linux/macOS : source .venv/bin/activate
# Windows PowerShell : .venv\Scripts\Activate.ps1
python -m pip install -r requirements-dev.txt
python -m playwright install chromium
python scripts/test.py --suite browser
```

Sur une machine Linux sans bibliothèques graphiques, l'installation des dépendances système
peut être nécessaire : `python -m playwright install --with-deps chromium` (prévoir les droits
système adéquats). Le workflow GitHub prévoit cette installation sur sa machine temporaire.

Les tests utilisent `CHROMIUM_PATH` s'il est défini, sinon un Chromium présent dans le PATH,
sinon le Chromium installé par Playwright. Aucun téléchargement n'est déclenché par les tests.

La suite compte 43 scripts : 34 conservés, `test_offline.py` pour le fonctionnement
hors réseau, `test_retours_recette_v233.py` pour les corrections de fiches et de combat,
`test_imports_fiabilite.py` pour les erreurs et la restauration des sauvegardes,
`test_uiux_navigation.py` pour le socle de navigation,
`test_galerie_personnages.py` pour les cartes et filtres,
`test_fiches_uiux.py` pour les fiches et brouillons,
`test_ressources_pnj.py` pour les profils et leur stockage,
`test_lieux.py` pour la hiérarchie et les relations PNJ,
et `test_livrets_uiux.py` pour le socle des Livrets et le suivi manuel.
Le premier tente l'ouverture en `file://`, un cycle de combat et un export/réimport fidèle.
Si une politique administrateur interdit `file://`, ce seul cas est annoncé par
`LIMITATION:` : le test charge alors le HTML via HTTP local puis coupe le réseau.
Cette alternative ne certifie pas le double-clic ; le runner conserve cette limite dans
son affichage et son rapport JSON, même si les autres assertions réussissent.
Les 13 formulaires Terre sont couverts en desktop et mobile par `test_terre_v233_browser.py`.

## Tout lancer et conserver un bilan

```bash
python scripts/test.py
python scripts/test.py --jobs 3 --report work/tests.json
```

- Le dossier courant n'influe pas sur les chemins de l'application ; le rapport est écrit
  à l'emplacement demandé, relativement au dossier courant.
- Tous les scripts découverts sont exécutés. Un échec, un délai dépassé ou un outil absent
  produit un code de sortie non nul ; aucun test ancien n'est ignoré automatiquement.
  Les restrictions d'environnement annoncées par `LIMITATION:` sont comptées séparément.
- `--jobs 1` permet une exécution séquentielle. Le défaut est deux processus indépendants.
- `--timeout 120` définit le délai maximal de chaque script.
- Les résultats et caches locaux sont ignorés par Git. Ne pas y placer de données réelles
  à partager par défaut ; les tests actuels utilisent des personnages synthétiques.

Le workflow `.github/workflows/tests.yml` propose les deux suites pour chaque Pull Request,
avec uniquement un droit de lecture du dépôt. Il ne fusionne et ne déploie rien.

## Vérifier cette réorganisation

Le contrôle d’identité ci-dessous s’applique à l’état `67273e0`, avant les correctifs
de recette autorisés. Il échoue légitimement sur le HTML courant, qui intègre ces correctifs
d’interface. Ne pas supprimer ce contrôle pour masquer les différences.

La référence de conservation est `backup/v233-before-maintenance`, commit `d247193`.

```bash
python scripts/verify_reorganisation.py --baseline backup/v233-before-maintenance
python scripts/inventory.py --baseline backup/v233-before-maintenance --output docs/maintenance/INVENTAIRE.csv
```

Le premier contrôle compare réellement le HTML, la matrice et les archives à Git. Il
recalcule également les seules adaptations autorisées dans les 223 tests historiques :
chemins et localisation du navigateur. Il échoue si une assertion a été modifiée.

Ce contrôle est spécifique à la migration depuis cette référence. Une future évolution
fonctionnelle modifiera légitimement le HTML : ne pas le présenter comme une régression
sans comparer au bon point de départ. La suite de tests reste la commande de développement
courante.

## Portée et limites

Les résultats de référence et les écarts avant/après figurent dans le
[rapport de maintenance](maintenance/RAPPORT_REORGANISATION_V233.md).
Certains tests historiques simulent localStorage ; le test Terre V2.33 utilise une vraie
origine HTTP locale, sauvegarde, recharge, annule et recharge à nouveau. Cela ne remplace
pas une campagne sur tous les navigateurs et tous les profils utilisateur.

Les résultats V2.32/V2.33 dans les rapports historiques correspondent à leur date. Ils ne
suffisent pas à certifier une évolution future ni à démontrer la conformité aux règles.

## Fiabilité des imports

`tests/js/test_validite_sauvegardes.cjs` ajoute 30 scénarios de validation des engagements
et pièges, dont la compatibilité des champs optionnels anciens.
`tests/browser/test_imports_fiabilite.py` couvre 11 parcours avec stockage réel :
fichiers invalides, échecs de rendu et de stockage des trois imports, lecture impossible,
annulation et export/restauration avec effets et historique, puis rechargement et annulation.
Les erreurs injectées sont artificielles ; elles ne reproduisent pas toutes les pannes
possibles du navigateur. Aucun test existant n’est supprimé.

## Socle UI/UX — lot 1

`python tests/browser/test_uiux_navigation.py` vérifie sept formats de 320 à 1440 pixels,
les six destinations, la sélection active, le clavier (Alt+1…6, saisie protégée, Entrée,
lien d’évitement), le focus, les cibles tactiles et les débordements. Des modèles et chaînes
localStorage sont comparés avant/après navigation et rechargement ; Gestion effectue un
vrai export/restauration complet. Les captures desktop/mobile sont générées dans `work/`.
Les deux tests de recette/import existants ne changent que leurs sélecteurs de libellé
« Personnages » et « Combats » ; leurs assertions métier sont conservées.

## Galerie et cartes — lot 2

`node tests/js/test_galerie_personnages.cjs` vérifie 32 scénarios de requête, classification,
compatibilité et absence de mutation, dont 500 PNJ sans limite artificielle.
`python tests/browser/test_galerie_personnages.py` couvre cinq formats, cartes natives au
clavier, informations sans ouverture accidentelle, filtres conservés, ordre d’importance,
panne de stockage, données anciennes, identifiants/textes piégés et sauvegarde complète
après rechargement. Le grand format vérifie aussi le rendu et la recherche de 500 PNJ
supplémentaires. Captures dans `work/`, hors Git. Les bornes métier PNJ ne changent pas.

Pour les campagnes navigateur lourdes, éviter de lancer un second parcours Chromium à côté
de la suite ; le lot 2 a observé deux délais dépassés dans cette situation, puis des reprises
isolées réussies avec le même délai de 120 secondes. Utiliser `--jobs 2` pour le bilan final
et consigner les dépassements plutôt que d’augmenter silencieusement le délai.

## Fiches détaillées — lot 3A

`node tests/js/test_fiches_uiux.cjs` : 32 scénarios purs sur les patches ciblés,
la compatibilité des données et les portraits embarqués.
`python tests/browser/test_fiches_uiux.py` : cinq formats, consultation/édition,
protection des brouillons, ajustements/annulation, centre, portraits et erreur de quota,
lecture asynchrone retardée, export/restauration et rechargement. Captures dans `work/`.
Les anciens parcours de recette et de galerie passent par Modifier et les commandes
permanentes ; leurs assertions métier sont conservées. Les limites de ressources du moteur
restent celles de la V2.33 : ces tests ne certifient pas encore les capacités PNJ étendues.


## Ressources PNJ — lot 3B

- `node tests/js/test_ressources_pnj.cjs` : 42 scénarios de capacités, coûts,
  débordements, principe, états personnalisés, protections, Terre, annulation et imports.
- `node tests/js/test_stockage_profils_pnj.cjs` : 19 scénarios de stockage,
  journal, panne partielle, récupération et blocage des écritures sur données illisibles.
- `python tests/browser/test_ressources_pnj.py` : quatre formats (1280×900,
  390×844, 320×640 et 844×390), activation refusée/confirmée, quota, copies de combat,
  ressources, annulation, non-combattant et vrais exports/restaurations/rechargements.

Bilan du lot : référence 233/233 ; résultat final 236/236 scripts (195 JS et 41 navigateur).
Les 42 et 19 scénarios sont internes à leurs scripts, pas 61 scripts supplémentaires.
Deux régressions intermédiaires de changement de cible ont été détectées par les anciens
parcours fatigue/piège : correction du code sans retrait de leurs assertions.
La limite `file://` demeure ; le double-clic sur Chrome macOS reste à vérifier manuellement.
Voir [le rapport et la recette](RAPPORT_UI_UX_LOT3B.md).


## Lieux — lot 4

`node tests/js/test_lieux.cjs` vérifie 30 scénarios purs : identité stable, indépendance
des relations, profondeur 12 000, cycles, orphelins, suppression explicite et conservation des
données anciennes. `python tests/browser/test_lieux.py` couvre quatre formats, activation,
quota et rollback, brouillons, illustrations locales et lecture retardée, relations de PNJ,
filtre récursif, suppression annulée/confirmée, textes piégés, exports et rechargement.
Un fichier complet contenant un cycle est refusé avant mutation. Les captures restent dans
`work/`, hors Git. La référence 236/236 est exécutée depuis une copie isolée du commit parent,
pour éviter qu’une modification en cours ne contamine le bilan avant intervention.

Le bilan du lot 4 distingue la campagne complète (237/238, seule attente obsolète sur
l’écran Lieux) des reprises réussies du test de navigation actualisé et du parcours Lieux.
Les 238 scripts ont chacun passé ; ce résultat consolidé n’est pas présenté comme une
campagne locale unique à 238/238 après le dernier changement de libellé. GitHub Actions
relance la suite complète sur le commit final. Voir le détail dans le rapport du lot.


## Livrets — lot 5

`node tests/js/test_livrets_uiux.cjs` : 30 scénarios, dix références existantes,
progression bornée, suivi par Livret, corrections, champs futurs conservés, imports invalides
et absence d’effet sur les règles et ressources. Un changement simultané de Livret et
progression est refusé sans mutation ; une saisie vide ne devient pas implicitement zéro.
`python tests/browser/test_livrets_uiux.py` : quatre formats, progression exclusivement
dans Livret, cartes et notes sûres, activation refusée/confirmée, quota/rollback, brouillons,
changement aller-retour de Livret, notes d’évolution sans consommation de points, export,
restauration, rechargement, import invalide et Livret personnalisé préservé.
Les captures sont locales dans `work/`. Aucun ancien test supprimé.

Bilan final du lot 5 : référence isolée 238/238, puis suite complète **240/240**
(197 JS et 43 navigateur), avec la limite `file://` conservée explicitement.
