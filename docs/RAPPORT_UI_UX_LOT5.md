# UI/UX — lot 5 : structure des Livrets

Livraison du 8 novembre 2026 sur `refonte/livrets`, depuis `1eaa233`.
Cette branche dépend du lot 4 (PR nº 7), puis des PR nº 6, nº 5, nº 4 et nº 3.
Aucune fusion automatique de ces branches ni de `main`. Application autonome V2.33 conservée.

## Résultat et limites fonctionnelles

L’onglet Livret des PJ dispose désormais d’un patron commun : cartes compactes des manœuvres
inscrites, panneau de spécificité, moment d’équilibre et progression/notes d’évolution.
Les quatre onglets PJ restent exactement Aperçu, Livret, Techniques, Histoire et relations.
La progression n’apparaît ni dans le panneau permanent ni sur les fiches PNJ.
L’histoire, les relations, les ressources et les techniques existantes sont conservées.

| Élément | Livré | Différé explicitement |
|---|---|---|
| Dix Livrets | Noms, références et données de création existants réemployés | Reconstitution d’un catalogue de manœuvres et de leurs textes |
| Manœuvres | Cartes repliables des noms réellement saisis, statut « Inscrite » | Déclencheurs structurés, statut officiel acquise/non acquise, assistance et effets spécifiques |
| Spécificités | Adaptateur de présentation et notes libres propres au Livret | Compteurs, réserves et parcours propres aux dix Livrets |
| Moment d’équilibre | Indication manuelle non renseigné/non débloqué/débloqué | Validation de condition, texte détaillé, suivi d’utilisation et effet de combat |
| Progression | Quatre cases, édition manuelle, annonce d’évolution à choisir à 4 | Attribution automatique, consommation, application et contrôle des choix d’évolution |
| Palmarès de L’Audacieux | Panneau nommé et notes dans l’adaptateur | Liste d’objectifs, sélection de quatre objectifs, accomplissement, récompense guidée, cycle suivant |

Les manœuvres historiques appartiennent à la fiche : leur liste ne prouve pas leur appartenance
au Livret sélectionné. Elles ne sont pas supprimées ni réattribuées automatiquement lors d’un
changement. L’interface le précise. Aucun faux contenu officiel ni bouton universel Activer.

## Sources réellement consultées

Le cahier des charges demande la structure UI seulement et reporte les mécanismes détaillés
des dix Livrets. Il permet de laisser des adaptateurs explicites lorsque règles et données
fiables ne sont pas encore intégrées.

Le PDF fourni est accessible et a été consulté pour la progression : p. 212 imprimée
(page physique 213), jauge de quatre cases donnant accès à une évolution. Les références
L’Audacieux p. 171–173 sont accessibles également, mais le dépôt ne dispose pas d’un modèle
structuré des objectifs, déclencheurs et récompenses. Ce lot n’ajoute pas un automate partiel
du Palmarès. Le document commercial et les extractions privées restent hors Git.

Les cases sont un suivi manuel, pas un calcul des récompenses réglementaires. Les quatre cases
restent cochées après saisie d’une note d’évolution ; aucun gain n’est perdu par une remise
à zéro automatique. Le choix, l’application et les corrections se discutent avec le MJ.
Il n’existe ni file d’évolutions en attente ni attribution au-delà des quatre cases dans ce socle.
Déclarer le moment d’équilibre débloqué n’applique aucune évolution ni effet au combat.

## Données et conservation

Le champ optionnel `playbookState`, version 1, contient des entrées séparées par nom exact
de Livret : progression, indication du moment, notes de spécificité et notes d’évolution.
Les champs inconnus sont conservés lors des modifications. Aucun état n’est créé en naviguant,
ni lors d’un enregistrement de fiche qui ne change pas le suivi. Une ancienne fiche affiche
clairement « Suivi non encore renseigné ».

Changer de Livret conserve les entrées anciennes. Le nouveau commence sans suivi enregistré ;
revenir au précédent retrouve ses valeurs. Le nom exact identifie le suivi : une appellation
personnalisée différente constitue une autre entrée, sans rapprochement automatique.
Les Livrets personnalisés déjà enregistrés restent affichés et sélectionnés dans le formulaire.

Modifier simultanément le Livret choisi et son suivi est refusé avant enregistrement :
faire deux enregistrements distincts évite d’attribuer les cases au mauvais Livret.
Les brouillons sont protégés par les mécanismes existants, avec Annuler et avertissement
avant sortie. Pour corriger un suivi enregistré, rouvrir Modifier et ajuster explicitement.
Une case vide n’est pas convertie implicitement en zéro ; valeurs hors 0…4 refusées.

