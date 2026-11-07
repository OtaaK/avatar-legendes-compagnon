# V1.26 — Lot Air et vérification Chromium renforcée

## Techniques ajoutées (annexe A, p. 291 ; descriptions de la matrice du projet)
- **Vague d’air** : mode déviation d'une attaque (1 fatigue, note narrative) ou mode rafale de fin de passe (2 fatigues à 1–3 ennemis, sans coût indiqué dans la matrice). Le MJ confirme les circonstances ; le moteur ne déduit pas les attaques ennemies ni la portée.
- **Sphère d’air** : statut Avantagé lorsque la sphère est maintenue. Sacrifice pour annuler une fatigue ou un état d'attaque laissé manuel au MJ : pas de protection automatique ou de durée inventée.
- Validation groupée des événements, annulation et tests spécifiques.

## Vérifications réellement exécutées
- Node.js : 88 scripts `test_*.cjs`, 88 réussis.
- Chromium/Playwright : deux scénarios réussis (`test_chromium_v125.py` adapté au titre et `test_chromium_v126.py`). Le second teste les options visibles des nouvelles techniques et un cycle de proposition/validation/annulation dans le moteur chargé dans Chromium.
- `node --check` sur le JavaScript embarqué : réussi.
- Les tests Chromium utilisent `set_content` et un stockage mémoire simulé : **la persistance locale réelle, les clics complets d'approbation MJ et les parcours de sauvegarde JSON ne sont pas validés**. Dans le second scénario, les nouvelles techniques sont injectées dans le sélecteur pour tester leur panneau d'options ; cela ne valide pas leur disponibilité selon la maîtrise d'un personnage.

## Suite
- Vérifier les interactions complètes d'approbation MJ par clics et les sauvegardes sur une origine réelle.
- Continuer les techniques de l'Air à effets différés, notamment Oscillations du vent, après étude des mécanismes de report.
