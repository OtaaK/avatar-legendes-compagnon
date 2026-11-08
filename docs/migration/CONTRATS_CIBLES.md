# Contrats proposés pour la convergence React / métier

Document de conception, non implémenté. Référence métier : PR nº 10, `a9079fa`.
Ces contrats ne remplacent pas le modèle Codex par les types de démonstration v0.
Ils seront affinés et testés au lot 1, avant raccordement d’un écran réel.

## 1. Document canonique et projections

Le document de travail contient **la bibliothèque et le combat existants**. Leurs champs,
IDs, séquences, historiques, snapshots et propriétés inconnues restent conservés.
`sessionRevision` et `projectGeneration` sont des contrôles applicatifs ; ils ne deviennent
pas des caractéristiques de jeu ni des champs obligatoires des exports historiques.

```ts
// Schéma indicatif : les Legacy* seront décrits depuis les modèles existants.
type SessionSnapshot = {
  revision: number
  projectGeneration: string
  library: DeepReadonly<LegacyLibrary>
  combat: DeepReadonly<LegacyCombat>
}

type Outcome<T> =
  | { ok: true; value: T }
  | { ok: false; error: {
      kind: 'domain' | 'validation' | 'storage' | 'conflict' | 'unavailable'
      message: string
    } }

interface CompanionSession {
  getSnapshot(): SessionSnapshot
  subscribe(listener: () => void): () => void
  dispatch(command: ApplicationCommand, expectedRevision: number): Promise<Outcome<void>>
}
```

`getSnapshot` renvoie une référence stable jusqu’à une vraie mutation ; il ne recrée pas
un clone à chaque lecture React. L’UI utilise subscribe/useSyncExternalStore. Elle ne détient
pas une seconde version métier dans des useState characters/places/techniques indépendants.
Les useState restent adaptés aux champs de formulaire non enregistrés et aux ouvertures.

Les sélecteurs produisent des ViewModels en lecture seule. Ils peuvent adapter le vocabulaire
ou la présentation pour v0, mais **ne sont jamais sérialisés comme sauvegarde**.
Un composant envoie un ID et les champs réellement modifiés, pas le personnage projeté entier.

| v0 | Canonique Codex / règle de projection |
|---|---|
| `kind: pj/pnj` | `kind: PJ/PNJ`, identité et ID conservés |
| `training: Terre` | Affichage de `Maîtrise de la Terre` ; préserver absence/valeur réelle sans défaut Terre silencieux |
| `playbook` abrégé | `livret` exact ; label abrégé possible, clé de suivi BookState inchangée |
| `fatigueCapacity` | Lecture ResourceRules ; aucune capacité dérivée automatiquement de l’importance |
| `principle`, `balanceCenter` | Principes réels et centre PJ ; PNJ à échelle issue de son profil ou de ses limites historiques |
| `states` | Deux groupes : `conditions` et `statuses`, avec traductions Roster/CombatCore existantes |
| `locationId/homeLocationId/associatedLocationIds` | `placeLinks.currentId/homeId/associatedIds` sans aplatir les cas historiques |
| `role` | Pour un PNJ, rôle historiquement enregistré dans `livret`, sans nouveau champ contradictoire |
| `stats.creativity/...` | Projection des quatre clés françaises, valeurs négatives incluses |
| `progression` | Entrée BookState du Livret actuel, pas un compteur partagé ou adressé à Nara |
| `techniques: string[]` + maîtrise globale | Techniques de fiche `{name, mastery}` ; catalogue partagé immuable, maîtrise par personnage |
| `relationships: string` | Liste historique `relationships[]` conservée ; édition par lignes ou composants, sans conversion destructrice |
| Portrait d’initiales | Cadre v0 et vraie image locale validée, sans chargement distant implicite |

