# UI/UX — lot 4 : Lieux et liens des PNJ

Livraison du 8 novembre 2026 sur `refonte/lieux`, depuis `7cb514b`.
Cette branche dépend du lot 3B (PR nº 6), puis des PR nº 5, nº 4 et nº 3.
Aucune de ces branches n’est fusionnée automatiquement. L’application reste V2.33,
un fichier HTML autonome sans installation pour son utilisateur.

## Ce qui est livré

L’espace Lieux remplace son écran d’attente par une arborescence navigable :
création à la racine ou sous un lieu, fil d’Ariane, cartes compactes, vue complète,
fiche, nom, description facultative, illustration locale et choix du parent.
Aucun type ni nombre de niveaux n’est imposé. Renommer et déplacer un lieu conserve
son identifiant et les relations enregistrées. Le parent ne peut être le lieu lui-même
ni un de ses descendants. Aucun système de secrets, événements ou scénarios n’est ajouté.

La fiche PNJ comporte trois liens indépendants dans son onglet Lieux :

| Relation | Édition | Effet |
|---|---|---|
| Domicile | Modifier la fiche | Un lieu principal, sans déplacement |
| Lieux associés | Modifier la fiche, plusieurs cases | Relations multiples, sans déplacement |
| Position actuelle | Modifier ou appliquer la position en consultation | Un seul lieu, sans changement du domicile ou des associations |

Les liens ouvrent la fiche du lieu. Les personnes affichées dans un lieu ouvrent la fiche
PNJ correspondante, avec le même identifiant que dans Personnages. Il n’existe pas de seconde
copie de PNJ dédiée aux lieux. Les positions ne modifient pas les combattants ni leurs ressources.

Chaque fiche de lieu présente séparément Présents actuellement, Associés au lieu et Domiciliés.
Un domicile ne crée pas une association. Le filtre « Ici uniquement » / « Inclure les sous-lieux »
applique le même périmètre aux trois groupes ; il couvre tous les descendants. Une personne
n’est affichée qu’une fois dans chaque groupe, même si elle est liée à plusieurs descendants.
Elle peut figurer dans plusieurs groupes parce qu’ils représentent des relations distinctes.
Les compteurs des cartes concernent le lieu directement ; le filtre récursif s’applique aux
groupes de la fiche consultée.

## Anciens textes et migration volontaire

Les textes `location` des PNJ sont conservés, sans rapprochement automatique sur le nom.
Tant que la position n’est pas explicitement choisie dans l’arborescence, ce texte reste
la position affichée et filtrée. Ajouter seulement un domicile ou une association ne change
pas cette position. Une position explicitement vide reste distincte d’un texte historique.

« Relier ce texte à un lieu » demande confirmation : il utilise l’unique lieu du même nom
ou crée un lieu à la racine, puis change uniquement la position. Si plusieurs lieux ont
ce nom, il demande d’utiliser le sélecteur ; il ne devine pas lequel choisir.
Le domicile, les associations et le texte d’origine restent conservés.
Le texte historique reste consultable et modifiable, même après rattachement.
Après choix d’une position structurée, changer ce texte ne déplace pas le PNJ lié.

La galerie Personnages affiche et recherche le nom actuel du lieu référencé. Un renommage
ne casse donc pas la relation. Les filtres historiques de lieu restent des filtres par nom :
deux lieux homonymes peuvent y être regroupés ; leurs fiches Lieux gardent des identifiants
et des groupes séparés. Les sélecteurs structurés distinguent les homonymes par leur chemin
et leur identifiant stable. L’indication textuelle du lieu de session est conservée comme repère,
sans automatisation de déplacement et sans conversion implicite en référence.

## Sauvegardes et erreurs

Les lieux font partie de la bibliothèque commune : `places`, `placeSeq` et `placeLinks`
optionnels sur les PNJ. Les champs ne sont pas ajoutés à une ancienne bibliothèque simplement
par navigation. Un compteur persistant évite de réutiliser l’identifiant d’un lieu supprimé. Les identifiants
visés par des références absentes sont aussi réservés : une création ne les rattache pas
involontairement à un nouveau lieu.
La position `currentId` absente signifie que la position textuelle n’est pas encore remplacée ;
`null` signifie une position explicitement vide. Les imports conservent cette distinction.

