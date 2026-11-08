# Refonte UI/UX — audit de départ et livraisons

## Référence réelle

Branche de travail : `refonte/ui-ux-progressive`, créée depuis la V2.33 et avancée sur
`42b306f`, dernier `main` vérifié sur GitHub. La PR nº 1 (structure et recette) et la
PR nº 2 (fiabilité des imports) sont fusionnées. Le cahier des charges a été ajouté dans
`c99f0f2` puis intégré dans `42b306f` ; il n’était pas dans le checkout initial.
Référence de conception : [cahier des charges](../CAHIER_DES_CHARGES_UI_UX_AVATAR_COMPAGNON_CODEX.md).
`AGENTS.md` lu ; pas de changement de règle ni de fusion autorisés par cette mission.

## Matrice de départ

| Sujet | Existe en V2.33 | Manque / travail prévu | À préserver |
|---|---|---|---|
| Navigation | Accueil, Personnages, Combat, Techniques ; vue mémorisée ; Alt+1…4 | Six sections, latérale desktop, compacte mobile, focus explicite | Identifiants des vues existantes et état des écrans |
| Visuel | CSS embarqué, bleu sombre, composants nombreux | Variables communes, hiérarchie, or modéré, focus et cibles tactiles | HTML autonome et palette sémantique des techniques |
| Personnages | Galerie PJ/PNJ, recherche/lieu PNJ, cartes clavier | Portraits, importance, filtres/tri complémentaires, cartes compactes | IDs, sélection, données anciennes, accès au combat |
| Fiches | Formulaire partagé, quatre onglets, brouillons et sauvegarde explicite | Consultation/édition distinctes, panneau permanent, PJ/PNJ différents | Tous les champs existants, confirmation et rollback |
| Ressources | Fatigue 0…5, équilibre −3…3, centre, états/statuts | Capacités PNJ variables, jauges et modèle adaptés après vérification PDF | Valeurs personnalisées ; ne pas appliquer une migration implicite |
| Lieux | Texte `character.location` et lieu actif de session | Arbre à IDs stables, domicile/associations/présence distincts | Texte historique et lieux orphelins ; migration explicite testée |
| Livrets | Création, références et liste `playbookMoves` ; pas de champ de progression dédié | Patron UI, panneaux repliables, progression dans Livret | Données réelles ; automatismes détaillés des dix Livrets reportés |
| Persistance | Bibliothèque/combat séparés ; sauvegarde complète avec journal ; imports transactionnels | Tester chaque nouvelle donnée en aller-retour | Clés historiques, erreurs, récupération et exports privés/publics |

## Lots et retour arrière

Chaque lot a son commit et sa vérification ; une PR ne doit pas présenter comme terminé un
lot encore à venir. La première PR couvre **0 et 1 uniquement**. Les suivantes partent de
cette base vérifiée (ou de `main` après intégration autorisée), dans l’ordre demandé.

| Lot | Contenu / fichiers prévus | Critères de sortie | Retour arrière |
|---|---|---|---|
| 0 | Ce plan, audit de `app/simulateur.html`, tests de référence | Version, sauvegardes et écarts connus consignés | Documentation seule |
| 1 | Thème embarqué, navigation six sections, Gestion réutilisant les imports/exports, tests navigateur et docs | Desktop/mobile/clavier, état conservé, aucune évolution de modèle | Revert du commit UI ; données inchangées |
| 2 | Galerie/cartes PJ/PNJ et métadonnées nécessaires, tests ciblés | Importance accessible, filtres cumulables, navigation clavier, round-trip | Anciennes données conservées ; champs additionnels compatibles |
| 3 | Fiches et ressources, consultation/édition, brouillons, tests | PJ quatre onglets / PNJ trois, capacités réelles, erreurs et annulation | Prévoir export avant toute adaptation de schéma ; conserver champs historiques |
| 4 | Arbre Lieux et liens PNJ, adaptateurs de sauvegarde, tests | IDs stables, absence de cycles, récursivité, suppression explicite, migration sans perte | Sauvegarde préalable et conservation des textes historiques ; aucune cascade implicite |
| 5 | Structure UI Livrets, réemploi du modèle existant, tests | Progression dans Livret, contenu réel, fonctions non implémentées signalées | Aucun automatisme nouveau de règle à annuler |
| 6 | Harmonisation ciblée et recette transversale | Combat/techniques intacts, responsive, hors ligne, imports/exports | Revert cosmétique sans transformation des sauvegardes |

Dans le lot 1, Lieux est une destination annoncée comme à venir, avec accès aux lieux
textuels des PNJ ; ce n’est pas une fausse arborescence fonctionnelle. Gestion expose les
outils déjà présents sans dupliquer leur logique. Aucun réglage fictif n’est ajouté.

## Stratégie de vérification

- Avant intervention : **228/228 scripts réussis**, via `python scripts/test.py --jobs 3` ;
  les 228 scripts préexistants sont conservés. L’ajout du cahier des charges sur GitHub ne modifie pas leur code.
- Après chaque lot : tests ciblés puis suites pertinentes ; comparer moteur, catalogue et
  persistance à la référence tant que le lot n’exige pas leur évolution.
- Responsive : grand écran, portable, tablette, téléphone portrait/paysage ; titres longs,
  absence de débordement, focus visible, clavier et commandes tactiles.
- Contrôler les modèles et chaînes JSON enregistrées avant/après navigation, puis recharger ;
  réutiliser les parcours d’import/export et de combat existants.
