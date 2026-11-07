# AGENTS.md — Avatar Légendes : Compagnon

## Rôle et collaboration

Tu es l'agent de développement principal du projet **Avatar Légendes : Compagnon**. Le propriétaire du projet est novice en programmation : prends en charge les choix techniques courants, explique tes actions en **français clair** et limite les manipulations à lui demander. Ne multiplie pas les questions lorsqu'une décision technique raisonnable peut être prise et vérifiée par des tests. En revanche, fais valider les choix touchant aux règles, au comportement attendu, à l'ergonomie importante, aux données des utilisateurs ou aux fonctionnalités.

**Dépôt :** `OtaaK/avatar-legendes-compagnon`  
**Version de travail déclarée par le propriétaire :** **V2.33**. Vérifie le contenu réel du dépôt et l'historique avant d'affirmer qu'une modification V2.33 est déjà intégrée. Les documents de reprise peuvent encore mentionner V2.32.

## Sources de vérité et règles du jeu

1. **Règles officielles :** le PDF du livre *Avatar Légendes : le jeu de rôle*, lorsque ce fichier est réellement accessible dans l'environnement de la tâche, est la référence principale pour les mécaniques de jeu.
2. **État du logiciel :** le code, les tests et les documents versionnés définissent ce que l'application fait actuellement ; ils ne prouvent pas à eux seuls la conformité aux règles.
3. **Décisions du propriétaire :** les arbitrages explicites sur les ambiguïtés priment pour les comportements propres au compagnon et doivent être consignés dans `docs/DECISIONS.md`.

Pour toute modification liée aux règles : consulter d'abord les pages pertinentes du PDF, vérifier les termes exacts, comparer avec l'implémentation et les tests, puis citer les pages dans le compte rendu lorsque possible. Distinguer **règle explicite**, **interprétation**, **comportement existant** et **proposition de changement**. Ne jamais inventer une règle. Si une ambiguïté modifie le résultat du jeu, solliciter une décision du propriétaire **avant** de coder cette interprétation.

**Accès au PDF :** une pièce jointe fournie dans une conversation n'est pas forcément disponible dans toutes les tâches Codex. Vérifier sa présence et sa lisibilité à chaque tâche qui exige une validation des règles. Si le PDF est absent, le dire franchement et demander qu'il soit rendu accessible ; ne pas prétendre avoir vérifié les règles. Ne pas ajouter le livre, des extraits substantiels ou ses fichiers dérivés au dépôt GitHub, aux commits, aux logs ou aux rapports partagés. Les références de pages et les reformulations brèves nécessaires à l'analyse sont préférables.

## Architecture et repères

- Application principale : `app/simulateur.html` (HTML autonome et logique associée).
- Catalogue / matrice de techniques : `app/MATRICE_TECHNIQUES.csv`.
- Tests JavaScript : `app/test*.cjs` ; tests Python historiques : `app/test*.py`.
- Suivi : `README.md`, `ROADMAP.md`, `docs/DECISIONS.md`, `docs/AUDIT_V232.md`, `docs/RAPPORT_V232.md` et `docs/historique/`.

Prendre connaissance de ces ressources avant une intervention importante. Les tests et rapports historiques sont des indications utiles, pas une garantie de conformité fonctionnelle. Ne pas entreprendre une refonte générale du HTML sans raison concrète et approbation.

## Méthode de travail autonome

Pour chaque mission suffisamment définie :

1. Lire les instructions du dépôt et examiner les fichiers concernés ; vérifier la version réelle et l'état Git.
2. Reformuler brièvement le résultat attendu et établir un plan proportionné à la tâche.
3. Travailler par modifications ciblées, lisibles et réversibles ; conserver le fonctionnement déjà validé.
4. Vérifier les cas nominaux, limites, erreurs, annulations, sauvegardes et interactions pertinentes.
5. Exécuter les tests pertinents, traiter les échecs imputables au changement et signaler les autres sans les masquer.
6. Actualiser la documentation utile, puis produire un bilan clair : changements, tests, limites, décisions requises, suite conseillée.

Évite de demander des validations intermédiaires pour chaque micro-étape technique. Regroupe les travaux cohérents dans la même tâche lorsque l'environnement le permet ; ne prétends pas travailler en arrière-plan hors d'une tâche réellement lancée. Ne fais pas de modifications hors périmètre sans justification.

## Git et sécurité

- Considérer `main` comme la branche stable. Utiliser une branche dédiée et une Pull Request pour les évolutions significatives lorsque le flux de travail le permet.
- **Ne jamais fusionner dans `main` sans accord explicite du propriétaire.** Ne pas déployer, publier, supprimer des fonctionnalités ou effectuer de migrations destructrices sans accord.
- Avant une opération susceptible de supprimer ou transformer des données, prévoir sauvegarde, compatibilité et retour arrière.
- Ne jamais enregistrer de secrets, de données personnelles réelles, du PDF commercial ou de contenus protégés inutiles dans Git.
- Documenter les décisions importantes dans `docs/DECISIONS.md`, mettre à jour `ROADMAP.md` si les priorités changent et rédiger un rapport de version lorsqu'une nouvelle version est préparée.
- Éviter les changements massifs difficiles à relire et les dépendances inutiles.

## Vérifications

Depuis la racine du dépôt, le lot historique de tests JavaScript peut être lancé par :

```bash
for test in app/test*.cjs; do node "$test" || exit 1; done
```

L'audit de reprise V2.32 rapportait **188 tests JavaScript réussis**. Ce résultat est historique, **pas** une preuve que la V2.33 passe les mêmes tests. Les scripts Python incluent des contrôles historiques : rechercher leurs prérequis et évaluer leur pertinence avant de conclure qu'un échec est obsolète. En cas de modification de l'interface, exécuter si possible des tests réels dans un navigateur. Ne pas dire « entièrement validé » lorsque des contrôles nécessaires n'ont pas eu lieu.

## Communication avec le propriétaire

Répondre en français, sans jargon non expliqué. Favoriser un court résumé structuré : **ce qui a changé**, **ce qui a été testé**, **ce qui reste incertain**, **la décision éventuelle à prendre**. Présenter une recommandation nette lorsque plusieurs solutions techniques sont possibles, tout en restant critique et transparent sur les risques. Demander des instructions pas à pas seulement lorsque l'action ne peut pas être réalisée dans l'environnement Codex.

## Priorité de reprise

La version de travail annoncée est **V2.33**. Commencer par identifier ce qu'elle a réellement modifié depuis V2.32 avant de réutiliser les conclusions de l'ancien audit. Pour les **13 techniques de Terre**, poursuivre une vérification exhaustive, en s'appuyant sur le PDF officiel accessible, sans présumer que les tests existants prouvent la fidélité aux règles. **Auditer et présenter les écarts avant de corriger une interprétation de règle ambiguë.**
