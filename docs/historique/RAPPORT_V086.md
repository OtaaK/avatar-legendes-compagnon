# Rapport V0.86 — Validation Chromium du moteur de combat

## Réalisé
- Nouveau test d'intégration `test_navigateur_v086.py` sous Chromium réel via Playwright, sans serveur externe.
- Scénario : deux PNJ, déclaration des approches, technique « Aveuglé par la science », prévisualisation, validation, vérification de la fatigue et du statut Gêné, journal, annulation.
- Aucun message d'erreur JavaScript durant ce test.
- Numéro de version du simulateur actualisé.

## Limites
- Le scénario utilise l'API CombatCore à l'intérieur de Chromium ; il ne pilote pas encore tous les contrôles graphiques par clics.
- Aucune nouvelle technique entièrement automatisée dans cette livraison : compteur provisoire inchangé, 14/102.
