# V1.24 — Premier lot de techniques de maîtrise de l’Air

Référence : *Avatar Légendes*, annexe A, p. 291, PDF fourni.

## Intégrations
- **Cône d’air** : 1 fatigue pour le lanceur, 1 fatigue par allié participant confirmé à portée, 2 fatigues infligées à une cible par allié participant. Choix explicite des participants, contrôle des doublons et de la cible ; validation groupée et annulation.
- **Onde de choc** : 2 fatigues pour le lanceur, sélection explicite des autres personnages dans la zone, résistance individuelle (4 fatigues) ou statut Étourdi, rupture des engagements impliquant les personnages touchés et note de projection narrative. Validation groupée et annulation.
- Catalogue/audit : les deux entrées passent à `validee_v124`. Interface dédiée et matrice actualisée.

## Vérifications
- 87 scripts `test_*.cjs` réussis avec Node.js, dont `test_air_v124.cjs`.
- Syntaxe JavaScript du script embarqué vérifiée avec `node --check`.
- Test de navigateur réel non exécuté.

## Limites et arbitrages
- Le MJ confirme la portée, les participants et la composition de la zone : aucun placement spatial n’est inféré.
- Le lanceur d’Onde de choc est traité comme l’origine de l’onde, non comme une cible de son propre effet ; cette interprétation est à confirmer à la table si nécessaire.
- Les personnages repoussés ne reçoivent pas de coordonnées fictives.
- L’interface permet la sélection manuelle des personnages ; le MJ doit s’assurer qu’aucun personnage présent dans la zone n’a été omis.

## Suite
- Continuer par lots, en ciblant les techniques restantes de l’Air : Amortir le poing rageur, Sphère d’air, Souple comme un roseau, Vague d’air, Oscillations du vent.
- Vérifier le fonctionnement en navigateur réel et les scénarios multi-combattants.
