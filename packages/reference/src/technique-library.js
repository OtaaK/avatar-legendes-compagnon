import { TECH_CATALOG } from "../../domain/src/catalog.js";
export const FAMILIES = Object.freeze(
  [
    { id: "base", name: "Base", count: 9 },
    { id: "universelle", name: "Universelles", count: 13 },
    { id: "groupe_pnj", name: "Groupe", count: 13 },
    { id: "eau", name: "Eau", count: 13 },
    { id: "terre", name: "Terre", count: 13 },
    { id: "feu", name: "Feu", count: 13 },
    { id: "air", name: "Air", count: 13 },
    { id: "armes", name: "Armes", count: 12 },
    { id: "technologie", name: "Technologie", count: 12 },
  ].map((f) => Object.freeze(f)),
);
export const APPROACHES = Object.freeze([
  "Avancer et attaquer",
  "Défendre et prendre à revers",
  "Esquiver et analyser",
]);
// Projection informative volontairement sans maîtrise, effets, coûts ou commandes.
export const TECHNIQUE_LIBRARY = Object.freeze(
  TECH_CATALOG.map((t) =>
    Object.freeze({
      id: t.id,
      name: t.nom,
      family: t.famille,
      approach: t.approche,
    }),
  ),
);
export const normalizeName = (value) =>
  value.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("fr");
export function filterTechniques({
  query = "",
  family = "",
  approach = "",
} = {}) {
  const term = normalizeName(query.trim());
  return TECHNIQUE_LIBRARY.filter(
    (t) =>
      (!term || normalizeName(t.name).includes(term)) &&
      (!family || t.family === family) &&
      (!approach || t.approach === approach),
  );
}
export function familyName(id) {
  return FAMILIES.find((f) => f.id === id)?.name ?? id;
}
