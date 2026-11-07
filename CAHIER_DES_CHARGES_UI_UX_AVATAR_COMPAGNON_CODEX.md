# Avatar Légendes : Compagnon — Cahier des charges UI/UX pour Codex

**Statut :** spécification de conception approuvée pour mise en œuvre progressive  
**Date :** 7 novembre 2026  
**Cible :** dépôt privé `OtaaK/avatar-legendes-compagnon`, version de travail annoncée **V2.33**  
**Objet :** mettre en place l'architecture visuelle, la navigation, les composants de fiches, les espaces Personnages et Lieux, et les interactions communes validées. **Les mécaniques ergonomiques propres aux dix Livrets sont explicitement reportées.**

> **Instruction centrale à Codex :** implémenter la refonte UI/UX ci-dessous **sans réécrire les règles du jeu**, sans supprimer de données existantes et sans présumer que les images conceptuelles sont des spécifications fonctionnelles. Auditer le code actuel et proposer/produire des PR incrémentales vérifiables. Si une règle ambiguë exige une interprétation, la signaler avant de modifier son comportement.

---

## 0. Sources, priorité et limites

1. Lire en priorité le `AGENTS.md` réel du dépôt, `README.md`, `ROADMAP.md`, `docs/DECISIONS.md`, les tests et l'état réel de `app/simulateur.html`. **Vérifier la branche et les changements apportés en V2.33, ainsi que la restructuration éventuellement issue de la PR #1.** Le présent fichier n'affirme pas que cette restructuration est déjà fusionnée.
2. L'application existante et ses sauvegardes sont la source de vérité pour les champs et fonctionnalités **déjà implémentés**. Les décisions ci-dessous définissent **l'UI cible**, pas une permission de détruire un champ ancien.
3. Le PDF officiel d'*Avatar Légendes : le jeu de rôle* sert de référence réglementaire **uniquement s'il est réellement accessible à Codex**. Références pertinentes : équilibre PJ p. 103 ; Livret L'Audacieux p. 171–173 ; construction et catégories de PNJ p. 239–242 ; progression et évolutions dans le chapitre correspondant. Vérifier les pages avant de coder les règles.
4. **Ne pas committer ni redistribuer** le PDF commercial, ses scans, ses images extraites ou de longs textes de règles. Utiliser références de pages et paraphrases brèves dans la documentation.
5. Des maquettes générées par IA ont servi de support de discussion. **Elles contiennent des noms, caractéristiques, techniques, valeurs, principes, libellés et images fictifs, parfois inexacts.** Seules les règles écrites ci-dessous sont normatives. Ne pas copier d'images de personnages sous droits, ni de logos officiels.
6. Cette mission vise l'UI/UX ; toute automatisation nouvelle des effets de Livret non décrite comme validée doit rester en attente. Conserver les opérations du moteur existant et leurs protections.

## 1. Objectifs et principes transversaux

- Application **élégante, claire, immersive, sobre et utilisable rapidement pendant une partie** ; éviter tableaux de bord saturés, mosaïques de gros encadrés et longs formulaires permanents.
- Univers graphique : **bleu nuit / bleu pétrole**, accents **dorés modérés**, typographie lisible, lignes de séparation fines, transparences subtiles, ombres douces, arrondis légers à moyens, espacement généreux.
- Les couleurs d'entraînement / élément complètent la palette structurelle ; **l'or signale la sélection ou l'interaction importante**, sans contour doré partout.
- Favoriser la **hiérarchie de l'information**, le contraste, les icônes monochromes originales et la densité maîtrisée ; ne pas recopier les illustrations ou glyphes du livre.
- Desktop : navigation latérale et zone centrale ample ; tablette et téléphone : adaptation responsive, navigation compacte, sans défilement horizontal, actions accessibles au toucher.
- Supporter l'usage **hors ligne**, sans dépendances distantes nécessaires à l'affichage ou au fonctionnement principal ; conserver l'esprit HTML autonome, sauf évolution technique explicitement validée.
- Ne pas supprimer ou altérer les données anciennes, la persistance locale, les imports/exports existants, les références de techniques et les fiches liées au combat.
- Préserver un comportement cohérent clavier, souris et tactile : focus visible, labels accessibles aux lecteurs d'écran, cibles tactiles confortables, tooltips non exclusifs (alternative tap/clic), indicateurs jamais compréhensibles par la couleur seule.

