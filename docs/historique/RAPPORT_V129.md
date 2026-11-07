# V1.29 — Repère d'immunité Amortir le poing rageur

Référence : Avatar Légendes, annexe A, p. 291, technique Amortir le poing rageur.

## Modifications
- Création automatique d'un repère temporaire **après validation groupée du MJ**, lié à l'action de technique.
- Durée du repère : jusqu'à la fin de la passe d'armes suivante (`expiresAfterRound = round + 1`).
- Annulation de la validation retire le repère. Un refus partiel groupé n'en crée aucun.
- Conservation des repères de fin de passe historiques ; l'exception de durée est limitée aux repères dotés d'une échéance explicite.
- Aucune immunité aux dégâts calculée automatiquement : la qualification des attaques reste arbitrée par le MJ.
- Correction du titre V1.29 et de l'étiquette « Effets assistés » pour deux techniques récentes.

## Vérifications exécutées
- 91 scripts `test_*.cjs` sur 91 réussis (dont `test_air_v129.cjs`).
- Vérification `node --check` du JavaScript embarqué : réussie.
- Chromium : `test_chromium_v129.py` réussi (rendu, navigation, création, sélection et confirmation de la technique).
- Intégrité ZIP vérifiée.

## Limites
- Le scénario Chromium ne teste pas les clics complets de validation/refus du MJ : ce parcours est testé au niveau moteur par Node.js.
- La persistance réelle du stockage après fermeture, l'import/export JSON et la navigation directe `file://` restent non validés sous Chromium.
- Aucun nouveau lot de plusieurs techniques n'a été intégré dans cette livraison ; priorité future.
