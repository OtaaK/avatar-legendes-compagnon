# Avatar Légendes : Compagnon — V1.05

## Fonctionnalité
- Modification d'un effet temporaire actif : description et durée.
- Conservation de la cible et de l'origine de l'effet.
- Validation des saisies, refus des modifications avec actions en attente, annulation par snapshot.
- Une modification identique ne produit ni snapshot ni événement d'historique.
- Ajout d'un bouton « Modifier » et adaptation du test navigateur de retrait existant.

## Vérifications
- 68 scripts de tests Node.js réussis.
- Chromium : `test_interface_effects_v103.py`, `test_interface_edit_v105.py` et `test_interface_scene_v098.py` réussis.
- Syntaxe JavaScript vérifiée avec `node --check`.
- ZIP vérifié à l'assemblage.

## Limites
- L'édition de l'origine d'un effet n'est pas encore proposée.
- Les repères narratifs ne modifient pas automatiquement les règles mécaniques.
