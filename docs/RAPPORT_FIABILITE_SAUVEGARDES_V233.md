# Fiabilité des imports — V2.33

## Périmètre

Proposition sur `maintenance/fiabilite-sauvegardes`, après intégration autorisée de la PR nº 1
(référence `adeef67`). Le propriétaire prépare la refonte UI/UX séparément ; cette intervention
reste ciblée sur la robustesse des imports. Aucune règle du jeu, mise en page, dépendance,
clé de stockage ou format d’export n’est modifié. Aucun fichier ni test existant n’est supprimé.

## Défauts confirmés et corrections

| Constat reproduit avant correction | Correction |
|---|---|
| Un objet à la place de la liste d’engagements est accepté, puis le rendu échoue sur `.some`. | Vérifier la liste et ses paires de combattants existants distincts. |
| Un piège dont le propriétaire est absent est accepté, puis le rendu échoue (« Combattant inconnu »). | Vérifier les identifiants uniques, propriétaires, zones et passes cohérents. |
| Les imports écrivent les nouvelles données avant leur affichage : un rendu défaillant peut remplacer les données enregistrées. | Rendre avant persistance ; restaurer les modèles précédents si le rendu ou le stockage échoue, pour combat, fiches et sauvegarde complète. |
| Un rejet de lecture du fichier de sauvegarde complète n’a pas de traitement explicite. | Afficher l’erreur de lecture et réinitialiser le sélecteur de fichier. |

Les champs optionnels absents ou nuls restent acceptés. Les anciens identifiants de piège
non vides et les pièges sans champ de passe restent lisibles ; aucune conversion silencieuse.
Le journal existant de restauration complète reste en place pour les écritures des deux clés.

## Vérification

- Avant modification : **226 scripts réussis** (190 JavaScript, 36 navigateur).
- Après correction : **228/228 scripts réussis**, aucun échec (191 JavaScript, 37 navigateur),
  avec la limite locale `file://` décrite ci-dessous. Commande :
  `python scripts/test.py --jobs 3 --report /workspace/work/sauvegardes-final.json`.
- Deux nouveaux scripts : **30 scénarios JavaScript** et **11 parcours navigateur**.
- Les parcours injectent des erreurs de rendu et de stockage pour les trois imports,
  vérifient le refus sans perte, l’annulation par l’utilisateur et une lecture impossible.
- Un export/restauration complet conserve deux fiches liées, engagements, conditions,
  Armure de terre, Étoile de lave, piège et instantanés. Les modèles sont comparés après
  restauration, rechargement, annulation et nouveau rechargement.
- Le nouveau test JavaScript échoue sur le cas d’engagement mal formé avant correction.
- Interface statique et code des moteurs/modèles inchangés par comparaison avec `main` ;
  syntaxe JavaScript et `git diff --check` vérifiés.

## Limites

Les nouveaux contrôles ne constituent pas une validation exhaustive de tous les champs
imbriqués, notamment de chaque instantané historique. Les pannes de stockage testées sont
ponctuelles : une panne durable du navigateur peut aussi empêcher toute restauration disque.
Conserver des exports JSON reste nécessaire. Les données des tests sont synthétiques.

Le navigateur local administré interdit `file://`. Le contrôle hors connexion annonce cette
limite et utilise HTTP local, puis coupe le réseau ; cela ne certifie pas le double-clic sur
Mac. Les autres parcours utilisent aussi une origine HTTP locale. La dernière validation
Chrome/macOS du propriétaire concerne la PR nº 1, pas encore cette nouvelle proposition.

Aucun arbitrage de règles n’est nécessaire pour ces corrections techniques. La nouvelle PR
reste à examiner et ne doit pas être fusionnée sans accord explicite du propriétaire.
