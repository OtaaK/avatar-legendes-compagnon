# Convergence vers l’interface v0 — faisabilité et plan proposé

Étude du 8 novembre 2026. **Plan proposé, intégration non commencée.**
La version v0 corrigée et la validation de ce plan précéderont l’intégration effective.
La décision du propriétaire remplace la reproduction de v0 dans le HTML historique :
v0 devient la référence du rendu, de la navigation et de l’organisation ; Codex reste
la référence des comportements, des règles implémentées, des données et des sauvegardes.

## 1. Conclusion et architecture recommandée

La convergence est faisable sans réécrire le moteur. Construire une application **React
à partir des composants et du CSS de v0**, puis raccorder progressivement ses actions
aux modules métier Codex, derrière un service de commandes transactionnelles.

Recommandation technique : **React + TypeScript + Vite**, application statique locale,
avec un build portable HTML unique à qualifier. Le prototype est actuellement Next.js,
mais la logique d’écran est côté client ; aucune API, Server Action ou fonctionnalité
serveur métier n’a été trouvée dans les fichiers suivis. Les vues changent déjà via un hash
et un état React. Conserver le rendu v0 ne nécessite donc pas d’imposer un serveur Next.js.
Ne pas convertir tout le moteur en TypeScript pendant son extraction : garder d’abord les
corps JavaScript, avec exports de modules et types aux frontières.

Next.js reste une alternative si une contrainte nouvelle le justifie : export statique
multi-fichiers et éventuelle PWA. Il n’est pas retenu comme prérequis pour un outil dont
l’usage principal doit rester local et sans service externe. La qualification du HTML
portable est un critère de sortie, pas une promesse issue de cette seule étude.

Le **dépôt fonctionnel porterait le projet unifié**, pour conserver son historique, ses
tests et ses archives. L’application React dans `apps/companion` reprendrait la base v0.
`avatar-legendes-ui` resterait l’amont visuel, où les corrections v0 peuvent continuer.
Il s’agit d’une proposition d’organisation Git ; aucun projet React n’a été copié ou créé ici.

## 2. Sources réellement examinées

| Source | Référence examinée | État |
|---|---|---|
| Codex `main` distant | `42b306f71793e755bf2ee7066d515518f07c9987` | Ne représente pas les fonctionnalités des PR de refonte |
| Codex complet | `a9079fa5b1babc560ee11a8d28430504df8704fc` | Tête de PR nº 10 et base métier de l’étude |
| UI v0 `main` | `8b8924de34949d5bdf20bc6ea7ec53be59da28e0` | Instantané provisoire, à remplacer par le SHA de la version corrigée |

Les PR nº 3 à 10 ont été relues via leurs métadonnées GitHub et sont toutes ouvertes,
non fusionnées au moment de l’étude. La chaîne des bases a été vérifiée ; le code de la
PR nº 10 contient les lots précédents. Il ne faut ni travailler uniquement depuis main,
ni tenter une fusion globale des deux dépôts.

| PR | Branche / SHA court | Fonctionnalités à préserver ; traitement du rendu |
|---|---|---|
| 3 | `refonte/ui-ux-progressive` / `a323655` | Six destinations, clavier, Gestion et conservation des données ; thème HTML remplacé par v0 |
| 4 | `refonte/ui-ux-personnages` / `c6e1e0b` | Distinction PJ/PNJ, importance, filtres et tri ; cartes v0 comme rendu |
| 5 | `refonte/ui-ux-fiches` / `cfdd496` | Consultation/édition, brouillons, portraits locaux et ressources ; mise en page v0 |
| 6 | `refonte/ressources-pnj` / `7cb514b` | Profils explicites, limites, états personnalisés, copies indépendantes et stockage protégé |
| 7 | `refonte/lieux` / `1eaa233` | Hiérarchie, IDs stables, liens indépendants, orphelins, suppression protégée |
| 8 | `refonte/livrets` / `977cce6` | Suivi manuel par Livret, quatre cases, notes et limites explicites |
| 9 | `refonte/recette-ui-ux` / `1e57d22` | Recette combinée, lisibilité, états de cible et repli mobile |
| 10 | `correctifs/retours-recette-uiux` / `a9079fa` | Guidage du profil légendaire, lieux renommés, retrait de combattant protégé et undo |

