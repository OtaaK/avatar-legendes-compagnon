# Décisions de conception

## 2026-11-07 — Base de référence V2.32

- Préserver le comportement applicatif avant de refactoriser.
- Conserver les tests historiques et les rapports dans le dépôt.
- Ne pas publier le PDF commercial du livre de règles.
- Considérer la conformité exhaustive des techniques de Terre et les tests navigateur comme travaux ouverts.

## 2026-11-07 — V2.33 : corrections après audit Terre

### Règles appliquées

- Le PDF fourni sert de référence documentaire : techniques p.289, fatigue p.100, statuts p.155–157. Il n'est pas ajouté au dépôt.
- Un coût volontaire de Terre ne se convertit pas en états. La fatigue involontaire conserve sa conversion. Le coût net tient compte des réductions approuvées.
- La gêne de Mouvements tectoniques couvre la prochaine passe, conformément au report des effets mécaniques des nouveaux statuts p.157 ; elle expire ensuite. Le comportement des événements temporaires des autres techniques reste inchangé.
- Une Frappe supplémentaire de Boue est une attaque ordinaire pour les protections et réactions ; seule sa disponibilité échappe au quota et à l'approche habituels.
- Un paiement de résistance ne constitue pas une attaque. Un désengagement faisant partie d'une attaque est neutralisé lorsque cette attaque est bloquée.

### Décisions ouvertes — comportement antérieur conservé

| Sujet | Comportement conservé | Décision nécessaire |
|---|---|---|
| Gantelet : état ou fatigue | Choix saisi comme choix de la cible | Le texte p.289 ne nomme pas explicitement le décideur. |
| Tectoniques : branche Étourdi | Retrait selon fiction, sans échéance automatique | Déterminer l'articulation entre « pendant une passe » et la durée narrative d'Étourdi. |
| Lave : attaque sans conséquence offensive | Fracasser exige une conséquence offensive réelle résolue | Déterminer si une attaque bloquée ou sans dégâts suffit. |
| Escalier : annulation tardive | Choix de résistance pendant la proposition | Définir une éventuelle fenêtre d'annulation après activation. |
| Projection : retour au sol | Retour narratif, pas de réengagement automatique | Le MJ décide des liens au retour ; aucune restauration identique n'est inventée. |
| Cumul de Boucliers | Plusieurs effets peuvent protéger une cible | Préciser le nombre de boucliers et de blocages autorisés. |
| Entraves : libération narrative | Dérogation MJ explicite disponible | Assumer l'exception ou limiter aux deux motifs du texte (maîtrise du métal / fin de combat). |

### Compatibilité et périmètre

- Clés de stockage et format JSON existants conservés. Les exports portent V2.33.
- Les anciens tests restent conservés ; seules les attentes réglementaires erronées et les assertions d'interface périmées sont adaptées.
- Aucune migration automatique des anciens indicateurs ambigus de provenance ; arbitrage MJ si un avantage indépendant ne peut pas être distingué d'une ancienne source de Terre.
- Les coûts des autres familles ne sont pas déclarés conformes par ce chantier.

## 2026-11-07 — Maintenance de structure, sans changement fonctionnel

- V2.33 locale sécurisée avant toute réorganisation : archive du répertoire, bundle Git,
  puis commit de conservation sur une branche dédiée. Référence : `backup/v233-before-maintenance`
  (`d247193`). `AGENTS.md` récupéré depuis GitHub et synchronisé sans remplacer le travail local.
- Application conservée dans `app/simulateur.html`, strictement identique à ce point de départ.
  Aucun arbitrage de règles, changement d'ergonomie ou de données utilisateur pendant cette mission.
- Tests séparés en `tests/js/` et `tests/browser/`, matrice dans `data/`, outillage dans `scripts/`.
  Les assertions des 223 tests historiques sont conservées ; seuls leurs chemins et la localisation
  de Chromium changent. Un nouveau test vérifie l'utilisation hors connexion et le réimport JSON.
- Tous les rapports historiques sont conservés. L'ancien accueil V0.71 devient
  `docs/historique/README_ORIGINAL_V071.md` et un index contextualise les archives.
- Les deux exemplaires du rapport V2.32 restent conservés ; les fonctions sans appel statique
  identifié ne sont pas supprimées faute de preuve suffisante d'inutilité.
- Modularisation du HTML évaluée et reportée à une mission distincte : conserver un HTML autonome
  généré si des sources séparées sont introduites ultérieurement. Aucune dépendance d'application
  ni étape de compilation ajoutée.
- Une Pull Request doit distinguer les changements V2.33 déjà présents localement et la maintenance
  non fonctionnelle effectuée ensuite. Aucune fusion dans `main` sans accord du propriétaire.

## 2026-11-07 — Retours de recette Chrome/macOS

- Le propriétaire demande le rafraîchissement du récapitulatif de fatigue, une confirmation
  d'enregistrement, la séparation visuelle PJ/PNJ et l'accès aux PNJ depuis Combat.
- Le récapitulatif reflète le brouillon du formulaire ; le bouton Enregistrer conserve son rôle.
  La confirmation est un message de succès après sauvegarde, sans dialogue supplémentaire pour
  les enregistrements internes.
- Les cartes PJ mal masquées sont un défaut d'affichage, pas un doublon à supprimer des données.
- L'ajout d'une fiche au combat reprend une copie liée ; les ressources de la fiche ne sont pas
  écrasées automatiquement par les modifications du combat.
