import type { CharacterBase, Characteristics, NpcResources, PlaceLinks, BookState, PlaybookPreparation } from '../../domain/src/contracts';
import type { BusinessStore } from './business-ports';
export type CharacterPatch = Omit<Partial<CharacterBase>, 'id' | 'stats'> & {
  id?: never; kind?: never; stats?: Partial<Characteristics>;
  importance?: string; npcResources?: NpcResources | null; placeLinks?: PlaceLinks;
  playbookState?: BookState | null; playbookPreparation?: PlaybookPreparation;
};
export interface CharacterService {
  create(revision: number, kind: 'PJ' | 'PNJ', name: string, patch?: CharacterPatch): Promise<string>;
  edit(revision: number, id: string, patch: CharacterPatch): Promise<void>;
  adjust(revision: number, id: string, kind: 'fatigue' | 'balance' | 'conditions' | 'statuses', value: number | string[]): Promise<void>;
  canUndo(id: string): boolean;
  undo(revision: number, id: string): Promise<void>;
  invalidate(): void;
}
export function createCharacterService(store: BusinessStore): CharacterService;
