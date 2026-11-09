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


## 2026-11-08 — UI/UX, lot 3B : ressources PNJ

- Application progressive du cahier des charges : aucune migration par simple changement
  d’importance, aucune suppression automatique de fatigue, d’état ou de principe existant.
- PDF consulté, pagination imprimée : fatigue p. 100, PNJ p. 239–242. Propositions
  mineur 3/1/1, majeur 5/3/2, maître 10/5/3, légendaire 15/8/4
  (fatigue/nombre d’états/équilibre maximal). Les noms manquants sont saisis par le MJ.
- Profil optionnel explicite, principe requis si jauge positive ; les données historiques
  restent à leurs limites V2.33 tant que l’utilisateur ne confirme pas un profil compatible.
- Les coûts/effets gardent leurs quantités ; bornes et listes d’états sont propres au PNJ.
  Dépassement d’équilibre nécessitant une conséquence : arrêt explicite pour le MJ, sans
  inventer d’automatisme de perte d’équilibre ou de défaite. Ce n’est pas un audit réglementaire exhaustif.
- Non-combattant sans fatigue ni états : ajout au combat refusé. Pas de création automatique
  de groupes. Les profils de combat existants ne changent pas avec une fiche permanente ;
  une synchronisation incompatible est refusée sans mutation partielle.
- Après confirmation d’activation : canal local v021 séparé, v020 conservé, journal atomique
  et export du point antérieur depuis Gestion. Les exports étendus portent une version 2 ;
  l’ancien code ne doit pas interpréter ces nouvelles ressources comme un modèle historique.
- Écritures bloquées si récupération impossible ou données v021 illisibles ; restauration
  complète volontaire pour réparer. Aucune fusion automatique entre ancien et nouveau canal.
- Aucun PDF, extrait substantiel, test ancien supprimé ou fusion dans main dans cette livraison.


## 2026-11-08 — UI/UX, lot 4 : Lieux

- Application du cahier des charges, sans modification de règle du jeu : modèle narratif
  dans la bibliothèque commune, identifiants indépendants du nom et du parent.
- Trois relations séparées : domicile, associations et position. Position non migrée
  (champ absent) et position explicitement vide (null) restent distinctes. Les groupes Présents,
  Associés et Domiciliés sont distincts ; un domicile seul ne crée pas une association.
- Aucun rapprochement automatique de textes identiques. Le rattachement de l’ancien texte
  à la position est proposé et confirmé ; en cas de noms ambigus, sélection manuelle requise.
- Cycles et données mal formées refusés ; références absentes structurellement valides
  conservées et affichées pour réparation volontaire. Aucun effacement silencieux à l’import.
- Suppression proposée avec dépendances : confirmer la promotion des sous-lieux au parent
  et le retrait des seuls liens concernés, ou annuler pour réaffecter manuellement.
  Aucun PNJ ou sous-lieu n’est supprimé en cascade.
- Première activation dans le canal v021 existant, sauvegarde complète version 2 et point
  v020 conservé. Aucune nouvelle dépendance, extraction de code, migration destructive ou fusion.


## 2026-11-08 — UI/UX, lot 5 : structure des Livrets

- PDF réellement accessible, progression consultée p. 212 : jauge de quatre cases.
  Le cahier des charges limite ce lot au socle ; aucune attribution de progression,
  consommation de cases ou évolution de caractéristiques n’est automatisée.
- Progression seulement dans Livret, jamais dans le panneau permanent ni sur les PNJ.
  Suivi manuel par Livret exact, conservé après changement ; corrections via Modifier.
- Moment d’équilibre : indication manuelle non renseignée/non débloqué/débloqué, sans
  validation de condition, effet de combat ou compteur d’utilisation inventé.
- Afficher les manœuvres réellement saisies, sans catalogue officiel incomplet ni fausse
  appartenance à un nouveau Livret. Les déclencheurs et assistances spécifiques sont reportés.
- Adaptateur de présentation et notes libres pour les spécificités ; Palmarès explicitement
  non automatisé. Le livre disponible ne constitue pas un modèle de données déjà intégré :
  ni liste complète d’objectifs ni parcours de récompense partiellement fonctionnel dans ce lot.
- L’état est optionnel, validé et conservé dans les sauvegardes étendues v021/version 2.
  Refuser la modification simultanée du Livret choisi et de son suivi, en demandant deux
  enregistrements distincts ; ne jamais réattribuer silencieusement les cases.
