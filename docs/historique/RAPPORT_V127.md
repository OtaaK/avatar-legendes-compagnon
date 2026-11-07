# V1.27 — Oscillations du vent et Chromium

Référence : Avatar Légendes, annexe A, p. 291.

## Technique intégrée
- **Oscillations du vent** : le moteur compte les ennemis engagés ayant choisi Avancer et attaquer, efface une fatigue par ennemi et réserve autant de points pour la passe suivante.
- Les points remplacent des coûts de fatigue propres aux techniques lorsque le personnage choisit Avancer et attaquer à la passe suivante ; ils expirent après cette passe.
- Confirmation explicite du MJ pour les approches/engagements ; validation groupée et annulation des dépenses.
- Pas d'inférence de portée, d'ennemis cachés ou de déclarations non enregistrées.

## Tests exécutés
- 89 scripts `test_*.cjs` : 89 réussis.
- `node --check` : syntaxe du JavaScript embarqué valide.
- `test_chromium_v127.py` : navigation, création de combattants, panneau Oscillations réussis sous Chromium.
- **Test HTTP local réel échoué** : `net::ERR_BLOCKED_BY_ADMINISTRATOR`. Repli sur `set_content` et stockage simulé. La persistance réelle du navigateur, les clics complets du MJ et l'import/export JSON restent à valider.
- Les scripts Chromium V1.25 et V1.26 ne sont pas comptabilisés comme réussis dans cette campagne ; le nouveau scénario V1.27 a été exécuté.

## Points de vigilance
- La réserve n'est visible que lors de la sélection d'une technique avec approche Avancer et attaquer ; les coûts propres à la posture restent à arbitrer selon les règles habituelles.
- La version est une livraison ciblée sur un effet différé complexe, pas un lot de quatre techniques ; la priorité suivante est d'élargir la couverture par lots et les tests UI complets.