Aucune PR n’est fusionnée ou supprimée par cette étude. Les anciens choix visuels restent
archivés, sans être imposés à v0. La référence et les commandes exactes figurent dans
[SOURCES.json](SOURCES.json).

## 3. Inventaire utile des deux applications

### Codex

`app/simulateur.html` : 547 478 octets, un script, 298 fonctions nommées. Catalogue de
**111 techniques**, dont **13 de Terre**. Suites : 198 scripts JS et 45 scripts navigateur.
Ces chiffres décrivent l’implémentation ; ils ne certifient pas l’automatisation ni la
conformité exhaustive de toutes les techniques.

| Bloc | Rôle conservé | Couplage à traiter |
|---|---|---|
| `ResourceRules` | Profils PNJ, fatigue, équilibre et conditions | Export global window à remplacer, sans changer les règles |
| `CombatCore` | Phases, actions, effets, coûts, protections, scènes, pièges, historique et snapshots | Pas de DOM, stockage ou dialogue dans le bloc de calcul ; API mutable sur l’état reçu |
| `CombatRules` | Disponibilité, maîtrise, choix et coûts de posture | Exports explicites ; conserver ses résultats et refus |
| `Roster` | Bibliothèque, création, mises à jour, copies et synchronisation explicite | Dépend des règles de ressources et de la validation des liens |
| `PlaceRules` | Parents, descendants, liens PNJ, orphelins et suppression | Algorithmes itératifs et transactions de bibliothèque à conserver |
| `BookState`, `Playbooks` | Suivi manuel par Livret et données de création | Aucun Palmarès complet à inventer à partir du prototype |
| `TECH_CATALOG`, `TECH_AUDIT`, matrice | Références et statut réel d’assistance | Données partagées ; conserver IDs, noms, pages et marqueurs de validation |
| `validateCombat`, `validateBackupLinks`, import Roster | Contrôles de données et compatibilité | Fonctions de validation séparables du DOM |
| Persistance et transactions | Journaux, rollback, versions, chargement et blocages de protection | Remplacer les alertes/éléments DOM par des résultats structurés et un port de stockage |
| Formulaires / `prepare` / `approvalDecisions` | Collecte d’options et décisions du MJ | Extraire le protocole : aucune lecture de champs HTML depuis React |

Le moteur n’est pas fonctionnellement immuable : ses fonctions modifient le combat passé
en paramètre. Le service applicatif doit les appeler sur un brouillon isolé. Réécrire leur
algorithme en reducers React ne serait pas une extraction fidèle.

Les règles déjà opérationnelles restent la référence, y compris leurs limites et arbitrages
ouverts consignés dans DECISIONS. Une correction réglementaire éventuelle fera l’objet d’une
mission séparée ; les tests verts ne suffisent pas à l’autoriser.

### v0

Prototype Next.js 16.4.3, React verrouillé à 19.2.4, TypeScript 5.7.3, Tailwind 4.3.3.
`companion-app.tsx` : 561 lignes ; `companion-ui.tsx` : 101 ; CSS : 451 ; données : 93.
Les données incluent 13 personnages, 10 lieux, 10 techniques fictives et six objectifs.
Aucun AGENTS.md, script de tests, test suivi ou README n’a été trouvé dans ce snapshot UI.

Composants réutilisables : shell/sidebar/topbar, regroupement des six pages, hash de
navigation, HomeView, PeopleView, CharacterDetail, PlacesView, TechniquesView, cartes,
jauges, pastilles, icônes, formulaires, AppModal et ses mécanismes de focus/inert.
Les vues internes devront devenir des modules importables par feature, sans tout découper
ou restyler à la fois. Le composant `components/ui/button.tsx` n’est pas importé par les deux
composants principaux au snapshot étudié ; ne pas généraliser arbitrairement shadcn.

### Comportements du prototype à raccorder, pas à promouvoir en règles

