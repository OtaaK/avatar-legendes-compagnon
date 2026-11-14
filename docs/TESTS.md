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

La suite compte 39 scripts : 34 conservés, `test_offline.py` pour le fonctionnement
hors réseau, `test_retours_recette_v233.py` pour les corrections de fiches et de combat,
`test_imports_fiabilite.py` pour les erreurs et la restauration des sauvegardes,
`test_security_import_ids.py` pour les identifiants piégés et le rendu inerte,
et `test_architecture_contracts.py` pour la parité du scénario Node/HTML.
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

## Vérifier la réorganisation historique

Le contrôle d’identité historique est conservé, sans être affaibli. Il vise l’état
`67273e0`, avant les corrections d’interface et de sécurité, et doit être exécuté dans
une copie de cet état, pas sur le HTML courant :

```bash
git worktree add --detach ../avatar-verification-ancienne 67273e0
cd ../avatar-verification-ancienne
python scripts/verify_reorganisation.py --baseline backup/v233-before-maintenance
python scripts/inventory.py --baseline backup/v233-before-maintenance --output work/inventaire-ancien.csv
```

Les références historiques doivent être disponibles dans le clone. L’ancien inventaire
complet reste [consultable sous l’étiquette](https://github.com/OtaaK/avatar-legendes-compagnon/blob/avant-nettoyage-2026-11-13/docs/maintenance/INVENTAIRE.csv).
Ce contrôle compare HTML, matrice, archives et adaptations des 223 tests d’époque ; il
ne doit pas être réinterprété comme un contrôle du comportement de la version courante.

## Vérifier le nettoyage de mission 2

Le [bilan](maintenance/nettoyage/BILAN.md) compare les 192 scripts JS et 38 navigateur
avant/après. Tous restent en place. Les identifiants Git d’origine sont conservés dans
l’index ; seul le commentaire de lancement du test Terre est corrigé, avec comparaison
de son AST hors docstring. Les chemins archivés doivent correspondre exactement aux
278 lignes approuvées, et le diff HTML uniquement aux deux helpers retirés.

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

## Mission 3A — contrats et frontières de test

`tests/support/legacy-application.cjs` centralise les repères et charge les corps réels
sans démarrage de l’interface. Aucun moteur recopié. Le DOM, le réseau et le stockage
sont interdits au chargement métier ; la persistance n’est chargée qu’avec un stockage
de test explicitement fourni et des notifications limitées.

- `node scripts/architecture/check-contracts.cjs` compare les entrées publiques, champs
  par défaut, identifiants et clés à `docs/architecture/REFERENCE.json`.
- `tests/js/test_architecture_contracts.cjs` ajoute 20 scénarios de contrats, refus,
  isolation, copies, quotas et reprise. Il garde aussi l’identité HTML pour cette étape.
- Le job navigateur de CI prépare désormais Node 22 comme le job JS, sans nouveau
paquet. Le scénario partagé est exécuté sous Node et dans le véritable HTML Chromium, en
  1280×900 et 390×844. États et résultats doivent être identiques ; ni la session réelle
  ni le stockage du navigateur ne doivent changer, y compris après rechargement.

Ce pont de test reste transitoire : il utilise encore des repères textuels. Les 230
scripts historiques ne sont pas réécrits ni remplacés par ce contrôle. Les futures
extractions auront un contrôle de génération et une parité propres à leur étape.

## Étape 3B — génération et import depuis les sources

Exécuter `node scripts/build.cjs --check` avant les suites. La CI fait ce contrôle sans
écrire l’HTML. `test_generated_html.cjs` couvre le déterminisme, les sorties absentes ou
périmées, les erreurs sans écrasement, les données inertes, les chemins/gabarits et l’UTF-8.
`test_source_domain.cjs` compare les mêmes contrats, états, notifications et reprises entre
le domaine importé et les blocs du HTML ; il importe aussi sans gabarit, style ou UI.

Le test navigateur de 3A garde toutes ses assertions et ajoute une égalité avec le domaine
source. Le même scénario est donc comparé entre trois exécutions : source Node, blocs HTML
Node et vrai document Chromium, en desktop/mobile. La préparation VM est partagée comme
outil, les corps JS ne sont ni recopiés ni remplacés par des simulations métier.
Les 193 anciens scripts JS sont inchangés ; une assertion navigateur est ajoutée, aucune
supprimée. Aucun test n’est déplacé ni ignoré. Voir [le bilan](architecture/BILAN_3B.md).


## Étape 3C — stockage injectable

`test_storage_adapter.cjs` ajoute 17 scénarios sans DOM : création sans accès,
ordre des écritures, refus à chaque opération de l’import complet, quota persistant,
reprise, valeurs absentes, journal invalide, anciennes versions, validation et sérialisation.
Total : 196 scripts JS et 39 scripts navigateur. Les 58 comparaisons ponctuelles
`node scripts/architecture/compare-persistence.cjs` confrontent directement l’ancien
code au nouveau (valeurs, opérations, erreurs, notifications). Cette commande nécessite
le commit `a8cbd38` dans l’historique local et ne fait pas partie de la CI à clone superficiel.

La référence `REFERENCE.json` de 3A reste inchangée : les contrats restent comparés,
mais l’identité de ses octets HTML est désormais explicitement fausse. Le générateur
compare son résultat à `BUILD_REFERENCE.json`, référence courante distincte et revue.
Deux anciens tests reçoivent seulement le service extrait en préambule de leur fixture ;
leurs assertions restent intégralement conservées. Les deux contrôles d’empreinte/parité
sont actualisés explicitement, sans prétendre que le HTML est encore celui de 3A.


## Étape 3D — commandes, événements et démarrage

197 scripts JS et 40 scripts navigateur. `test_command_ports.cjs` couvre 16 scénarios
sans DOM (retours, restauration, commandes imbriquées, absence d’écriture au chargement,
préférences refusées). Les quatre tests historiques de transactions chargent le service
extrait en préparation ; toutes leurs assertions sont conservées.

`test_architecture_commands.py` teste 390×844, 768×1024, 1280×900 et 1920×1080 :
navigation, clavier, annulation d’invite et de fenêtre, copie indépendante, historique,
rendu sans écriture métier, rechargement et interactions sans réseau. Il teste aussi
le refus du stockage des préférences. Le retour à l’onglet Combattants après rechargement
est un défaut préexistant reproduit sur la base, documenté plutôt que modifié ici.

Contrôles ponctuels exécutés, nécessitant le commit `ae4c86a` dans l’historique :

```bash
node scripts/architecture/compare-commands.cjs
python scripts/architecture/compare-visual.py
```

Le premier compare 36 scénarios au code précédent (états, retours, erreurs, écritures,
rendus). Le second compare 16 captures (quatre rubriques × quatre tailles), avec des
données synthétiques identiques. Tolérance des arrondis Chromium : 1/255 par composante
sur au plus 0,1 % des pixels (plancher 100). Les captures restent en mémoire, pas publiées.
Ces outils ne font pas partie de la suite CI à clone superficiel ; les nouveaux tests
JS et navigateur ordinaires y sont découverts automatiquement.