## 2. Architecture principale de navigation

Espaces de premier niveau (ordre recommandé) :

1. **Accueil** — tableau de bord léger, accès rapide à la campagne et aux éléments importants ; pas d'invention d'une nouvelle logique métier.
2. **Personnages** — zones distinctes PJ / PNJ, cartes compactes, fiches détaillées.
3. **Lieux** — nouvelle arborescence de lieux imbriqués et PNJ associés / présents.
4. **Combats** — conserver intégralement les fonctions actuelles, **refonte fonctionnelle détaillée reportée**. À ce stade, harmonisation graphique légère seulement, en limitant les risques.
5. **Techniques** — zone déjà fonctionnelle : **harmoniser visuellement sans refondre le fonctionnement ni les règles**.
6. **Gestion** — accès aux outils, sauvegardes et réglages déjà présents ; préserver leurs fonctions.

Desktop : barre latérale fixe ou repliable ; mobile : navigation adaptée (barre compacte, menu ou équivalent) avec repère de section active, retour explicite et sans masquer les actions essentielles.

## 3. Espace Personnages — vue d'ensemble

### 3.1 Sections

- Deux sections nettement séparées : **Personnages joueurs** et **Personnages non joueurs**.
- Environ trois PJ habituels, nombre de PNJ potentiellement élevé ; **ne pas imposer de limite de PNJ**.
- Une **icône `+` discrète** par section pour créer un PJ ou un PNJ ; pas de gros bouton textuel envahissant.
- Toutes les cartes ouvrent leur fiche détaillée au clic/tap ; accessibles au clavier.
- PJ et PNJ ont une **identité visuelle commune mais des contenus et fiches détaillées distincts**.

### 3.2 Cartes compactes PJ

Afficher : portrait (ou avatar par défaut), nom, **une seule icône colorée d'entraînement sans texte**, fatigue compacte segmentée, petits états actifs, **mini-jauge d'équilibre à deux repères**. Ne pas ajouter le mot « PJ » sur chaque carte. Laisser de la respiration ; si certaines données manquent, afficher un état vide discret.

### 3.3 Cartes compactes PNJ

Afficher : portrait, nom, éventuelle icône d'entraînement, fatigue si applicable, états compacts, équilibre si applicable, position actuelle et **une pastille d'importance** proche du nom.

- Importance officielle : **Mineur**, **Majeur**, **Champion**, **Légendaire**.
- **Pas de badge lourd, d'étoiles ni de barre de classement**. Carte compacte : **pastille seule** près du nom ; légende permanente ou facilement accessible dans la zone PNJ. Au survol/focus/activation, rendre le nom de l'importance accessible.
- Fiche détaillée : **pastille + libellé** près du nom.
- Une palette cohérente proposée (à ajuster pour le contraste) : mineur gris bleu ; majeur bleu turquoise atténué ; champion or doux ; légendaire rose/cuivre discret. Le classement ne dépend jamais du seul code couleur.

### 3.4 Recherche, filtres et tri PNJ

