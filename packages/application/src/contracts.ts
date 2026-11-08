/** Frontières du lot 1 ; les champs supplémentaires des sauvegardes restent conservés. */
export type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue };
export type CanonicalSession = {
  library: {
    version: number;
    seq: number;
    characters: Record<string, JsonValue>[];
    [key: string]: JsonValue;
  };
  combat: {
    round: number;
    seq: number;
    phase: string;
    fighters: Record<string, JsonValue>[];
    snapshots: JsonValue[];
    [key: string]: JsonValue;
  };
  backupMetadata: Record<string, JsonValue>;
  [key: string]: JsonValue;
};
export type Snapshot = Readonly<{
  session: CanonicalSession;
  revision: number;
  error: string | null;
}>;
export type ImportPlan = Readonly<{
  session: CanonicalSession;
  revision: number;
  kind: string;
  summary: {
    characters: number;
    fighters: number;
    snapshots: number;
    places: number;
  };
}>;
export interface SessionRepository {
  readonly key: string;
  readonly concurrency: "web-locks" | "optimistic";
  load(): {
    token: string | null;
    session: CanonicalSession | null;
    revision: number;
  };
  save(
    session: CanonicalSession,
    expectedToken: string | null,
    revision: number,
  ): Promise<{ token: string; session: CanonicalSession; revision: number }>;
}
export interface SessionStore {
  getSnapshot(): Snapshot;
  subscribe(listener: () => void): () => void;
  prepareImport(text: string): ImportPlan;
  commitImport(plan: ImportPlan): Promise<Snapshot>;
  execute(
    expectedRevision: number,
    command: (draft: CanonicalSession) => CanonicalSession | void,
  ): Promise<Snapshot>;
  checkExternal(): boolean;
  exportBackup(): string;
}
/** Les décisions MJ restent séquentielles. Ce port est réservé, pas connecté en lot 1. */
export type DecisionRequest = {
  id: string;
  kind:
    | "accept"
    | "intercept"
    | "protector"
    | "armor"
    | "overflow"
    | "mj-confirmation";
  context: Readonly<Record<string, JsonValue>>;
};
export type DecisionPlan = {
  expectedRevision: number;
  proposalIds: readonly string[];
  requests: readonly DecisionRequest[];
};
