# V2.22 — transactions de combat et libération de Piégé

- Libération de Piégé : refus explicite en présence de propositions non résolues.
- Libération atomique : une erreur pendant l’écriture du journal restaure combattants, notes, historique et pile d’annulation.
- Interface : les transactions imbriquées (notamment commandes enveloppées appelant déjà `commitCombatMutation`) ne déclenchent plus de sauvegardes intermédiaires ; une seule écriture est effectuée au niveau externe.
- Nouveau test `test_terre_v222.cjs` : refus, coût mixte, annulation et panne tardive simulée.

Les 13 techniques de Terre restent intégrées, sans certification exhaustive. La priorité reste la validation de combats multi-techniques.
