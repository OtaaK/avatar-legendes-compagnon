# Avatar Légendes : Compagnon — V2.32

## Modifications
Les trois opérations de terrain (`setEngagement`, `clearEngagements`, `disengageFighter`) restaurent désormais intégralement le combat si le recalcul des Entraves de métal ou l’écriture de l’historique échoue. Les liens, les statuts, la provenance métallique, les instantanés et les actions précédentes sont préservés.

## Vérifications
Tests de régression sur six erreurs tardives et un parcours réussi avec plusieurs combattants et annulations. Les 13 techniques de Terre sont intégrées ; validation exhaustive encore en cours.
