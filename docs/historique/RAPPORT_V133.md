# Rapport V1.33 — Sécurisation de la résolution de Souple comme un roseau

## Modification
- La résolution du pari n’est désormais autorisée qu’en phase **Défendre et prendre à revers**, après révélation des approches.
- Si une technique a déjà été engagée pendant la passe, la résolution est refusée **sans mutation de l’état**. Cela évite que la protection de ciblage soit activée trop tard, alors qu’une attaque adverse est déjà en file.
- Le refus n’altère pas le pari ; le MJ peut corriger la chronologie ou arbitrer manuellement.
- Le test `test_air_v133.cjs` vérifie le refus tardif, l’absence d’effets partiels et la protection lorsque la résolution est faite à temps.

## Vérifications
- 95/95 scripts Node.js réussis.
- 8/8 scripts Chromium réussis avec stockage simulé.
- Syntaxe JavaScript vérifiée avec Node.js.
- Archive ZIP vérifiée.

## Limites
- La protection reste appliquée aux nouvelles techniques mises en file, pas aux modifications manuelles ou aux imports arbitraires.
- La confidentialité des prédictions dans les exports JSON n’est pas garantie.
- La persistance du navigateur après fermeture n’a pas été testée.
