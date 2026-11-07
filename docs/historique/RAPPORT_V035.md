# V0.35 — Transactions sur les fiches

## Réalisé
- Les modifications de fiches passent par une transaction : copie de l'état, modification, écriture locale, restauration en mémoire en cas d'erreur.
- Couverture : création PJ par assistant, création PJ/PNJ rapide, sauvegarde de fiche, choix de livret, états, statuts et attribution de technique.
- Les noms des exports indiquent V0.35. Les clés de stockage restent inchangées pour la compatibilité.

## Tests
- 34 tests préexistants (intégration, règles, statuts, réactions, simultanéité, persistance).
- 5 nouveaux tests transactionnels.
- 39 tests exécutés avec succès, syntaxe de l'application validée.

## Limites et travaux à poursuivre
- La persistance après fermeture d'un navigateur réel n'est pas encore validée.
- La transaction restaure l'état en mémoire ; elle ne garantit pas que le stockage local soit fonctionnel si le navigateur refuse les écritures.
- Les interactions de combat et leurs sauvegardes nécessitent un audit transactionnel distinct.
- Les 102 techniques avancées restent à confronter individuellement aux règles officielles.
