# Compagnon V0.39 — Synchronisation transactionnelle

La commande « Reporter les ressources du combattant vers sa fiche » utilise désormais `commitLibraryMutation`, comme les autres mutations de bibliothèque. Elle conserve la confirmation explicite et restaure la fiche en mémoire si la sauvegarde échoue ou si la synchronisation lève une erreur.

Ajout d’un fichier de tests isolés `test_sync_sheet_transaction.cjs` couvrant succès, échec de stockage, erreur métier et présence du garde transactionnel.

Limites : le navigateur réel n’a pas été validé ; la revue individuelle des techniques avancées reste à effectuer.
