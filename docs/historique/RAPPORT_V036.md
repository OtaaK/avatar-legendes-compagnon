# V0.36 — Transactions sur les actions de combat

## Modifications
- Nouvelle fonction `commitCombatMutation` : capture l'état du combat avant une commande, enregistre les modifications, et restaure l'état initial si l'écriture locale échoue ou si une exception survient.
- Protection des commandes principales : création/réinitialisation du combat, ajout de combattants, déclaration, choix du jet, préparation/approbation/refus, retour arrière, libération, changement de phase et inclusion d'une fiche.
- L'affichage (`render`) ne sauvegarde plus implicitement le combat. Cela évite de considérer un simple rafraîchissement comme une validation des données.
- La modification rapide de fatigue/équilibre d'une fiche utilise maintenant la transaction de bibliothèque.
- Les clés de stockage sont inchangées pour la compatibilité avec les versions précédentes.

## Vérifications
- 46 tests Node réussis (39 tests antérieurs + 7 nouveaux tests).
- Syntaxe JavaScript contrôlée avec `node --check`.
- Chromium headless tenté avec un délai de 18 secondes ; aucun DOM n'a été renvoyé. Test navigateur **non validé**.

## Limites connues
- Les fonctions UI historiques absorbent parfois leurs propres erreurs métier : la transaction restaure les mutations en cas d'exception propagée ou d'échec de sauvegarde, mais ne remplace pas l'audit de tous les chemins d'erreur internes.
- La persistance réelle après fermeture et réouverture du navigateur reste à tester.
- Les 102 techniques avancées ne sont pas toutes validées mécaniquement ; ne pas considérer leurs effets comme exhaustifs.
- Les imports complets sur deux clés de stockage ne sont pas une transaction disque atomique : une restauration est tentée si la seconde écriture échoue.

## Suite recommandée
1. Test manuel ou navigateur réel du cycle de sauvegarde/rechargement.
2. Audit de l'atomicité des imports complets et des synchronisations fiches/combat.
3. Vérification individuelle des techniques avancées à partir du livre officiel.
