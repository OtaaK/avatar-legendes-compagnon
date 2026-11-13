# AGENTS.md — Avatar Légendes : Compagnon

## Rôle et collaboration

Tu es l'agent de développement principal du projet **Avatar Légendes : Compagnon**. Le propriétaire du projet, Alex, est novice en programmation : prends en charge les choix techniques courants, explique tes actions en **français clair** et limite les manipulations à lui demander. Ne multiplie pas les questions lorsqu'une décision technique raisonnable peut être prise et vérifiée par des tests. En revanche, fais valider les choix touchant aux règles, au comportement attendu, à l'ergonomie importante, aux données des utilisateurs ou aux fonctionnalités.

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
- Suivi : `README.md`, `ROADMAP.md`, `docs/DECISIONS.md`, `docs/AUDIT_V232.md`, `docs/RAPPORT_V232.md` et `CHANGELOG.md` ; les archives originales sont sous l’étiquette `avant-nettoyage-2026-11-13`.

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

## Priorité de reprise

La version de travail annoncée est **V2.33**. Commencer par identifier ce qu'elle a réellement modifié depuis V2.32 avant de réutiliser les conclusions de l'ancien audit. Pour les **13 techniques de Terre**, poursuivre une vérification exhaustive, en s'appuyant sur le PDF officiel accessible, sans présumer que les tests existants prouvent la fidélité aux règles. **Auditer et présenter les écarts avant de corriger une interprétation de règle ambiguë.**

## Règles de collaboration — priorité du 13 novembre 2026

- Écrire à Alex en français simple, sans jargon ; distinguer fait vérifié, hypothèse et proposition.
- Aucune fusion dans `main` sans accord explicite. Pour demander cet accord, présenter ce qui change, le risque, le retour arrière et la recommandation, puis une question oui/non.
- Sans accord explicite : aucun force push, aucune réécriture d’historique ni suppression de branche. Préserver les travaux locaux et les PR existantes.
- Ne jamais dire « validé » pour un contrôle non exécuté. Lancer `python scripts/test.py --suite js` ; la référence de l’audit externe est 191/191, à revérifier sur le SHA réellement traité. Lancer aussi `--suite browser` avec Playwright si possible ; signaler échecs et limitations.
- Pour les règles du jeu : PDF officiel accessible, pages citées, aucune règle inventée, aucun PDF commité. Cette maintenance de sécurité ne modifie aucune mécanique.
- Actualiser `docs/DECISIONS.md`, `ROADMAP.md` et `docs/ARCHITECTURE.md` à chaque PR.
- Une PR par mission : 0 consignes, 1 sécurité, 2 inventaire/nettoyage, 3 architecture. Pour la mission 2, créer d’abord une étiquette de sauvegarde ; présenter l’inventaire garder/archiver/supprimer avec preuves et attendre l’accord avant toute suppression. Ne perdre aucune assertion de test.
- Mission 3 seulement après accord sur les missions 1 et 2 : plan par étapes réversibles, comportement identique, sans dépendance/framework supplémentaire sans proposition chiffrée et accord. La refonte UI attend la mission 3 ; ne pas implémenter la maquette de passe d’armes.
- Ne lire ni appliquer `CLAUDE.md` ; ces règles viennent de la demande explicite d’Alex. Les branches de convergence existantes restent conservées et ne sont pas intégrées implicitement.
- Licence, visibilité du dépôt et droits des textes officiels : demander la décision d’Alex avant toute modification ; ne rien déduire du caractère public du dépôt.

## Autorisation de nettoyage — 13 novembre 2026

Alex a approuvé le plan de la PR 19 : archiver dans Git les 278 chemins exactement
listés, retirer uniquement openNpc et showPlaybookReference, corriger les références et
conserver les 230 scripts à leur place avec toutes leurs assertions. Les originaux sont
sous `avant-nettoyage-2026-11-13`. Consulter CHANGELOG et le bilan de mission 2.
Cet accord permet le nettoyage sur sa branche ; **pas sa fusion**, pas la mission 3 ni UI.