La première utilisation du suivi active, après confirmation, la bibliothèque version 2 et
le canal v021 journalisé déjà utilisé par PNJ/Lieux. Le point v020 reste intact. Si ce canal
est déjà actif, il n’est pas créé de nouveau point de retour spécifique au Livret : exporter
une sauvegarde complète avant cette étape reste utile. Les textes Gestion précisent les
trois déclencheurs possibles de la première activation. Le bouton historique d’export du point
antérieur garde son libellé PNJ, pour la continuité des parcours existants.

Les imports anciens sont acceptés ; les suivis mal formés ou de version inconnue sont refusés
avant remplacement des données. Les exports étendus nécessitent l’application correspondante.
Ils ne sont pas convertis pour l’ancien programme. Les anciennes branches UI ne proposent pas
l’édition de ce suivi ; utiliser celle-ci pour le consulter et le modifier.
Les sauvegardes récentes et le point historique restent indépendants, sans fusion automatique.
La panne de stockage annule la mutation et conserve le brouillon. Les blocages de protection
et la récupération journalisée du lot 3B restent en place.

## Vérifications

Référence exécutée depuis une copie isolée de `1eaa233` : **238/238 scripts réussis**.
Les tests déjà présents ne sont pas modifiés ni supprimés dans ce lot.

| Vérification finale | Résultat |
|---|---|
| Suite complète, deux processus | **240/240 scripts réussis** |
| JavaScript | 197 scripts |
| Navigateur | 43 scripts |
| Nouveaux scénarios purs | 30, dans un script |
| Nouveau parcours navigateur | Quatre formats, dans un script |

Rapport détaillé local : `/workspace/work/livrets-final.json`. Aucun échec préexistant
sur la référence isolée, aucune régression non résolue sur la suite finale.

Les nouveaux contrôles sont :

- `test_livrets_uiux.cjs` : 30 scénarios purs, dix Livrets existants, bornes, suivi par Livret,
  changements aller-retour, corrections, états invalides refusés, absence d’effet sur les
  caractéristiques/ressources/manœuvres, champs futurs conservés et patch sans écriture implicite.
- `test_livrets_uiux.py` : quatre formats (1280×900, 390×844, 320×640, 844×390), navigation,
  progression seulement dans Livret, notes et noms piégés, confirmation refusée/acceptée,
  quota injecté et rollback, brouillons, changements de Livret, conservation des quatre cases,
  exports/restaurations réels, rechargement, import invalide et Livret personnalisé.

Les captures desktop/mobile sont locales dans `work/`, hors Git. Le contrôle hors réseau
conserve sa limite : `file://` bloqué dans le navigateur cloud, chargement HTTP local puis
coupure du réseau. Le double-clic Chrome macOS reste à vérifier sur le Mac du propriétaire.
Les tests ne certifient pas les règles et automatismes détaillés explicitement différés.

## Recette courte sans commandes

1. Ouvrir une copie de test du HTML et exporter une sauvegarde complète depuis Gestion.
2. Ouvrir un PJ doté d’un Livret, puis l’onglet Livret. Vérifier ses manœuvres et les panneaux
   repliables ; la progression doit être absente du panneau permanent.
3. Cliquer Modifier le suivi, renseigner trois cases et une note ; enregistrer. Recharger
   et retrouver les valeurs. Corriger à quatre cases : l’évolution doit rester à choisir.
4. Écrire une note d’évolution. Vérifier que les quatre cases, caractéristiques, états et
   techniques n’ont pas été modifiés automatiquement.
5. Changer uniquement de Livret dans Aperçu, enregistrer, puis consulter son suivi vide.
   Revenir au premier Livret : ses anciennes valeurs doivent être retrouvées.
6. Exporter le tout, puis tester la restauration dans une copie de test. Conserver l’export
   récent et le point antérieur séparément.

## Fichiers et suite

Un fichier applicatif modifié, deux scripts ajoutés, README, ROADMAP, architecture, tests,
décisions, plan et présent rapport actualisés. Aucun ancien test supprimé ou modifié.
Moteur de combat, catalogue de techniques, données de création des Livrets et matrice CSV
conservés. Aucune dépendance ajoutée, aucun PDF versionné, aucune fusion dans main.

Prochaine étape : lot 6, harmonisation et recette transversale du socle. Le fonctionnement
spécifique des dix Livrets et le parcours du Palmarès attendent leur spécification détaillée.
