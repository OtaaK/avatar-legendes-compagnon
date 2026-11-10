import type { SessionStore } from "./contracts";
export type PlacePatch = {
  name?: string;
  description?: string;
  parentId?: string | null;
  portrait?: string | null;
};
export function createPlaceCommands(store: SessionStore): {
  create(
    revision: number,
    fields: PlacePatch & { name: string },
  ): Promise<string>;
  edit(revision: number, id: string, patch: PlacePatch): Promise<void>;
  remove(
    revision: number,
    id: string,
    strategy?: "promote-unlink",
  ): Promise<void>;
  links(
    revision: number,
    id: string,
    patch: {
      homeId?: string | null;
      currentId?: string | null;
      associatedIds?: string[];
    },
  ): Promise<void>;
};
