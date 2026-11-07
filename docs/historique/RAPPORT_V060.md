# V0.60 — Abri et effets réellement efficaces

## Correction

La technique **Se mettre à l’abri** ne consomme plus son usage sur une attaque entièrement sans effet : fatigue nulle, état déjà coché, équilibre saturé ou statut déjà présent. Les statuts hostiles bloqués par **Fort comme un chêne** ne consomment pas non plus l’abri. Une attaque multi-effets dont le premier effet est nul mais un effet suivant est réel est entièrement absorbée.

## Tests

Sept nouveaux scénarios dédiés ; tous les anciens scénarios sont conservés. Contrôles automatisés JavaScript, sans navigateur réel.

## Limites

Le MJ détermine la réussite de l’attaque et si l’abri est endommagé ou détruit. La modélisation cumulative des attaques simultanées reste une approximation pour les cas où plusieurs protections et changements d’état se combinent dans une même validation.
