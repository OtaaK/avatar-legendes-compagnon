# V0.66 — Choix du protecteur lors des interceptions

La validation accepte désormais `decisions["protector:"+event.id]` pour sélectionner explicitement le combattant qui utilise **Protection**. Sans ce paramètre, le premier protecteur disponible reste choisi, pour compatibilité. Un protecteur déjà réservé pour une autre attaque dans la même validation ne peut pas intercepter deux fois. L’interface demande au MJ de choisir parmi les protecteurs lorsque plusieurs sont éligibles.

## Tests

Nouveau `test_protecteurs_v066.cjs` : choix du second protecteur, compatibilité, identifiant invalide, deux attaques avec deux protecteurs, réservation unique, prévisualisation et annulation. Les tests existants sont conservés.

## Limites

La sélection s'effectue par événement de la proposition ; en cas d'attaque multi-effets, choisir l'événement déclenchant l'interception. Les décisions narratives restent au MJ. Aucun test dans un navigateur réel.
