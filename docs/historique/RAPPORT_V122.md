# V1.22 — Boulet de canon (maîtrise de l'Air)

Référence : *Avatar Légendes*, annexe A, p. 291.

## Implémentation
- **Boulet de canon** : cible distincte non déjà engagée avec le lanceur ; coût de 1 fatigue ; rupture de tous les engagements précédents du lanceur ; nouvel engagement avec la cible ; application d'un état choisi parmi les états existants.
- Interface : sélecteur de l'état et explication des contraintes.
- Les quatre types d'effets (fatigue, désengagement, engagement, état) doivent être acceptés ou refusés **ensemble** par le MJ.
- Annulation : restauration de la fatigue, de l'état et des engagements antérieurs.
- Audit des techniques : `air-boulet-de-canon` marqué `validee_v122`. Les tests d'audit historiques ont été adaptés pour tenir compte de cette validation.

## Vérifications effectuées
- **85/85 scripts `test_*.cjs` réussis** avec Node.js, y compris `test_air_v122.cjs`.
- **Syntaxe JavaScript embarquée valide** (`node --check`).
- Archive ZIP : intégrité à vérifier à la livraison.
- **Tests Chromium / vérification visuelle non exécutés**.

## Limites
- Les déplacements physiques et la portée restent sous arbitrage du MJ ; les engagements sont ceux enregistrés dans le simulateur.
- Le choix de l'état doit refléter la fiction et les règles ; aucun état n'est choisi automatiquement.
- L'intégration des autres techniques de l'Air reste à poursuivre.

## Suite recommandée
- Étudier et intégrer une technique de l'Air supplémentaire, en privilégiant des effets clairement vérifiables.
- Réaliser une campagne de tests dans un navigateur réel et préserver les sauvegardes, le hors-ligne et l'annulation.