| Constat dans v0 | Adaptation obligatoire |
|---|---|
| `BalanceMeterPJ` affiche Loyauté/Assurance et une aria-label Nara | Recevoir principes et nom réels, conserver son cadre visuel |
| PNJ borné et affiché en −2…+2 | Bornes issues de ResourceRules : profil explicite 0…maximum, anciennes données −3…+3 conservées |
| États et statuts réunis dans `states` et une liste d’exemples | Deux ensembles distincts, noms réels et limites par personnage |
| Validation des caractéristiques en 0…3 | Accepter les valeurs Codex via ses validateurs, dont les valeurs négatives |
| Création d’un PNJ toujours à capacité 5 | Guidage explicite du profil, dont Légendaire 15 ; aucune migration silencieuse |
| Maîtrise stockée dans le catalogue global | Lire/écrire la maîtrise par personnage, pas pour tous les PJ |
| Objectifs globaux et récompense appliquée à l’ID `nara` | Ne pas raccorder cet automate fictif ; conserver le suivi manuel Codex jusqu’à spécification dédiée |
| Combat composé d’un sous-ensemble de personnages, contrôles indisponibles | Véritables participants et commandes CombatCore, sans supposer PJ/PNJ = camps ennemis |
| Arbre rendu récursivement et recherche répétée dans les lieux | Projeter les données PlaceRules sans introduire de limite de profondeur ou perdre les orphelins |
| Portrait d’initiales | Ajouter l’image locale validée dans le cadre v0 ; conserver import et limites des portraits |
| `AppData` / validateDemoData / export JSON de démo | Les réserver aux fixtures ; codecs Codex en production |
| Autosauvegarde dans un useEffect sans gestion de quota | Remplacer par une transaction applicative et un résultat d’écriture explicite |
| AppModal ferme le brouillon directement | Conserver l’apparence et le focus, ajouter protection du brouillon et des lectures asynchrones |
| Campagne, horaire de session et utilisateur illustratifs | Afficher les valeurs réelles disponibles ou un état non renseigné, sans inventer un service de campagne/authentification |
| Analytics Vercel activé en production | Retirer ce branchement du runtime hors ligne ; aucune télémétrie requise |

Ces adaptations sont des problèmes de fonctionnement constatés, pas un prétexte pour
remplacer la navigation, le design ou l’organisation des écrans préférés par le propriétaire.

## 4. Cible et frontières

```text
avatar-legendes-compagnon/
  app/simulateur.html            référence historique conservée
  apps/companion/src/
    shell/                      navigation, modales, CSS v0
    features/                   personnages, lieux, livrets, techniques, combat, gestion
    shared/                     primitives visuelles v0 adaptées aux données réelles
  packages/domain/src/
    resources/ combat/ characters/ places/ playbooks/ catalog/ validation/
  packages/application/src/
    commands/ decisions/ selectors/ session/
  packages/persistence/src/
    codecs/ legacy-reader/ local-session-repository/
  tests/
    js/ browser/                références historiques conservées
    parity/ components/ fixtures/   compléments du nouveau client
  docs/migration/
```

Cette arborescence est une proposition, pas un scaffold déjà implémenté.

Flux : **composant v0 → commande applicative → brouillon métier → validation → écriture
transactionnelle → publication d’un nouvel état React**. Les écrans n’écrivent jamais les
objets métier directement, ni le stockage. Les projections d’affichage ne sont pas un format
à réimporter : elles ne doivent pas faire disparaître les champs inconnus.

Les formes canoniques demeurent bibliothèque et combat Codex. Un store de session léger
fournit un snapshot stable et subscribe, raccordable à `useSyncExternalStore` ; les états
locaux React sont réservés aux brouillons, filtres, sélection et ouvertures de panneaux.
Pas de Redux, backend, compte utilisateur ou synchronisation distante imposés.
Après validation de l’extraction, les modules deviennent l’unique source métier active ;
le HTML figé reste l’oracle et l’ancienne distribution. Si un défaut métier impose une
correction pendant la transition, le traiter dans une PR distincte avec tests et référence
explicite mise à jour, sans divergence silencieuse entre les deux clients.

