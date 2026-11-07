# V2.23 — Provenance des statuts temporaires et techniques de Terre

- Corrige la provenance `external` des statuts de passe lorsqu’une source persistante de Terre (Entraves de métal, Bouclier de roche, Armure de terre, Étoile de lave) applique le même statut.
- Évite qu’une expiration de passe considère cette source mécanique comme un statut permanent autonome et laisse un statut fantôme.
- Préserve le marquage des véritables applications indépendantes de statut.
- Tests de régression dédiés : superposition, expiration, libération et annulation.
- Les 13 techniques de Terre restent en validation, sans certification exhaustive.
