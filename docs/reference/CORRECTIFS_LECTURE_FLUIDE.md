# Bibliothèque — lecture fluide et ligne de famille

Correctif demandé le 10 novembre 2026, appliqué au prototype complet de la PR 15, sur `convergence/lot3-lieux`. Aucun autre lot ni modification des Lieux, règles ou sauvegardes de campagne.

## Cartes

Famille et icône occupent une ligne entière. Le nom vient ensuite, puis l’approche complète dans une étiquette arrondie. La famille conserve sa taille lisible de 10 px et ne partage plus sa largeur avec l’approche : Universelles et Technologie ne se coupent plus. Bordures, hauteur commune intrinsèque, noms intégraux et clic/clavier restent conservés.

## Cause et correction des descriptions

La version précédente conservait chaque fin de ligne de la page PDF. Elle entourait aussi les fragments italiques de marques avant de réunir les mots : une marque pouvait séparer la césure de son retour à la ligne. Ce n’était donc pas une lecture fluide malgré la présence de paragraphes et d’italique.

La nouvelle couche pure `packages/reference/src/pdf-flow.js` distingue le texte et son style avant de recomposer les lignes. Les paragraphes séparés et les éléments de liste restent distincts. Un vocabulaire de césures vérifié pour l’édition fournie permet de réunir les mots coupés sans supprimer les traits lexicaux comme « peut-être » ou « sous-lieu ». Ce vocabulaire ne contient que des formes de mots, aucun passage du livre ; ce n’est pas une réécriture ou une correction orthographique des règles. Les caractères discrétionnaires sont retirés. Les marqueurs d’italique ne bloquent plus la jonction.

Le rendu applique la même lecture aux anciennes banques privées, **sans écriture**. Une nouvelle extraction PDF stocke directement les paragraphes recomposés ; les deux continuations entre colonnes/pages sont réunies au lieu d’ajouter systématiquement un paragraphe à la frontière. La banque privée reste séparée des campagnes. Aucun HTML importé n’est interprété.

## Vérifications et limites

Nouveaux tests : prose en plusieurs lignes, césures dures reconnues/discrétionnaires, traits lexicaux, paragraphes, listes, fragments italiques, échappements et absence de mutation. Navigateur : 111 cartes, familles sur une ligne, approche sous le titre aux quatre résolutions, anciennes descriptions privées corrigées à l’affichage sans réécriture, sécurité du rendu, rechargement et hors ligne. Les tests précédents sont conservés.

Contrôle privé sur les 111 passages déjà extraits : contenu textuel préservé après normalisation des espaces et césures ; 92 fins de ligne précédées d’un trait d’union avant remise en page, aucune après, traits lexicaux conservés. Le véritable PDF est contrôlé séparément ; aucun texte intégral ni capture de celui-ci n’entre dans les artefacts publics. Les résultats définitifs et le prototype téléchargeable sont dans la PR 15.

Les anciens JSON ne contiennent pas toutes les informations de mise en page du PDF : les doubles retours déjà présents restent des paragraphes. Pour régénérer les paragraphes directement à partir de la géométrie du livre, utiliser à nouveau **Gestion → Préparer depuis mon PDF personnel**, confirmer puis exporter la banque privée. Les descriptions d’une autre édition peuvent nécessiter une revue ; aucune règle ni mot inconnu n’est inventé pour compléter le texte.