- Recherche textuelle par nom.
- Filtres : **lieu**, **entraînement**, **rôle** (si ce champ existe dans l'application ou en tant que métadonnée de classification), **importance**.
- Tris : nom, lieu, importance croissante et décroissante (au minimum). Ordre des niveaux : Mineur < Majeur < Champion < Légendaire.
- Filtres cumulables, réinitialisables, résultats vides expliqués clairement. Préserver leur état lors d'allers-retours vers une fiche si possible.
- Ne pas confondre « rôle » utilisé uniquement pour filtrer/classer avec une obligation de l'afficher dans la fiche PNJ : le propriétaire souhaite une fiche PNJ minimaliste.

## 4. Patron commun des fiches détaillées

- **Disposition approuvée : portrait et informations équilibrés.** Desktop : portrait occupant environ **un tiers** de la zone supérieure/latérale, contenu de jeu sur les deux tiers restants ; **portrait et ressources visibles pendant la navigation entre onglets** (panneau latéral fixe/sticky ou équivalent robuste).
- **Ne pas figer tout l'écran** : si la hauteur est insuffisante, permettre le défilement du panneau de contenu sans rendre les commandes inaccessibles.
- Panneau ressources **sans multiplication de cartes encadrées** : rubriques intégrées, séparateurs fins, titres secondaires sobres, boutons compacts et espaces respirants.
- Desktop : onglets dans la partie de contenu ; smartphone : portrait réduit, résumé des ressources condensé, onglets accessibles et défilement naturel. **Pas de panneau fixe occupant presque toute la hauteur mobile**.
- Bouton retour vers la galerie ; mode **consultation** par défaut, bouton explicite **Modifier** pour informations structurelles. Les ajustements de ressources autorisés restent disponibles en consultation.
- Toute modification doit être sauvegardée de manière fiable selon les conventions du projet ; en cas d'échec, message explicite et restitution d'un état cohérent.
- Avertir d'un brouillon structurel non enregistré lors de la fermeture/changement de page. Annulation des modifications sensibles, dans la mesure où la structure de sauvegarde le permet.

## 5. Ressources et interactions communes

### 5.1 Fatigue

- **Barre horizontale segmentée en autant de cellules que la capacité réelle du personnage**, avec segments pleins/vides et un rendu qui s'adapte à 3, 5, 10 et jusqu'à **15** cases selon le type de PNJ, sans déborder.
- Jauge interactive : cliquer/toucher une cellule définit la valeur ; si elle est déjà remplie, pouvoir diminuer. Petits boutons **`+` / `−`** pour changer d'un cran ; bornes contrôlées ; indication accessible des valeurs.
- Sur carte compacte, **aucun libellé « Fatigue » requis**, seule la barre ; détails et valeurs accessibles dans la fiche ou à l'activation.
- Pour un **PNJ non combattant**, le PDF indique qu'il peut ne pas avoir de fatigue ni d'états : **masquer ces jauges si non applicables**, au lieu d'inventer 3 ou 5 cases.

### 5.2 Équilibre PJ : deux principes opposés, **une seule position**

- **Sept graduations** interprétées pour un principe de `−3` à `+3`, et inversement pour l'autre : à l'extrémité d'un principe `+3`, l'autre vaut `−3` ; au centre géométrique `0 / 0`. Le couple de valeurs vient **d'une même position**, jamais de deux variables indépendantes.
- Afficher les **noms réels des deux principes** sur la fiche complète.
- Distinguer **l'indicateur actuel** (losange doré) et **le centre d'équilibre** (repère bleu/cyan, cercle ou trait) ; les deux doivent rester perceptibles même lorsqu'ils sont sur la même case. En carte compacte, conserver uniquement les graduations et les deux repères ; noms/valeurs disponibles au détail.
- Modification directe de la position actuelle par case et `+`/`−`, en conservant les règles et contraintes métier. **Le centre ne bouge pas lors d'un clic sur la jauge** : action explicite séparée et protégée.
- Les cas de dépassement / perte d'équilibre sont **du ressort des règles réelles**, pas d'un clamp naïf. Ne pas déclencher automatiquement une perte d'équilibre par simple clic si cette opération ne serait pas légale selon les règles ; vérifier le moteur et le PDF (p. 103 notamment).

### 5.3 Équilibre PNJ : principe unique

- Jauge à **un principe**, de `0` à la borne applicable selon le PNJ ; ne pas afficher les deux principes du PJ ni le marqueur de centre du PJ.
- Vérifier les limites du livre avant tout changement du modèle : mineur combattant souvent `0…+1`, majeur `0…+2`, champion `0…+3`, légendaire `0…+4` ; les cas sans principe/équilibre sont possibles pour certains PNJ mineurs. **Ne pas écraser les personnalisations existantes.**

### 5.4 États et statuts

- **Petites capsules lisibles**, pas de grandes tuiles ; ouvrir le détail par clic/tap/focus et distinguer visuellement **états** des **statuts de combat**.
- Un panneau léger peut réunir les deux catégories, avec séparation subtile.
- Les états actifs peuvent être marqués/effacés depuis la fiche **uniquement par des opérations permises par les règles et l'architecture existante**. Ne pas supprimer silencieusement des statuts produits par les combats.

### 5.5 Politique d'interaction validée

- **Mode hybride approuvé : clic sur jauge + boutons `+`/`−`.**
- **Confirmation uniquement pour les actions importantes** : changements structurels sensibles, modification du centre, suppression, opérations irréversibles ou portant sur des règles complexes. Fatigue / position d'équilibre courantes : ajustement immédiat, feedback discret et annulation si possible.
- Prévenir les clics accidentels (zones tactiles distinctes, pas de drag implicite non confirmé).
- Distinguer actions métier réelles des **illustrations de maquette** : les jauges montrées dans les maquettes ne fixent pas les valeurs d'un personnage.

## 6. Fiche PNJ — structure volontairement minimale

**La fiche PNJ doit être différente de celle des PJ.** Elle n'est **pas** un Livret réduit.

### 6.1 Données à afficher

- **Nom** et portrait optionnel.
- **Importance** (pastille + texte : Mineur/Majeur/Champion/Légendaire).
- **Désir**.
- **Description** courte et facultative.
- **Technique(s)** connues, si présentes.
- **Principe** et **équilibre PNJ** si applicables.
- **États** et **fatigue** si applicables.
- **Lieu actuel** visible directement dans l'**Aperçu**.
- Aucun onglet « Capacités », « Livret », « Profil », « Histoire » ou grille de caractéristiques PJ. Pas de champs supplémentaires inventés pour garnir la fiche.
- L'entraînement, s'il existe, peut rester une **icône discrète** sans nouvelle section métier. Un éventuel champ `rôle` utilisé par un filtre n'impose pas son affichage dans la fiche.

### 6.2 Onglets PNJ (exactement trois)

1. **Aperçu** — nom, désir, description, **lieu actuel**, informations de principe et ressources (certaines restent aussi dans le panneau permanent).
2. **Techniques** — cartes de techniques existantes ; état vide si aucune.
3. **Lieux** — gestion du **lieu principal / domicile**, des **lieux associés multiples** et de la **position actuelle**. Interface de sélection et liens vers les fiches de lieux, sans changer les règles du PNJ.

### 6.3 Importance et ressources

- La catégorie d'importance est modifiable en mode édition ; elle oriente des **valeurs proposées** pour une nouvelle fiche, mais la migration de valeurs déjà enregistrées ne doit jamais être destructrice ni silencieuse.
- Références réglementaires à vérifier dans le PDF : p. 239–242. Propositions typiques mentionnées par le livre : combattant mineur 3 fatigue/1 état, majeur 5/3, champion 10/5, légendaire 15/8. Les PNJ non combattants peuvent ne posséder aucune de ces ressources.
- Les **états PNJ peuvent être personnalisés** selon le jeu ; le composant ne doit pas supposer exactement les cinq états PJ.
- Ne pas figer de nombre maximal de techniques à partir d'une illustration ou d'un prototype : valider avec les règles et les données existantes.

## 7. Fiche PJ — Livret modernisé (distinct de la fiche PNJ)

### 7.1 Organisation générale

- **Contenu du Livret officiel conservé**, mais **réorganisé** pour un usage interactif ; ne pas singer visuellement le formulaire papier.
- Portrait, nom, icône d'entraînement, **Livret choisi** et ressources permanentes.
- Les **quatre caractéristiques officielles** : **Créativité, Concentration, Harmonie, Enthousiasme** ; ne pas reprendre les noms erronés des maquettes (p. ex. « Focalisation », « Passion »). Les caractéristiques doivent afficher les valeurs réelles, pas les valeurs de démonstration.
- **La progression ne figure PAS dans le panneau permanent** : décision explicite du propriétaire.

### 7.2 Onglets PJ (quatre)

1. **Aperçu** — caractéristiques, entraînement, identité et informations utiles pendant la partie, sans dupliquer inutilement toutes les ressources permanentes.
2. **Livret** — spécificité propre au Livret, **cartes compactes de manœuvres**, sections repliables pour ses aspects particuliers, moment d'équilibre et **progression / évolutions**.
3. **Techniques** — techniques de combat, niveaux de maîtrise, apprentissage, réemploi des cartes et du catalogue existants. Conserver les fonctionnalités validées.
4. **Histoire et relations** — histoire, questions et relations propres au Livret, origines et informations narratives réellement prévues ; éditables proprement, liens facultatifs vers PJ/PNJ existants si réalisable sans imposer un modèle relationnel lourd.

### 7.3 L'onglet « Livret » : architecture commune et souple

- **Carte(s) de manœuvres compactes**, avec titre, statut acquise/non acquise, résumé, détail extensible, conditions de déclenchement.
- **Sections visuelles repliables** pour spécificités et autres mécanismes qui ne se prêtent pas aux cartes.
- **Assistance contextuelle approuvée** : selon la manœuvre, proposer les actions utiles (compteur d'utilisation, réserve, aide au jet, ajustement de ressource, rappel d'effet) **avec décision finale du joueur/MJ**, sans bouton « Activer » universel et sans automatisation non validée.
- Le contenu, le nombre de manœuvres, les choix possibles et les effets dépendent du **Livret sélectionné** et de la version réellement intégrée ; ne pas supposer que tous les Livrets possèdent la même spécificité.
- **Moment d'équilibre** : espace pour consulter la condition, l'état de déblocage et, si le système le prévoit déjà, le suivi d'utilisation ; ne pas inventer d'automatismes.
- **Progression** : jauge 4 cases dans cet onglet uniquement ; indication d'évolution disponible et choix guidé si la logique existe déjà et est fiable. Ne pas consommer automatiquement les points ni faire disparaître une évolution non choisie.

### 7.4 Cas d'étude : L'Audacieux — exemple de design, **pas livraison exhaustive de sa mécanique**

- Livret étudié : **L'Audacieuse / L'Audacieux**, p. 171–173 du livre.
- La spécificité **Palmarès d'excellence** doit être représentable comme une liste de **quatre objectifs sélectionnés** parmi un ensemble d'objectifs, états d'accomplissement et renouvellement de cycle.
- **Décision produit validée** : accomplir un objectif déclenche un **parcours guidé** : approbation du MJ constatée, choix **« progression » ou « effacer un état »**, application cohérente à la fiche, confirmation utile et retour visuel. Conserver la possibilité d'annuler/corriger une erreur.
- Lorsqu'un état n'est pas disponible, l'option correspondante ne doit pas exécuter d'action impossible. Lorsqu'un cycle est achevé, préparer la sélection du prochain groupe conformément au livre ; ne pas réutiliser inconsidérément les objectifs déjà terminés.
- Les manœuvres du Livret sont présentées en cartes avec assistance propre à chacune **mais leurs automatismes détaillés restent hors périmètre du présent lot**.
- Les **textes et listes complets du Palmarès** ne sont pas reproduits ici et ne doivent pas être reconstruits à partir d'une image générée ; consulter la source autorisée si l'intégration réglementaire est demandée ultérieurement.
- **Important :** le comportement complet des 10 Livrets, la validation fine des manœuvres, les choix d'évolution et leurs limites feront l'objet d'une **seconde spécification et de demandes séparées** après test du socle UI.

## 8. Espace Lieux — nouvel espace hiérarchique

### 8.1 Modèle de lieux

- Lieux imbriqués sans profondeur fixe : région > cité > quartier > bâtiment > pièce, etc., sans imposer ces niveaux comme types obligatoires.
- Données essentielles seulement : **nom, courte description facultative, illustration facultative, lieu parent, sous-lieux et PNJ liés**. Le propriétaire a **écarté un système élaboré de secrets/événements**.
- Chaque lieu doit posséder un **identifiant stable**, indépendant de son nom et de son parent ; renommer/reparenter ne doit pas casser ses liens.
- Liste/arbre facilement navigable, fil d'Ariane, création d'un sous-lieu depuis son parent, fiche de lieu facilement atteignable depuis une fiche PNJ.
- Cartes de lieux **compactes et illustrables**, claires, avec sous-lieux et nombre de personnes selon la logique réellement disponible.

### 8.2 Liens PNJ ↔ lieux : trois concepts distincts

Pour chaque PNJ, maintenir :

1. **Lieu principal / domicile** — relation principale persistante.
2. **Lieux associés** — liste de relations multiples indépendantes du domicile et de la présence.
3. **Position actuelle** — **un lieu actuel** distinct du domicile, modifiable rapidement.

Changer sa position ne doit pas changer son domicile ni ses lieux associés ; changer un lieu associé ne doit pas téléporter le PNJ. Renommer un lieu ne doit pas faire perdre la liaison. Les données orphelines et références cassées doivent être détectées/traitées sans perte silencieuse.

### 8.3 Fiche d'un lieu

- Afficher séparément **« Présents actuellement »** (fondé sur la position actuelle) et **« Associés au lieu »** (fondé sur les associations enregistrées).
- Filtre **« Ici uniquement » / « Inclure les sous-lieux »** ; le deuxième mode applique une recherche **récursive sur tous les descendants**, pas seulement sur les enfants directs, pour les catégories pertinentes.
- Une même personne ne doit pas être dupliquée involontairement dans un groupe ; les deux groupes peuvent contenir le même PNJ parce qu'ils représentent des relations différentes.
- Possibilité de naviguer vers la fiche PNJ depuis chaque personne affichée.
- Suppression d'un lieu : **confirmation sensible**, présentation des dépendances et choix de stratégie explicite ; ne jamais supprimer en cascade des PNJ ou des sous-lieux sans autorisation spécifique.

## 9. Édition, création et sauvegarde

- **Mode hybride** : modifications rapides des ressources depuis la consultation ; données structurelles via **Modifier** (nom, portrait, Livret, description, importance, liens de lieux, techniques acquises selon les fonctions existantes).
- Avant de supprimer une fiche ou un lieu, confirmation claire avec conséquences ; opérations réversibles/rollback si techniquement possible.
- Détection de modifications non sauvegardées ; retour utilisateur discret en cas de réussite ; erreur intelligible en cas d'échec ; validation de données.
- Les imports/exports et sauvegardes historiques doivent conserver leurs comportements et fonctionner avec les nouveaux champs. Prévoir adaptation de schéma **non destructive**, valeur par défaut raisonnable, sauvegarde de sécurité, tests de round-trip (export/import).
- Ne pas introduire de source de données parallèle contradictoire entre Personnages, Lieux et Combats ; référencer les mêmes identifiants de personnage.
- Échapper/sécuriser tout texte personnalisé inséré dans le DOM, notamment noms, descriptions, désirs, relations, noms de lieux et portraits importés.

## 10. Responsive, accessibilité, performances

- Test desktop large, portable, tablette et téléphone portrait/paysage ; pas de débordement horizontal sur les longues listes, grosses jauges ou noms.
- Cartes compactes adaptatives ; grille PJ/PNJ réorganisée en moins de colonnes selon largeur.
- Fatigue segmentée **jusqu'à quinze cellules** visible sans débordement ; réduire la largeur/gap des segments avant de masquer des cases.
- Barres et jauges accessibles au clavier ; touches/contrôles explicites, états de focus, annonces de valeurs (ARIA ou équivalent) ; contrastes lisibles sur bleu nuit ; les pastilles d'importance ont leur légende et leur libellé accessible.
- Scroll indépendant et comportement sticky testés : sur mobile, priorité à la lecture plutôt qu'à l'en-tête fixe volumineux.
- Nombreux PNJ et lieux hiérarchiques : préserver de bonnes performances ; tri, filtrage et rendu ne doivent pas bloquer l'interface.
- Mode hors ligne complet sur les parcours de base et absence de requête requise à un CDN pour les nouvelles icônes/styles.

## 11. Périmètre de livraison : priorité et lots recommandés

**Ne pas entreprendre la totalité de la refonte dans un unique changement monolithique.** Découper en PR ou commits lisibles, sous réserve des dépendances du code :

**Lot 0 — Audit et préparation** : inspecter code V2.33, tests, sauvegardes, `AGENTS.md`, schéma de données, composants existants et conflits éventuels ; dresser une courte matrice « existe / manque / à préserver » et planifier les fichiers touchés.

**Lot 1 — Design system / navigation responsive** : variables de thème, typographie, composants de base, navigation six sections, comportements clavier/mobile, sans modifier les mécaniques.

**Lot 2 — Personnages : galerie et cartes** : zones PJ/PNJ, cartes compactes, pastilles d'importance, filtres/tri/recherche, accès aux fiches.

**Lot 3 — Fiches détaillées** : socle commun et ressources fiables, **deux structures distinctes** : PNJ à 3 onglets et PJ à 4 onglets ; vues et mode Modifier ; cohérence avec les sauvegardes.

**Lot 4 — Lieux** : modèle hiérarchique stable, fiches et sous-lieux, associations et présence PNJ, sélecteur de position, filtres récursifs, sécurité de suppression, migration.

**Lot 5 — Livrets : structure UI seulement** : composant générique de Livret moderne, cartes de manœuvres, panneaux de spécificité, jauge de progression dans Livret, histoire/relations ; **Palmarès de L'Audacieux en composant visuel et parcours guidé uniquement si les règles et données fiables sont disponibles**. Sinon placer les hooks/adaptateurs et documenter les règles/actions encore non implémentées. Ne pas automatiser sans validation.

**Lot 6 — Harmonisation ciblée** des zones Techniques, Combats et Gestion, tests transverses, finition responsive, sans refonte métier des combats.

**Hors périmètre explicite :** programmation exhaustive des dix Livrets, automatisations fines de leurs manœuvres et spécificités, refonte profonde du combat, ajout de scénarios/événements/secrets aux lieux, invention de caractéristiques PNJ, modification des règles des techniques, changements de gameplay implicites.

## 12. Critères d'acceptation vérifiables

### Fonctionnel

- [ ] Les six rubriques de navigation sont présentes et utilisables desktop/mobile.
- [ ] La galerie distingue PJ et PNJ, propose `+` discret, affichage compact et accès fiche.
- [ ] Une carte PNJ montre une pastille d'importance et la galerie possède légende, filtre et tri par importance.
- [ ] L'importance est lisible (pastille + texte) sur fiche PNJ, et modifiable sans écrasement silencieux de ressources.
- [ ] Les PNJ détaillés n'ont **que** les onglets Aperçu, Techniques et Lieux ; désir, description facultative, principe/équilibre, ressources pertinentes et lieu actuel sont accessibles.
- [ ] Les PJ détaillés ont **exactement** Aperçu, Livret, Techniques, Histoire et relations ; la progression est dans **Livret seulement**.
- [ ] Les ressources restent accessibles depuis tous les onglets sur desktop, sans envahir le mobile.
- [ ] Fatigue : segmentations correctes pour 3, 5, 10, 15 ; boutons et clic direct ; capacité absente gérée proprement.
- [ ] Équilibre PJ : valeur des deux principes inversée ; centre et actuel distincts, y compris en coïncidence ; équilibre PNJ à une seule échelle pertinente.
- [ ] États compacts et statuts distingués ; aucune manipulation contourne le moteur des combats.
- [ ] Lieux hiérarchiques imbriqués sans limite pratique de profondeur ; IDs stables, fil d'Ariane, liens fonctionnels.
- [ ] Les listes « Présents actuellement » et « Associés au lieu » sont distinctes ; inclusion récursive de **tous** les descendants.
- [ ] Les retours arrière, confirmations sensibles et erreurs de sauvegarde sont gérés clairement.
- [ ] Imports/exports et sauvegardes existantes relues sans perte ; données nouvelles persistantes et restaurées.

### Technique et qualité

- [ ] Tests JS existants exécutés : `for test in app/test*.cjs; do node "$test" || exit 1; done` (ou commande courante équivalente du dépôt), résultats documentés ; **188/188 est un chiffre historique V2.32, pas une garantie V2.33**.
- [ ] Tests de non-régression ciblés ajoutés pour fatigue, équilibre, changement d'importance, tri PNJ, hiérarchie des lieux, relations et import/export.
- [ ] Tests navigateur manuels ou automatisés desktop/tablette/mobile et parcours au clavier.
- [ ] Fonctionnement hors ligne vérifié ; les nouvelles dépendances nécessaires sont locales.
- [ ] Les données de sauvegarde et l'état des combats survivent à une navigation entre sections et à un rechargement.
- [ ] Pas d'ajout du PDF ni de contenu artistique protégé dans le dépôt.
- [ ] Documentation de décisions et `ROADMAP.md` mises à jour, bilan en français avec tests exécutés et limites restantes.

## 13. Consigne d'exécution pour Codex

1. **Commencer par un court audit concret et un plan de PR**, mais ne pas s'arrêter pour redemander l'approbation de choix visuels explicitement validés ici.
2. Implémenter les lots dans un ordre sûr, en créant une branche dédiée / PR ; **ne jamais merger dans `main` sans accord explicite**.
3. S'appuyer sur les composants et modèles existants plutôt que les doubler ; préserver le moteur de règles et l'ensemble des fonctionnalités déjà validées.
4. Quand une fonctionnalité nécessite une règle non documentée dans le code ou indisponible dans le PDF, **ne pas l'inventer** : rendre le composant visuel compatible avec le futur ajout et noter clairement le blocage.
5. Fournir à chaque étape : changements réalisés, fichiers touchés, tests exécutés et résultats, limites, éventuelles validations métier restantes. Expliquer en français clair.
6. Consigner les décisions effectivement implémentées dans `docs/DECISIONS.md` ; conserver ce cahier des charges comme référence de conception, non comme substitut au code et aux tests.

---

### Décisions explicitement reportées pour la suite

- Design détaillé et interactions spécifiques des **dix Livrets PJ** ; l'exemple de L'Audacieux sert à valider le patron UI, pas à généraliser son fonctionnement.
- Texte exact, choix et effets de chaque manœuvre, automatisations de jet, Palmarès complet, évolutions, cas limites : à traiter avec le PDF et une validation dédiée.
- Refonte fonctionnelle de l'écran **Combats**.
- Micro-interactions et aspects cosmétiques restant à affiner après tests des premières PR.

**Définition du succès :** obtenir une base UI/UX cohérente, sobre et utilisable, deux fiches réellement distinctes, une gestion fiable des Lieux/PNJ et une architecture capable d'accueillir les Livrets spécifiques ultérieurement, **sans régression ni perte de sauvegarde**.
