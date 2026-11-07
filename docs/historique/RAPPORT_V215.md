# Avatar Légendes : Compagnon — V2.15

## Correctif de combat transversal

L’expiration de plusieurs sources du même statut au même moment pouvait effacer un statut préexistant lorsque la source marquée `external` était examinée avant une autre source temporaire. La vérification porte désormais sur **toutes les sources expirantes du statut**, indépendamment de leur ordre.

## Scénarios vérifiés

- Gêné : sources simultanées avec et sans provenance extérieure, dans les deux ordres.
- Avantagé et Prêt : provenance extérieure et échéances successives.
- Suppression normale lorsque toutes les sources sont temporaires.
- Combat combinant Entraves de métal, expiration, libération et annulations.
- Régression de tous les tests historiques.

## Limites

L’intégration des 13 techniques de Terre ne constitue pas encore une certification exhaustive en combat réel.
