# V0.79 — Glissade et Charge

- Glissade : saisie des nouvelles paires d’engagements dans le formulaire de la technique, propositions validables individuellement par le MJ, prise en compte des résistances, contrôle des paires et des doublons.
- Charge : crée l’engagement entre le lanceur et sa cible lorsqu’il n’existe pas déjà.
- Le graphe d’engagement reste sans coordonnées fictives ; prévisualisation, validation et annulation sont conservées.
- Limite : une validation partielle des ruptures et créations peut produire un terrain narrativement incohérent ; le MJ arbitre chaque effet.
- Les tests en navigateur réel restent à réaliser.

## Vérifications
- 51 fichiers `test_*.cjs` : tous réussis, dont 10 nouveaux scénarios.
- Vérification syntaxique Node.js : réussie.
- Chromium headless via Playwright `set_content` : interface chargée sans erreur JavaScript ; navigation `file://` bloquée par l'environnement de test.
- Test de bout en bout des interactions Glissade en navigateur : non réalisé.
