# Refonte UI/UX — lot 3A : fiches détaillées et édition protégée

## Base et périmètre

Branche `refonte/ui-ux-fiches`, depuis `c6e1e0b` du lot 2. La PR nº 4 reste ouverte,
ses tests GitHub sont réussis ; cette livraison en dépend sans la fusionner.
Référence locale avant intervention : **231/231 scripts réussis**, une limite `file://` annoncée.
`AGENTS.md`, le cahier des charges et les écrans réels ont été examinés.

Cette étape réalise le **socle des fiches**, leur séparation PJ/PNJ et la protection de
l’édition. Elle ne prétend pas terminer l’adaptation des ressources PNJ : voir le lot 3B
restant ci-dessous. Lieux et Livrets détaillés restent les étapes suivantes.

## Comportement livré

| Sujet | Résultat |
|---|---|
| Consultation | Ouverture de fiche en lecture, action explicite Modifier ; ajustements rapides de ressources séparés |
| PJ | Exactement Aperçu, Livret, Techniques, Histoire et relations ; caractéristiques officielles et valeurs réelles |
| PNJ | Exactement Aperçu, Techniques, Lieux ; désir, description facultative, importance, principe enregistré et position actuelle |
| Panneau permanent | Portrait, identité, entraînement, ressources et effets ; environ un tiers du contenu desktop, sticky avec défilement si nécessaire |
| Mobile / faible hauteur | Panneau dans le flux naturel, portrait réduit, commandes compactes ; aucun panneau fixé prenant tout l’écran |
| Édition | Brouillon explicite, Enregistrer et Annuler ; erreur de stockage conserve le brouillon et restaure le modèle |
| Sortie de fiche | Confirmation d’abandon lors de fermeture, changement de personnage/type, navigation et imports ; protection beforeunload |
| Fatigue / équilibre | Clic direct et boutons +/−, enregistrement immédiat en consultation ; en édition, changement du brouillon uniquement |
| Annulation | Dernier ajustement de fatigue, équilibre ou état annulable ; référence de bibliothèque et ressources vérifiées pour éviter une annulation obsolète |
| Centre PJ | Action distincte en édition, valeur préparée puis confirmation spécifique à l’enregistrement ; la jauge de position ne déplace pas le centre |
| États / statuts | États ajustables par les opérations existantes ; statuts consultables, édition explicite ; le combat lié n’est pas écrasé |
| Techniques | Cartes de consultation et degrés existants ; ajout dans le brouillon puis sauvegarde explicite |
| Portraits | PNG/JPEG/WebP locaux, 256 Ko maximum par fichier ; type/signature et décodage vérifiés, image embarquée dans le JSON, affichage fiche et galerie |
| Données anciennes | Champs non modifiés préservés, y compris valeurs +3, CRLF, espaces dans les listes et métadonnées inconnues |

Les anciennes données PNJ supplémentaires restent disponibles sous « Données historiques »
et en édition sous « Données historiques et classification » ; elles ne deviennent pas
une grille PJ dans la consultation PNJ. Aucun champ utile n’est effacé pour alléger la fiche.
L’onglet Lieux affiche et permet d’éditer la position textuelle actuelle ; il n’introduit
ni domicile ni associations fictives avant le modèle hiérarchique du lot 4.

L’onglet Livret réemploie les manœuvres enregistrées et la référence de page existante,
sans inventer de texte, de moment d’équilibre, de progression ou d’automatisme. Leur
structure complète et leurs fonctions détaillées restent au lot 5 / aux spécifications dédiées.
La progression n’est pas ajoutée au panneau permanent.

## Règles : sources et séparation du travail restant

Le PDF fourni est réellement accessible et lisible. Repères consultés : **p. 103** pour
position/centre d’équilibre ; **p. 239–242** pour les PNJ. Les pages imprimées correspondent
ici aux pages PDF 104 et 240–243. Aucun extrait substantiel, scan ou dérivé du livre n’est
ajouté au dépôt.

- **Règle explicite / spécification :** les PNJ peuvent avoir des capacités et des états
  différents des PJ, avec notamment des jauges de fatigue de 3 à 15 cases selon les cas.
- **Comportement actuel conservé :** le modèle `Roster` et le moteur de combat imposent encore
  fatigue 0…5, équilibre −3…3 et les cinq états historiques. Les anciennes ressources ne sont
  pas recalculées à partir de l’importance.
- **Livraison UI :** deux présentations distinctes, affichage de la valeur PNJ existante sans
  jauge à deux principes PJ, deux repères PJ, commandes dans les limites déjà implémentées.
  Aucun dépassement ni perte d’équilibre n’est automatisé par un clic.