Le service prépare la projection et la sérialisation avant écriture. Une erreur de domaine,
de validation ou de stockage conserve le précédent état et le brouillon. Une erreur React
imprévue doit laisser un écran de récupération/export, sans réinitialiser les données.
Les écritures ne sont jamais déclenchées par le rendu ou un useEffect ; StrictMode ne doit
pas rejouer une action ou sauvegarder les données de démonstration au montage.

Les [contrats proposés](CONTRATS_CIBLES.md) précisent les copies de combat, les différences
undefined/null, les décisions MJ, la publication transactionnelle et les formats préservés.

## 5. Sauvegardes, origine et retour arrière

- Réutiliser les codecs Codex : bibliothèque versions 1/2, sauvegarde complète
  `avatar-compagnon-backup` versions 1/2, combat brut historique et enveloppe
  `avatar-compagnon-combat` version 2. Préserver métadonnées, profils et snapshots.
- Conserver l’ancienne application et ses clés `avatar-roster-v020` / `avatar-v020`, v021,
  marqueur de génération, journaux d’import et clés de repli. Aucun effacement automatique.
- **Proposer un espace React isolé**, activé par import explicite après aperçu et sauvegarde.
  Un dépôt de session stockerait le couple bibliothèque/combat en une seule enveloppe interne
  sous une nouvelle clé technique dédiée : aucun format d’export utilisateur fictif v0.
  Un setItem atomique remplace le document entier ou échoue, sans publier un demi-état.
  La clé et le schéma interne seront actés au lot 1, pas créés par cette étude.
- Le lecteur des données locales historiques est en lecture seule. Un ancien journal
  interrompu ne doit pas être « réparé » en écrivant dans les clés de l’autre application.
  Préférer la récupération/export par l’ancienne application ; à défaut, diagnostic explicite.
- Un fichier local, un site localhost et une autre URL ne partagent pas nécessairement le
  même stockage. La reprise recommandée est **export privé depuis Codex puis import React**,
  pas la promesse d’une découverte automatique des anciennes données.
- Le JSON de démonstration v0 n’est pas un ancien format Codex. Le détecter et expliquer son
  incompatibilité ; ne pas le convertir silencieusement ni mélanger ses exemples à une partie.
- Quota, espace doublé par les copies et taille de l’historique restent à tester. IndexedDB
  pourra être un autre adaptateur si nécessaire, après qualification des fichiers locaux ;
  ce n’est pas une nouvelle base de données imposée avant preuve du besoin.

Retour arrière par lot : garder le dernier artefact accepté et l’export privé précédent.
Le code React peut être retiré sans toucher au HTML et aux clés historiques. Les changements
réalisés dans les deux applications ne sont pas fusionnés automatiquement. Si l’ancien client
ne peut interpréter une future donnée, utiliser le point antérieur compatible ; ne pas
annoncer une rétrocompatibilité complète sans test bidirectionnel.

## 6. Hors ligne : comparaison et preuve attendue

| Option | Ce qu’elle permet | Limite |
|---|---|---|
| Next actuel | Build compilé et pages prérendues | Pas d’export out configuré ; HTML référençant neuf assets séparés sous /_next |
| Next export statique | Dossier HTML/JS/CSS local, hébergement statique possible | Pas un HTML unique ; routing/assets et ouverture directe à qualifier, headers serveur inapplicables au fichier |
| PWA statique | Réutilisation hors réseau après installation/mise en cache | Première installation et mise à jour, origine sécurisée et cache à gérer ; pas le même usage que double-cliquer un HTML |
| React/Vite portable recommandé | JS, React, CSS, icônes et assets embarqués dans un HTML construit | Build mono-fichier à prototyper, imports dynamiques/fonts/assets à incorporer ; stockage file:// et navigateurs à qualifier |

Aucun appel réseau fonctionnel ne sera requis : pas d’analytics, CDN, police distante, API
ou ressources de jeu chargées à la demande. Les outils de build ont besoin de dépendances
pour le développement ; l’utilisateur final ne doit pas installer Node ou lancer des commandes.
Un build dossier pourra compléter le HTML portable, depuis les mêmes sources.

