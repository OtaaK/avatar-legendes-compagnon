# Correctifs de recette — PR 14

Branche conservée : `convergence/bibliotheque-techniques`, base PR 13. Aucun autre lot, aucune fusion ni aucun déploiement. Moteur, catalogue, ancien HTML et formats de campagne inchangés.

## Cartes compactes

Suppression du minimum de 160/180 px, du vide avant l’approche et de la marge de l’en-tête. Espacements : 6 px, padding 10×12 px, icônes 24 px, nom 17 px et approche 13 px. La hauteur dépend du contenu : les noms longs restent visibles, sans troncature. Grille adaptative d’au moins quatre colonnes à 1440 px, trois à 1280 px, deux sur tablette et une sur téléphone dans les tailles testées. Styles limités à la bibliothèque, CSS v0 de référence conservé.

Bordure de 1 px : Eau `#1BA9E1`, Terre `#92BB52`, Feu `#D84B63`, Air `#B8A06A`, Armes `#4F79B4`, Technologie `#8E5EC7`. Base `#9DAABB`, Universelles `#C38F6A`, Groupe `#68A595`. Le survol renforce discrètement la même bordure ; le focus ajoute un contour doré distinct sans remplacer la couleur de famille. Le libellé écrit reste présent : l’identité ne dépend pas uniquement de la couleur.

Une carte reste un seul bouton : ses trois informations, ses espaces intérieurs et ses bords arrondis visibles ouvrent la même fenêtre. Clavier et tactile conservés.

## Préparation privée sans copie individuelle

Gestion lit désormais le PDF personnel **sur le Mac**, hors réseau possible, avec PDF.js embarqué. Douze pages utiles, 111 titres et approches vérifiés, association par IDs stables, rectangles de lecture propres à l’édition française fournie. Les continuations de Riposter (colonne suivante) et Se recueillir (page imprimée 161) sont prévues. Aucun remplacement par un résumé, aucune écriture avant confirmation, aucun PDF conservé.

Un export JSON privé explicite permet la restauration groupée des 111 textes. Cette banque est distincte de la campagne et exclue des exports Codex. Un import remplace la banque après aperçu et confirmation. Les erreurs/annulations conservent l’existant. Le [guide Mac](DESCRIPTIONS_PRIVEES.md) détaille les boutons et les limites.

**Aucun texte du livre n’est ajouté à Git, au HTML distribué ou aux rapports publics.** Le prototype demeure vide de descriptions privées au premier lancement. Le texte extrait automatiquement n’est pas certifié éditorialement : une relecture demeure nécessaire. PDF.js ajoute environ 1,5 Mo, portant le HTML à environ 2 Mo ; [licence et justification](DEPENDANCES.md).

## Vérifications

Les résultats définitifs et liens CI sont consignés dans la PR. Rapports locaux : `work/recette-library-before.json`, `work/recette-library-after.json`, `work/library-browser/results.json`.

Le premier passage historique a donné 241/243 : deux délais de 30 s dans les tests V1.43 et V1.47, avant modification du HTML historique. Tous deux passent isolément. La nouvelle exécution complète séquentielle donne 242/243, avec un délai global de 120 s dépassé pour `test_uiux_navigation.py` ; ce test de l’ancien HTML est relancé isolément. Les résultats CI et cette relance sont indiqués dans la PR, sans masquer ces incidents.

Tests de convergence : banque synthétique de 111 descriptions, export/réimport sans perte, rectangles et continuations, conservation des paragraphes et césures, non-mutation des campagnes. Navigateur : neuf bordures, densité, quatre tailles, coins visibles et contenu des cartes, focus, filtres, import/export/restauration groupés, quotas, JSON invalide, démarrage/rechargement hors ligne. Un PDF de recette intégralement synthétique teste le parcours PDF → aperçu → annulation/confirmation → export de 111 entrées, sans contenu du livre en CI.

Le véritable PDF fourni est vérifié séparément et localement, hors artefacts CI : extraction des 111 passages, absence d’écriture avant confirmation, export privé, persistance après rechargement hors réseau. Cela ne vaut pas validation éditoriale ni recette de votre Mac. Les tests natifs `file://` Linux et la limitation du navigateur cloud sont rapportés séparément.

Le contrôle privé indépendant rapproche les 111 passages extraits par PDF.js d’une extraction pdfplumber des rectangles de cette édition : 111/111 identiques après normalisation des espaces et césures. Les pages paires/impaires emploient des limites de colonnes différentes. Cette comparaison technique ne certifie pas une transcription éditoriale universelle ; aucun contenu des passages n’apparaît dans le rapport public.

Les 46 tests de contrats/parité passent. Le parcours navigateur bibliothèque passe aux quatre résolutions ; les parcours des lots 1/2 passent également. Un contrôle ciblé complémentaire vérifie l’annulation pendant la lecture PDF et le refus d’un titre PDF incohérent, sans écriture tardive. Les textes PDF réels et comparaisons privées restent exclusivement dans le dossier ignoré `work/recette-private/`.

## Ajustements finaux autorisés ensuite

Famille à 10 px ; nom à 17 px principal. Approche complète dans une étiquette secondaire arrondie en haut à droite ; famille/icône à gauche, titre en dessous. Les lignes de grille ont une hauteur commune intrinsèque (`grid-auto-rows: 1fr`), sans hauteur fixe ni troncature, y compris pour le plus long nom. Description dans un encart, texte à 13 px et interligne 1,65, paragraphes/lignes/puces conservés. JSON v1 inchangé ; JSON v2 opt-in pour l’italique sûr, aucun HTML interprété. Les italiques déjà perdus nécessitent une nouvelle lecture privée du PDF, car ils ne peuvent pas être déduits du texte brut.

Le Lot Lieux est désormais explicitement autorisé par le propriétaire après ces contrôles, sur une branche distincte dépendante. Aucune fusion préalable n’est demandée.
