# V1.54 — Réserve d’Armure de terre

- La validation de l’activation crée une réserve persistante de **3 points** dans les effets temporaires.
- Deux boutons MJ permettent de dépenser 1 point pour annuler **1 état** ou **2 fatigues**. L’opération est historisée, annulable par Undo et sauvegardée transactionnellement dans le navigateur.
- Une activation refusée ne crée aucune réserve. La réserve atteint zéro puis disparaît ; un message indique de retirer Avantagé **après vérification des autres sources**.
- Limite explicite : les dégâts annulés ne sont **pas** automatiquement interceptés dans le moteur ; le MJ doit effectuer la dépense avant d’appliquer les dégâts. Une dépense correspond à un bloc de protection de la règle p. 289, pas à une annulation rétroactive de dégâts.
- La Terre reste en développement : effets réactifs de Bouclier de roche et d’autres techniques à terminer.
