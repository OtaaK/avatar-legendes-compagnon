# V0.59 — Riposter : évaluation cumulative des effets

## Modifications

- La détection des ripostes simule désormais les états, l’équilibre et la fatigue après chaque événement effectif, sans toucher aux combattants réels.
- Réappliquer un état déjà infligé dans la même validation ne déclenche pas une seconde riposte.
- Une attaque ultérieure qui décale un équilibre déjà saturé ne déclenche pas de riposte injustifiée.
- Les attaques réellement distinctes et efficaces conservent leurs ripostes ; les effets d’une même attaque ne génèrent qu’une seule riposte.
- Prévisualisation et annulation testées.

## Limites

- Le choix de réussite des attaques, leur portée et la fiction restent au MJ.
- Les événements de fatigue excédentaire nécessitent toujours les choix d’états habituels.
- Aucun essai dans un navigateur réel.
