# V0.62 — Ordre canonique des attaques entrelacées

## Correction

Les événements d’une même attaque et d’une même cible sont désormais appliqués de manière contiguë, selon l’ordre de première apparition du groupe `(actionId, targetId)`. L’évaluation de **Se mettre à l’abri**, l’application effective et le déclenchement de **Riposter** utilisent ainsi un ordre cohérent. Les événements internes à chaque groupe conservent leur ordre initial.

**Convention explicite :** quand deux attaques sont entrelacées dans la file, la première attaque rencontrée est résolue intégralement avant la suivante. Ce choix technique ne détermine pas la chronologie narrative : le MJ reste arbitre.

## Validation

Six nouveaux scénarios dans `test_entrelacement_v062.cjs` : abri, effets conservés, riposte, abri avec riposte, prévisualisation et annulation. Exécution de l’ensemble des tests de régression et contrôle de syntaxe.

## Limites

Pas de tests automatisés dans un navigateur réel. Le catalogue conserve 8 techniques avancées validées sur 102.
