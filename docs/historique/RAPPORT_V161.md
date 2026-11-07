# V1.61 — Sécurisation des effets mécaniques de Terre

- Retirer génériquement un Bouclier de roche déclenche désormais sa révocation complète, y compris le statut Gêné et ses autres sources.
- Retirer génériquement une Armure de terre met à jour Avantagé sans effacer les autres sources connues.
- Le bouton Retirer sauvegarde atomiquement et restaure l’état en cas d’échec de localStorage.
- L’éditeur générique ne peut plus changer l’identité des effets mécaniques Terre et contourner ces règles.
- Tests Node et parcours Chromium interactif dédiés.
