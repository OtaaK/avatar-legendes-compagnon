# Rapport V0.78 — Glissade et engagements avec des tiers

La résolution de **Glissade** propose désormais la rupture de **tous les engagements préexistants** d’un ennemi repositionné, et pas uniquement de son lien avec le lanceur. Une paire entre deux ennemis déplacés n’est proposée qu’une fois. Un ennemi résistant conserve tous ses engagements, sauf si son partenaire est lui-même déplacé : ce cas reste à arbitrer par le MJ en validant ou refusant la rupture proposée. Chaque rupture est soumise aux décisions du MJ, et prévisualisable et annulable.

**Limites** : les nouveaux engagements, la portée et les positions restent déterminés par le MJ. Le moteur ne modélise pas de coordonnées. Cette évolution corrige le suivi de Glissade, mais ne constitue pas une technique avancée entièrement automatisée supplémentaire (13/102).

Tests : `test_glissade_engagements_v078.cjs` (8 scénarios), en plus de la suite héritée. Tests Node.js uniquement, sans navigateur réel.
