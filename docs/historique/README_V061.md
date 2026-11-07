# Avatar Légendes : Compagnon V0.61

Ouvrir `simulateur.html` dans un navigateur moderne. Application autonome utilisable hors ligne.

La V0.61 corrige la résolution cumulative des attaques absorbées par *Se mettre à l'abri*, en particulier lorsque plusieurs attaques successives appliquent le même effet. Elle conserve les améliorations précédentes des interactions avec *Protection* et *Riposter*.

Tests : `node test_abri_cumul_v061.cjs` ou `for f in test_*.cjs; do node "$f"; done`.

Voir `RAPPORT_V061.md` pour les détails et limites.
