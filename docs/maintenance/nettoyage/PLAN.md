# Mission 2 — inventaire et plan soumis à Alex

**13 novembre 2026 — proposition uniquement, aucune suppression ni déplacement appliqué.**
Branche : `maintenance/inventaire-nettoyage`. Référence vérifiée : `main`, commit
`38943c54c732857db60ae38ebda92c61fdb7e5cc`, après fusion des missions 0 et 1.

## Sauvegarde préalable réalisée

L’étiquette Git annotée **`avant-nettoyage-2026-11-13`** a été créée et publiée avant
l’inventaire. Elle pointe sur ce commit, avec tout le code, les tests et les documents :
[consulter cette sauvegarde](https://github.com/OtaaK/avatar-legendes-compagnon/tree/avant-nettoyage-2026-11-13).
Aucun remplacement d’étiquette, force push, effacement d’historique ou de branche.

Le périmètre chiffré est **le main sauvegardé**, pas l’ensemble des branches de convergence.
Ces dernières sont conservées ; leurs fichiers supplémentaires ne sont ni classés inutiles
ni retirés parce qu’ils ne figurent pas dans cet inventaire de main.

## Résultats vérifiés

| Constat | Vérification indépendante |
|---|---|
| Ensemble versionné | 532 fichiers, 1 440 169 octets (hors métadonnées Git et fichiers ignorés) |
| Archives historiques | 275 fichiers, 210 724 octets, soit environ 206 Kio |
| Tests | 192 JS + 38 navigateur = **230 scripts**, plus deux helpers |
| Tests nommés par version | 205 fichiers, 180 libellés numériques distincts dans les noms ; ce nombre ne mesure pas la couverture |
| HTML | 444 841 octets ; 206 déclarations de fonctions nommées repérées par recherche syntaxique simple, pas 206 modules indépendants |
| Ancien inventaire | `docs/maintenance/INVENTAIRE.csv` : 143 522 octets, rapport de 508 anciens fichiers, utile comme preuve historique |
| Doublons stricts | **Un seul groupe** : `docs/RAPPORT_V232.md` et `docs/historique/RAPPORT_V232.md`, même objet Git |
| Fichiers temporaires suivis à retirer | Aucun identifié ; les résultats/caches de travail sont déjà ignorés |
| Deux fonctions signalées | Leur nom apparaît uniquement dans leur déclaration dans le HTML actuel ; voir preuves ci-dessous |
| Chemins périmés | Commande `app/test*.cjs` dans le cahier des charges et exemple `python app/test_terre_v233_browser.py` dans un commentaire de test |

Le poids des archives ne justifie pas une suppression de tests. Les cinq documents V2.33
ne sont **pas cinq copies identiques** : audit, récit des corrections, retours de recette,
fiabilité des sauvegardes et guide manuel ont des rôles distincts.

## Inventaire fichier par fichier et preuves

- [INVENTAIRE.csv](INVENTAIRE.csv) : **une ligne par chacun des 532 fichiers**, taille,
  objet Git, proposition et code de preuve ; pas un ordre de suppression.
- [REFERENCES.csv](REFERENCES.csv) : liens Markdown, chemins littéraux, helpers et
  découverte des tests par le runner. Les références sont indicatives, pas un graphe exhaustif.
- [INDEX_TESTS.csv](INDEX_TESTS.csv) : les **230 scripts** avec thèmes non exclusifs et
  objet Git d’origine. Les thèmes sont une aide automatique de navigation, pas une preuve
  de redondance ou de couverture complète.
- [SOURCE.json](SOURCE.json) : source figée, totaux et mention `changesApplied: false`.
- `scripts/audit_cleanup.py` permet de reproduire ces fichiers depuis l’étiquette, sans
  modifier, déplacer ni supprimer les originaux. Il ne lit pas CLAUDE.md ni les PDF.

| Code de preuve | Justification de la proposition |
|---|---|
| G-APP | HTML distribué, unique point d’entrée autonome ; fichier conservé |
| G-TEST | Script découvert par `scripts/test.py`, exécuté et conservé intégralement |
| G-HELP | Helper utilisé par les tests ; un fichier sans scénario n’est pas inutile |
| G-DATA | Matrice utilisée par les tests/documentation ; pas une ressource chargée par le navigateur |
| G-TOOLS | Outil de test ou preuve de maintenance ; rôle historique à documenter plutôt qu’effacer |
| G-CONFIG | Configuration CI, fichiers ignorés ou dépendance de test ; utiles aux contrôles |
| G-DOC | Instruction, guide, audit ou décision active/non redondante ; gardé par prudence |
| A-HIST | Archive datée ; proposer son retrait du dossier courant après accord, original conservé dans Git |
| A-INV | Inventaire d’une ancienne réorganisation, à consulter sous sa référence historique |
| A-REL | Récit de changement à consolider dans CHANGELOG ; détails originaux sous l’étiquette |

L’absence de référence textuelle n’est **jamais** utilisée seule comme preuve d’inutilité :
le runner découvre les tests par glob, l’HTML contient des événements et plusieurs appels
sont indirects. Les références internes aux archives et à l’ancien inventaire ne sont pas
comptées comme dépendances actives dans le fichier des références.

Pour reproduire les preuves sans toucher aux rapports suivis :

```bash
git fetch origin tag avant-nettoyage-2026-11-13
python scripts/audit_cleanup.py --ref avant-nettoyage-2026-11-13 --output work/nettoyage/reproduction
```

Le fetch rend aussi la référence accessible dans une copie peu profonde. L’outil lit
les objets de cette référence, pas les modifications locales des documents.

## Plan proposé — à approuver avant retrait

| Décision | Quantité | Proposition précise et conditions |
|---|---:|---|
| **Garder dans l’arborescence** | 254 fichiers d’origine | Application, 230 scripts et helpers, matrice, outils, configuration et documentation utile |
| **Archiver dans Git** | 275 fichiers historiques | Retirer `docs/historique/` du dossier courant seulement après accord ; originaux sous l’étiquette ; accès depuis CHANGELOG |
| **Archiver dans Git** | 1 ancien CSV | Retirer l’ancien `docs/maintenance/INVENTAIRE.csv` après mise à jour des liens du rapport historique ; original sous l’étiquette |
| **Consolider puis archiver** | 2 rapports | `docs/RAPPORT_V233.md` et `docs/RAPPORT_RETOURS_RECETTE_V233.md` : synthèse dans CHANGELOG et liens aux originaux complets sous l’étiquette |
| **Supprimer définitivement des fichiers de l’historique** | **0** | Aucune purge, aucun historique réécrit |
| **Retirer du code inutilisé** | 2 fonctions, pas deux fichiers | Candidats `openNpc` et `showPlaybookReference`, après accord et régression complète |
| **Regrouper/déplacer des tests** | **0 à ce stade** | Index par fonctionnalité proposé ; conserver noms, assertions et emplacements pour ce lot |

**« Archiver dans Git » implique bien de supprimer 278 chemins de la copie courante après
accord.** Ce n’est pas déjà effectué, ni une suppression de leur historique. Les fichiers
resteraient accessibles sur GitHub et dans toute copie du dépôt contenant l’étiquette.
Pour les consulter hors réseau sans Git, une archive ZIP du point sauvegardé peut être
conservée séparément. L’étiquette ne réduit pas le poids de l’historique Git téléchargé.

Gain brut proposé dans les fichiers de travail : **363 586 octets, environ 355 Kio**, avant
les nouveaux documents/index et le CHANGELOG. Le gain net est donc inférieur. L’objectif
principal est une arborescence et un suivi plus lisibles ; l’application autonome et ses
performances ne dépendent pas du chargement de ces anciens rapports.

Le doublon V2.32 est traité dans les 275 archives : garder le rapport courant dans `docs/`,
archiver sa copie historique, sans compter deux fois ce retrait.

## Documents V2.33 conservés et consolidation proposée

| Document | Rôle constaté | Proposition |
|---|---|---|
| `docs/AUDIT_V233.md` | Matrice des 13 techniques, anomalies, sources et limites | Garder |
| `docs/RECETTE_MANUELLE_V233.md` | Parcours du propriétaire sans commandes | Garder |
| `docs/RAPPORT_FIABILITE_SAUVEGARDES_V233.md` | Échecs d’import, restauration, décisions de protection des données | Garder |
| `docs/RAPPORT_V233.md` | Récit A1–A8 et références aux preuves | Consolider dans CHANGELOG, archiver l’original sous l’étiquette |
| `docs/RAPPORT_RETOURS_RECETTE_V233.md` | Retours et corrections, résultats datés, limites de recette | Consolider dans CHANGELOG, archiver l’original sous l’étiquette |

Le [CHANGELOG proposé](../../../CHANGELOG.md) est ajouté en brouillon. Ce n’est pas une
retranscription de chaque phrase des 275 archives : les originaux restent disponibles
intégralement sous l’étiquette. Aucun arbitrage de règle n’est créé pour les résumer.
Les documents d’audit et DECISIONS restent les lieux des preuves et questions ouvertes.

## Deux fonctions candidates, preuves et limite

- `openNpc` : une seule occurrence dans l’HTML, sa déclaration. Elle délègue à
  `openCharacterDetail(id)` puis retourne ; le bloc suivant est déjà inaccessible. Les
  cartes utilisent directement `openCharacterDetail`. Aucun appel dans les tests ou outils
  suivis. Retrait proposé du wrapper et de son bloc inaccessible, pas du parcours PNJ.
- `showPlaybookReference` : une seule occurrence dans l’HTML, sa déclaration. Son élément
  cible `playbookReference` n’existe plus comme élément HTML. Aucun bouton, écouteur ni
  test ne l’appelle. Retrait proposé du helper, pas des données `Playbooks` ni des fiches.

Recherche statique : ces constats ne garantissent pas l’absence d’un appel manuel depuis
une console, un favori externe ou une branche non fusionnée. C’est pourquoi le retrait
est soumis à l’accord et n’est pas appliqué pendant l’inventaire.

## Dépendances à préserver avant toute exécution du plan

- `app/simulateur.html` n’a aucune dépendance réseau d’exécution ; ne pas extraire de
  données/scripts maintenant. L’extraction et les imports de tests relèvent de la mission 3.
- `scripts/test.py` utilise des globs **non récursifs**. Une réorganisation physique des
  tests imposerait de modifier la découverte ainsi que les chemins JS et imports Python.
  Un déplacement brut pourrait ne plus lancer certains tests : ne pas le faire ici.
- Les tests JS découpent le script HTML par repères textuels ; conserver leurs assertions
  et passer toute la suite après le retrait éventuel de fonctions. Ne pas transformer un
  test en simple contrôle de présence pour faire passer un changement.
- Corriger les liens **dans tous les fichiers conservés** vers les chemins archivés :
  README, AGENTS, ROADMAP, audits, guides, rapport de maintenance, cahier des charges, etc.
  Les anciens textes chargés depuis l’étiquette conservent leurs liens dans ce contexte.
- L’ancien `verify_reorganisation.py` prouve un déplacement à un ancien commit précis,
  pas l’identité de main actuel avec un HTML ancien. Conserver son rôle et indiquer le
  checkout historique où l’exécuter ; ne pas l’affaiblir pour masquer une différence attendue.
- Pas de nouvelle dépendance ni framework, aucun report implicite vers les PR de convergence.

## Vérifications et critères avant/après

Pour ce **lot d’inventaire**, les tests et l’application restent inchangés. La commande du cahier des charges et les comptes de scripts des guides sont corrigés
dans cette PR documentaire ; l’ancien exemple dans le commentaire du test est signalé
pour l’étape suivante, sans changer le test pendant l’inventaire. Les fichiers
produits sont reproductibles depuis l’étiquette. Les contrôles sont rapportés dans le
[bilan](BILAN.md), avec la limitation `file://` existante.

Si Alex approuve le plan, exécuter dans **la même PR de mission 2**, par commits séparés :

1. Finaliser CHANGELOG et ses liens de sources, puis corriger les références actives.
2. Archiver les 278 chemins exactement listés, sans toucher aux autres ; comparer chaque
   chemin avec la sauvegarde et contrôler qu’aucun fichier inattendu n’est retiré.
3. Retirer les deux helpers seulement ; aucune règle ou donnée métier changée.
4. Corriger l’exemple de commande dans le commentaire du test Terre ; comparer l’AST
   Python hors docstring pour prouver que toutes les assertions sont inchangées.
5. Exécuter les **192 scripts JS et 38 navigateur**, comparer noms et résultats à la référence,
   vérifier imports/exports, sauvegardes, combat/techniques et fonctionnement hors réseau.
6. Relire les liens, rendre compte du gain réel, des limites et des éventuelles différences.

Ne fusionner cette PR qu’après un **autre accord explicite de fusion**, une fois les
changements réalisés et contrôlés. Ne pas commencer la mission 3 ni la refonte UI.

## Risques et retour arrière

Risques : liens cassés vers les rapports retirés, perte de découverte de tests en cas de
réorganisation prématurée, éventuel usage externe des helpers. Mesures : références
inventoriées, tests laissés en place, étiquette publiée et retrait de code minimal.

Retour arrière : restauration des seuls chemins concernés depuis l’étiquette dans un
nouveau commit, ou annulation des commits de nettoyage. Pas de réinitialisation forcée,
aucune suppression de branche, pas de réécriture du passé. Recommandation : approuver
ce plan ciblé, avec le regroupement physique des tests différé.
