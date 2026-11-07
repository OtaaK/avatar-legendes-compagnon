# V0.81 — Validation cohérente des engagements de Glissade

- Les propositions de rupture et de création d’engagements d’une même Glissade sont **indivisibles** : toutes acceptées ou toutes refusées.
- La fatigue et les états restent validables séparément, comme précédemment.
- Un refus partiel de la configuration de terrain déclenche une erreur explicite **avant toute mutation**, aussi bien dans la prévisualisation que dans la validation.
- La résolution conserve le contrôle du MJ et l’annulation.
- Ajout d’un test de régression autonome couvrant les deux engagements, la validation partielle et le retour arrière.
- Limites : cette version n’ajoute pas de technique avancée entièrement automatisée ; le compteur reste à 13/102. Tests navigateur interactifs non effectués.
