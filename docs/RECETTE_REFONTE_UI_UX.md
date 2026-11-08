# Tester la refonte UI/UX, sans commandes

Cette recette concerne la branche `correctifs/retours-recette-uiux`, qui réunit les lots progressifs.
Elle ne nécessite aucune fusion dans main. Prévoir environ 15 à 20 minutes ; utiliser des
personnages fictifs et noter les étapes qui semblent difficiles, même si elles fonctionnent.

## Ouvrir la bonne application

1. Depuis ton application habituelle, exporter une sauvegarde complète de ta partie et la garder à part.
2. Ouvrir [le fichier de la branche de recette](https://github.com/OtaaK/avatar-legendes-compagnon/blob/correctifs/retours-recette-uiux/app/simulateur.html).
3. Sur GitHub, cliquer **Download raw file / Télécharger le fichier brut** en haut à droite.
   La page de code GitHub n’est pas l’application. Il suffit de télécharger ce seul fichier HTML.
4. Enregistrer `simulateur.html` dans un dossier de test, puis l’ouvrir avec Chrome par double-clic.
5. Vérifier le repère **V2.33 · refonte UI/UX en validation · hors ligne**.

Un téléchargement ne met pas à jour une ancienne copie locale : retélécharger pour obtenir
les corrections suivantes. Si de vraies données apparaissent, les exporter avant tout essai
et utiliser un autre profil de navigateur pour les tests. Un nouveau dossier ne garantit pas
à lui seul un stockage isolé : les navigateurs gèrent différemment les fichiers locaux.
Ne pas importer un fichier d’essai par-dessus sa partie habituelle.

## 1. Navigation et lisibilité

- Parcourir Accueil, Personnages, Lieux, Combats, Techniques, Gestion.
- Rechercher Armure de terre dans Techniques et ouvrir sa fiche.
- Réduire la largeur de la fenêtre, puis revenir en grand écran.
- Essayer Tab puis Entrée pour activer un bouton : le focus doit rester visible.

Attendu : aucun écran vide ou débordement horizontal gênant. Sur une fenêtre étroite,
les six rubriques restent accessibles ; sur grand écran, le menu est à gauche.

## 2. Fiches et ressources

- Créer un PJ avec l’assistant, puis un PNJ de test avec le bouton `+` de sa galerie.
- Vérifier que chacun apparaît dans sa bonne catégorie et ouvrir les deux fiches.
- Le PJ doit avoir Aperçu, Livret, Techniques, Histoire et relations ; le PNJ seulement
  Aperçu, Techniques, Lieux.
- Sur une fiche, ajouter une fatigue depuis le panneau de ressources, puis utiliser
  **Annuler le dernier ajustement**. Recharger et retrouver les valeurs enregistrées.
- Cliquer Modifier, changer une information, puis Annuler les modifications.
- Sur fenêtre étroite, utiliser **Masquer les ressources**, changer d’onglet, puis **Afficher
  les ressources** : les valeurs doivent rester identiques. Sur grand écran elles restent affichées.

Attendu : ressources immédiatement cohérentes ; aucun brouillon enregistré à l’insu du joueur.
Enregistrer la fiche confirme le succès. Une erreur de sauvegarde doit rester visible.

## 3. Capacités PNJ — sur une fiche fictive uniquement

- Choisir une importance dans Modifier et accepter de préparer ses ressources.
- Pour un PNJ déjà classé mais resté à ses anciennes limites, le panneau s’ouvre ; utiliser
  Proposer les valeurs de l’importance. Compléter le principe et les noms d’états demandés
  (huit pour Légendaire ; trois noms supplémentaires sont à fournir si cinq sont déjà présents).
- Enregistrer et lire la confirmation d’activation des données étendues.
- Vérifier la capacité proposée : 3, 5, 10 ou 15 cases selon l’importance.

Attendu : changer seulement l’importance ne change pas les ressources. Une incompatibilité
avec les valeurs déjà marquées est signalée ; aucune valeur n’est effacée en silence.
Pour un PNJ sans profil de combattant, aucun ajout au combat ne doit être possible.
Une copie de combat déjà ajoutée reste indépendante : pour reprendre le nouveau profil,
la retirer puis la rajouter en préparation, après sauvegarde et sans effet dépendant.
Le retrait ne reporte pas automatiquement ses ressources sur la fiche.

## 4. Lieux et relations indépendantes

- Créer une région, une ville dedans, puis un temple dans la ville.
- Sur un PNJ, choisir séparément un domicile, un lieu associé et une position actuelle.
- Depuis son onglet Lieux, changer seulement la position : domicile et associations restent identiques.
- Ouvrir la région et comparer Ici uniquement / Inclure les sous-lieux.
- Renommer un lieu puis ouvrir le PNJ : son lien reste fonctionnel.
- Demander une suppression pour lire les dépendances, puis annuler. Ne confirmer que sur
  des données fictives ; aucun PNJ ni sous-lieu ne doit disparaître en cascade.

Les anciens lieux saisis en texte restent conservés. Leur rattachement à l’arborescence est
volontaire. Les groupes Présents, Associés et Domiciliés représentent des relations distinctes.

## 5. Livrets — suivi manuel

- Dans le PJ, ouvrir Livret puis Modifier le suivi du Livret.
- Enregistrer trois cases de progression et une note ; recharger pour les retrouver.
- Passer à quatre cases puis écrire une note d’évolution.
- Vérifier que les quatre cases restent cochées et que les caractéristiques/ressources n’ont
  pas changé automatiquement.
- Changer seulement de Livret, enregistrer, puis revenir au premier : son suivi est conservé.

Ce socle ne programme pas les dix Livrets. Les textes de manœuvres, objectifs et récompenses
du Palmarès, choix d’évolution et effets du moment d’équilibre ne sont pas automatisés.
Ce fonctionnement différé est expliqué dans l’interface, pas remplacé par de faux boutons.

## 6. Combat et retour arrière

Sur un combat fictif vide, créer deux PNJ via + PNJ dans Combats → Combattants.
Choisir Défendre et prendre à revers pour le premier et Avancer et attaquer pour le second,
puis Révéler les approches. Dans Actions, sélectionner le premier et Armure de terre,
confirmer le matériau, préparer puis valider les effets dans Validation MJ.
Vérifier l’effet temporaire et utiliser l’annulation du combat.

Avant révélation et sans effet dépendant, essayer **Retirer du combat** sur un combattant
de test, puis annuler avec l’historique. Sa fiche de Personnages doit rester présente.
Le bouton explique son indisponibilité si une action ou mécanique est encore liée.

Ajouter également une fiche depuis Personnages pour vérifier son lien. La copie de combat
et la fiche permanente restent indépendantes ; modifier une ressource du combat ne réécrit
pas automatiquement la fiche. Aucune règle nouvelle n’est introduite par cette refonte.

## 7. Sauvegarde et reprise

- Dans Gestion, exporter une sauvegarde complète récente et la conserver.
- Exporter aussi **l’état avant les données étendues**, si le bouton est disponible.
- Restaurer le fichier récent seulement dans l’environnement de test, puis recharger.
- Contrôler PJ/PNJ, profils, positions de lieux, progression et combat.
- Couper le Wi-Fi après ouverture de la page et vérifier navigation et export.

Les deux exports ont des fonctions différentes : le récent contient la partie actuelle ;
l’antérieur contient le point précédant la première activation des profils PNJ, Lieux ou
Livrets. Il ne contient pas les changements réalisés ensuite. Il n’existe pas de fusion
automatique entre ces générations. Garder les deux fichiers, sans remplacer la sauvegarde habituelle.

## Retour utile au développeur

Indiquer l’étape, le navigateur, le résultat attendu et ce qui s’est produit. Préciser aussi
si une action est difficile à trouver ou nécessite trop de défilement. Éviter de joindre de
vraies sauvegardes personnelles si une fiche fictive permet de reproduire le problème.
La validation de cette recette ne vaut pas autorisation implicite de fusion dans main.
