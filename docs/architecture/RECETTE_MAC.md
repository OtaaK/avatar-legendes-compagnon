# Recette Mac — Avatar Légendes : Compagnon V2.33

Ce paquet teste le socle HTML après maintenance de l’architecture. L’intégration de
l’interface React/v0 reste un chantier distinct. Durée indicative : 10 à 15 minutes.

## Ouvrir sans commande

1. Décompresse le ZIP.
2. Dans Google Chrome, ouvre une fenêtre privée avec **⌘ ⇧ N**.
3. Glisse **simulateur.html** depuis le dossier décompressé dans cette fenêtre.

La fenêtre privée isole les essais de tes parties habituelles. Garde-la ouverte pendant
la recette : les données privées disparaissent après fermeture de toutes les fenêtres
privées. Les fichiers JSON exportés, eux, restent dans tes téléchargements.
Aucune installation, connexion à un compte ou commande technique n’est nécessaire.

Si tu utilises l’archive complète de GitHub, le HTML est dans **app/** et le JSON
d’essai dans **tests/fixtures/**. Le paquet de recette les rassemble dans le même dossier.

## Charger les deux fiches d’essai

Dans **Personnages**, utilise **Restaurer une sauvegarde complète** et choisis
**recette-architecture.json** dans le paquet. Confirme le remplacement.
Tu dois trouver **Recette – PJ** dans PJ et **Recette – PNJ** dans PNJ.
Ce sont des données fictives de test ; le combat est initialement vide.

## Six contrôles essentiels

1. **Fiche et rechargement.** Ouvre Recette – PJ, puis Ressources. Ajoute une fatigue :
   le récapitulatif doit afficher **1/5**. Enregistre la fiche ; un message doit confirmer
   l’enregistrement. Recharge avec **⌘ R**, puis rouvre la fiche : la fatigue reste à 1.
2. **Copie de combat et annulation.** Depuis cette fiche, clique Ajouter au combat.
   Dans Combat, modifie la fatigue du combattant à 3 et enregistre. La fiche permanente
   doit rester à 1. Clique Annuler dernière validation : le combattant revient à 1.
3. **Nom et lieu du PNJ.** Ouvre Recette – PNJ et change son nom. Enregistre : le lieu
   doit rester **Village de recette**, sur la fiche et sur la carte.
4. **Création.** Reviens aux cartes. Crée un nouveau PNJ ; il apparaît seulement dans
   PNJ. Dans PJ, utilise Nouveau PJ et suis l’assistant (nom, livret, bonus, entraînement,
   vérification). La nouvelle carte apparaît seulement dans PJ.
5. **Export et restauration.** Reviens aux cartes et clique Sauvegarder tout (fiches +
   combat). Garde le JSON téléchargé. Renomme temporairement un PNJ, puis restaure ce
   JSON : le nom d’avant doit revenir, avec les fiches et le combat conservés.
6. **Catalogue et hors ligne.** Dans Techniques, fais une recherche, efface-la puis
   filtre Eau, referme le menu des familles puis ouvre une carte. Sans filtre, le catalogue doit retrouver 111 techniques.
   Coupe le Wi-Fi, navigue entre les rubriques et recharge le fichier local : les données
   doivent rester accessibles. Rétablis ensuite le Wi-Fi.

## Point déjà connu

Après rechargement, le sous-onglet Combat revient à **Combattants**. Ce défaut existait
avant la maintenance ; il n’est pas une régression de ce paquet. La rubrique principale
et les données restent les points à contrôler.

## Me transmettre le résultat

Tu peux répondre simplement :

- Ouverture dans Chrome sur Mac : OK / problème
- 1. Fiche et rechargement : OK / problème
- 2. Combat et annulation : OK / problème
- 3. Nom et lieu : OK / problème
- 4. Création PJ et PNJ : OK / problème
- 5. Export/restauration : OK / problème
- 6. Catalogue et hors ligne : OK / problème

Pour un problème, indique l’étape, ce que tu as fait, le résultat observé et le message
éventuel. La validation de cette recette ne fusionne aucune PR automatiquement.
