import data from "./playbooks-data.json" with { type: "json" };
import { Playbooks } from "../../domain/src/playbooks.js";
export function freeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value).forEach(freeze);
  }
  return value;
}
// Les préréglages restent ceux du moteur extrait, jamais une seconde copie modifiable.
export const playbookReference = freeze({
  ...data,
  books: data.books.map((book) => ({
    ...book,
    ...JSON.parse(
      JSON.stringify(Playbooks.PLAYBOOKS.find((p) => p.id === book.id)),
    ),
  })),
});
export const findPlaybook = (id) =>
  playbookReference.books.find((b) => b.id === id) ?? null;
export const findMove = (id) =>
  playbookReference.books
    .flatMap((b) => b.moves.map((m) => ({ ...m, bookId: b.id })))
    .find((m) => m.id === id) ?? null;
