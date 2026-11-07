# V1.49 — Terre : Boue gluante (assistance partielle)

Source : Avatar Légendes, annexe A, p.289.

- Nouveau formulaire : MJ confirme les ennemis engagés ayant ciblé le lanceur durant la passe.
- Ces assaillants deviennent Gênés, avec validation atomique du lot.
- Rappel explicite de Frapper chaque ennemi enlisé à la prochaine passe, en supplément des techniques normales, indépendamment de l’approche. **Cette action différée reste manuelle** : pas de frappe gratuite automatisée, pas d’invention d’attaque.
- Pas de coût en fatigue ajouté : le texte de la technique n’en indique pas.
- Liste vide autorisée : aucun adversaire ne s’est enlisé.
- Les autres maîtrises restent gelées.

## Vérifications

- Test Node V1.49 : cas valides, engagement, confirmation MJ, cible distincte, doublons, effets et atomicité.
- 108/108 tests Node réussis ; syntaxe JS validée.
- Chargement Chromium vérifié ; interactions du nouveau formulaire non testées en navigateur.
