# UI/UX — lot 6 : harmonisation et recette transversale

Livraison du 8 novembre 2026 sur `refonte/recette-ui-ux`, depuis `977cce6` (lot 5, PR nº 8).
Les lots 1, 2, 3A, 3B, 4 et 5 sont dans les branches dépendantes PR nº 3 à nº 8.
Aucune fusion automatique, aucune modification directe de main, aucune nouvelle version déclarée.

## Changements ciblés

- Repère d’en-tête V2.33 · refonte UI/UX en validation · hors ligne, pour identifier la bonne copie.
- Accès Accueil vers Lieux et Gestion, avec les commandes Explorer les lieux et Sauvegarder ma partie.
- Libellé et nom du fichier d’export antérieur harmonisés : Exporter l’état avant les données
  étendues / `avatar-avant-donnees-etendues.json`. Les fonctions, clés et formats sont conservés.
- Messages de protection des données récentes généralisés : ils concernent également Lieux et
  Livrets, pas seulement les PNJ. Le contrôle et le blocage d’écriture ne changent pas.
- 57 libellés adjacents reliés à leurs champs par un attribut for. Ce contrôle ciblé ne constitue
  pas un audit d’accessibilité complet ; les libellés complexes ne sont pas réécrits massivement.
- Option de repli des ressources sur fenêtre étroite (jusqu’à 900 px). Les ressources sont
  affichées par défaut ; les masquer conserve un résumé fatigue/équilibre/états et reste sans
  écriture dans les modèles. Le choix est en mémoire par fiche, jusqu’au rechargement seulement.
  Sur grand écran, les ressources restent affichées même après un repli en petit format.
  Le bouton ne s’affiche pas pour un PNJ dépourvu de ressources et statuts.
- Bouton Cibler un autre combattant : actualisation des listes d’états de la nouvelle cible,
  comme lors d’un changement manuel de cible. L’ancien raccourci modifiait seulement le select,
  sans déclencher le traitement onchange. Les autres paramètres restent conservés.

Aucune règle du jeu modifiée. Cette correction de cible suit les capacités déjà validées du
lot 3B ; elle ne change ni les états autorisés par les profils ni les quantités des effets.
Les données de création des Livrets, le catalogue et la matrice des techniques restent inchangés.
Aucun nouveau champ de sauvegarde, format, canal local ou import automatique n’est introduit.
Le repli ne contourne aucune validation métier et ne modifie pas le combat.

## Vérifications croisées

La référence `977cce6` est exécutée dans une copie isolée : **240/240 scripts réussis**.
Les 197 scripts JS ont également passé sur l’étape d’harmonisation.

| Vérification finale | Résultat |
|---|---|
| Référence isolée | 240/240 scripts |
| Suite complète du lot, deux processus | **241/241 scripts réussis** |
| JavaScript | 197 scripts |
| Navigateur | 44 scripts |
| Nouveau parcours transversal | Cinq formats et quatre segmentations PNJ |
| Échecs non résolus | Aucun |

Rapport local détaillé : `/workspace/work/recette-final.json`. La limitation file:// est
conservée explicitement dans le résultat ; elle ne certifie pas le double-clic macOS.

Le nouveau script `test_recette_uiux.py` couvre cinq formats : 1440×1000, 1024×768,
390×844, 320×640 et 844×390. Il combine dans une même bibliothèque :

1. Un PJ avec suivi de Livret et un PNJ au profil étendu.
2. Région, ville et temple imbriqués, domicile/association/présence indépendants.
3. Liens de lieux ouvrant les fiches et filtre récursif.
4. Repli mobile, résumé, changement d’onglet et retour desktop sans écriture des modèles.
5. Ajustement de fiche puis annulation, avec copie de combat inchangée.
6. Clic d’un libellé donnant le focus au champ, sans altérer sa valeur.
7. Progression à quatre cases, puis vraie préparation/validation/annulation d’Armure de terre.
8. Export récent version 2 et point antérieur version 1 distincts ; restauration complète de
   profils, lieux, suivi de Livret et combat, puis comparaison exacte après rechargement.
9. Export et restauration sans réseau après chargement local ; absence de requête HTTP nouvelle.
10. Changement de cible par raccourci actualisant les états personnalisés.
11. Quatre segmentations PNJ 3/5/10/15, et absence de commande inutile pour le non-combattant.

La première exécution du nouveau scénario choisissait Dérobade sur un PJ qui ne l’avait pas
apprise. Le catalogue la classe universelle, et non technique de base ; la fixture a été corrigée
pour la déclarer maîtrisée. Aucune règle ou condition d’accessibilité n’a été assouplie.

Deux tests existants changent uniquement leurs attentes de libellé : retour de recette pour
le nouveau repère de version, ressources PNJ pour le nom générique d’export. Leurs assertions
sur ressources, données, erreurs et sauvegardes sont conservées. Aucun test supprimé.

Le moteur et les modèles restent comparés à la base ; les changements JavaScript portent sur
le rendu, ses libellés et l’actualisation des options de cible. Aucun PDF n’est nécessaire pour
réinterpréter une règle dans ce lot, qui ne le fait pas. Aucun extrait ou actif protégé ajouté.
Les captures de recette sont locales dans `work/`, avec des personnages fictifs.

## Bilan de la refonte et validation attendue

La [grille de critères](BILAN_REFONTE_UI_UX.md) précise ce qui est couvert, conditionnel ou différé.
Le cahier des charges original reste intact. Les principales limites restent :

- Double-clic Chrome macOS non vérifié dans le cloud : file:// y est bloqué. Le contrôle hors
  réseau après chargement HTTP local n’est pas une certification de l’ouverture sur le Mac.
- Confort réel et choix visuels à valider par le propriétaire ; le repli mobile est facultatif,
  sans prétendre que toutes les petites cibles segmentées équivalent à un audit d’accessibilité.
- Palmarès complet, déclencheurs de manœuvres, choix d’évolution et automatismes propres aux
  dix Livrets explicitement différés. Le suivi du lot 5 est manuel.
- Refonte fonctionnelle de Combats, navigateurs Safari/Firefox et conformité réglementaire
  exhaustive de toutes les combinaisons hors certification de cette recette.

Le [guide global sans commandes](RECETTE_REFONTE_UI_UX.md) donne le fichier exact à télécharger,
les vérifications essentielles et la distinction entre export récent et point antérieur.
L’ancien guide V2.33/PR nº 1 reste disponible comme archive contextualisée.

## Fichiers et retour arrière

Un fichier applicatif modifié ; un parcours navigateur ajouté, deux attentes de libellé
actualisées. README, ROADMAP, architecture, tests, décisions, plan, guide et rapports actualisés.
Aucun fichier supprimé, aucune dépendance ajoutée, aucune migration de données dans ce lot.
Revenir au lot 5 retire ces ajustements de présentation ; les modèles et sauvegardes restent
au même format. Les précautions de retour à l’ancienne génération v020 restent celles des
lots précédents : les données récentes ne sont pas fusionnées dans le point historique.

Suite recommandée : recette personnelle de cette branche complète, puis corrections issues
des retours avant toute intégration autorisée. Ne pas commencer les mécanismes détaillés des
dix Livrets sans leur spécification distincte. Rien n’est fusionné dans main dans cette mission.