- Les noms de Livrets personnalisés déjà enregistrés restent visibles et sélectionnés.
  Aucun PDF ni extrait substantiel versionné, aucune fusion dans main.


## 2026-11-08 — UI/UX, lot 6 : harmonisation et recette globale

- Repère V2.33 refonte UI/UX en validation ; conserver V2.33 comme version déclarée.
- Point antérieur nommé données étendues, car activé par profils PNJ, Lieux ou Livrets.
  Libellé et nom du téléchargement clarifiés, fonctions/format/clés conservés.
- Repli mobile facultatif par fiche, en mémoire jusqu’au rechargement ; affichage ouvert
  par défaut et ressources toujours visibles en grand écran. Aucun changement de données.
- Relier les libellés adjacents à leur champ. La recette clavier n’est pas présentée comme
  un audit complet d’accessibilité ou une certification de toutes les cibles tactiles.
- Corriger le raccourci de cible pour actualiser les états possibles ; ne modifier aucune
  règle ou quantité d’effet et ne réinitialiser aucun autre paramètre.
- Critères suivis dans un document distinct, sans cocher ni réécrire le cahier des charges
  original. Recette Mac et confort attendus du propriétaire avant autorisation de fusion.
- Les anciens guides restent contextualisés comme historiques. Aucun déploiement, fusion
  automatique ou programmation des dix Livrets dans cette mission.


## 2026-11-08 — Retours de recette, points 3, 4 et 6

- Le propriétaire précise que le choix Légendaire seul laissait cinq fatigues. Conserver la
  possibilité de classification seule, mais proposer immédiatement et explicitement de
  préparer le profil 15/8/+4. Un profil incomplet ne s’enregistre pas et les noms manquants
  ne sont pas inventés. Les fiches déjà classées ouvrent leur configuration si la fatigue diffère.
- Rafraîchir la galerie au retour d’un autre espace ; suivre un filtre renommé seulement si
  l’ancien nom n’est plus utilisé. Aucun rapprochement automatique des textes historiques.
- Ajouter Retirer du combat avec confirmation, instantané et protection des dépendances.
  Déclaration seulement, sans action/proposition/effet dépendant ; ne pas supprimer de fiche
  ni interpréter une règle de départ ou défaite. L’undo restaure aussi les engagements.
- Les parcours historiques de classification seule refusent la nouvelle proposition de profil ;
  leurs assertions de conservation des données restent présentes. Aucun test supprimé.
- Correctifs sur branche dépendante de la PR nº 9, sans fusion dans main.


## 2026-11-08 — Nouvelle orientation : interface v0 comme base

**Décision du propriétaire :** reprendre l’interface React v0 pour le rendu, la navigation
et l’organisation des écrans ; adapter les fonctionnalités Codex derrière elle. Les modèles,
règles implémentées, sauvegardes et acquis des PR nº 3 à 10 restent la référence métier.
L’ancienne refonte HTML est conservée dans l’historique et comme application de référence.
Les anciennes décisions visuelles ne doivent pas être imposées à v0.

**Préparation effectuée :** audit des deux snapshots, chaîne GitHub vérifiée, 243 tests Codex
réussis, prototype v0 compilé avec TypeScript. Branches d’étude isolées ; documentation seule,
aucun moteur extrait et aucun composant remplacé. La version v0 corrigée doit être fournie
avant intégration effective. Ni fusion des PR ni déploiement dans cette mission.

**Recommandations à valider :** projet unifié dans le dépôt fonctionnel, UI v0 en amont,
React/Vite local, modules métier JavaScript extraits à comportement identique, service de
commandes transactionnelles, espace React isolé avec codecs historiques. Ce sont des
propositions du [plan](migration/FAISABILITE_CONVERGENCE_V0.md), pas des modifications déjà
appliquées aux sauvegardes ou une autorisation d’intégration.


## 2026-11-08 — Validation de convergence et réalisation limitée au lot 1

**Décisions explicites du propriétaire :** React + TypeScript + Vite ; dépôt principal
`avatar-legendes-compagnon` ; v0 visuel `8b8924d` ; métier `a9079fa` incluant PR 3–10 ;
sept lots ; conservation de l'ancien HTML, règles, tests et formats ; reprise explicite
par export/import ; hors ligne sans outils installés par l'utilisateur final.
Le lot 1 est autorisé, le lot 2 attend une validation séparée. Aucune fusion ni déploiement.

