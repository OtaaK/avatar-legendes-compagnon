# Avatar Légendes : Compagnon — V1.09

## Filtrage des effets temporaires

- Filtre par provenance : décision MJ, technique, personnage, ou toutes.
- Recherche insensible à la casse dans la description, le nom de technique, le combattant ciblé et le personnage d’origine.
- Les filtres de provenance et de recherche se combinent avec le filtre de durée déjà présent.
- Les anciennes sauvegardes sans provenance sont considérées comme « décision MJ ».
- Garde-fou : création refusée au-delà de 10 000 effets, conformément à la limite de validation des imports.

Les filtres sont purement visuels : ils ne modifient ni l’état du combat, ni les durées, ni l’historique. Aucune mécanique de technique supplémentaire n’est automatisée dans cette version.

## Contrôles exécutés

- 72 tests Node.js (71 hérités et nouveau test de limite) réussis.
- Chromium : nouveau scénario de filtres combinés V1.09, scénario d'effets V1.03 et scénario de scènes V0.98 réussis.
- Vérification de syntaxe JavaScript réussie.
- Archive ZIP créée et intégrité vérifiée.
