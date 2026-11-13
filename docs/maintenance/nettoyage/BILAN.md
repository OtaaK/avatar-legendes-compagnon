# Bilan de l’étape d’inventaire — mission 2

13 novembre 2026. **Étape préparée, nettoyage non exécuté, accord d’Alex attendu.**

## Ce qui est fait

- Main vérifié au commit `38943c5`, après les fusions des missions 0 et 1.
- Étiquette annotée `avant-nettoyage-2026-11-13` créée et publiée sur ce commit, sans
  remplacement d’étiquette ou de branche ; cible distante vérifiée.
- Les 532 fichiers d’origine sont classés dans l’[inventaire](INVENTAIRE.csv), avec objet
  Git, taille, code de justification, références indicatives et copies identiques.
- Le [plan](PLAN.md) propose de garder 254 fichiers et d’archiver 278 chemins dans Git,
  ainsi que le retrait conditionnel de deux anciennes fonctions. Aucun de ces retraits
  n’est effectué. Les archives et l’ancien inventaire restent présents.
- Un [CHANGELOG en brouillon](../../../CHANGELOG.md) propose une entrée unique pour les
  changements, avec liens aux audits conservés et aux originaux sous l’étiquette.
- Les 230 scripts sont indexés par thèmes dans [INDEX_TESTS.csv](INDEX_TESTS.csv), sans
  déplacement, renommage, changement de code ou perte d’assertion.
- Commande JS du cahier des charges et comptes de tests du README/guide actualisés.
  Le commentaire périmé d’un test est signalé pour l’étape de nettoyage, sans toucher
  au fichier de test pendant cet inventaire.
- Le nouvel outil `scripts/audit_cleanup.py` ne dépend que de Python/Git. Il produit les
  preuves depuis une référence, ne lit ni CLAUDE.md ni les PDF et refuse de produire un
  rapport qui écraserait un fichier de cette référence.

Aucun changement d’application, de données métier, règles, sauvegardes, framework,
configuration CI ou ancienne assertion. Aucune branche de convergence n’est supprimée
ni réorganisée, aucun déploiement ni aucune fusion de cette étape.

## Tests et preuves réellement exécutés

| Contrôle | Avant les ajouts d’inventaire | Après les ajouts |
|---|---:|---:|
| Suite JavaScript | 192/192 réussis | 192/192 réussis |
| Suite navigateur Chromium | 38/38 réussis | 38/38 réussis |
| Échecs | 0 | 0 |
| Limite préexistante | `file://` cloud bloqué | Même limite, aucun nouveau défaut |

Les suites sont lancées par `python scripts/test.py --suite js --jobs 2` et
`python scripts/test.py --suite browser --jobs 2`. Les rapports JSON détaillés sont dans
`work/nettoyage/` localement ; les contrôles GitHub ont leur propre résultat dans la PR.
Ils ne sont pas déclarés réussis avant leur exécution.

La restriction du navigateur cloud empêche le double-clic natif. Le contrôle existant
bascule vers un serveur HTTP local puis coupe le réseau ; ce n’est pas un test macOS.

Autres vérifications :

- Comparaison des ensembles de noms et des résultats avant/après : les mêmes 230 scripts
  sont conservés et réussissent.
- Comparaison binaire avec l’étiquette de **tous** les fichiers `app/`, `data/` et `tests/` :
  identité exacte. Les règles et chaque fichier de test restent ainsi inchangés.
- Régénération dans un second dossier : les quatre fichiers de données produits sont
  identiques octet pour octet (inventaire, références, index des tests, source).
- Essai d’une sortie écrasant l’ancien inventaire : refus explicite, fichier original
  vérifié identique après l’essai.
- Contrôle de la présence des 532 chemins d’origine, des liens documentaires nouveaux et
  de `git diff --check`, sans nouvelle suppression.

## Ce qui n’est pas démontré

Un nombre élevé de fichiers, un nom de version ou l’absence de référence littérale ne
prouve pas l’inutilité. Les thèmes sont indicatifs ; ni couverture de lignes ni équivalence
sémantique de tests n’est prétendue. Les deux fonctions n’ont pas d’appel statique repéré,
mais un usage externe/manual ne peut pas être exclu par cette recherche.

L’inventaire couvre main sauvegardé, pas toutes les branches de convergence. Il ne vaut
pas autorisation de supprimer leurs composants. Les questions de licence, visibilité et
droits de reproduction restent ouvertes et hors de ce plan.

## Décision à prendre

Examiner [le plan précis](PLAN.md) et approuver ou refuser **l’archivage des 278 chemins et
le retrait des deux fonctions**, en conservant tous les tests à leur place. Le gain brut
concerne environ 355 Kio des fichiers de travail, avant ajout des index et du CHANGELOG ;
il ne réduit ni l’historique Git ni le temps de chargement du HTML autonome.

Après accord, le nettoyage sera réalisé par étapes dans cette même PR, avec de nouveaux
contrôles avant/après et correction des références. La fusion nécessitera ensuite un
accord séparé. Retour arrière par restauration depuis l’étiquette ou annulation de commit,
sans force push ni réécriture d’historique. Mission 3 et refonte UI restent en attente.
