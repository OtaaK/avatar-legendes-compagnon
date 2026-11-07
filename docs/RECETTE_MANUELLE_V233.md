# Tester la V2.33 dans son navigateur, sans commande

Cette vérification est destinée au propriétaire avant toute fusion de la PR nº 1.
Elle prend environ 10 à 15 minutes. Aucune installation, console ou commande n'est nécessaire.

## Ouvrir le fichier exact de la PR

1. Ouvrir [le fichier de la version testée](https://github.com/OtaaK/avatar-legendes-compagnon/blob/67273e0bdad651ab00cf039000a5e031be1f0ca7/app/simulateur.html), en étant connecté à GitHub.
2. En haut à droite du fichier, cliquer sur la flèche **Download raw file** / **Télécharger le fichier brut**. La page de code GitHub n'est pas l'application.
3. Enregistrer `simulateur.html` dans un nouveau dossier, par exemple `Test Avatar V2.33`, sans remplacer l'ancienne version.
4. Double-cliquer sur le fichier téléchargé. Si nécessaire, choisir « Ouvrir avec » puis Chrome, Firefox ou Edge.
5. Vérifier que l'application affiche **V2.33**.

Le fichier est autonome : il n'y a rien d'autre à télécharger pour le lancer. Il correspond à
l'application de la PR nº 1 ; les ajouts de documentation ultérieurs ne modifient pas ce HTML.

Utiliser des personnages fictifs. Si de vraies données apparaissent, les conserver d'abord avec
**Personnages → Sauvegarder tout (fiches + combat)** et faire les essais dans un autre profil du
navigateur. Ne pas restaurer une sauvegarde de test par-dessus sa partie habituelle.

## 1. Navigation et catalogue

- Ouvrir successivement **Personnages**, **Combat**, **Techniques** puis **Accueil**.
- Dans **Techniques**, rechercher **Armure de terre** et ouvrir sa fiche.

**Attendu :** les écrans s'ouvrent, les boutons restent accessibles et la fiche présente le nom,
l'approche et la référence p.289. Aucun écran vide ni message d'erreur.

## 2. Une fiche de test

- Dans **Personnages**, choisir **PNJ**, puis **+ Nouveau PNJ**.
- Dans la fiche, donner un nom fictif, par exemple « Recette V2.33 ».
- Dans **Ressources**, augmenter la fatigue de 1 avec le bouton **+**, puis **Enregistrer la fiche**.
- Revenir à la liste, puis rouvrir la fiche.

**Attendu :** nom et fatigue sont conservés. Un PNJ suffit pour cet essai rapide ; on peut aussi
créer un PJ avec l'assistant si c'est une fonction utilisée habituellement.

## 3. Armure de terre dans un petit combat

Ces deux combattants sont indépendants de la fiche précédente : aucun apprentissage de technique
sur une fiche n'est nécessaire pour ce scénario avec des PNJ.

- Dans **Combat → Combattants**, créer deux combattants avec **+ PNJ**. On les appellera ici
  « premier PNJ » et « second PNJ ».
- Cocher leur paire dans **Engagements**.
- Dans **Passe**, choisir **Défendre et prendre à revers** pour le premier et **Avancer et attaquer**
  pour le second. Cliquer sur **Révéler les approches**.
- Dans **Actions**, choisir le premier PNJ puis **Armure de terre**. Cocher la confirmation du
  matériau disponible et cliquer sur **Préparer les effets**.
- Dans **Validation MJ**, cliquer sur **Valider les effets cochés**.
- Regarder le combattant et les effets temporaires dans **Passe**.

**Attendu :** le premier PNJ est **Avantagé**, l'armure possède **3 points** et sa fatigue reste à **0**.

## 4. Une attaque, puis son annulation

- Depuis **Passe**, cliquer sur **Approche suivante** pour passer à Avancer et attaquer.
- Dans **Actions**, choisir le second PNJ, cibler le premier et sélectionner **Gantelet de terre**.
- Garder le choix **2 fatigues** et **aucune projection**.
- Préparer, puis valider les effets dans **Validation MJ**.

**Attendu :** le second PNJ paie **1 fatigue** ; le premier reste à **0 fatigue**, son armure absorbe
les 2 fatigues et passe de **3 à 2 points**.

- Cliquer sur **Annuler dernière validation**.

**Attendu :** l'armure retrouve **3 points** et la fatigue du second PNJ revient à **0**. Le lot proposé
est restauré : il est normal de revoir des effets en attente.

- Revalider ce lot pour poursuivre les essais avec **2 points d'armure**.

Ces nombres vérifient le comportement actuel de la version soumise, sans ajouter d'arbitrage de règles.

## 5. Reprise, sauvegarde et restauration

- Actualiser la page dans le même navigateur, puis rouvrir **Personnages** et **Combat**.

**Attendu :** la fiche de test, les deux combattants et l'armure à **2 points** sont toujours présents.
Si un avertissement indique que le navigateur refuse le stockage, le signaler : ne pas conclure que
la sauvegarde a réussi.

- Dans **Personnages**, cliquer sur **Sauvegarder tout (fiches + combat)** et conserver le fichier JSON téléchargé.
- Sur ce combat fictif uniquement, cliquer sur **Combat → Réinitialiser la démonstration** : la liste des combattants devient vide.
- Revenir à **Personnages**, puis utiliser **Restaurer une sauvegarde complète** pour sélectionner le fichier JSON de test, puis confirmer la restauration de ces données fictives.

**Attendu :** la fiche, les deux combattants, leurs fatigues et l'armure à **2 points** sont restaurés.
Le JSON privé de l'écran Combat ne remplace pas la sauvegarde complète des fiches et du combat.

## Retour attendu

Indiquer simplement :

- navigateur et appareil utilisés ;
- étapes 1 à 5 : OK, problème ou non testée ;
- en cas de problème : bouton utilisé, résultat attendu, résultat observé et, si utile, capture d'écran.

L'absence de problème sur ce parcours ne certifie pas toutes les règles ni toutes les techniques.
La PR reste en attente : aucune fusion ne doit être faite sans validation explicite du propriétaire.
