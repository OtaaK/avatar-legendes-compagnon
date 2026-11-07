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
