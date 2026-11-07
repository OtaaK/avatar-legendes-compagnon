# Rapport de stabilisation V0.28

## Réussites
- 10 assertions de validation des sauvegardes (Node.js).
- Analyse syntaxique JavaScript (`node --check`).
- Test dans Chromium headless à 390 × 844 px : navigation entre les espaces Personnages, Combat, Techniques ; aucun débordement horizontal sur les vues testées.
- Création de personnage et modification de ses ressources.
- Attribution d'une technique et copie des données vers un combattant.
- Refus d'un doublon dans le même combat.
- Déclaration, révélation, progression des trois approches, fin de passe et début de la suivante.
- Effet du statut Renforcé en fin de passe.
- Synchronisation des ressources et statuts du combattant vers sa fiche.
- Sérialisation, validation et restauration des données, rejet d'un lien de fiche inexistant.

## Corrections
- Import de combat désormais refusé si l'enregistrement local échoue.
- Synchronisation vers fiche annulée en mémoire si l'enregistrement échoue.
- Import complet : restauration des états mémoire et tentative de retour arrière sur les clés persistantes en cas d'échec.

## Risques résiduels
- Transactions entre les deux clés de stockage non atomiques ; export JSON externe indispensable.
- Persistance après fermeture et réouverture du navigateur non testée de bout en bout.
- Tests des gestes tactiles et du parcours complet de l'assistant de création non effectués.
- Mécanique des 102 techniques non entièrement validée.
