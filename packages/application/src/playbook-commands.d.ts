import type { SessionStore } from "./contracts";
import type {
  PlaybookDraft,
  Character,
  AdvancementProposal,
} from "./playbook-preparation";
export type PlaybookDecision = {
  confirmed: true;
  reason: string;
  acceptPending?: boolean;
};
declare const planBrand: unique symbol;
/** Valable seulement dans l’instance qui l’a préparé, à la révision indiquée. */
export type PlaybookPlan = Readonly<{
  [planBrand]: true;
  revision: number;
  warnings?: readonly string[];
  kind: "create" | "moves" | "progress" | "advancement";
}>;
export function createPlaybookCommands(store: SessionStore): {
  prepareCreation(draft: PlaybookDraft): Readonly<{
    errors: readonly string[];
    warnings: readonly string[];
    candidate: Character | null;
    plan: PlaybookPlan | null;
  }>;
  prepareMoves(
    id: string,
    names: string[],
    decision: PlaybookDecision,
  ): PlaybookPlan;
  prepareAddMove(
    id: string,
    moveId: string,
    decision: PlaybookDecision,
  ): PlaybookPlan;
  prepareProgress(
    id: string,
    book: string,
    changes: {
      progress?: 0 | 1 | 2 | 3 | 4;
      moment?: "unknown" | "locked" | "unlocked";
      notes?: string;
      evolutions?: string;
    },
    decision: PlaybookDecision,
  ): PlaybookPlan;
  prepareAdvancement(
    id: string,
    proposal: AdvancementProposal,
    decision: PlaybookDecision,
  ): PlaybookPlan;
  cancel(plan: PlaybookPlan): void;
  commit(plan: PlaybookPlan, decision: PlaybookDecision): Promise<string>;
};
