# Rapport V1.02

## Livré
- Effets temporaires narratifs par combattant, avec expiration fin de passe, fin de scène ou retrait manuel.
- Bouton MJ, liste visible et retrait explicite.
- Transactions annulables pour ajout et retrait ; conservation des effets dans les sauvegardes.
- Validation à l'import des effets temporaires et compatibilité avec les anciennes sauvegardes sans ce champ.

## Contrôles
- 65 tests Node.js hérités réussis.
- Nouveau test `test_temporary_effects_v102.cjs` réussi.
- Syntaxe JavaScript vérifiée par `node --check`.

## Limites
- Repères narratifs uniquement : aucune mécanique officielle automatisée à partir de ces effets.
- Le changement de passe est géré par le moteur existant ; le test Chromium dédié à l'interface des effets temporaires reste à créer.