**Mise en œuvre technique courante :** extraction reproductible de 11 modules JS, exports
ESM et imports explicites sans modifier les corps ; TypeScript aux frontières ; shell v0
et styles conservés ; React externe au moteur via un store stable ; codecs indépendants
sans stockage ; repository local isolé, une écriture du couple bibliothèque/combat.
Le montage n'écrit rien. Une erreur de lecture bloque les écritures et refuse d'exporter
un faux état vide comme récupération. Les aperçus sont sans écriture et les plans périmés
sont refusés. Les champs inconnus sont conservés, avec les normalisations historiques.

Le laboratoire écrit sa note fictive sous `avatar-compagnon-react-lab-v1` uniquement.
Le namespace projet est réservé séparément, sans migration automatique des anciennes clés.
Web Locks sérialise les écritures quand disponible ; sinon le contrôle est optimiste et ne
prétend pas garantir deux écritures exactement simultanées. Un seul onglet éditeur reste
la recommandation. Les données de démonstration v0 ne sont pas un format métier.

Vite + singlefile fournit un prototype d'un seul HTML, sans police distante ni analytics.
Le cloud bloque les navigations file:// ; les essais hors réseau du document embarqué
ne certifient pas l'ouverture native macOS. Le design n'a pas été remplacé pour contourner
cette limite. Voir [bilan](migration/BILAN_LOT_1.md), [matrice](migration/MATRICE_FONCTIONNELLE.md)
et [recette sans commande](migration/TESTER_LOT_1.md).


## 2026-11-08 — Lot 1 validé, lot 2 et bibliothèque indépendante

Le propriétaire valide le shell et le fonctionnement général après essai sur Mac. Il
autorise le lot 2 Personnages/ressources, avec véritable persistance Codex, portraits,
profils, ajustements annulables, navigation des fiches et import/export contrôlé.
Les données de combat restent des copies indépendantes. Aucun lot 3 commencé.

Une bibliothèque indépendante est insérée après validation du lot 2 : 111 techniques,
recherche/filtres/fiches v0, données et assistance existantes uniquement. Attribution et
maîtrise restent au lot 4, utilisation au lot 5. Branche et PR séparées ; ne pas commencer
cette bibliothèque avant accord explicite sur le lot 2. Voir les critères dans ROADMAP.md.


### Mise en œuvre du lot 2

Les formulaires appliquent le patch minimal Codex, y compris ses limites, normalisations,
confirmations et conservation des champs inconnus. Deux groupes d'ajout/retrait v0 séparent
états et statuts. Les profils restent volontaires ; importance seule inchangée côté ressources.
Le projet utilise le namespace React réel du lot 1 ; l'import est explicite avec aperçu,
confirmation et export préalable proposé. Aucune écriture ou récupération des anciennes clés.
La bibliothèque, le combat et leurs historiques restent conservés ensemble par le store.
La création PJ est manuelle ; aucune logique de Livret ajoutée. L'annulation permanente
reste temporaire, distincte des instantanés de combat.


## 2026-11-09 — Bibliothèque informative autorisée

Le propriétaire autorise une branche dépendante de la PR 13 pour la bibliothèque des 111
techniques. Cartes v0 limitées à famille/nom/approche, entièrement cliquables ; fenêtres
famille/nom/approche/description. Recherche par nom sans casse/accents ; filtres indépendants
par boutons et intersection ET. Aucun changement des règles, maîtrises, fiches ou combats.

Le PDF est accessible localement et les correspondances sont contrôlées sans en publier
les passages. Aucun droit de reproduction intégrale n'a été trouvé dans le dépôt : pas de
texte intégral dans le code ou le HTML distribué. Les résumés existants ne sont pas des
substituts. Un fichier privé explicitement fourni peut alimenter un espace local distinct,
sans export dans les sauvegardes Codex ; le contenu importé n'est pas certifié éditorialement.
La matrice précise ses limites : métadonnées/repérage des passages, pas transcription certifiée.

Le chantier ergonomie des fiches PJ/PNJ est distinct et différé. Les formulaires ne sont pas
refondus pendant ce lot ; aucun autre lot, déploiement ou fusion sans nouvel accord.

### 9 novembre 2026 — Correctifs de recette bibliothèque

Le propriétaire autorise les cartes plus compactes et les neuf bordures discrètes, ainsi que la préparation groupée de ses descriptions depuis son PDF pour usage local privé. PDF.js est embarqué hors réseau ; aucun texte du livre n’est publié. L’export JSON privé reste distinct de la campagne. Les techniques et règles sont inchangées. Relecture du résultat automatique nécessaire, aucune fusion ni autre lot autorisé.
