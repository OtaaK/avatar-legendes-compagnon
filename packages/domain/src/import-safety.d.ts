export function isSafeId(value: unknown): value is string;
export function assertCharacterId(value: unknown): asserts value is string;
export function assertSafeJson<T>(value: T): T;
export function parseSafeJson(text: string): unknown;
export function assertCombatIdentifiers(raw: unknown): void;
