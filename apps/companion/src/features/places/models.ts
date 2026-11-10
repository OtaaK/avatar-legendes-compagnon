import { PlaceRules } from "../../../../../packages/domain/src/places.js";
import type { CanonicalSession } from "../../../../../packages/application/src/contracts";
export type Place = {
  id: string;
  name: string;
  description?: string;
  parentId: string | null;
  portrait?: string | null;
  icon?: string;
  [key: string]: unknown;
};
export function placeList(library: CanonicalSession["library"]): Place[] {
  return PlaceRules.all(library) as Place[];
}
export { flattenPlaces } from "../../../../../packages/application/src/place-queries.js";
export function placePath(library: CanonicalSession["library"], id: string) {
  return (PlaceRules.path(library, id) as Place[])
    .map((p) => p.name)
    .join(" / ");
}
