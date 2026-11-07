# V2.18 — Transactions de combat et historique

Correction de trois transactions (`endRound`, `endCombat`, `newScene`) : la sauvegarde de rollback conserve désormais **toute la pile de snapshots** et l’historique, au lieu de restaurer la copie volontairement allégée réservée à l’annulation. En cas d’échec tardif (par exemple lors de l’écriture du journal), les instantanés précédents restent disponibles.

Nouveau test V2.18 : injection d’échec après modification des ressources, états, entraves ou pièges ; comparaison intégrale de l’état, reprise de la transition et `undo`. Les 13 techniques de Terre restent en cours d’audit ; aucune certification exhaustive revendiquée.
