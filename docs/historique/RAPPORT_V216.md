# Avatar Légendes : Compagnon — V2.16

## Transactions de fin de combat et changement de scène

- Fin de combat : vérification de toutes les références des Entraves de métal avant libération ; aucune libération partielle en présence d’une référence invalide.
- Fin de combat : restauration de l’état complet en cas d’erreur pendant la transaction.
- Nouvelle scène : transaction protégée, y compris lors d’une anomalie de données ; retour à l’état initial sans modification partielle.
- Régressions : libération de deux entraves, restitution d’équipement, pièges, historique et annulation.

## Limites

La certification exhaustive des 13 techniques de Terre et le parcours utilisateur complet restent à terminer.
