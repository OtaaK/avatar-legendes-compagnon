# V2.28 — changement de scène et effets persistants de Terre

- Nouvelle scène : révocation mécanique des effets de durée « scène » (bouclier, armure, étoile), au lieu de supprimer uniquement leurs fiches. Les statuts Gêné/Avantagé accordés par ces effets sont nettoyés lorsque leur dernière source disparaît.
- Les Entraves de métal ne sont pas libérées par le seul changement de scène : elles restent jusqu’à leur libération autorisée ou la fin du combat.
- La transition est une seule transaction annulable ; aucune entrée intermédiaire de l’historique n’est conservée.
- Préservation des sources de statut indépendantes et rollback en cas d’effet incohérent.
- Priorité aux 13 techniques de Terre, validation exhaustive encore en cours.
