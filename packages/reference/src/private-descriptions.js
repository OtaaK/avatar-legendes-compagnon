import { TECHNIQUE_LIBRARY } from "./technique-library.js";
export const PRIVATE_TEXT_KEY = "avatar-compagnon-private-technique-texts-v1";
const ids = new Set(TECHNIQUE_LIBRARY.map((t) => t.id));
/** Texte fourni par l'utilisateur, jamais issu d'un résumé du moteur. */
export function parsePrivateDescriptions(text) {
  const input = JSON.parse(text);
  if (
    !input ||
    input.format !== "avatar-technique-descriptions-privees" ||
    ![1, 2].includes(input.version) ||
    !Array.isArray(input.techniques) ||
    input.techniques.length > 111
  )
    throw Error("Format de descriptions privées non reconnu.");
  const descriptions = Object.create(null);
  for (const entry of input.techniques) {
    if (
      !entry ||
      typeof entry.id !== "string" ||
      !ids.has(entry.id) ||
      Object.hasOwn(descriptions, entry.id)
    )
      throw Error("Identifiant de technique inconnu ou dupliqué.");
    if (
      typeof entry.description !== "string" ||
      !entry.description.trim() ||
      entry.description.length > 1_000_000
    )
      throw Error("Description absente, invalide ou trop volumineuse.");
    const format = entry.textFormat ?? "plain";
    if (
      !["plain", "markdown-lite"].includes(format) ||
      (input.version === 1 && format !== "plain")
    )
      throw Error("Format de texte privé non reconnu.");
    descriptions[entry.id] =
      format === "markdown-lite"
        ? Object.freeze({ text: entry.description, format })
        : entry.description;
  }
  return Object.freeze(descriptions);
}
/** Export privé réimportable ; aucune donnée de campagne ni métadonnée inconnue. */
export function serializePrivateDescriptions(descriptions) {
  const raw = JSON.stringify(
    {
      format: "avatar-technique-descriptions-privees",
      version: Object.values(descriptions).some((v) => typeof v !== "string")
        ? 2
        : 1,
      techniques: Object.entries(descriptions).map(([id, description]) => ({
        id,
        description:
          typeof description === "string" ? description : description?.text,
        ...(typeof description !== "string"
          ? { textFormat: description?.format }
          : {}),
      })),
    },
    null,
    2,
  );
  parsePrivateDescriptions(raw);
  return raw;
}
export function privateDescriptionRepository(storage) {
  return {
    load() {
      try {
        const raw = storage.getItem(PRIVATE_TEXT_KEY);
        return {
          descriptions:
            raw === null
              ? Object.freeze(Object.create(null))
              : parsePrivateDescriptions(raw),
          error: null,
        };
      } catch (error) {
        return {
          descriptions: Object.freeze(Object.create(null)),
          error:
            "Les descriptions privées ne peuvent pas être lues. Le contenu local est conservé : " +
            error.message,
        };
      }
    },
    save(descriptions) {
      const raw = serializePrivateDescriptions(descriptions);
      const valid = parsePrivateDescriptions(raw);
      storage.setItem(PRIVATE_TEXT_KEY, raw);
      return valid;
    },
    clear() {
      storage.removeItem(PRIVATE_TEXT_KEY);
      return Object.freeze(Object.create(null));
    },
  };
}
