# V2.19 — Sauvegarde atomique des interactions MJ

Correction d’une lacune transversale : plusieurs boutons MJ modifiaient le combat puis appelaient `render()` sans transaction de persistance. La fonction `render` est volontairement en lecture seule depuis V2.18 ; ces modifications n’étaient donc pas sauvegardées et disparaissaient au rechargement.

22 points d’entrée supplémentaires passent désormais par `commitCombatMutation`, notamment engagements, pièges, journal de scène, changement de scène, effets temporaires, résolution Terre (armure, bouclier, lave, boue, détection sismique). Le gestionnaire annule la modification en mémoire si la sauvegarde échoue, sans enregistrer d’état partiel.

Les confirmations MJ et contrôles métier existants sont conservés. L’API de simulation reste inchangée. La couverture complète des 13 techniques Terre reste à compléter.