Critère de faisabilité à vérifier sur l’artefact : démarrage à froid réseau coupé, navigation
par hash, édition, sauvegarde, export/import, combat et annulation. Tests Chrome desktop/mobile,
puis double-clic sur le Mac du propriétaire. La politique du navigateur cloud bloque file:// :
les tests actuels après chargement HTTP local ne prouvent pas ce dernier point.

## 7. Lots proposés et critères d’acceptation

La sécurité de persistance et l’import/export ne sont pas repoussés jusqu’au lot 6 : leur
contrat, leurs fixtures et les erreurs d’écriture sont une fondation du lot 1. Le lot 6
termine la distribution, la récupération et les parcours utilisateurs complets.

| Lot | Contenu | Critères concrets avant passage au suivant |
|---|---|---|
| 1. Architecture et contrats | Figer le v0 corrigé ; extraire les blocs JS et données sans changer leur algorithme ; service, codecs et repository isolé ; shell v0 | 243 scripts historiques conservés ; mêmes scénarios exécutés contre le moteur extrait, snapshots/erreurs comparés ; aucun DOM/React/stockage dans domain ; montage React sans écriture ; import/export de fixtures v1/v2 sans perte ; aucune clé historique modifiée ; build local et interfaces documentées |
| 2. Personnages et ressources | Cartes, formulaires et portraits v0 ; Roster/ResourceRules ; copies indépendantes | PJ/PNJ et onglets distincts ; fatigue 3/5/10/15 et PNJ sans jauge ; principes/centre réels, PNJ explicite jusqu’à +4 et anciens profils conservés ; conditions/statuts séparés ; Légendaire guidé sans migration silencieuse ; brouillon, quota, correction/annulation et rechargement sans perte |
| 3. Lieux et liens PNJ | Arbre, fil d’Ariane et fiches v0 raccordés à PlaceRules | 12 000 niveaux testés côté modèle, parcours sans récursion de pile ; pas de cycle ; renommage/reparentage sans casser les IDs ; carte actualisée ; domicile/associations/présence indépendants et descendants complets sans doublon ; orphelins visibles ; suppression stratégique confirmée, sans cascade de PNJ |
| 4. Livrets et techniques | Présentation v0, catalogue réel et suivi par Livret | 111 références, dont 13 Terre ; mêmes IDs/pages/rareté et niveaux par personnage ; techniques personnalisées préservées ; aucune maîtrise globale partagée ; progression quatre cases et anciennes entrées conservées ; manœuvres et Palmarès non implémentés explicitement inactifs, aucun gain adressé à Nara |
| 5. Combat complet existant | Vues et contrôles v0 pilotant les commandes Codex, plans de décisions MJ | Déclarations/phases, accessibilité et coûts de posture inchangés ; préparations, protections, débordements, réserves, effets/durées/provenance, interruptions, pièges, scènes, journal et CSV préservés ; 13 Terre et interactions avancées en parité ; retrait protégé ; undo exact ; annuler un dialogue ne mute rien et valider un plan périmé est refusé |
| 6. Données, undo et hors ligne | Gestion v0, codecs/erreurs, récupération et artefacts portables | Import complet, bibliothèque, combat privé/public selon capacités existantes ; versions antérieures, snapshots et champs inconnus conservés ; journal interrompu, quota, mauvais fichier et retour arrière testés ; export/import entre anciens/nouveaux clients sur données compatibles ; démarrage sans réseau et aucun appel externe ; rechargement puis undo fidèle ; double-clic Mac à qualifier |
| 7. Recette finale | Visuel v0 corrigé, responsive, clavier et scénarios combinés | Comparaisons visuelles basées sur la version v0 figée ; 320 px/portrait/paysage/tablette/desktop ; tests de composants et parcours sans sélecteurs HTML historiques ; erreurs visibles ; validation personnelle des parcours et sauvegardes ; aucune intégration tant que les écarts bloquants ne sont pas traités |