- Un éditeur ciblé permet de modifier les combattants pendant la déclaration, sans action en
  attente ; il conserve les statuts dépendant d'un effet actif et l'annulation transactionnelle.
- Ces correctifs fonctionnels sont distincts de la réorganisation sans changement de HTML au
  commit `67273e0`. Les règles et les techniques ne sont pas modifiées.
- La refonte UI/UX générale évoquée par le propriétaire est à cadrer dans une mission ultérieure.

## 2026-11-07 — Fiabilité des imports, avant la refonte UI/UX

- Poursuivre le développement par une correction ciblée de fiabilité ; conserver les écrans,
  les règles, les clés de stockage et les formats d’export existants.
- Refuser les références d’engagement/piège incohérentes ; accepter encore les champs
  optionnels absents ou nuls et les identifiants de piège anciens non vides.
- Effectuer le rendu avant la persistance des données importées. En cas d’échec, rétablir
  les modèles précédents ; conserver le journal existant pour la sauvegarde complète.
- Aucun nettoyage ni migration silencieuse de sauvegarde ; aucune fusion de cette nouvelle
  proposition sans accord du propriétaire.

## 2026-11-07 — Refonte UI/UX, lots 0 et 1

- Le cahier des charges poussé par le propriétaire est la référence de conception. Les choix
  visuels validés sont appliqués progressivement, sans réinterprétation des règles.
- Première livraison limitée au thème embarqué et à la navigation : bleu pétrole, accents
  dorés de sélection, icônes SVG originales locales, menu latéral desktop et grille mobile.
- Ordre : Accueil, Personnages, Lieux, Combats, Techniques, Gestion ; Alt+1…6 suit cet ordre.
  Les identifiants historiques home/characters/combat/catalog restent inchangés.
- Gestion réemploie les fonctions et sélecteurs d’import existants ; les anciens accès sont
  conservés. Aucun réglage, stockage ou format parallèle.
- Lieux est annoncé explicitement comme non encore intégré ; les textes historiques restent
  dans les fiches PNJ. Le modèle hiérarchique viendra au lot 4, sans migration dans le lot 1.
- Le script ne change que dans le bloc de navigation ; moteurs, modèles, catalogue et
  persistance restent identiques à la référence `42b306f`.
- Les lignes `.row[hidden]` respectent désormais leur masquage : le `display:flex` historique
  les réaffichait. Les outils restent accessibles par les commandes existantes et Gestion.
- Les prochaines PR traiteront cartes, fiches, Lieux puis Livrets, avec vérifications entre
  lots. La programmation exhaustive des dix Livrets reste hors périmètre.

## 2026-11-07 — UI/UX, lot 2 : galerie Personnages

- Branche dépendant du lot 1, sans fusion de la PR nº 3. Cartes compactes, avatars neutres
  et icônes originales embarquées ; portraits personnalisés reportés à l’édition des fiches.
- Importance optionnelle : ne pas classer automatiquement les anciennes fiches. Conserver
  les anciennes valeurs inconnues, sans changement implicite des ressources. Les quatre
  choix du cahier des charges sont une classification, pas une automatisation réglementaire.
- Les outils de sauvegarde passent après les cartes pour dégager la galerie, sans supprimer
  leurs commandes ; Gestion reste accessible.
- Le filtre de rôle réutilise `livret` sur les PNJ. Pas de second modèle concurrent. Recherche
  historique conservée ; filtres cumulables et tri explicite, non classés en fin dans les deux sens.
- Le centre et la position sont deux repères d’affichage d’un même modèle PJ existant. Pas de
  jauge PJ sur PNJ, ni de déduction de bornes PNJ à partir de la catégorie dans ce lot.
- Les fiches, ressources variables PNJ et consultation/édition distinctes restent le lot 3 ;
  aucune règle du jeu n’est modifiée par le lot 2.

## 2026-11-07 — UI/UX, lot 3A : consultation et édition des fiches

- Fiche consultée par défaut ; Modifier ouvre un brouillon, Enregistrer ou Annuler le termine.
  Les sorties, changements de fiche/type, imports et rechargements protègent les modifications.
- PJ : Aperçu, Livret, Techniques, Histoire et relations. PNJ : Aperçu, Techniques, Lieux.
  Les champs historiques non retenus dans la présentation minimale restent accessibles.
- Ressources courantes enregistrées en consultation et ajustables dans le brouillon en édition,
  sans sauvegarde implicite des changements structurels. Centre PJ confirmé séparément.
- Annulation du dernier ajustement en mémoire, protégée contre un état ou une bibliothèque
  remplacés. Les statuts et la copie de combat ne sont pas effacés automatiquement.
- Portraits raster embarqués (PNG/JPEG/WebP, fichiers jusqu’à 256 Ko), affichés fiche et galerie.
  Métadonnées optionnelles `desire`, `description`, `portrait`, sans migration de schéma.
- PDF effectivement consulté : équilibre p. 103 ; PNJ p. 239–242. Les capacités PNJ différentes
  sont confirmées ; le moteur et Roster restent à limites communes. Le lot 3B doit traiter
  ensemble modèle, validation, combat et compatibilité avant les jauges 3/5/10/15 et états PNJ
  personnalisés. Aucun changement de règle ou recalcul silencieux dans ce lot UI.
