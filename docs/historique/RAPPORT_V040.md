# Compagnon V0.40 — Intégrité du catalogue et transparence mécanique

## Réalisé
- Ajout d’un avertissement visible sur les fiches des techniques avancées non encore validées individuellement avec les règles officielles.
- Ajout d’un rappel dans le compteur de résultats du catalogue.
- Nouveau test `test_catalogue_integrite.cjs` : 111 entrées dont 9 de base et 102 avancées, unicité des identifiants, cohérence des approches, présence des pages, contrôle des techniques réservées aux groupes PNJ et correspondance exacte des 102 identifiants entre catalogue embarqué et matrice CSV.

## Vérifications
- Tous les fichiers `test_*.cjs` réussissent sous Node.js.
- Syntaxe JavaScript embarquée : valide.
- Archive ZIP : intégrité contrôlée.
- Chromium headless : nouvelle tentative avec délai de 18 secondes, expirée sans DOM exploitable. **Aucun test navigateur réel validé.**

## Limites
Le test de cohérence vérifie les métadonnées *entre les fichiers du projet*, pas leur exactitude par rapport au PDF officiel. Les effets et prérequis des 102 techniques avancées restent à examiner individuellement. Les techniques de base conservent leurs automatismes actuels ; l’avertissement ne s’applique qu’aux avancées. Aucune migration de sauvegarde n’est nécessaire.

## Prochaine étape
Comparer les techniques avancées à l’ouvrage officiel par petits groupes, noter pour chacune source et règle, puis seulement implémenter des effets vérifiés et des tests ciblés. Vérifier également le fonctionnement dans un navigateur disponible.
