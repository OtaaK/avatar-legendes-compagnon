# V2.27 — Armure de terre : allocation sans sur-réservation

- Après consommation du dernier point d’armure, les autres états de la même attaque sont automatiquement subis : aucune invitation à dépenser un point inexistant.
- Les décisions explicites à zéro sont conservées pour les événements restants, sans modifier les choix déjà effectués.
- Validation de l’interface réelle sous Chromium : choix de l’état absorbé, absence de dialogue superflu, sauvegarde et annulation.
- Priorité maintenue aux 13 techniques de Terre ; validation exhaustive non terminée.

## Vérifications réalisées
- 183/183 tests Node réussis.
- Chromium : une seule question pour deux états et une réserve d'un point, état non absorbé conservé, persistance simulée et annulation validées.
- Syntaxe JavaScript vérifiée avec `node --check`.
