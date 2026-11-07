# V0.67 — Protection et attaques multi-effets

Le moteur traite la décision d’interception au niveau du groupe `(actionId, cible)` : le MJ peut cocher une interception sur n’importe quel effet approuvé de cette attaque. La première décision positive dans l’ordre des effets approuvés est retenue, avec son protecteur explicitement choisi. Une attaque ne consomme qu’une seule Protection.

L’interface ne demande plus une confirmation pour chaque effet : un seul dialogue par attaque/cible, même si les événements sont entrelacés. Elle réserve les protecteurs déjà sélectionnés lors des dialogues suivants. Les décisions programmatiques des versions précédentes restent compatibles.

Tests : `test_protection_groupes_v067.cjs` et suite historique. Limites : les interactions de protections avec les autres réactions doivent continuer à être arbitrées par le MJ ; aucun test navigateur réel.
