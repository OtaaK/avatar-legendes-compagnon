# V2.11 — Cohérence des sources de Gêné

Bouclier de roche : la révocation manuelle et la consommation après validation ne retirent plus Gêné si un statut temporaire encore actif ou des Entraves de métal en cours constituent une autre source. Les contrôles reposent sur les sources mécaniques présentes, même lorsque les indicateurs de provenance d’une sauvegarde ancienne sont incomplets.

Nouveau test `test_terre_v211.cjs` : révocation avec statut temporaire, révocation avec entraves, libération des entraves, consommation, expiration, annulation.

Tests automatisés : 169/169.

Limite : tests de chargement navigateur distincts d'un parcours de combat interactif complet.
