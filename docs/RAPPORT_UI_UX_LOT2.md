# Refonte UI/UX — lot 2 : galerie et cartes Personnages

## Périmètre et dépendance

Branche `refonte/ui-ux-personnages`, depuis le commit `a323655` du lot 1.
La PR nº 3 est encore ouverte : cette livraison en dépend et ne la fusionne pas.
Le cahier des charges du dépôt et `AGENTS.md` ont été relus. Les tests GitHub du lot 1
sont réussis ; la référence locale avant intervention compte 229 scripts réussis.

## Ce qui change

- Création par un `+` discret, avec nom accessible PJ/PNJ et aide au survol.
  Les outils de sauvegarde et leur aide passent en bas de galerie ; leurs commandes restent
  disponibles à l’identique, ainsi que depuis Gestion.
- Cartes avec avatar neutre original, nom, une seule icône d’entraînement colorée sans
  texte visible, fatigue segmentée, états et statuts actifs distingués en capsules.
- PJ : mini-jauge à sept graduations, losange doré de position et cercle cyan de centre.
  Les repères sont décalés verticalement pour rester visibles s’ils coïncident ; noms et
  valeurs restent accessibles. Aucune modification de ressource depuis la carte.
- PNJ : position actuelle conservée, valeur d’équilibre enregistrée, pastille seule près du
  nom, libellé accessible par focus/clic/survol et légende permanente.
- Recherche historique conservée (nom et aussi rôle/lieu/notes), filtres cumulables par
  lieu, entraînement, rôle et importance. Le rôle réutilise `livret`, qui sert déjà de rôle
  pour les PNJ : aucun second champ concurrent.
- Tri nominal, par lieu, par importance croissante/décroissante ; non classés en fin de liste
  dans les deux sens. Départage nominal puis identifiant pour un ordre stable.
- Recherche visible ; filtres et tri dans un panneau repliable pour garder les cartes lisibles.
  Compteur filtré/total, état vide explicatif et remise à zéro. Les critères et l’ouverture
  du panneau restent conservés lors d’un aller-retour vers une fiche ; pas de nouvelle
  persistance de préférences lors du rechargement.
- Ouverture par bouton natif au clavier ou clic sur le fond de carte ; les boutons d’information
  sont indépendants. Retour avec focus sur la carte ou sur la création si elle est filtrée.

## Importance et compatibilité

Le champ optionnel `importance` est une **classification**, pas une automatisation de règles.
Les quatre catégories proposées sont Mineur, Majeur, Champion et Légendaire, conformément
au cahier des charges. Aucune fatigue, limite, caractéristique, technique ou valeur d’équilibre
n’est déduite de cette sélection.

Les fiches anciennes sans importance restent sans ce champ après lecture et simple sauvegarde.
Elles sont affichées « Non précisée », sans classement Mineur implicite. Les anciennes valeurs
personnalisées/non reconnues sont préservées à l’import et lors d’une édition sans rapport ;
elles sont regroupées comme non classées pour le filtre/tri. Une valeur textuelle inconnue
reste disponible dans le sélecteur de la fiche. Les nouvelles classifications sont contrôlées
par `Roster.updateCharacter` et ne peuvent pas ajouter une catégorie PNJ à un PJ.

Le formulaire actuel expose provisoirement la sélection et la pastille + libellé d’importance.
La refonte des fiches en consultation/édition, avec leurs onglets distincts, reste le lot 3.

Les ressources restent celles du modèle V2.33 : fatigue 0…5 et équilibre −3…3. Les cartes PNJ
n’utilisent plus la jauge à deux principes du PJ, mais affichent leur valeur existante sans
l’écraser. Capacités PNJ 3/5/10/15, non-combattants, états personnalisés et bornes à principe
unique nécessitent le lot 3 et une vérification du PDF ; ils ne sont pas prétendus livrés ici.
Les portraits personnalisés viendront avec l’édition des fiches ; seul l’avatar par défaut
est nécessaire à ce lot, sans image distante ni contenu artistique protégé.

## Fichiers et retour arrière

