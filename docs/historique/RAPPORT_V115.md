# Avatar Légendes : Compagnon — V1.15

## Évolution du moteur

**Projection tellurique** (annexe A, p. 289 du livre de règles fourni) est désormais prise en charge pour ses deux effets mécaniques explicites : coût de **1 fatigue** pour le lanceur et statut **Avantagé**. Une proposition narrative rappelle au MJ de désengager uniquement les adversaires incapables de suivre le lanceur dans les airs. Le retour au sol à la fin de la passe demeure un repère narratif temporaire qui expire automatiquement à la passe suivante.

Le coût, le statut et la note narrative de cette technique doivent être acceptés ou refusés ensemble. Les coûts généraux de posture, lorsqu'ils existent, restent indépendants. La création du repère de retour au sol est conditionnée à l'acceptation de la proposition `status_add` Avantagé propre à cette technique ; une note générique ne suffit plus. Les changements sont annulables via l'annulation du combat.

## Limites volontaires

Le moteur n'infère pas les adversaires capables de suivre un personnage dans les airs et ne modifie donc pas automatiquement les engagements. Il ne prétend pas simuler une position spatiale. Les autres techniques du catalogue restent partiellement automatisées selon leur prise en charge existante.

## Tests

- 78 fichiers `test_*.cjs` exécutés avec Node.js : 78 réussis.
- Chromium : `test_interface_effects_v103.py` et `test_interface_scene_v098.py` réussis.
- Syntaxe du JavaScript embarqué vérifiée avec `node --check`.
- Archive ZIP contrôlée par `ZipFile.testzip()`.

Les fixtures historiques V1.07 et V1.10 ont été adaptées au déclenchement désormais plus strict de Projection tellurique.
