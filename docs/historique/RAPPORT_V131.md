# Rapport de livraison V1.31

## Fonctionnalités
- **Souple comme un roseau** (Annexe A, p. 291) : coût 2 fatigues ; prédiction de l'approche adverse pour la prochaine passe, conservée dans un effet temporaire uniquement après approbation du MJ.
- Prédiction limitée aux trois approches reconnues, cible distincte, confirmation du MJ obligatoire.
- Les effets de coût et de note sont indivisibles à la validation. Annulation et expiration à la fin de la prochaine passe testées.
- **Limite assumée** : révélation de la prédiction, correction éventuelle de l'approche, avantage et impossibilité de cibler restent des décisions manuelles du MJ. La prédiction figure dans le libellé du repère temporaire et n'est donc pas secrète si l'écran du MJ est partagé.
- Test Chromium supplémentaire sur le cycle proposition → refus → proposition → approbation → annulation, et sur les contrôles du formulaire.
- Test de noms d'export JSON adapté à la version courante, pour éviter une régression artificielle après changement de version.

## Vérification
- 93 tests Node.js (test_*.cjs) : tous réussis.
- Syntaxe du JavaScript intégré : `node --check` réussi.
- `test_chromium_v131.py` : réussi, Chromium réel via Playwright.
- Chromium charge le HTML par `page.set_content` avec `localStorage` simulé ; **la persistance du navigateur après fermeture n'est pas validée**.

## Prochaines priorités
- Ajouter d'autres techniques par lot quand leurs interactions sont maîtrisées.
- Concevoir une vraie résolution du pari secret de Souple comme un roseau (révélation après choix des approches), sans fuite aux joueurs.
- Vérifier la persistance réelle sur un environnement sans blocage des navigations locales.
