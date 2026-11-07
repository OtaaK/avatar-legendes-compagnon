# V1.62 — Expiration des statuts et protections persistantes

Correction de la fin de passe : un statut Gêné ou Avantagé dont la durée initiale expire ne peut plus être supprimé si un Bouclier de roche ou une Armure de terre le maintient. La protection récupère alors la responsabilité du statut et le retire lors de sa propre disparition. Test de non-régression sur expiration ordinaire, révocation et annulation.
