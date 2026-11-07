# V1.28 — Amortir le poing rageur et vérifications Chromium

Source : Avatar Légendes, annexe A, p. 291, texte extrait du livre fourni.

## Développement
- Ajout de la proposition de **Amortir le poing rageur** : 2 fatigues et statut Avantagé, groupés pour acceptation/refus MJ et annulation.
- Confirmation MJ obligatoire dans le panneau de technique.
- **Automatisation partielle** : immunité aux attaques physiques puissantes/vigoureuses et projections, jusqu’à la fin de la passe suivante, décrite dans une note. La détection des attaques admissibles et l'expiration de l'immunité **ne sont pas automatisées**. L'audit reste donc « non_validee ».
- Aucun changement de la logique de sauvegarde.

## Vérifications réellement exécutées
- 90 scripts Node.js sur 90 réussis, incluant `test_air_v128.cjs`.
- Vérification syntaxique du JavaScript embarqué par `node --check` : réussie.
- `test_chromium_v128.py` : ouverture du rendu, navigation, création de personnages, affichage et confirmation de la technique : réussis.
- Chromium bloque toujours `file://` et les navigations HTTP locales dans cet environnement ; le test utilise `page.set_content` et un stockage simulé. **Pas de preuve de persistance réelle, de clics complets MJ ou d'import/export JSON.**

## Suite
- Compléter le cycle d'immunité de la technique sans inventer de règles ; automatiser expiration et tests Chromium de validation MJ.
- Poursuivre les techniques de l'Air par lots et revoir les données d'audit historique.
