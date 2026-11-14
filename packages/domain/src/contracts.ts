/** Contrats persistants phase B. Les validations JS restent la référence d'exécution.
 * Aucun renommage v0, compteur calculé ou valeur par défaut UI n'est sauvegardé ici.
 * Les extensions sont conservées ; elles doivent être JSON sûres à l'exécution.
 */
export interface Extensions { [key: string]: unknown }
export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
/** Chaîne ASCII 1–120 [A-Za-z0-9][A-Za-z0-9_-]*, vérifiée à l'import. */
export type CharacterId = string;
/** Format historique libre, 1–120 caractères. Jamais un fragment JS/HTML. */
export type PlaceId = string;
export type FighterId = `p-${number}`;
export type StatKey = 'creativite' | 'concentration' | 'harmonie' | 'enthousiasme';
export type Characteristics = Record<StatKey, number> & Extensions;
export type Mastery = 'acquise' | 'pratiquee' | 'maitrisee';
export type CharacterStatus = 'En danger' | 'Renforcé' | 'Avantagé' | 'Gêné' | 'Confiant' | 'Prêt' | 'Piégé' | 'Étourdi';
export type CombatStatus = 'en_danger' | 'renforce' | 'avantage' | 'gene' | 'confiant' | 'pret' | 'piege' | 'etourdi';
/** Deux emplacements historiques, y compris le second vide des profils PNJ. */
export type Principles = [string, string];
export interface NpcResources extends Extensions {
  format: 'avatar-npc-resources'; version: 1; combatant: boolean;
  fatigueMax: number; balanceMax: number; conditions: string[];
}
export interface Resources extends Extensions {
  fatigue: number; balance: number; conditions: string[];
}
/** Les limites sont calculées par ResourceRules, jamais par l'importance seule. */
export interface ResourceLimits {
  fatigueMax: number; balanceMin: number; balanceMax: number;
  conditions: string[]; combatant: boolean; explicit: boolean;
}
export interface CharacterTechnique extends Extensions {
  /** Nom historique ; aucune conversion forcée vers un ID de catalogue. */
  name: string; mastery: Mastery;
}
export interface BookEntry extends Extensions {
  book: string; progress: 0 | 1 | 2 | 3 | 4;
  moment: 'unknown' | 'locked' | 'unlocked'; notes: string; evolutions: string;
}
export interface BookState extends Extensions {
  format: 'avatar-playbook-state'; version: 1; entries: BookEntry[];
}
export interface PlaceLinks extends Extensions {
  homeId: PlaceId | null; currentId?: PlaceId | null; associatedIds: PlaceId[];
}
export interface Place extends Extensions {
  id: PlaceId; name: string; parentId: PlaceId | null;
  description?: string; portrait?: string | null;
}
export type BookId = 'audacieux' | 'fripouille' | 'gardien' | 'heritier' | 'icone' | 'idealiste' | 'inflexible' | 'marteau' | 'pilier' | 'prodige';
export type AdvancementProposal =
  | { kind: 'own-move' | 'foreign-move'; moveId: string }
  | { kind: 'stat'; stat: StatKey }
  | { kind: 'center'; direction: 1 | -1 }
  | { kind: 'moment' };
export interface AdvancementReview extends Extensions {
  bookId: BookId; proposal: AdvancementProposal; errors: readonly string[];
  decisions: readonly string[]; sourcePage: 214; status: 'pending'; applied: false;
}
export interface PreparationDecision extends Extensions {
  confirmed: true; reason: string; acceptPending?: boolean;
}
export type PreparationEvent =
  | (Extensions & { kind: 'moves'; book: string; decision: PreparationDecision; before: string[]; after: string[] })
  | (Extensions & { kind: 'advancement'; book: string; decision: PreparationDecision; review: AdvancementReview; applied: false });
