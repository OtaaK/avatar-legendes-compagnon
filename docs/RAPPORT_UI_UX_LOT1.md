# Refonte UI/UX — premier lot : socle visuel et navigation

## Résultat et périmètre

Cette première livraison met en place le thème bleu nuit/pétrole, des accents dorés de
sélection, une typographie système lisible et des icônes SVG originales embarquées.
La navigation comporte Accueil, Personnages, Lieux, Combats, Techniques et Gestion.
Elle devient latérale sur ordinateur et compacte sur téléphone ; la section active est
indiquée par son texte, son état accessible et son décor, sans dépendre de la couleur seule.
Le clavier dispose d’un lien « Aller au contenu », d’un focus visible et de Alt+1…6,
suivant l’ordre du menu. Les raccourcis ne détournent pas la saisie des formulaires.

Gestion ouvre les fonctions existantes de sauvegarde complète, fiches et combat ; les
accès historiques restent disponibles. Lieux est une page d’attente explicite avec un
accès aux PNJ et à leurs lieux textuels. **L’arbre des lieux n’est pas livré dans ce lot.**
Les lignes historiques explicitement masquées par `hidden` ne sont plus réaffichées par
leur style `flex` ; les outils restent accessibles par leurs commandes prévues.
Les cartes et fiches conservent leurs fonctions et structures actuelles ; leur refonte
vient ensuite. Les dix Livrets ne reçoivent aucune nouvelle mécanique.

## Audit réel et sécurité

- Base `42b306f` de `main` : V2.33 réorganisée et PR nº 2 de fiabilité des imports intégrées.
  Le cahier des charges ajouté sur GitHub est récupéré sans écraser de travail local.
- Branche dédiée `refonte/ui-ux-progressive`. Audit/plan dans un commit distinct du lot visuel.
- Moteurs, catalogue, modèles, imports et persistance identiques à la base : le seul bloc
  JavaScript modifié est celui allant de `VIEWS` à `setView`.
- Aucun nouveau champ de sauvegarde, changement de clé, migration ou suppression de fichier.
- Aucun serveur ni compilation requis par l’application, aucune ressource distante ajoutée.
- Le CSS du socle est balisé et reste embarqué après les styles historiques. Cette approche
  évite de mélanger refonte visuelle et réécriture générale ; le nettoyage des anciennes
  déclarations pourra être fait séparément après stabilisation des composants.
- Pour revenir en arrière : rétablir le commit UI via Git ; les données n’ont pas à être
  transformées. Ne pas effacer le stockage du navigateur pour changer de présentation.

## Fichiers touchés

| Fichiers | Changement |
|---|---|
| `app/simulateur.html` | Thème, menu, accueil léger, destinations Lieux/Gestion, focus et raccourcis |
| `tests/browser/test_uiux_navigation.py` | Nouveau parcours de navigation et de conservation des données |
| `tests/browser/test_imports_fiabilite.py`, `test_retours_recette_v233.py` | Libellés du menu mis à jour ; assertions métier conservées |
| `docs/PLAN_REFONTE_UI_UX.md` | État réel, matrice existe/manque/préserver, lots et retour arrière |
| `README.md`, `ROADMAP.md`, `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`, `docs/TESTS.md` | Suivi de la livraison et procédures |
| Ce rapport | Bilan et recette courte |

## Vérification

- Avant intervention : **228/228 scripts réussis**, avec une limite locale `file://` annoncée.
- Après les corrections finales : **229/229 scripts réussis** (191 JavaScript,
  38 navigateur), **0 échec**, une limite locale `file://` explicitement annoncée.
  Commande : `python scripts/test.py --jobs 3 --report /workspace/work/uiux-lot1-final.json`.
- Nouveau parcours : sept résolutions (1440×1000, 1280×800, 1024×768, 768×1024,
  390×844, 844×390, 320×640), six rubriques et absence de débordement horizontal.
- Navigation clavier, focus des titres, lien d’évitement, sélection active et hauteur des
  cibles du menu contrôlés ; saisie dans Techniques protégée des raccourcis.
- Modèles de bibliothèque/combat et chaînes JSON stockées comparés avant/après navigation
  et rechargement ; vrai téléchargement et restauration depuis Gestion, sans perte.
- Parcours historique de recette : quatre parcours desktop/mobile réussis après changement.
- Captures Accueil 1440/390 pixels, PNJ à nom long, Combat et Gestion inspectées ;
  générées hors Git. Défaut préexistant des lignes `hidden` réaffichées par `flex`
  corrigé, avec assertion dédiée dans le nouveau parcours.
- Syntaxe JavaScript, comparaison du code hors navigation et `git diff --check` vérifiés.

## Vérification simple par le propriétaire

1. Depuis la PR, ouvrir le fichier `app/simulateur.html` de cette branche, puis le télécharger
   avec le bouton de téléchargement du fichier brut. Ouvrir ce HTML dans Chrome.
   Utiliser d’abord des personnages de test ; un chemin de fichier différent peut donner
   accès à un stockage local différent selon le navigateur. Exporter la version habituelle
   avant de déplacer/remplacer son fichier.
2. Parcourir les six rubriques. Vérifier le menu latéral sur Mac puis réduire la fenêtre :
   le menu compact doit rester lisible et les actions accessibles.
3. Dans Personnages, ouvrir une fiche et vérifier que les commandes habituelles sont toujours
   accessibles. Ce lot ne propose pas encore les nouvelles cartes/fiches du cahier des charges.
4. Dans Gestion, exporter une sauvegarde complète, puis la restaurer. Vérifier noms,
   ressources et combat, puis recharger la page. Les confirmations existantes restent actives.
5. Vérifier que Lieux annonce bien la suite de la refonte ; aucun lieu n’est créé ou déplacé.

## Limites et suite

Le navigateur administré local interdit `file://` : le test hors connexion passe par HTTP
local puis coupe le réseau. L’ouverture par double-clic sur Chrome/macOS reste donc une
recette du propriétaire. Les captures et tests Chromium ne certifient pas Safari, tous
les lecteurs d’écran ni toutes les combinaisons de données réelles.

Les lots suivants sont **cartes Personnages**, puis **fiches détaillées distinctes**, puis
**Lieux**, puis **structure des Livrets**. Les capacités PNJ et adaptations de modèle seront
vérifiées avec le PDF avant toute modification de règle ; aucune valeur ancienne ne sera
remplacée silencieusement. Le [plan](PLAN_REFONTE_UI_UX.md) précise ces dépendances.

Aucune fusion dans `main` n’est effectuée par cette livraison.
