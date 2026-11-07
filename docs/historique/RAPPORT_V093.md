# V0.93 — Collecter du matériel

- Technique **Collecter du matériel** (p. 293) : ajoute 3 matériels réservés au combattant et le statut Prêt, après validation MJ.
- Nouveau champ `materials` dans les combattants, avec valeur par défaut 0 et compatibilité des fiches anciennes dans l’application de l’effet.
- Prévisualisation, validation partielle et annulation prises en charge par le moteur transactionnel existant.
- **Limite :** le remplacement d’une fatigue par un matériel, ainsi que Maintenance et Puissance maximale, ne sont pas encore implémentés. Aucun automatisme de dépense n’est revendiqué.
- Test ajouté : `test_materiel_v093.cjs`.

- Le compteur de matériels est visible sur chaque carte de combattant.
- 57/57 fichiers de tests Node.js validés.