Le « combat complet » signifie la totalité de ce qui est actuellement implémenté, y compris
les opérations manuelles et les refus. Il ne signifie pas que toutes les 111 techniques
ou tous les Livrets deviennent automatiquement conformes et automatisés par cette migration.

Chaque lot : branche/PR ciblée, fixtures fictives, preuve avant/après, liste des écarts,
artefact précédent conservé. Aucun lot ne retire un comportement opérationnel en le remplaçant
par un toast de démonstration. Les commandes pas encore raccordées sont explicitement
indisponibles dans la préversion ; l’ancien HTML reste l’application complète de référence.

## 8. Risques prioritaires et contrôles

| Priorité | Risque | Réponse |
|---|---|---|
| Bloquant | Démarrer depuis main et perdre les PR 3–10 | Base métier a9079fa, vérification d’ascendance et inventaire par PR |
| Bloquant | Import v0 remplaçant une vraie partie | Codecs historiques, démo séparée, aperçu/confirmation, namespace React isolé |
| Bloquant | Perdre l’ordre des décisions MJ et coûts/protections | Adapter approvalDecisions sous forme de demandes ordonnées, tests différentiels, pas de nouvelle interprétation |
| Bloquant | Règles et affichage simplifiés v0 devenant autoritaires | Vue projetée depuis domain, limites/capacités dynamiques, aucune écriture de VM dans le modèle |
| Élevé | Écriture dans useEffect, quota, double montage React | Commande transactionnelle, snapshot stable, erreurs structurées et aucun autosave de rendu |
| Élevé | Historique, IDs ou champs inconnus perdus | Modèles conservés, pas de normalisation nouvelle par DTO, fixtures aller-retour, undo après reload |
| Élevé | Changements v0 pendant les branchements | SHA corrigé figé par lot, séparation des connecteurs, PR de resynchronisation visuelle explicite |
| Élevé | HTML autonome annoncé sans preuve | Petit prototype de distribution au lot 1 après validation, recette complète au lot 6, test file:// sur machine qui l’autorise |
| Moyen | CSS/tableaux/arbres volumineux, portraits et snapshots | Mesures sur grandes bibliothèques et combats longs ; optimisation distincte après parité |
| Moyen | Apparence fidèle mais commandes factices | Inventaire de capacités et désactivation expliquée tant qu’un service réel n’existe pas |

## 9. Vérifications réalisées pour cette étude

- GitHub : état et chaîne des huit PR ; main distant et SHA UI relevés.
- Codex a9079fa : **243/243 scripts réussis**, 198 JS et 45 navigateur.
  Rapport local `/workspace/work/convergence-baseline.json`, limite file:// explicitement conservée.
- v0 8b8924d : installation avec pnpm **12.3.4**, lockfile figé et scripts d’installation
  désactivés ; **pnpm build réussi**, compilation Next 16.4.3 et contrôle TypeScript réussis.
  Aucun fichier suivi UI modifié par ces commandes. Ce contrôle n’est pas une recette métier
  du prototype et ne prouve pas le HTML autonome. Aucun serveur de développement ni déploiement lancé.
- Analyse statique des exports, modèles, dépendances DOM et accès réseau. Aucun texte du livre
  nécessaire pour inventer ou modifier une règle : l’étude n’en change aucune.

## 10. Préparation et décision suivante

Branche documentaire `architecture/convergence-v0` dans le dépôt fonctionnel. Une branche
locale UI `convergence/preparation-ui` est isolée du main v0 et reste sans modification de code.
Un worktree de convergence dédié est préparé séparément ; aucun scaffold React ni moteur extrait
n’est livré dans cette mission. Les branches existantes et leur historique restent intacts.

Après accord sur ce plan et réception du v0 corrigé : relever son nouveau SHA, comparer les
corrections au snapshot inspecté, reconfirmer le build et ouvrir **le lot 1 uniquement**.
La référence visuelle finale doit être celle corrigée, pas un mélange des anciennes propositions
Codex. Aucun déploiement, fusion ou changement de sauvegarde avant validation correspondante.
