# V1.97 — Armure de terre : dépense MJ sur une attaque fragmentée

Correction de l’interface de validation : le dialogue de dépense supplémentaire calcule désormais la fatigue totale de l’attaque (après regroupement des événements) et non uniquement celle du premier fragment. Le plafond tient compte du total et de la réserve encore disponible. Le moteur de résolution n’est pas modifié.

Un nouveau test vérifie le regroupement de deux fragments de 2 fatigues, la prévisualisation et la dépense de 2 points.

**Limite** : le traitement conjoint fatigue + état reste à revoir ; les parcours complets Chromium ne sont pas inclus dans cette livraison.
