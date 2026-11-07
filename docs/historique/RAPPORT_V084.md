# V0.84 — Nouvelle technique et restauration des tests

## Fonctionnalité
- **Aveuglé par la science** (technologie, livre p. 293) : choix de 1, 2 ou 3 fatigues à investir ; cible distincte ; 1 fatigue et Gêné infligés à la cible ; à 2 fatigues, choix entre Piégé et Étourdi ; à 3 fatigues, les deux statuts.
- Formulaire de combat dédié et propositions d'effets validables individuellement par le MJ.
- Prévisualisation sans mutation et annulation après validation.

## Tests
- Restauration de 50 fichiers de tests historiques issus de la V0.78, en plus des 3 fichiers de la V0.83.
- Nouveau fichier `test_science_v084.cjs` (10 scénarios).
- **54/54 fichiers de tests Node.js réussis**, et contrôle `node --check` de la portion JavaScript réussi.
- Test Chromium en mode headless **non confirmé** : délai d'exécution dépassé. Aucun combat complet dans le navigateur n'est déclaré testé.

## Limites
- Le MJ reste responsable des décisions narratives et de la légalité du ciblage selon la fiction.
- Les effets sont des propositions distinctes : le MJ peut en refuser certains.
- Le compteur antérieur de 13 techniques avancées entièrement automatisées est porté **provisoirement à 14/102** en comptant cette technique aux trois paliers ; un audit exhaustif du catalogue reste à mener.
