# Avatar Légendes : Compagnon — V0.90

## Évolution

Ajout de `test_interface_glissade_v090.py`, test Chromium/Playwright qui manipule les contrôles HTML de l'application. Trois PNJ sont créés ; un engagement B–C est confirmé. Le PNJ A utilise **Glissade** pour déplacer B et proposer simultanément la rupture B–C et la création A–B.

Le test refuse un seul changement de terrain et vérifie que l'interface signale l'invalidité du lot sans mutation des engagements. Il accepte ensuite les deux changements, vérifie les engagements obtenus, puis annule et vérifie la restauration intégrale des engagements initiaux.

**Aucune modification du moteur ni de l'interface de production dans cette version** : il s'agit d'une extension de la couverture de régression.

## Contrôles

- 55 fichiers de tests Node.js : réussis.
- 5 scénarios Chromium/Playwright : réussis, y compris le nouveau scénario Glissade.
- `node --check` du JavaScript embarqué : réussi.
- Archive ZIP : intégrité contrôlée.

## Limites

Les tests Chromium utilisent `set_content` avec stockage local simulé. La persistance entre sessions n'est pas validée. La couverture des techniques avancées entièrement automatisées reste une estimation de **14/102**, non auditée.
