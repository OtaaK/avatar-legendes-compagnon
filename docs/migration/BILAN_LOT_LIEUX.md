# Lot Lieux — bilan pour recette

Branche `convergence/lot3-lieux`, issue de la Bibliothèque corrigée `b037e8d` (PR 14), elle-même dépendante du Lot 2. Référence visuelle v0 `8b8924d`, moteur figé `a9079fa`. Aucun changement du moteur, ancien HTML, règle, catalogue, format de campagne ou copie de combat. Aucune fusion ni déploiement.

## Fonctionnement intégré

La page reprend les classes et la composition v0 : arbre à gauche, illustration et détail à droite, fil d’Ariane, cartes de sous-lieux, contrôle des descendants et cartes PNJ. Les données proviennent exclusivement de la campagne Codex. État vide à la première ouverture, aucun exemple enregistré.

Création racine/sous-lieu, nom, description, parent et illustration locale passent par `createPlaceCommands` et `SessionStore.execute`. `PlaceRules` reste la seule implémentation des cycles, liens, descendants et suppressions. Le brouillon est validé puis enregistré en une transaction ; en cas d’erreur, aucune publication partielle ni ID consommé. Révision périmée et changement dans un autre onglet sont refusés.

L’arbre utilise un parcours itératif, testé à 2 000 niveaux, sans plafond de profondeur métier ni récursion React. Les descendants et le chemin réutilisent PlaceRules. Les lieux dont le parent est absent restent visibles comme entrées ; les liens orphelins sont signalés, pas réparés ou supprimés silencieusement. Le lieu sélectionné et l’option des descendants se trouvent dans l’URL, sans écriture de consultation.

Trois groupes indépendants montrent les PNJ présents, domiciliés et associés. Les descendants sont inclus sur demande ; pas de doublon au sein d’un groupe. Ouvrir une fiche et revenir conserve le contexte du lieu, y compris le filtre. L’onglet Lieux du PNJ reçoit les champs v0 nécessaires, sans refonte générale des fiches : position actuelle, domicile, associations. Aucun automatismes entre ces valeurs, aucun changement de ressources ou de combat. Une ancienne position textuelle et les références absentes sont conservées tant que l’utilisateur ne les modifie pas explicitement. Renommer ou déplacer un lieu ne réécrit aucune fiche.

## Suppression et illustrations

Le dialogue indique les sous-lieux et personnages concernés. Sans dépendance : confirmation de suppression simple. Avec dépendances : case d’accord explicite et bouton de confirmation, puis stratégie **`promote-unlink`** existante. Les enfants deviennent enfants du parent du lieu supprimé ; seuls les liens vers ce lieu sont retirés. Aucun personnage ni sous-lieu n’est supprimé. Annulation et refus ne changent rien ; une révision changée invalide la commande.

Illustrations PNG/JPEG/WebP locales, 256 Ko maximum, signatures et décodage contrôlés. Pas de SVG ni URL distante nouvellement introduite. Une ancienne valeur non affichable reste conservée sans accès réseau, sauf remplacement/retrait explicitement demandé. Les champs inconnus des lieux, fiches, liens et enveloppes de sauvegarde sont conservés.

## Différences visuelles intentionnelles avec v0

- Troisième groupe **Domiciliés ici**, nécessaire pour respecter le modèle Codex ; aucune confusion avec la position.
- Actions de suppression protégée, contrôles d’erreur et références absentes, absents de la maquette fictive.
- Taille de texte secondaire, boutons tactiles et focus renforcés dans les composants concernés ; pas de nouvelle palette ni identité.
- Sur tablette, arbre et détail s’empilent pour conserver l’espace utile. Sur téléphone, le panneau d’arbre reste disponible et défilable.
- Indentation visuelle de l’arbre limitée à six crans pour éviter le débordement ; **aucune limite du nombre de niveaux** : nom, niveau accessible et chemin complet restent disponibles. Navigation itérative, branches repliables.
- Pictogrammes v0 et paysage CSS conservés ; une icône déjà présente dans les données est affichée, sinon pictogramme v0 par défaut. Aucun champ de démonstration fictif ajouté au modèle.

## Vérifications

Les résultats finaux et les liens de téléchargement/CI sont dans la PR. Rapports locaux : `work/places-contracts.log`, `work/places-browser/results.json`, `work/places-historical.json` et rapports des Lots 1/2/Bibliothèque.

Dix nouveaux tests de données couvrent création, hiérarchie, renommage, description, parent/cycle, champs protégés, liens indépendants, positions textuelles, inconnus/orphelins, descendants sans doublons, suppression explicite/annulation, illustrations, quota, révision périmée, conflit, export/import/rechargement. Les tests historiques et tous les tests de convergence sont conservés.

Parcours navigateur aux quatre résolutions : 1440×1024, 1280×800, 768×1024, 390×844. Arbre/fil d’Ariane, groupes PNJ et descendants, aller-retour fiche, création sur plusieurs niveaux, édition et déplacement sans modification des fiches, image acceptée/refusée, suppression protégée et annulation, export/réimport/rechargement, ancien stockage intact, zéro écriture de consultation. Contrôles complémentaires de quota avec brouillon/réessai, deux onglets et fonctionnement hors ligne.

## Limites et suite

La recette Mac reste nécessaire. Le cloud bloque `file://` : démarrage embarqué hors réseau et ouverture native Linux CI sont distingués. Le stockage transactionnel garde ses protections : Web Locks lorsqu’ils sont disponibles, contrôle optimiste sinon ; deux écritures exactement simultanées sans Web Locks ne constituent pas une garantie de verrouillage global. Aucun mécanisme de fusion automatique.

Aucune intégration des Livrets, techniques attribuées ou combat ; leurs données sont seulement préservées. Le chantier ergonomique PJ/PNJ reste dans la feuille de route, seuls les liens nécessaires sont raccordés. Une validation propriétaire est requise avant tout lot suivant.

Guide Mac : [TESTER_LOT_LIEUX.md](TESTER_LOT_LIEUX.md). Retour arrière : rouvrir le prototype Bibliothèque ou ancien HTML avec une copie de sauvegarde ; les exports restent au format Codex, sans nouvelle migration destructive.

Résultats locaux finaux : **243/243 historiques**, **57/57 contrats/parité**, parcours Lots 1/2/Bibliothèque conservés et parcours Lieux réussis aux quatre résolutions. Quota avec brouillon/réessai, refus d’édition inter-onglets et démarrage/rechargement embarqué hors réseau réussis. Aucun test historique supprimé et aucun échec historique à masquer sur cette exécution. La CI vérifiera aussi l’ouverture native Linux du HTML.