/** Les choix particuliers des Livrets restent des données préparatoires, sans gain automatique. */
export interface BookChoices extends Extensions {
  bonusKey: StatKey | null; moveIds: string[]; feature: Record<string, string[]>;
  sourceReviewed: boolean; passiveBonusIds: string[];
  techniqueChoices: Array<Extensions & { referenceId: string; mastery: 'acquise' | 'maitrisee'; accessReviewed: boolean }>;
  secondaryTraining?: string; additionalOrigin?: string;
}
export interface PlaybookPreparation extends Extensions {
  format: 'avatar-playbook-preparation'; version: 1; activeBookId: BookId | null;
  name: string; training: string; origins: string[]; attitudes: string[];
  combatStyle: string; historyAnswers: string[]; relationships: string[];
  combatMode: 'deferred' | 'full'; byBook: Partial<Record<BookId, BookChoices>>;
  status?: 'prepared' | 'recorded'; creationDecision?: PreparationDecision;
  events?: Array<PreparationEvent | Extensions>;
}
export interface CharacterBase extends Resources {
  id: CharacterId; name: string; stats: Characteristics;
  livret?: string; principles?: Principles; center?: number;
  statuses: CharacterStatus[]; techniques: CharacterTechnique[];
  training?: string; location?: string; relationships?: string[]; history?: string;
  /** Manœuvres persistées par nom : inclut les anciens noms et noms personnalisés. */
  playbookMoves?: string[]; notes?: string; updatedAt?: string | null;
  portrait?: string | null;
}
export interface PlayerCharacter extends CharacterBase {
  kind: 'PJ'; npcResources?: null; playbookState?: BookState | null;
  playbookPreparation?: PlaybookPreparation | Extensions;
}
export interface NonPlayerCharacter extends CharacterBase {
  kind: 'PNJ'; importance?: string; npcResources?: NpcResources | null;
  placeLinks?: PlaceLinks;
}
export type Character = PlayerCharacter | NonPlayerCharacter;
export interface Library extends Extensions {
  version: 1 | 2; seq: number; characters: Character[]; places?: Place[]; placeSeq?: number;
}
export type CombatPhase = 'declaration' | 'defendre' | 'attaquer' | 'esquiver' | 'fin';
export type Approach = 'defendre' | 'attaquer' | 'esquiver';
export interface Fighter extends Resources {
  id: FighterId; characterId?: CharacterId; name: string; kind: 'PJ' | 'PNJ';
  statuses: CombatStatus[]; approach: Approach | null; roll: '6-' | '7-9' | '10+' | null;
  blocked: JsonValue[]; reactions: JsonValue[]; bonuses: JsonValue[];
  npcResources?: NpcResources | null; principles?: Principles;
  techniques?: CharacterTechnique[]; stats?: Characteristics;
  equipmentDisabled?: boolean; materials?: number;
}
/** Les événements historiques ne sont PAS réduits au modèle de la phase courante.
 * Leurs références peuvent viser un combattant retiré. Le détail reste extensible.
 */
export type CombatEvent = JsonValue;
export interface CombatAction extends Extensions {
  id?: string; sourceId: FighterId; targetId?: FighterId | null; round: number;
}
export interface CombatProposal extends Extensions { id: string; targetId: FighterId }
export interface CombatHistory extends Extensions { round: number; events: CombatEvent[] }
export interface CombatSnapshot extends Extensions {
  fighters?: Array<Partial<Fighter> & Pick<Fighter, 'id'>>; snapshots?: CombatSnapshot[];
}
export interface TemporaryEffect extends Extensions {
  id: `temp-${number}`; targetId: FighterId; label: string;
  duration: 'round' | 'scene' | 'manual'; createdRound: number; createdScene: number;
  expiresAfterRound?: number; originType?: 'mj' | 'technique' | 'personnage';
  originLabel?: string; originSourceId?: FighterId | null; originActionId?: string;
}
export interface SceneNote extends Extensions {
  id: `scene-note-${number}`; scene: number; round: number; title: string; text: string;
}
export interface Combat extends Extensions {
  round: number; seq: number; phase: CombatPhase; scene?: number;
  fighters: Fighter[]; actions: CombatAction[]; proposals: CombatProposal[];
  history: CombatHistory[]; snapshots: CombatSnapshot[]; notes: JsonValue[];
  engagements?: [FighterId, FighterId][] | null;
  traps?: Array<Extensions & { id: string; ownerId: FighterId; zone: string; round?: number }> | null;
  temporaryEffects?: TemporaryEffect[]; sceneJournal?: SceneNote[];
}
export interface BusinessSession extends Extensions {
  library: Library; combat: Combat; backupMetadata: Extensions; combatMetadata?: Extensions;
}
export interface CompleteBackup extends Extensions {
  format: 'avatar-compagnon-backup'; version: 1 | 2; createdAt?: string;
  library: Library; combat: Combat;
}
export interface PrivateCombat extends Extensions {
  format: 'avatar-compagnon-combat'; version: 2; combat: Combat;
}
export interface SessionEnvelope extends Extensions {
  format: 'avatar-compagnon-react-session'; version: 1; revision: number; session: BusinessSession;
}
export type CampaignImport = Library | Combat | CompleteBackup | PrivateCombat;
export type TechniqueFamily = 'base' | 'universelle' | 'groupe_pnj' | 'eau' | 'terre' | 'feu' | 'air' | 'armes' | 'technologie';
/** Référence de lecture ; ni attribution, ni maîtrise d'un personnage. */
export interface TechniqueReference {
  readonly id: string; readonly name: string; readonly family: TechniqueFamily; readonly approach: string;
}
export interface MoveReference extends Extensions {
  id: string; name: string;
}
/** Banque privée séparée, jamais incluse dans CampaignImport ou CompleteBackup. */
export interface PrivateDescriptionsFile {
  format: 'avatar-technique-descriptions-privees'; version: 1 | 2;
  techniques: Array<{ id: string; description: string; textFormat?: 'plain' | 'markdown-lite' }>;
}
export type PrivateDescriptions = Readonly<Record<string, string | Readonly<{text: string; format: 'markdown-lite'}>>>;
export type DeepReadonly<T> = T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> } : T;
