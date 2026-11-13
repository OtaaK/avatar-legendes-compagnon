# Bilan de mission 2 — nettoyage exécuté sur sa branche

**13 novembre 2026 — plan approuvé par Alex, PR 19 non fusionnée.**
L’accord porte sur l’exécution du nettoyage, pas sur sa fusion. Aucune mission 3,
refonte UI, nouvelle dépendance ou modification de règle du jeu.

## Résultat

| Ensemble | Résultat vérifié |
|---|---|
| Sauvegarde | Étiquette annotée `avant-nettoyage-2026-11-13`, sur `38943c5`, publiée et conservée |
| Chemins retirés de la copie courante | **278 exactement**, tous listés dans l’inventaire approuvé |
| Détail | 275 archives, l’ancien CSV d’inventaire, deux récits V2.33 consolidés |
| Originaux archivés | Chaque objet Git vérifié dans l’étiquette avant retrait ; historique intact |
| Fichiers d’origine gardés | **254**, aucun retrait supplémentaire |
| Tests | **230 scripts** à leur place, aucun renommage, déplacement ou retrait |
| HTML | Deux helpers retirés : `openNpc` et `showPlaybookReference`, aucun autre changement |
| Commentaire de test | Ancienne commande de lancement du test Terre corrigée ; AST inchangé hors docstring |
| Suivi | CHANGELOG centralisé, références actives corrigées, audits et guides conservés |

Les [532 lignes de l’inventaire](INVENTAIRE.csv) et [SOURCE.json](SOURCE.json) restent la
photographie **avant action**, avec les propositions originales et `changesApplied: false`
à cette date. L’état réalisé est donné par [EXECUTION.json](EXECUTION.json), qui ne doit
pas être confondu avec cette photographie. Les 278 chemins retirés n’ont pas été remplacés
par des copies dans un autre dossier du dépôt.

Les textes intégraux sont consultables dans la
[sauvegarde](https://github.com/OtaaK/avatar-legendes-compagnon/tree/avant-nettoyage-2026-11-13).
L’ancien rapport V2.32 subsiste dans `docs/` ; sa copie historique est comprise dans les
278 chemins archivés. Aucune branche ni étiquette supprimée, aucun historique réécrit.

## Étapes et vérifications

1. Référence et sauvegarde revérifiées ; **230/230 scripts** réussis avant action.
2. CHANGELOG finalisé et références préparées vers les originaux archivés.
3. Avant `git rm`, contrôle de la liste exacte et des objets des 278 originaux ; après
   archivage, nouvelle suite **192/192 JS** réussie.
4. Retrait des deux seuls helpers, avec comparaison du HTML attendu calculé depuis la
   sauvegarde. Le diff correspond exactement à ces deux blocs ; moteur/catalogue et tout
   le reste du HTML sont identiques.
5. Correction d’une commande de docstring dans le test Terre. Tous les autres fichiers
   de tests sont identiques ; comparaison de l’AST Python hors docstring pour celui-ci.
6. Suite complète finale et comparaison des noms/résultats avant/après ; mêmes scripts,
   mêmes réussites et même limitation préexistante.

| Contrôle | Avant nettoyage | Après nettoyage |
|---|---:|---:|
| Scripts JavaScript | 192/192 réussis | 192/192 réussis |
| Scripts Chromium | 38/38 réussis | 38/38 réussis |
| Échecs | 0 | 0 |
| Limitation cloud `file://` | 1 | 1, identique |

Commandes réellement exécutées : `python scripts/test.py --jobs 2` avant et après,
et `--suite js --jobs 2` après archivage. Rapports locaux :
`work/nettoyage/execution-before.json`, `after-archive-js.json`, `execution-after.json`.
Les contrôles GitHub ont leur résultat propre dans la PR ; aucune réussite n’est
annoncée avant leur exécution.

Les suites comprennent imports/exports et sauvegardes réelles, rechargement, erreurs de
stockage/import, ressources, ajout/édition de combattants, annulation, 13 formulaires
Terre desktop/mobile et fonctionnement hors réseau. Le cloud bloque le double-clic
`file://` : le contrôle existant utilise alors HTTP local puis coupe le réseau. Cela ne
certifie pas un double-clic natif sur Mac ni Safari.

Preuves supplémentaires :

- **Aucune différence** des 192 fichiers JS, des 37 autres scripts navigateur et des deux
  helpers : 231 fichiers sur 232 identiques octet pour octet. Le fichier restant ne
  diffère que par sa commande de docstring ; ses instructions/assertions sont identiques.
- Matrice de techniques, runner, anciens outils, configuration CI et dépendance de test
  inchangés. Aucun format de sauvegarde ni mécanisme de persistance modifié.
- Les quatre fichiers de données de l’inventaire restent reproductibles depuis l’étiquette,
  même après retrait des fichiers courants : l’outil lit les objets Git d’origine.
- Les liens locaux et les cibles des liens vers les fichiers archivés sont contrôlés.
  L’ancien contrôle de réorganisation reste intact et documenté pour son checkout historique.
- `git diff --check` réussi ; ensemble des suppressions comparé exactement au plan.

## Taille et portée

Les chemins archivés représentent **363 586 octets**. Le retrait des deux fonctions
réduit le HTML de **634 octets**, de 444 841 à 444 207 octets. Le gain brut n’est pas le
gain net : les nouveaux index, preuves et le CHANGELOG occupent aussi de la place.
La copie courante compte **263 fichiers suivis**, contre 532 dans la sauvegarde ;
le gain net après ajout du CHANGELOG, des index et des preuves est d’environ
**198 Kio**. Ce chiffre exclut les métadonnées et l’historique Git.
Le dépôt de travail est plus lisible ; aucune réduction de l’historique Git n’est promise.

Cette mission couvre le main sauvegardé et sa branche de nettoyage. Les branches de
convergence restent intactes ; aucune compatibilité de leurs points d’entrée externes
n’est déduite de ce contrôle. Les tests passent et aucun appel statique aux deux helpers
n’existait, mais un éventuel usage manuel externe n’a pas été testé.

Licence, visibilité et droits des textes restent des décisions distinctes, sans modification.

## Retour arrière et décision suivante

Restaurer les chemins concernés depuis `avant-nettoyage-2026-11-13` dans un nouveau
commit, ou annuler les commits de nettoyage ; pas de force push ni réinitialisation forcée.
La sauvegarde contient déjà le correctif de sécurité des missions précédentes.

Recommandation : examiner la PR 19 et ses contrôles, puis décider explicitement de sa
fusion. **Aucune fusion ni aucun déploiement réalisés.** L’accord de nettoyage ne vaut
pas accord de mission 3 ou de refonte UI.
