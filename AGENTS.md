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
- Catalogue / matrice de techniques : `data/MATRICE_TECHNIQUES.csv`.
- Tests JavaScript : `tests/js/test*.cjs` ; tests navigateur Python : `tests/browser/test*.py`.
- Commande commune : `python scripts/test.py` ; chemins communs : `tests/support/paths.cjs` et `tests/browser/_paths.py`.
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
python scripts/test.py --suite js
```

L'audit de reprise V2.32 rapportait **188 tests JavaScript réussis**. Ce résultat est historique, **pas** une preuve que la V2.33 passe les mêmes tests. Les scripts Python incluent des contrôles historiques : rechercher leurs prérequis et évaluer leur pertinence avant de conclure qu'un échec est obsolète. En cas de modification de l'interface, exécuter si possible des tests réels dans un navigateur. Ne pas dire « entièrement validé » lorsque des contrôles nécessaires n'ont pas eu lieu.

## Communication avec le propriétaire

Répondre en français, sans jargon non expliqué. Favoriser un court résumé structuré : **ce qui a changé**, **ce qui a été testé**, **ce qui reste incertain**, **la décision éventuelle à prendre**. Présenter une recommandation nette lorsque plusieurs solutions techniques sont possibles, tout en restant critique et transparent sur les risques. Demander des instructions pas à pas seulement lorsque l'action ne peut pas être réalisée dans l'environnement Codex.

## Orientation active — convergence vers v0 (8 novembre 2026)

Décision du propriétaire : `OtaaK/avatar-legendes-ui` devient la référence visuelle,
de navigation et d’organisation des écrans. `OtaaK/avatar-legendes-compagnon`, en tenant
compte des PR nº 3 à 10 et des corrections suivantes, reste la référence des comportements
métier, des données, des sauvegardes et des tests. Ne plus poursuivre par défaut la
reproduction du design v0 dans le HTML historique.

La préparation est décrite dans `docs/migration/FAISABILITE_CONVERGENCE_V0.md`, les contrats
proposés dans `docs/migration/CONTRATS_CIBLES.md` et les références inspectées dans
`docs/migration/SOURCES.json`. Le propriétaire a validé le plan, les sept lots, React/TypeScript/Vite, le dépôt principal
unifié et les références initiales : métier `a9079fa5b1babc560ee11a8d28430504df8704fc`,
v0 corrigé `8b8924de34949d5bdf20bc6ea7ec53be59da28e0`.
Le lot 1 est autorisé sur `convergence/react-v0` : architecture, extraction contrôlée,
contrats/parité, shell/navigation et prototype HTML portable. Voir
`docs/migration/BILAN_LOT_1.md` et `MATRICE_FONCTIONNELLE.md`.
Le propriétaire a validé le lot 1 après essai sur Mac et autorisé le lot 2 Personnages/
ressources, sur branche dépendante dédiée. Préserver le v0 corrigé et le métier Codex.
Le propriétaire autorise désormais le lot indépendant Bibliothèque de techniques, dépendant
du lot 2 (PR 13). Branche : `convergence/bibliotheque-techniques`. Inventaire 111, recherche
par nom et filtres par boutons, cartes 3 informations, modales 4 informations, lecture seule.
Aucune maîtrise, attribution ou commande de combat. Aucun autre lot sans accord.
Les droits de reproduction des descriptions intégrales ne sont pas établis : aucun PDF ni
texte intégral dans Git ou les artefacts distribués. Chargement privé explicite séparé des
sauvegardes. Matrice source sans texte dans `docs/reference/CONTROLE_TECHNIQUES_PDF.json`.
Les améliorations ergonomiques PJ/PNJ sont un chantier futur distinct, pas une condition
bloquante de la bibliothèque. **Attendre l’accord après ce lot avant le lot suivant.**
Les réserves v0 (focus PJ, onglets PJ, petits textes, responsive métier) sont suivies dans
la matrice ; ne pas annoncer leur résolution sur des écrans non encore intégrés.

Conserver le moteur et ses règles ; extraire/adapter les frontières plutôt que réécrire.
Ne pas promouvoir les données, validations simplifiées ou interactions fictives de v0
en logique de jeu. Ne pas réutiliser son format de démo pour les sauvegardes réelles.
Préserver les branches, PR, anciennes versions et tests utiles ; ne pas déployer ni
fusionner dans main sans accord explicite. Figer le SHA v0 corrigé par lot, car son dépôt
peut continuer à recevoir des modifications. Ne pas modifier directement son main.

## Priorité de reprise

La version de travail annoncée est **V2.33**. Commencer par identifier ce qu'elle a réellement modifié depuis V2.32 avant de réutiliser les conclusions de l'ancien audit. Pour les **13 techniques de Terre**, poursuivre une vérification exhaustive, en s'appuyant sur le PDF officiel accessible, sans présumer que les tests existants prouvent la fidélité aux règles. **Auditer et présenter les écarts avant de corriger une interprétation de règle ambiguë.**

## Vérifications de la convergence

- `packages/domain/src` contient les corps métier extraits de l'oracle ;
  `node scripts/convergence/extract-domain.mjs --check` contrôle leur fidélité.
  Ne pas modifier ces corps pour contourner un test. Une correction métier demande une
  mission distincte, des tests, puis une mise à jour explicite de la référence.
- L'ancien `app/simulateur.html` reste inchangé et tous ses tests restent conservés.
- `npm run build`, `npm run test:contracts`, `npm run test:parity`,
  `npm run test:inventory`, `npm run test:react` et `npm run test:characters` complètent la suite historique.
- Aucun import/auto-enregistrement des données fictives v0. Aucun `setItem` au montage.
  Le laboratoire du lot 1 reste sous `avatar-compagnon-react-lab-v1` ; le lot 2 utilise
  `avatar-compagnon-react-session-v1` pour les véritables personnages via les commandes et
  l’import explicite. Aucun accès automatique aux anciennes clés Codex.
- Le cloud bloque `file://` ; distinguer le document embarqué testé hors réseau du
  double-clic réel sur Mac, et Web Locks de la seule détection optimiste des conflits.