- La politique locale bloque `file://` : le contrôle hors ligne utilise HTTP local puis coupe
  le réseau et annonce cette limite. Ne pas présenter cela comme une recette double-clic Mac.
- Les lots 2–5 impliquant des ressources/modèles exigent un examen des pages du PDF avant de
  modifier une limite métier. Le PDF commercial reste hors Git ; aucun contenu à reconstruire
  depuis une maquette. Tout arbitrage de règle reste à soumettre au propriétaire.

## Livraison suivante : lot 2

Le lot 2 est isolé sur `refonte/ui-ux-personnages`, depuis `a323655`, avec une PR ciblant la
branche du lot 1 tant que la PR nº 3 reste ouverte. Voir [le bilan](RAPPORT_UI_UX_LOT2.md).
La galerie et la classification sont livrées sans anticiper les nouvelles limites métier
des fiches ; les champs inconnus et ressources des sauvegardes sont conservés.

## Lot 3 : séparer socle UI et capacités PNJ

Le [lot 3A](RAPPORT_UI_UX_LOT3.md), sur `refonte/ui-ux-fiches` depuis `c6e1e0b`, livre
les deux structures de fiches, consultation/édition et brouillons, commandes de ressources
existantes et portraits. Il dépend de la PR nº 4. L’architecture reste HTML autonome.

La lecture réelle du PDF p. 239–242 confirme que les ressources PNJ exigent une adaptation
du modèle et du combat, pas seulement du rendu. Le lot 3B reste à traiter séparément avec
compatibilité non destructive et tests de domaine ; le lot 3 n’est donc pas déclaré terminé.
Lieux hiérarchiques et Livrets détaillés restent les étapes 4 et 5.


## Livraison du lot 3B

Le [lot 3B](RAPPORT_UI_UX_LOT3B.md), sur `refonte/ressources-pnj` depuis `cfdd496`,
dépend du lot 3A (PR nº 5). Capacités PNJ, états personnalisés, principe unique et
non-combattants sont pris en charge ensemble dans les fiches, le combat et les validations.
L’adoption reste explicite ; les valeurs incompatibles ne sont jamais écrêtées en silence.
Le canal local v021 et les exports version 2 protègent le point de retour v020.
Le MJ conserve les conséquences narratives et les cas non automatisés ; ce lot ne prétend
pas certifier toutes les règles et interactions. Prochaine étape : Lieux hiérarchiques,
puis structure des Livrets. Les PR précédentes restent sans fusion automatique.


## Livraison du lot 4 : Lieux

Branche `refonte/lieux`, depuis `7cb514b` (lot 3B, PR nº 6). Le modèle, les fiches et les
liens PNJ partagent la bibliothèque versionnée. Création et déplacement de sous-lieux,
fil d’Ariane, illustrations, relations indépendantes, position rapide et filtres descendants
sont accompagnés de protections de brouillon et de suppression. Les textes historiques
restent conservés ; les orphelins sont signalés. Aucun changement du moteur de combat.
Voir [le rapport](RAPPORT_UI_UX_LOT4.md). Prochain lot : structure des Livrets, sans programmer
les mécanismes spécifiques des dix Livrets. Aucune PR précédente n’est fusionnée automatiquement.


## Livraison du lot 5 : structure des Livrets

Branche `refonte/livrets`, depuis `1eaa233` (lot 4, PR nº 7). Cartes des manœuvres
saisies, panneaux de spécificité et de moment d’équilibre, progression quatre cases
et notes d’évolution dans Livret seulement. Le suivi reste manuel et séparé par Livret.
Les textes, déclencheurs, conditions et automatismes des dix Livrets ne sont pas inventés.
Le Palmarès est représenté par son adaptateur de notes ; sélection d’objectifs et parcours
de récompenses attendent le modèle fiable de la spécification suivante.
Voir [le rapport](RAPPORT_UI_UX_LOT5.md). Prochain lot : harmonisation et recette transversale,
sans anticiper les règles détaillées reportées. Aucune fusion automatique des PR.


## Livraison du lot 6 : harmonisation et recette transversale

Branche `refonte/recette-ui-ux`, depuis `977cce6` (lot 5, PR nº 8). Harmoniser l’identification
et les sauvegardes, relier les libellés évidents et proposer le repli mobile sans changer les
modèles. Un parcours combiné vérifie profils PNJ, Lieux, Livret, combat, annulation et export/
restauration après coupure réseau. Le raccourci de cible reçoit la même actualisation de
ses états que le select manuel.

Voir [le rapport](RAPPORT_UI_UX_LOT6.md), [la grille de critères](BILAN_REFONTE_UI_UX.md) et
[la recette personnelle sans commandes](RECETTE_REFONTE_UI_UX.md). Le socle est proposé pour
recette, pas déclaré intégralement conforme aux règles ou aux besoins des dix Livrets.
Aucune fusion de PR sans accord explicite ; prochaine étape : retours de recette et corrections.


## Après recette : correctifs ciblés

Branche `correctifs/retours-recette-uiux`, depuis `1e57d22` (lot 6, PR nº 9) : guidage de
l’adoption du profil légendaire, cartes/filtres mis à jour après renommage et retrait protégé
de combattants avec undo. Les autres parcours sont signalés comme fonctionnels. Voir
[le rapport des retours](RAPPORT_RETOURS_UI_UX.md) et [la recette actualisée](RECETTE_REFONTE_UI_UX.md).
Aucune fusion de la chaîne sans accord explicite ; les règles détaillées différées le restent.
