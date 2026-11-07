# V0.75 — Fiabilité des engagements

- Correction : déclarer un engagement déjà actif, ou désengager deux combattants déjà libres, ne crée plus d’entrée d’historique ni de snapshot d’annulation.
- Le contrôle est symétrique : déclarer B–A après A–B ne duplique pas la liaison.
- Les changements réels restent transactionnels et annulables. Les propositions en attente interdisent toujours la modification du terrain.
- L’en-tête du simulateur indique désormais V0.75 (il était resté à V0.68).
- Six nouveaux scénarios de régression ; tests Node.js et contrôle de syntaxe à exécuter.
- Limite : la distance et les positions restent déclarées par le MJ ; aucune nouvelle technique avancée entièrement automatisée.
