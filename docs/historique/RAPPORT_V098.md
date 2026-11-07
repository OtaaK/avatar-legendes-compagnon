# Rapport V0.98 — Sécurisation des transitions de scène

## Production
- Interdit de démarrer une nouvelle scène si une déclaration de posture ou un jet est déjà enregistré dans la passe en cours.
- Interdit la transition si des actions sont encore en attente, même en phase de déclaration ou de fin.
- Les contrôles existants (propositions, phase active) restent appliqués avant toute mutation.
- Le passage de scène conserve les ressources et permet l’annulation, sans modifier les règles de fin de passe.

## Tests
- Nouveau test Node `test_scene_guard_v098.cjs`.
- Nouveau test d’interface Chromium `test_interface_scene_v098.py` couvrant le vrai bouton, la confirmation, la conservation des ressources, la restauration d’équipement, la suppression des pièges, l’annulation et le blocage des déclarations.

## Limite
- La fin d’une scène ne purge pas automatiquement tous les effets temporaires : elle reste sous arbitrage MJ.