La première activation des données étendues utilise le canal v021 déjà introduit au lot 3B,
avec confirmation et sauvegarde journalisée des deux modèles. Le point historique v020 reste
intact. Si les profils PNJ ont déjà activé ce canal, les Lieux s’y ajoutent sans créer un
second point de retour. Gestion explique que le point antérieur précède la première activation
(profils PNJ ou Lieux). Le bouton historique « Exporter l’état avant les profils PNJ » exporte
ce point ; son libellé est conservé pour la continuité des parcours existants.

Bibliothèque et sauvegarde complète utilisent la version 2 dès que nécessaire. Les imports
anciens restent lisibles. L’ancienne version stable ne peut pas exploiter ces nouveaux exports.
Pour revenir en arrière, conserver l’export complet récent et l’export du point antérieur.
Le retour à l’ancien HTML sur la même origine retrouve le point v020, sans y reporter les
changements récents. Aucun rapprochement automatique des deux générations.
Le lot 3B précédent ne propose pas l’interface des Lieux ; utiliser cette branche pour les éditer.

Toute mutation applicative passe par la transaction de bibliothèque. Une erreur d’enregistrement
restaure les modèles et conserve le brouillon. Les erreurs persistantes et données récentes
illisibles restent protégées par les blocages du lot 3B. Le stockage local a une capacité limitée ;
les illustrations sont raster embarquées (PNG/JPEG/WebP, 256 Ko maximum par fichier), ce qui
consomme davantage de place. Aucun lien d’image distant ni SVG personnalisé n’est rendu.

Les imports refusent les cycles, doublons et structures mal formées. Les références manquantes
mais bien formées sont conservées et signalées avec le lieu ou PNJ concerné. Les lieux dont
le parent manque restent accessibles à la racine ; les liens PNJ manquants restent visibles.
La réparation est volontaire, par modification du parent ou des liens. L’import ne transforme
pas une référence absente en une suppression silencieuse.

## Brouillons et suppression

Les lieux ont un formulaire local avec Enregistrer et Annuler. Quitter un brouillon modifié
ou recharger demande confirmation. La lecture tardive d’une image ne peut pas modifier un
nouveau formulaire après annulation. Les relations structurelles des PNJ utilisent leur
brouillon de fiche existant ; la position rapide est enregistrée explicitement.

Supprimer un lieu présente les nombres de sous-lieux et de PNJ concernés, puis la stratégie :
rattacher les sous-lieux au parent (ou à la racine), et retirer les seuls liens visant ce lieu.
Aucun PNJ ni sous-lieu n’est supprimé en cascade. Les autres relations et les textes historiques
restent conservés. Annuler permet de déplacer les enfants ou réaffecter les PNJ manuellement
avant de redemander la suppression. Pour retrouver le lieu supprimé avec ses anciens liens,
restaurer un export complet préalable ; il n’existe pas d’annulation dédiée à la suppression.

## Vérifications et limites

Référence : 236/236 scripts réussis, exécutés sur une copie isolée du commit `7cb514b`.
La première tentative de référence lancée dans le répertoire de travail a été interrompue
car des modifications en cours pouvaient la contaminer ; elle n’est pas utilisée comme bilan.

| Vérification locale | Résultat |
|---|---|
| Référence isolée `7cb514b` | 236/236 scripts |
| Campagne complète du lot | 237/238 scripts : 196 JS et 41 navigateur réussis |
| Seul échec de cette campagne | Attente du texte provisoire « sera intégrée », devenue obsolète |
| Reprise du test de navigation actualisé | Réussie sur sept formats ; autres assertions conservées |
| Reprise du parcours Lieux après précision des homonymes | Réussie sur quatre formats |
| Échecs non résolus après ces reprises | Aucun |