- **Lot 3B restant :** aligner modèle, validation d’import, copie vers le combat, coûts/effets,
  états personnalisés et jauges PNJ avant d’offrir des capacités 3/5/10/15, les cas non combattants
  et les bornes PNJ à principe unique. Une simple modification du dessin des cases laisserait
  ces fiches incompatibles avec le combat ; cette évolution exige des tests de domaine dédiés
  et une stratégie de compatibilité non destructive.

Ce report est une dépendance technique identifiée, pas une ambiguïté tranchée contre le livre.
Aucune nouvelle interprétation de règle n’est codée dans ce lot 3A.

## Architecture et sécurité

Le HTML reste autonome. Le moteur, le catalogue, `Roster` et les données de Livrets sont
identiques au lot 2 par comparaison du script avant `quickSheetResource`. Le journal
transactionnel de sauvegarde complète reste inchangé. Les imports ajoutent une garde de
brouillon, sans changement de format, de clé de stockage ni de validation mécanique.

`renderLegacySheetEditor` réemploie les champs existants. `showSheet` construit consultation
et édition ; `sheetPatchFromFields` produit seulement les champs réellement modifiés.
Les listes et textes historiques ne sont plus réécrits simplement parce qu’on modifie un nom.
Le brouillon est temporaire, pas une seconde bibliothèque persistée.

Les nouvelles métadonnées optionnelles sont `desire`, `description`, `portrait`. Elles ne
sont ajoutées que si modifiées. Les portraits externes ou actifs (URL distante, SVG, script)
ne sont pas rendus ; une ancienne valeur inconnue est conservée tant qu’elle n’est pas modifiée.
Un raster importé illisible conserve son contenu sauvegardé et affiche l’avatar neutre.
Les lectures tardives de fichier vérifient la fiche et la révision d’édition avant application.

Les textes personnalisés sont échappés. Les identifiants du panneau et de la liste historique
transitent par le DOM / `data-*`, sans interpolation dans du code d’événement. La régression
sécurité du lot 2 est renforcée avec un identifiant contenant des guillemets et du HTML.
Aucune ressource distante n’est nécessaire à ces fonctions.

## Vérifications

- Suite complète : **233/233 scripts réussis** (193 JavaScript, 40 navigateur),
  **0 échec**, une limite locale `file://` explicitement annoncée. Commande :
  `python scripts/test.py --jobs 2 --report /workspace/work/uiux-lot3-final.json`.
  Parcours fiches/galerie rejoués après les dernières protections de portrait et d’identifiant ;
  parcours fiches rejoué après restauration du focus clavier.
- 32 scénarios JavaScript ciblés : patch limité aux modifications, champs inconnus, listes
  anciennes, CRLF, statistiques personnalisées et refus des portraits actifs/distants.
- Cinq formats Chromium : 1440×1000, 1024×768, 390×844, 844×390, 320×640.
- Onglets exacts par type, consultation par défaut, panneau desktop/mobile, absence de
  débordement, ressources accessibles sur chaque onglet et annulations vérifiés.
- Abandon refusé/accepté, garde beforeunload, technique en brouillon, centre confirmé,
  portraits valides/trop grands, lecture retardée et échec de stockage testés.
- Export/restauration complète puis rechargement comparés sur les modèles entiers ;
  portrait embarqué, métadonnées et valeurs anciennes conservés ; combat stocké inchangé.
- Les deux tests de galerie et de recette sont adaptés aux actions Modifier et au panneau
  permanent, en conservant leurs assertions de persistance, rollback et liaison au combat.
- Syntaxe JavaScript, invariants du moteur et `git diff --check` vérifiés ; captures inspectées.

## Vérification simple dans Chrome

1. Télécharger `app/simulateur.html` de cette branche comme pour les lots précédents.
   Conserver le fichier habituel et un export de sécurité séparément.
2. Ouvrir une fiche PJ puis PNJ et parcourir leurs onglets ; vérifier les ressources sur le côté.
3. En consultation, ajuster une fatigue puis annuler. Vérifier le rechargement.
4. Cliquer Modifier, changer un nom puis essayer de quitter. Refuser l’abandon : le brouillon
   doit rester. Annuler ensuite ou enregistrer explicitement.
5. Tester un portrait local léger et un export/restauration depuis Gestion.

## Limites et retour arrière

Les ressources PNJ étendues, l’arbre de Lieux et les automatismes des Livrets ne sont pas
livrés ici. Le quota du navigateur peut limiter le nombre de portraits ; une erreur
n’annonce pas un faux succès. L’annulation rapide est en mémoire et ne survit pas au rechargement.
Le navigateur administré bloque `file://` : le test hors ligne passe par HTTP local puis
coupe le réseau ; le double-clic Chrome/macOS reste une recette du propriétaire.

Les nouvelles métadonnées restent lisibles comme champs additionnels par les versions
précédentes. Retour arrière : rétablir le commit UI, conserver les exports, sans effacer
le stockage et sans migration à inverser. Aucun fichier existant n’est supprimé.
Aucune fusion dans `main` effectuée.
