# V1.46 — À contretemps : arbitrage en cas d’adversaire incapable de déclarer

- Ajout de `waiveCountertime` : décision explicite et journalisée du MJ, uniquement si l’adversaire n’a pas déclaré et est Étourdi ou Piégé pendant la passe suivante.
- L’effet est marqué comme renoncé, **sans inventer d’approche adverse**. Le bénéficiaire peut ensuite choisir son approche ; la passe peut être révélée.
- La révélation normale reste obligatoire si l’adversaire a déclaré une approche. L’adversaire n’est pas verrouillé lorsqu’aucune approche n’a été révélée.
- Bouton d’arbitrage conditionnel dans les effets temporaires, confirmation du MJ, historique et annulation.
- Test `test_armes_v146.cjs` : refus hors condition, confirmation, absence de mutation, arbitrage, reprise, annulation, voie normale.

## Limites
La renonciation n’est pas une règle automatique du livre : c’est une décision explicite du MJ pour résoudre un blocage logiciel. La persistance réelle après fermeture du navigateur et l’ensemble des tests Chromium historiques ne sont pas certifiés.
