# V0.58 — Riposter : seuls les effets réellement subis déclenchent la réaction

## Correctif

- Une condition déjà cochée ne provoque plus de riposte supplémentaire.
- Un décalage d’équilibre nul ou bloqué à une extrémité ne provoque plus de riposte.
- Un événement de fatigue de montant nul ne provoque plus de riposte.
- Les effets réels (nouvel état, fatigue positive, décalage effectif) continuent de déclencher la réaction, après Protection et Se mettre à l’abri.
- Prévisualisation et annulation conservées.

## Limites

Le moteur travaille sur les événements mécaniques validés par le MJ. Les attaques purement narratives et les choix de portée restent à arbitrer. Les effets simultanés multiples sont encore évalués à partir de l’état initial pour déterminer si une riposte est justifiée : une consolidation par état intermédiaire serait une amélioration ultérieure.

## Vérification

Exécution des fichiers `test_*.cjs`, contrôle syntaxique du JavaScript extrait et intégrité ZIP. Aucun test de navigateur réel.
