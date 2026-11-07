# Rapport de livraison V1.32

## Réalisation
- **Souple comme un roseau** : prédiction scellée dans les effets temporaires (non affichée dans le libellé).
- Résolution explicite du MJ **après révélation des approches**, à la passe suivante uniquement.
- Prédiction correcte : statut Avantagé actif pendant la passe et interdiction de cibler le lanceur avec une technique de l’adversaire prédit, vérifiée à la mise en file des techniques.
- Prédiction incorrecte : autorisation de changer l’approche, seulement avant la résolution et avant toute technique du lanceur.
- Résolution et changement annulables par les instantanés existants.
- Bouton « Révéler (MJ) » dans les effets temporaires ; prédiction conservée dans les données internes et les sauvegardes, donc **pas de confidentialité garantie pour les exports JSON ni pour une personne ayant accès à l’ordinateur**.
- Validation des champs de prédiction à l’import.

## Vérification
- 94/94 scripts Node.js réussis.
- Tous les scripts Chromium historiques et nouveau `test_chromium_v132.py` réussis, avec `localStorage` simulé et `page.set_content`.
- Syntaxe JavaScript vérifiée avec Node.
- La persistance réelle après fermeture du navigateur reste non testée.

## Limites
- La résolution ne doit être déclenchée que lorsque toutes les approches ont été déclarées ; le moteur impose une phase postérieure à la déclaration, sans reconstituer le contexte narratif.
- L’interdiction de ciblage s’applique aux nouvelles techniques mises en file via `queueTechnique`, et non aux effets déjà engagés ou aux saisies manuelles.
- La modification de l’approche après un pari incorrect doit intervenir au début de la phase Défendre et prendre à revers ; une autre chronologie nécessite l’arbitrage du MJ.
- Une véritable interface séparée et privée pour le MJ reste à concevoir.