La position doit être représentable comme `legacy-text`, `linked`, `none` ou `orphan`.
Un `currentId` absent conserve le texte historique ; null signifie une position explicitement
vide. Une valeur falsy générique de formulaire ne doit pas effacer cette distinction.
Les techniques personnalisées et les noms de Livrets inconnus restent lisibles et conservés.

## 2. Frontière des commandes

Le service enveloppe les fonctions existantes. Exemples de commandes, pas de nouvelles règles :

- Fiche : créer, mettre à jour un patch, ajuster une ressource, annuler le dernier ajustement,
  proposer/adopter explicitement un profil et attribuer une technique avec sa maîtrise.
- Liens : créer/modifier un lieu, modifier domicile/associations/position, supprimer selon la
  stratégie confirmée PlaceRules. Aucun déplacement par simple changement d’association.
- Livret : modifier le suivi manuel du Livret exact ; aucune récompense implicite.
- Combat : ajouter une copie, déclarer approche/jet, gérer engagements, préparer une technique,
  valider/refuser ses effets, modifier un effet par son opération réelle, avancer, annuler,
  gérer scènes/notes, retirer un combattant selon les refus existants.
- Sauvegarde : analyser un fichier, présenter l’aperçu, confirmer le remplacement, exporter
  en privé ou produire le compte-rendu public existant.

Transaction : contrôler la révision, isoler le brouillon concerné, appeler le moteur,
valider le résultat et préparer la projection/sérialisation, enregistrer, puis publier.
Si une étape avant publication échoue, le précédent état reste la référence. Le formulaire
reste disponible et le succès n’est affiché qu’après l’écriture durable.

Les commandes modifiant seulement le combat ne réécrivent pas la fiche. L’ajout copie les
ressources/profils comme Roster ; le report vers la fiche reste confirmé et peut être refusé
si son profil a changé. Aucune liaison React bidirectionnelle de fatigue par characterId.

L’annulation de combat reste celle de `combat.snapshots`, restaurable après rechargement.
L’annulation de ressource permanente reste distincte : préserver ses gardes contre import,
remplacement de bibliothèque et modification intermédiaire de ressources. Une nouvelle
référence immutable React ne doit pas invalider à elle seule un undo valide ; utiliser une
génération de projet et l’empreinte avant/après des ressources plutôt qu’une référence DOM.

## 3. Décisions MJ et préparation de techniques

`prepare` collecte aujourd’hui les paramètres de nombreux formulaires, puis appelle les
vraies commandes. `approvalDecisions` collecte les acceptations, interceptions/protecteurs,
allocations d’armure et choix d’états pour fatigue excédentaire. `previewCommit` sert aux
simulations et conserve l’ordre des protections. Ces étapes ne peuvent être remplacées
par un simple bouton v0 qui coche un état.

Contrat de port proposé :

```ts
type DecisionRequest = {
  id: string
  kind: 'accept' | 'intercept' | 'protector' | 'armor' | 'overflow' | 'mj-confirmation'
  // Options autorisées et contexte issus du moteur/coordinateur existant.
}
type DecisionPlan = {
  expectedRevision: number
  proposalIds: readonly string[]
  requests: readonly DecisionRequest[]
}
```

Ce plan est une proposition d’extraction, pas une API existante de CombatCore.
Il faut d’abord tester son équivalence avec le collecteur HTML. Certaines demandes dépendent
des réponses précédentes : fournir un dialogue séquentiel/recalculé, sans figer trop tôt
les options ou les réserves. Les autres confirmations spécifiques des boutons de scène,
piège, interruption, bouclier et lave suivent le même port de décision.

Les clés de décision actuelles (`intercept:`, `protector:`, `armor:`, `overflow:` et IDs
acceptés) restent conservées à la première extraction. L’adaptateur ne calcule pas un coût
alternatif ; il transmet les options valides au moteur. Un plan périmé est refusé. Annuler
un dialogue ne paie rien, ne consomme pas de réserve et n’efface pas une proposition.
StrictMode, un double clic et le retour navigateur ne doivent pas exécuter deux commits.

