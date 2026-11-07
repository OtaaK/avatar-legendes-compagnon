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

Les 191 scripts sont lancés séparément. Le runner utilise la bibliothèque standard de
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

La suite compte 37 scripts : 34 conservés, `test_offline.py` pour le fonctionnement
hors réseau, `test_retours_recette_v233.py` pour les corrections de fiches et de combat,
et `test_imports_fiabilite.py` pour les erreurs et la restauration des sauvegardes.
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
