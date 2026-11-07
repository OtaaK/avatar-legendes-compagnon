# Avatar Légendes : Compagnon — V1.06

## Nouveauté
Modification de l’origine d’un effet temporaire existant : décision MJ, technique (nom facultatif) ou personnage (source obligatoire). Le libellé et la durée restent modifiables dans la même opération.

## Compatibilité et sécurité
- L’API `editTemporaryEffect(s,id,label,duration)` demeure compatible et préserve l’origine existante.
- La validation intervient avant toute mutation ; un choix invalide ne modifie ni l’effet ni l’historique.
- Les changements sont annulables ; les modifications sans changement ne créent pas d’historique.
- Les effets narratifs n’appliquent aucun changement mécanique.

## Contrôles
Voir le compte rendu de l’exécution des tests en fin de rapport.

- 69 tests Node.js réussis.
- Tests Chromium V1.03 (effets) et V0.98 (scènes) réussis.
- Syntaxe JavaScript validée.
- Test Chromium V1.05 adapté au dialogue V1.06 et réussi ; test Chromium V1.04 des origines réussi.
- Test Chromium V1.05 adapté et réussi ; test Chromium V1.04 adapté au sélecteur et réussi.
