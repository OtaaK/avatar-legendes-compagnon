export function flattenPlaces<
  T extends { id: string; parentId: string | null },
>(
  places: readonly T[],
  collapsed?: ReadonlySet<string>,
): { place: T; depth: number; hasChildren: boolean }[];
