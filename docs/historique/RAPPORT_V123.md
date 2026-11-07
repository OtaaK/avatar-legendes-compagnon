# V1.23 — Coussin d’air (maîtrise de l’Air)

Référence : *Avatar Légendes*, annexe A, p. 291 (vérification dans le PDF fourni).

## Fonctionnalités
- **Coussin d’air** : coût de 1 fatigue ; cible distincte confirmée comme allié à portée ayant subi une attaque pendant cette passe.
- Le MJ choisit entre effacer jusqu’à 2 fatigues, un état déjà coché ou un statut déjà présent.
- Interface dédiée : confirmation du contexte, choix du type d’effacement et sélection de l’état/statut.
- Coût et effet acceptés/refusés ensemble ; annulation restaure les valeurs précédentes.
- Audit : `air-coussin-dair` marqué `validee_v123`.

## Vérifications effectuées
- **86/86 scripts `test_*.cjs` réussis** avec Node.js, dont `test_air_v123.cjs`.
- **Syntaxe JavaScript embarquée vérifiée** avec `node --check`.
- **Aucun test Chromium / navigateur réel exécuté** pour cette version.

## Limites
- Le simulateur ne sait pas établir automatiquement la portée, l’alliance ou la réalité d’une attaque subie durant la passe : le MJ doit confirmer ces préconditions.
- La suppression d’un statut n’efface pas une cause narrative qui pourrait le rétablir ; arbitrage du MJ.

## Suite
- Vérifier l’interface dans un navigateur réel et poursuivre les techniques de l’Air restantes.
- Actualiser le dossier de reprise et conserver les archives de version.
