import type { CanonicalSession } from "./contracts";
export type Character = CanonicalSession["library"]["characters"][number];
export type Library = CanonicalSession["library"];
export const PREPARATION_FORMAT: "avatar-playbook-preparation";
export type BookId =
  | "audacieux"
  | "fripouille"
  | "gardien"
  | "heritier"
  | "icone"
  | "idealiste"
  | "inflexible"
  | "marteau"
  | "pilier"
  | "prodige";
export type StatKey =
  | "creativite"
  | "concentration"
  | "harmonie"
  | "enthousiasme";
export type TechniqueChoice = {
  referenceId: string;
  mastery: "acquise" | "maitrisee";
  accessReviewed: boolean;
};
export interface BookChoices {
  bonusKey: StatKey | null;
  moveIds: string[];
  feature: Record<string, string[]>;
  sourceReviewed: boolean;
  passiveBonusIds: string[];
  techniqueChoices: TechniqueChoice[];
  secondaryTraining?: string;
  additionalOrigin?: string;
  [unknown: string]: unknown;
}
export interface PlaybookDraft {
  format: typeof PREPARATION_FORMAT;
  version: 1;
  activeBookId: BookId | null;
  name: string;
  training: string;
  origins: string[];
  attitudes: string[];
  combatStyle: string;
  historyAnswers: string[];
  relationships: string[];
  combatMode: "deferred" | "full";
  byBook: Partial<Record<BookId, BookChoices>>;
  [unknown: string]: unknown;
}
export type AdvancementProposal =
  | { kind: "own-move" | "foreign-move"; moveId: string }
  | { kind: "stat"; stat: StatKey }
  | { kind: "center"; direction: 1 | -1 }
  | { kind: "moment" };
export interface AdvancementReview {
  bookId: BookId;
  proposal: AdvancementProposal;
  errors: readonly string[];
  decisions: readonly string[];
  sourcePage: 214;
  status: "pending";
  applied: false;
}
export function createPlaybookDraft(): PlaybookDraft;
export function selectDraftBook(
  draft: PlaybookDraft,
  bookId: BookId,
): PlaybookDraft;
export function creationSuggestions(
  bookId: BookId,
): Readonly<Record<string, unknown>>;
export function validateCreationDraft(
  draft: PlaybookDraft,
  library?: Pick<Library, "characters">,
): { errors: string[]; warnings: string[]; candidate: Character | null };
export function inspectCharacterMoves(character: Character): Array<{
  name: string;
  id: string | null;
  bookId: BookId | null;
  origin: "legacy-or-custom" | "current-book" | "other-book";
}>;
export function prepareCampaignBookChange(
  character: Character,
  bookId: BookId,
): Readonly<{
  from: string;
  to: string;
  sourcePages: number[];
  retained: Character;
  requiredDecisions: string[];
  operational: false;
}>;
export function validateAdvancementProposal(
  character: Character,
  proposal: AdvancementProposal,
): AdvancementReview;
