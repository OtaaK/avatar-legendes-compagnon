# Tester le lot 1 sur Mac — sans commande

Cette version est une **démonstration des fondations**. Elle présente la navigation v0,
pas encore les fiches ou le combat intégrés. L'ancienne application reste disponible.

## Obtenir le fichier

Depuis la PR dédiée au lot 1 :

1. Ouvrir les contrôles de la PR, puis **Convergence React — Lot 1**.
2. Ouvrir le résumé de l'exécution réussie, puis **Artifacts**.
3. Télécharger **avatar-legendes-lot1-portable** et décompresser le ZIP.
4. Dans le dossier `dist/companion`, ouvrir **index.html** avec Chrome.

Le ZIP contient aussi ce guide. Il n'y a aucun outil de développement à installer.
L'artefact GitHub reste disponible 30 jours ; une nouvelle exécution du workflow peut
le reconstruire. Le code source et le fichier de dépendances restent versionnés.
Si GitHub ne propose pas encore le téléchargement, attendre la fin du contrôle.

## Vérifications essentielles — environ cinq minutes

1. **Navigation** : ouvrir Accueil, Personnages, Lieux, Combats, Techniques et Gestion.
   Vérifier le bouton actif, les flèches précédent/suivant du navigateur et le rechargement.
   Les rubriques métier annoncent volontairement leur lot d'intégration.
2. **Fenêtre** : cliquer sur l'aide, se déplacer avec Tab et Maj+Tab, fermer avec Échap.
   Le focus doit revenir au bouton utilisé pour ouvrir la fenêtre.
3. **Persistance** : dans Gestion, saisir une note de test, l'enregistrer puis recharger.
   La note doit revenir. Seule cette note technique utilise l'espace de laboratoire.
4. **Fichiers** : exporter l'état de test, puis choisir ce fichier avec « Examiner une
   copie JSON ». Fermer l'aperçu avec « Annuler l'examen » : aucune donnée n'est importée.
5. **Hors ligne** : couper le Wi-Fi, fermer l'onglet puis rouvrir le même `index.html`.
   Vérifier navigation, note enregistrée et export. Réactiver le Wi-Fi ensuite.
6. **Taille de fenêtre** : réduire la fenêtre ; la navigation devient une barre d'icônes,
   puis une barre inférieure sur petit écran. Vérifier accès aux six rubriques et boutons.

En option : ouvrir le même fichier dans deux onglets. Saisir un brouillon dans le second,
puis enregistrer une note dans le premier. Le second doit conserver son texte, signaler
le conflit et bloquer l'enregistrement jusqu'au rechargement. En `file://`, la portée
partagée du stockage et Web Locks dépend du navigateur : signaler le résultat observé.

## Ce qu'il faut me transmettre

- Chrome ou Safari et sa version ; ouverture réussie ou message affiché.
- Résultat du redémarrage Wi-Fi coupé et de la note après rechargement.
- Bouton inaccessible, texte illisible ou débordement éventuel, avec la taille approximative.
- Résultat du test à deux onglets, si effectué.

L'environnement cloud interdit les URL `file://` (`ERR_BLOCKED_BY_ADMINISTRATOR`). Il a
vérifié le document embarqué hors réseau via un transport de test, pas le double-clic sur
macOS. Cet essai réel est donc encore nécessaire. Si le navigateur refuse le stockage,
l'application doit l'annoncer ; ne pas effacer ses anciennes données pour contourner le refus.
