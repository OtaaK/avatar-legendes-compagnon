# V1.81 — Transition de passe annulable

La commande « passe suivante » enregistre maintenant une photographie de l’état avant transition, après validation des états requis pour En danger. La transition produit une entrée d’historique `next_round`, réversible par Annuler. Les extinctions d’étoile non entretenue, expirations des effets, réinitialisations de phase et fatigue/états En danger sont restaurés ensemble.

Limite : la transition ne rend pas automatiques les protections d’Armure de terre lors de toutes les attaques.
