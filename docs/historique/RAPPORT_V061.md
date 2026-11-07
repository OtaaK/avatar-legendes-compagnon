# V0.61 — Résolution cumulative des attaques absorbées

## Changements

- Résolution des effets de couverture par groupe `(actionId, targetId)` dans l'ordre de première apparition.
- Une attaque absorbée ne modifie plus l'état intermédiaire servant à évaluer les attaques suivantes.
- Les effets non hostiles sont conservés, même lorsqu'ils appartiennent à un groupe dont l'attaque hostile est absorbée.
- Les statuts bénéfiques ne déclenchent pas la consommation de l'abri.
- Les ripostes restent déclenchées uniquement par les effets hostiles effectifs après résolution.

## Tests

Huit scénarios dédiés dans `test_abri_cumul_v061.cjs` : états répétés, fatigue, statut négatif, riposte, multi-effets, multicibles, prévisualisation/annulation et statut bénéfique. Les 33 fichiers de tests JavaScript passent.

## Limites

Les groupes sont ordonnés selon leur première apparition ; des événements d'une même attaque intercalés avec ceux d'une autre restent traités comme un groupe. Le MJ décide des réussites, de la portée et des effets narratifs. Aucun test en navigateur réel.

## Catalogue

8 techniques avancées validées sur 102 ; aucune nouvelle technique avancée n'a été ajoutée dans cette version.
