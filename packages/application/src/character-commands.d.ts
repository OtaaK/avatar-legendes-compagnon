import type { SessionStore } from "./contracts";
export function createCharacterCommands(store: SessionStore): {
  create(
    revision: number,
    kind: string,
    fields: Record<string, string>,
    conditions: string[],
    statuses: string[],
    initial?: Record<string, string>,
  ): Promise<string>;
  edit(
    revision: number,
    id: string,
    initial: Record<string, string>,
    fields: Record<string, string>,
    conditions: string[],
    statuses: string[],
  ): Promise<void>;
  adjust(
    revision: number,
    id: string,
    kind: string,
    value: unknown,
  ): Promise<void>;
  canUndo(id: string): boolean;
  undo(revision: number, id: string): Promise<void>;
  invalidate(): void;
};
