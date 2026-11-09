# Tester le lot 2 sur Mac — sans commande

Cette version ajoute les **vrais personnages et ressources Codex** à la navigation v0
validée au lot 1. L'ancienne application reste utilisable, avec ses données intactes.

## Télécharger et ouvrir

Depuis la PR du lot 2, ouvrir le contrôle **Convergence React — Lots 1 et 2**, puis le
résumé de l'exécution réussie. Dans **Artifacts**, télécharger **avatar-legendes-lot2-portable**,
décompresser le ZIP et ouvrir `dist/companion/index.html` avec Chrome. Aucun outil à installer.
L'artefact reste disponible 30 jours ; le workflow peut être relancé pour le reconstruire.

## Reprendre une copie de tes données

1. Dans l'ancienne application, exporter une **sauvegarde complète** et la conserver.
2. Dans le prototype React, ouvrir **Gestion → Vos personnages et sauvegardes**.
3. Choisir **Importer une sauvegarde Codex**, vérifier l'aperçu et confirmer.
4. Ouvrir **Personnages**. Les PJ et PNJ doivent apparaître dans leurs sections respectives.

L'import explicite écrit dans un nouvel espace React. Il ne lit ni ne remplace les clés
historiques. Les lieux, livrets, techniques et combats du fichier sont conservés même
lorsque leur édition n'est pas encore intégrée. Un export public de compte rendu n'est
pas une sauvegarde et sera refusé.

## Recette conseillée

- **Cartes et filtres** : chercher un PNJ, filtrer par lieu, entraînement, importance ou rôle,
  changer le tri puis réinitialiser. Vérifier les capacités de fatigue affichées.
- **Fiche PJ** : vérifier principes, position et centre distincts, caractéristiques et portrait.
  Ajouter une fatigue, revenir à la liste et rouvrir : le récapitulatif doit être cohérent.
  Tester « Annuler le dernier ajustement ».
- **États et statuts** : les deux listes sont distinctes. Changer un statut demande une
  confirmation pour la fiche permanente ; le combattant lié reste inchangé.
- **Édition** : modifier puis annuler, et refaire la modification en enregistrant. Une fenêtre
  confirme l'enregistrement réussi. Échap respecte l'abandon du brouillon et rend le focus.
- **PNJ** : renommer un PNJ ayant domicile et lieux associés, puis vérifier l'onglet Lieux.
  Ces liens sont en lecture seule dans ce lot et doivent rester identiques.
- **Profils** : changer l'importance et refuser la proposition : seule l'importance change.
  Une proposition acceptée prépare un brouillon ; elle n'efface ni fatigue ni états cochés.
  Pour un Légendaire explicite, compléter les huit noms d'états et le principe avant validation.
  Tester aussi les profils 3/5/10/15 et le non-combattant si tes données en contiennent.
- **Portrait** : ajouter une image PNG/JPEG/WebP locale de moins de 256 Ko, enregistrer et recharger.
- **Navigation** : changer d'onglet, recharger, utiliser précédent/suivant. Réduire la fenêtre
  pour contrôler accès aux boutons et onglets, sans barre de défilement verticale parasite.
- **Retour arrière** : exporter le projet React avant un nouvel import. Réimporter cette copie
  et vérifier personnages, ressources et liens. Ne pas supprimer l'export d'origine.
- **Hors ligne** : Wi-Fi coupé, fermer/rouvrir le même HTML, vérifier la fiche sauvegardée,
  modifier une fatigue puis recharger et exporter.

L'annulation du dernier ajustement est temporaire, comme dans le HTML : elle n'est plus
valable après édition, import, modification intermédiaire ou rechargement. L'historique
et les instantanés de combat restent dans la sauvegarde, sans être pilotables ici.

## Limites volontaires

Création PJ manuelle avec les valeurs Codex : aucun préréglage de Livret ou récompense
n'est appliqué automatiquement. Les onglets Livret, Techniques et Lieux annoncent leurs
lots dédiés ; les techniques de la fiche et les liens de lieux existants sont consultables.
L'arbre des lieux, l'attribution/maîtrise des techniques et le combat ne sont pas intégrés.

Le laboratoire technique du lot 1 reste séparé du projet : sa note ne constitue pas un
personnage. Pour tes données, utiliser les boutons du panneau **Vos personnages et sauvegardes**.

Une autre fenêtre peut provoquer un conflit : garder le brouillon ouvert, conserver une
copie de ses changements et exporter le projet avant rechargement. Pas de fusion automatique.
L'édition simultanée sans Web Locks reste un cas non garanti ; privilégier une fenêtre éditrice.

Merci de transmettre navigateur/version, résultat hors ligne, anomalies de données ou
boutons inaccessibles. Aucun accord de recette n'autorise une fusion ou un déploiement.
