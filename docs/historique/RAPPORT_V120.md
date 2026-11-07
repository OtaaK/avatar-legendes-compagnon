# V1.20 — Deux techniques de maîtrise de l'Air

Référence : *Avatar Légendes*, annexe A, p. 291.

- **Tourbillon miniature** : coût de 3 fatigues ; la cible devient Gênée et Étourdie. Le moteur soumet les trois événements ensemble au MJ.
- **Souffle du vent** : choix explicite de la cible entre cocher 4 fatigues ou devenir Étourdie ; un événement narratif rappelle le renversement sans imposer de coordonnées ni de déplacements fictifs.
- Interface : choix visible pour Souffle du vent et description du coût de Tourbillon miniature.
- Transactions : refus/acceptation groupés, annulation compatible avec l'historique.

## Vérifications
- 83 fichiers de tests Node.js exécutés avec succès, dont `test_air_v120.cjs`.
- Syntaxe JavaScript embarquée vérifiée avec `node --check`.
- Aucun test Chromium exécuté pour cette version.

## Limites
- Le placement exact d'une cible renversée reste à l'appréciation du MJ.
- Les statuts de ces deux techniques ne sont pas temporaires selon les descriptions de la p. 291 ; ils ne sont donc pas ajoutés au mécanisme d'expiration de V1.19.
