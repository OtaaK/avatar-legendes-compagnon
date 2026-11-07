# V1.99 — Armure de terre : dépense automatique minimale unique

- Correction de la résolution implicite des attaques mixtes : en l’absence de choix MJ, **un seul point** de réserve est dépensé pour l’ensemble de l’attaque, même avec fatigue et état(s).
- Priorité par défaut à l’absorption de 2 fatigues, puis au premier état si l’attaque ne contient pas de fatigue.
- Une allocation explicite du MJ peut toujours dépenser davantage, selon les points disponibles.
- Trois nouveaux scénarios : attaque mixte, événements inversés, plusieurs états ; vérification de l’annulation.
- Reste à auditer : décisions MJ sur plusieurs attaques simultanées et interactions entre protections.