Les 238 scripts ont donc chacun un résultat réussi, par campagne complète et reprises
ciblées. Ce bilan ne prétend pas être une nouvelle exécution complète à 238/238 en une
seule campagne locale après les derniers libellés. GitHub Actions relance toute la suite
sur le commit final de la PR. Rapport de campagne local : `/workspace/work/lieux-final.json`.

Les nouveaux contrôles comprennent :

- Un script JavaScript, 30 scénarios : création, renommage, déplacement, liens indépendants, cycles,
  doublons, orphelins conservés/réparés, suppression explicite, identifiants non réutilisés,
  profondeur 12 000 sans récursion de pile, aller-retour et métadonnées conservées.
- Un script Chromium sur 1280×900, 390×844, 320×640 et 844×390 : activation refusée/confirmée,
  quota injecté, rollback, brouillons, noms piégés, illustrations et lecture différée,
  formulaire PNJ, position rapide, recherche récursive, suppression annulée/confirmée,
  exports/restaurations réels, rechargement, cycle importé refusé et orphelins signalés.
- Les suites précédentes sont conservées. Le test de navigation remplace l’attente du message
  provisoire « sera intégrée » par la présence des commandes Lieux ; ses contrôles de clavier,
  navigation, données et sauvegardes restent conservés.

Un ancien parcours de fiches a détecté une régression intermédiaire : la position historique
était masquée dans l’onglet Lieux. La correction distingue position non migrée et position
explicitement vide, et teste aussi l’ajout d’associations sans déplacement implicite.
Un contrôle ciblé a aussi détecté puis corrigé la réutilisation d’un identifiant orphelin
à la création. Deux scénarios protègent les liens PNJ et les parents absents.
Le contrôle pur de fiche a également signalé l’insertion d’un gestionnaire navigateur dans
son segment de helpers ; le bloc UI a été déplacé, sans changer le test historique.

Le moteur et les règles avant Roster, le catalogue et les données Livrets restent identiques
à la base. Aucune règle du jeu n’est ajoutée : ce lot applique l’organisation narrative du
cahier des charges. Il n’exige pas de nouvelle interprétation du PDF.
Les captures desktop/mobile sont locales et hors Git. Les parcours utilisent des données fictives.
Le contrôle hors réseau reste limité : `file://` est interdit dans le navigateur cloud ;
le chargement HTTP local puis coupure réseau ne certifie pas le double-clic sur le Mac.
La profondeur testée concerne le modèle ; elle ne prouve pas qu’afficher des dizaines de
milliers de cartes simultanément soit confortable. La vue complète est déroulante, sans
pagination ni arbre virtuel dans cette livraison.

## Recette courte sans commandes

1. Ouvrir le HTML de cette branche dans une copie de test et exporter une sauvegarde complète.
2. Dans Lieux, créer une région, une ville dedans, puis un bâtiment dans cette ville.
   Parcourir le fil d’Ariane et renommer la ville : ses sous-lieux doivent rester liés.
3. Dans un PNJ → Modifier → Lieux, choisir un domicile, un lieu associé et une position différente.
   Enregistrer, puis changer seulement la position avec le sélecteur rapide.
4. Dans la région, comparer « Ici uniquement » et « Inclure les sous-lieux ».
   Ouvrir la fiche PNJ depuis les groupes et revenir à son lieu.
5. Essayer de supprimer la ville et lire les conséquences ; annuler d’abord.
   Ne confirmer ensuite que sur des données de test, et vérifier la conservation des sous-lieux et PNJ.
6. Exporter le tout, recharger et restaurer dans une copie de test. Garder l’export récent
   et le point antérieur séparément.

## Fichiers et suite

Un fichier applicatif modifié, deux scripts de test ajoutés et une attente historique de navigation actualisée ; README, ROADMAP, architecture,
tests, décisions, plan et présent rapport actualisés. Aucun fichier supprimé, dépendance ajoutée,
PDF versionné ou changement dans la matrice des techniques.

Prochaine étape : structure des Livrets et progression, en réemployant les données réelles.
Les mécanismes spécifiques des dix Livrets restent hors périmètre. Le lot 6 harmonisera la
recette transversale. Aucune fusion dans `main` sans accord explicite du propriétaire.
