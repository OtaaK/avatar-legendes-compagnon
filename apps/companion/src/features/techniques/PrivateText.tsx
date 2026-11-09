export type PrivateTextValue =
  | string
  | { text: string; format: "markdown-lite" };
// Sous-ensemble fermé : italique *...* et échappement. Aucun HTML, lien, image ou code exécuté.
function inline(text: string) {
  const nodes = [];
  let plain = "",
    italic = false,
    span = "",
    escaped = false;
  const flush = () => {
    if (plain) {
      nodes.push(plain);
      plain = "";
    }
  };
  for (const c of text) {
    if (escaped) {
      italic ? (span += c) : (plain += c);
      escaped = false;
      continue;
    }
    if (c === "\\") {
      escaped = true;
      continue;
    }
    if (c === "*") {
      if (italic) {
        nodes.push(<em key={nodes.length}>{span}</em>);
        span = "";
        italic = false;
      } else {
        flush();
        italic = true;
      }
    } else if (italic) span += c;
    else plain += c;
  }
  if (escaped) italic ? (span += "\\") : (plain += "\\");
  if (italic) plain += "*" + span;
  flush();
  return nodes;
}
export function PrivateText({ value }: { value: PrivateTextValue }) {
  const rich = typeof value !== "string",
    text = rich ? value.text : value;
  return (
    <div className="full-technique-description">
      {text.split(/\n\s*\n/).map((p, i) => (
        <p key={i}>{rich ? inline(p) : p}</p>
      ))}
    </div>
  );
}
