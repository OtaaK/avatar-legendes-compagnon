# Audit et stabilisation V0.27

## Corrigé
- P0 : erreurs de `localStorage` auparavant silencieuses, désormais signalées par une alerte persistante.
- P1 : import de combat validé avant remplacement (phase, séquence, identifiants uniques, ressources, états, statuts, actions, propositions, historique).
- P1 : restauration complète vérifiant aussi les références des combattants vers les fiches.
- P1 : récupération au démarrage : recherche de clés plus anciennes en cas de JSON invalide ; message de récupération.
- P1 : échec de persistance lors d'un import : état mémoire antérieur restauré.
- P2 : fichiers exportés nommés V0.27, clés locales V0.20 maintenues pour compatibilité.

## Vérifié
- Syntaxe JavaScript `node --check`.
- 10 assertions ciblées sur la validation, les références, les erreurs de quota et la récupération.

## Reste à vérifier
- Test complet de l'interface sur téléphone et navigateur réel.
- Tests de bout en bout des flux de création, attribution, combat, synchronisation et export/import.
- Conformité mécanique des techniques : 102 effets structurés encore à documenter.
- Une transaction parfaite entre deux clés `localStorage` n'est pas garantie : conserver un export JSON externe.
