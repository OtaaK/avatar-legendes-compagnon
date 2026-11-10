# Tester les Lieux sur Mac — sans commandes

Télécharger le ZIP **avatar-legendes-lieux-portable** indiqué dans la PR Lieux, le décompresser puis ouvrir **dist/companion/index.html** dans Chrome. Aucune installation ni serveur. Garder l’ancien prototype et une copie de vos sauvegardes d’origine.

## Charger vos données

Dans **Gestion**, exporter d’abord votre campagne actuelle si elle est présente, puis utiliser **Importer une sauvegarde Codex** avec une copie de votre sauvegarde. Examiner et confirmer. Les données fictives de v0 ne sont jamais utilisées. Une simple consultation n’enregistre rien.

## Quelques vérifications essentielles

1. **Lieux → Ajouter un lieu racine**, saisir un nom et une description, enregistrer. Ajouter un sous-lieu puis un sous-lieu de ce dernier. L’arbre et le fil d’Ariane doivent permettre de circuler entre les trois niveaux. Les flèches replient/déplient les branches.
2. **Modifier le lieu** : changer son nom, sa description et éventuellement son parent. Les descendants ne sont pas proposés comme parents. Le nom et le texte restent complets dans le panneau principal. Charger une petite image PNG/JPEG/WebP locale (256 Ko maximum), vérifier son aperçu puis enregistrer.
3. Dans une fiche PNJ, onglet **Lieux**, définir séparément **Position actuelle**, **Domicile** et **Lieux associés**, puis **Enregistrer les liens**. Changer le domicile ne doit pas déplacer le PNJ. Les anciennes positions textuelles restent disponibles tant qu’une position structurée n’est pas choisie explicitement. Les références absentes restent visibles.
4. Dans le lieu concerné, vérifier les groupes **Présents actuellement**, **Domiciliés ici** et **Associés au lieu**. Un même PNJ peut appartenir aux trois groupes ; il ne doit apparaître qu’une fois dans chacun. **Inclure les sous-lieux** étend la consultation à tous les descendants.
5. Ouvrir une fiche depuis un groupe, modifier son domicile, vérifier sa position inchangée, puis **Retour au lieu**. Recharger la page : le lieu sélectionné et le filtre des descendants restent dans l’adresse. Les boutons d’ouverture depuis la fiche permettent aussi de consulter un lieu puis de revenir à la fiche.
6. Essayer **Supprimer le lieu**, lire les dépendances puis **Annuler** : rien ne doit changer. Pour une véritable suppression avec dépendances, une case et une confirmation sont exigées. Les sous-lieux sont rattachés au parent, les liens vers le lieu sont retirés ; aucun PNJ ni sous-lieu n’est supprimé. Faire cet essai sur une copie de campagne.
7. **Gestion → Exporter la sauvegarde du projet**, conserver le JSON puis le réimporter. Les lieux, liens, autres fiches, Livrets, techniques et combat doivent être conservés. Le texte privé des techniques reste dans son propre export.
8. Couper le Wi-Fi, rouvrir le même HTML, créer/modifier un lieu et recharger. Tout doit fonctionner. Réduire aussi la fenêtre pour vérifier l’arbre, les boutons et les fenêtres sur petit écran.

## Sécurité des brouillons et fichiers

Annuler une édition modifiée demande confirmation. Une erreur de stockage garde la fenêtre et son brouillon ; ne pas fermer sans conserver vos informations. Si un autre onglet a modifié la campagne, l’ancienne fenêtre refuse d’écraser ses données : exporter l’état à garder puis recharger, aucune fusion automatique.

Conserver les JSON de campagne et de descriptions privées **hors du dossier du prototype**. Chrome peut séparer le stockage selon le chemin du HTML ; après remplacement/déplacement du fichier, réimporter vos copies si nécessaire. La banque privée des techniques ne fait jamais partie de la campagne.

Les droits du PDF ne changent pas : pour retrouver les italiques perdus dans un ancien JSON, préparer à nouveau les descriptions depuis votre PDF via Gestion, puis confirmer et exporter la banque privée enrichie. Aucun texte du livre n’est inclus dans le ZIP. Voir `docs/reference/DESCRIPTIONS_PRIVEES.md`.

Merci de signaler les écarts avec navigateur/version, action et résultat attendu. La recette n’autorise aucune fusion automatique ni le lot suivant.