## 4. Persistance isolée et codecs compatibles

Les codecs restent séparés du stockage et du téléchargement. Formats à reconnaître :

- bibliothèque Codex version 1/2 ;
- combat privé historique brut ou enveloppe `avatar-compagnon-combat`, version 2 ;
- sauvegarde complète `avatar-compagnon-backup`, version 1/2 ;
- compte-rendu `avatar-compagnon-compte-rendu-public`, version 1 : consultation, **pas un import de sauvegarde** ;
- CSV de journal narratif : export documentaire, pas un nouveau format canonique.

Réutiliser `publicCombatReport` et son avertissement sur les notes libres ; conserver le
filtrage des prédictions prévu par le code, y compris dans les objets imbriqués.
Ne pas annoncer une anonymisation complète que le code ne réalise pas.
Les migrations de normalisation existantes sont conservées ; les comparaisons de parité
portent sur les contenus normalisés comme l’ancien client, hors timestamp d’export attendu.

```ts
interface SessionRepository {
  load(): Promise<Outcome<StoredCanonicalSession | null>>
  save(session: CanonicalLibraryAndCombat): Promise<Outcome<void>>
}
interface LegacyReader {
  inspect(source: File | ReadOnlyLegacyStorage): Promise<Outcome<ImportPreview>>
}
```

Proposition initiale : nouvelle clé React dédiée portant une enveloppe interne du couple
canonique library/combat, écrite atomiquement en un seul setItem. Ce choix n’introduit pas
le format fictif AppData de v0 dans les sauvegardes privées. Ne pas réutiliser le journal v1/v2
Codex en changeant ses clés autorisées : il protège l’ancienne application et doit rester intact.
Le repository remonte quota, accès refusé et lecture invalide, sans retourner des exemples v0.

La révision en mémoire protège les commandes d’une session. Un setItem atomique ne fournit
pas à lui seul une transaction multi-fenêtres : première cible, une fenêtre éditrice par
projet, détection des changements externes et export du brouillon en cas de conflit, sans
fusion automatique. Une garantie de concurrence plus forte nécessiterait un adaptateur
ou verrou qualifié séparément. Ne pas la promettre avec un simple useEffect de stockage.

La copie explicite importée peut dépasser le quota à cause des portraits et historiques.
Un échec doit conserver le stockage historique et le précédent projet React ; proposer
l’export, pas l’effacement automatique d’images, de snapshots ou de champs inconnus.
Un ancien journal incomplet exige récupération par l’ancien client ou diagnostic explicite,
jamais un démarrage v0 qui écrase le fichier illisible avec defaultData.

## 5. Compatibilité et tests contractuels à créer au lot 1

Conserver les 243 scripts historiques sur le HTML de référence. Leur réussite n’est pas une
preuve du moteur extrait tant qu’ils exécutent encore le script HTML. Ajouter un harness de
parité exécutant les mêmes scénarios contre les modules extraits, puis migrer les assertions
utiles par petits groupes sans les réécrire pour refléter la nouvelle implémentation.

Corpus fictif minimal : bibliothèque v1 ; profils PNJ 3/5/10/15 et non-combattant ; anciennes
limites d’équilibre ; états personnalisés ; lieu texte/ID/null/orphelin ; Livrets inconnus et
suivis multiples ; portraits ; techniques personnalisées ; combats avec pièges, armures,
protections, scènes, coûts, choix MJ et snapshots ; champs additionnels inconnus ; corruption,
versions non reconnues, quotas et journal interrompu.

Comparer : résultat et erreurs de commande, bibliothèque et combat, IDs/seq, propositions,
coûts payés, réserves, états/statuts, dates/durées, provenance, historique et restauration
après undo. Annuler une opération doit laisser exactement le même état qu’avant.
Les tests composants pilotent les props/commandes ; Playwright pilote les parcours React
avec le style v0. Le changement de sélecteurs n’autorise pas à enlever les assertions métier.