| Fichier | Intervention |
|---|---|
| `app/simulateur.html` | Rendu/styles des cartes, filtres, tri, helpers d’importance, édition du champ optionnel |
| `tests/js/test_galerie_personnages.cjs` | 32 scénarios de filtrage/tri, compatibilité et classification non destructive |
| `tests/browser/test_galerie_personnages.py` | Cinq formats, clavier, filtres, stockage, erreurs, sécurité et round-trip |
| Documentation de suivi | README, feuille de route, architecture, décisions, tests et ce bilan |

Pas de suppression, nouvelle dépendance, changement de clé de stockage ni version du format
JSON. L’import conserve les champs additionnels : revenir au lot 1 conserve donc cette
métadonnée dans les sauvegardes, même si l’ancienne interface ne l’affiche pas. Aucun nettoyage
silencieux des données inconnues. Pour revenir en arrière, rétablir le commit du lot 2 et
conserver les exports de sécurité, sans effacer le stockage du navigateur.

## Vérifications

- Avant intervention : **229/229 scripts réussis**, une limite locale `file://` annoncée.
- Bilan final sur la présentation définitive : **231/231 scripts réussis** (192 JavaScript,
  39 navigateur), **0 échec**, une limite locale `file://` explicitement annoncée.
  Commande : `python scripts/test.py --jobs 2 --report /workspace/work/uiux-lot2-validation.json`.
- 32 scénarios JavaScript ciblés réussis : ordre des quatre catégories, filtres combinés,
  résultats vides, données non modifiées par les requêtes, tri stable, 500 PNJ, import/export
  et absence de classification implicite des anciennes fiches.
- Un lancement à trois processus, accompagné d’un test navigateur supplémentaire, a produit
  deux dépassements de 120 secondes (Terre et navigation). Les reprises isolées passent
  en 29,7 et 17,6 secondes sans modifier ce délai ni les assertions. Cette concurrence
  supplémentaire est évitée pour le bilan final ; ces dépassements ne sont pas masqués.
- Cinq parcours Chromium ciblés réussis : desktop 1440×1000, tablette 768×1024,
  téléphone 390×844, paysage 844×390 et petit écran 320×640.
- Classification enregistrée sans changement des ressources ; panne de stockage injectée
  sans faux succès ni modification du modèle ; valeurs anciennes non reconnues conservées.
- Compatibilité de retour au lot 1 vérifiée en exécutant son module `Roster` depuis
  `a323655` : il lit une fiche avec importance, modifie ses notes et conserve la classification.
- Export/restauration complète puis rechargement comparés sur les modèles entiers. État du
  combat stocké inchangé pendant filtres/édition de classification.
- Texte HTML et identifiant piégés testés dans les nouvelles cartes ; aucune exécution.
  Le texte est échappé, les identifiants transitent par des attributs `data-*` plutôt que
  d’être interpolés dans du code d’événement. Les icônes sont embarquées.
- Galerie avec 500 PNJ supplémentaires rendue et recherchée dans Chromium.
- Captures PJ/PNJ desktop/mobile inspectées, avec centres distincts/coïncidents ;
  aucune requête distante nécessaire au parcours.

## Recette simple

1. Ouvrir le HTML de cette branche comme pour le lot 1. Exporter ses données habituelles avant
   de remplacer/déplacer son fichier ; ne pas effacer le stockage du navigateur.
2. Vérifier les cartes PJ, puis PNJ. Utiliser Tab/Entrée et les petites icônes ; les informations
   d’entraînement ou d’importance ne doivent pas ouvrir la fiche par erreur.
3. Sur un PNJ de test, choisir une importance et enregistrer. Vérifier que ses ressources et
   sa participation au combat restent identiques.
4. Combiner recherche et filtres, ouvrir une fiche puis revenir ; vérifier que les critères
   sont conservés. Tester les deux tris d’importance et « Non précisée ».
5. Depuis Gestion, exporter puis restaurer une sauvegarde complète et recharger.

## Limites et suite

Le blocage local `file://` reste explicite ; le contrôle hors connexion utilise HTTP local
puis le réseau coupé. Cela ne remplace pas le double-clic sur Chrome/macOS ni une campagne
Safari/lecteurs d’écran. Les tests ne certifient pas toutes les données importées possibles.

Suite : **lot 3, fiches détaillées distinctes et ressources**, puis Lieux, puis structure
UI des Livrets. Aucune fusion dans `main` effectuée par ce lot.
