# V0.55 — Résolution atomique des interceptions

- Protection : l'interception couvre tous les effets fatigue/état/équilibre de la même attaque (`actionId` et cible), pour un seul coût de 1 fatigue.
- La réaction n'est consommée qu'à la validation ; la prévisualisation et une erreur de fatigue excédentaire ne la consomment pas.
- Une protection ne peut intercepter qu'une attaque par passe ; l'annulation restaure sa disponibilité.
- Cinq scénarios de régression supplémentaires ; aucune nouvelle technique avancée déclarée entièrement validée (8/102).
- Limites : la réussite, la portée, le regroupement des événements sous une même attaque et les décisions narratives restent sous contrôle du MJ. Aucun essai en navigateur réel.
