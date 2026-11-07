# V1.68 — Détection du pas lourd : annulation nominative

L’interruption sismique peut maintenant désigner une action ennemie **en attente** de la passe courante. Si l’adversaire choisit l’annulation, cette action est marquée comme annulée et `CombatCore.propose` interdit sa résolution ultérieure. La confirmation MJ, la fatigue et la dépense de Prêt sont atomiques et annulables. Le panneau MJ propose les identifiants d’actions non résolues ; une annulation narrative sans identifiant reste possible.

Une technique déjà inscrite dans l’historique ne peut pas être annulée rétroactivement. Les propositions déjà en attente doivent toujours être résolues avant l’interruption. Ce mécanisme ne modifie pas le traitement des autres techniques de Terre.
