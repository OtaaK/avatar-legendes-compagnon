import type { BusinessSession, DeepReadonly, Character, ResourceLimits, TechniqueReference, PlaybookPreparation, PrivateDescriptions } from '../../domain/src/contracts';
import type { CharacterService } from './character-service';
import type { createPlaceCommands } from './place-commands';
import type { createPlaybookCommands, PlaybookPlan } from './playbook-commands';
import type { PlaybookDraft } from './playbook-preparation';
export interface BusinessRepository {
  readonly key: string;
  readonly concurrency: 'web-locks' | 'optimistic';
  load(): { token: string | null; session: BusinessSession | null; revision: number };
  save(session: BusinessSession, expectedToken: string | null, revision: number): Promise<{ token: string; session: BusinessSession; revision: number }>;
}
export type BusinessSnapshot = DeepReadonly<{ session: BusinessSession; revision: number; error: string | null }>;
declare const importIdentity: unique symbol;
export type BusinessImportPlan = DeepReadonly<{
  /** Marque de contrat seulement ; identité de l'objet vérifiée par WeakSet à l'exécution. */
  [importIdentity]: true; session: BusinessSession; revision: number; kind: string;
  summary: {characters: number; fighters: number; snapshots: number; places: number};
}>;
export interface BusinessStore {
  getSnapshot(): BusinessSnapshot;
  subscribe(listener: () => void): () => void;
  execute(revision: number, command: (draft: BusinessSession) => BusinessSession | void): Promise<BusinessSnapshot>;
  prepareImport(text: string): BusinessImportPlan;
  commitImport(plan: BusinessImportPlan): Promise<BusinessSnapshot>;
  checkExternal(): boolean;
  exportBackup(): string;
}
export type PlaybookCommands = Omit<ReturnType<typeof createPlaybookCommands>, 'prepareCreation'> & {
  prepareCreation(draft: PlaybookDraft): Readonly<{
    errors: readonly string[]; warnings: readonly string[]; candidate: Character | null; plan: PlaybookPlan | null;
  }>;
};
export interface CompanionServices {
  readonly session: BusinessStore;
  readonly characters: CharacterService;
  readonly places: ReturnType<typeof createPlaceCommands>;
  readonly playbooks: PlaybookCommands;
  readonly queries: {
    techniques(filters?: {query?: string; family?: string; approach?: string}): readonly TechniqueReference[];
    /** Le détail préparatoire reste extensible ; aucune mécanique déduite du DTO. */
    playbooks(): DeepReadonly<{books: Array<Record<string, unknown>>; [key: string]: unknown}>;
    character(id: string): DeepReadonly<Character> | null;
    resources(id: string): DeepReadonly<ResourceLimits>;
  };
  readonly exports: { campaign(): string; combat(): string };
}
export interface PrivateDescriptionRepository {
  load(): { descriptions: PrivateDescriptions; error: string | null };
  save(descriptions: PrivateDescriptions): PrivateDescriptions;
  clear(): PrivateDescriptions;
}
/** Contrats d'affichage SEULEMENT : ne satisfont pas Character/BusinessSession.
 * Les composants v0 lot 2 ne sont pas encore raccordés ; ces projections sont proposées.
 */
export interface CharacterCardView {
  readonly characterId: string; readonly title: string;
  readonly kindLabel: string; readonly fatigueLabel: string;
  readonly placeLabel: string; readonly warnings: readonly string[];
}
export interface CharacterDetailView {
  readonly card: CharacterCardView;
  readonly balancePosition: number; readonly balanceCenter: number | null;
  readonly limits: DeepReadonly<ResourceLimits>;
  readonly preparation?: DeepReadonly<PlaybookPreparation> | Readonly<Record<string, unknown>>;
}
