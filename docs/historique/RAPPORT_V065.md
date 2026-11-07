# V0.65 — Protection et attaques sans effet

## Changement

La réaction **Protection** ne consomme plus 1 fatigue et ne devient plus utilisée lorsque l'attaque proposée ne produit aucun effet hostile mécanique : fatigue nulle, état déjà coché ou déplacement d'équilibre bloqué à sa limite. La décision d'interception examine l'ensemble des événements d'une même attaque (`actionId` + cible), y compris lorsque le premier effet est nul mais qu'un effet ultérieur est réel.

## Tests

Nouveau fichier `test_protection_v065.cjs` : six scénarios (fatigue nulle, état déjà coché, équilibre saturé, attaque multi-effets, attaques successives, prévisualisation et annulation). Les tests antérieurs sont conservés.

## Limites

La réussite de l'attaque, sa portée et les effets purement narratifs restent arbitrés par le MJ. Les interactions les plus complexes entre plusieurs attaques simultanées et plusieurs protecteurs ne sont pas intégralement automatisées. Tests Node.js sans validation dans un navigateur réel.
