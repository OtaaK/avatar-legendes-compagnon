export function parsePlaceHash(hash: string) {
  if (!hash.startsWith("#lieu-")) return null;
  try {
    const [raw, query = ""] = hash.slice(6).split("?");
    const id = decodeURIComponent(raw);
    if (!id) return null;
    const params = new URLSearchParams(query);
    return { id, descendants: params.get("desc") === "1" };
  } catch {
    return null;
  }
}
export const placeHash = (id: string, descendants = false) =>
  "#lieu-" + encodeURIComponent(id) + (descendants ? "?desc=1" : "");
export function returnRoute(hash: string) {
  const value = new URLSearchParams(hash.split("?")[1] ?? "").get("retour");
  return value && /^#(?:lieu-|personnage-|lieux$)/.test(value) ? value : null;
}
export function withReturn(target: string, origin: string) {
  const [base, query = ""] = origin.split("?");
  const params = new URLSearchParams(query);
  params.delete("retour");
  const clean = base + (params.size ? "?" + params.toString() : "");
  return (
    target +
    (target.includes("?") ? "&" : "?") +
    "retour=" +
    encodeURIComponent(clean)
  );
}
