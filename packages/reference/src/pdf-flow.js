// Vocabulaire de césures vérifié pour l'édition fournie, pas un correcteur orthographique.
// Hors de ces formes, un trait d'union dur est conservé (ex. peut-être, sous-lieu).
const joinedWords = new Set(
  `environnement personnages entreprendre mettez statut position combats accomplir quitter technique terrifie prochaine conserver parvient impossible composante infliger déséquilibrez maîtrisez destruction trouvez adversaire contestant intervenez pouvez devinez perdue directement personnage apparition existant transparaît rapproche inspiration pourquoi effet équilibre servir intercepter prévision principe brutal décentrez destinés efficacement sécurité supplémentaire éventuellement consentante immobilisez danger abondante première attaquer respect devenant adversaires immédiatement repousser physiques précédents projetant pendant question profit infligez matériel dépenser combattants échappez réservez entraînement personne`.split(
    " ",
  ),
);
const key = (s) => s.normalize("NFC").toLocaleLowerCase("fr");
const append = (runs, text, italic = false) => {
  if (!text) return;
  const previous = runs.at(-1);
  if (previous?.italic === italic) previous.text += text;
  else runs.push({ text, italic });
};
/** Markdown fermé : seul *italique* est reconnu ; le reste reste du texte. */
export function inlineRuns(text, rich = false) {
  if (!rich) return [{ text, italic: false }];
  const runs = [];
  const escaped = (at) => {
    let count = 0;
    for (let p = at - 1; p >= 0 && text[p] === "\\"; p--) count++;
    return count % 2 === 1;
  };
  const unescape = (s) => s.replace(/\\([\\*])/g, "$1");
  for (let i = 0; i < text.length; ) {
    if (text[i] === "\\" && ["*", "\\"].includes(text[i + 1])) {
      append(runs, text[i + 1]);
      i += 2;
      continue;
    }
    if (text[i] === "*") {
      let end = i + 1;
      while (end < text.length && (text[end] !== "*" || escaped(end))) end++;
      if (end < text.length) {
        append(runs, unescape(text.slice(i + 1, end)), true);
        i = end + 1;
        continue;
      }
    }
    append(runs, text[i++]);
  }
  return runs;
}
const listStart = (s) => /^\s*(?:[•●◦▪‣–-]|\d+[.)])\s+/u.test(s);
function flowParagraph(text, rich) {
  const tokens = inlineRuns(text, rich);
  if (!/[\n\r\u00ad]/.test(text)) return tokens;
  const lines = [[]];
  for (const token of tokens)
    for (const char of token.text) {
      if (char === "\r") continue;
      if (char === "\n") lines.push([]);
      else lines.at(-1).push({ char, italic: token.italic });
    }
  const out = [];
  let previousList = false;
  for (let index = 0; index < lines.length; index++) {
    let line = lines[index];
    const raw = line.map((c) => c.char).join(""),
      currentList = listStart(raw);
    // L'indentation d'une liste est conservée ; la justification PDF n'est pas une indentation de prose.
    if (!currentList) {
      while (line[0] && /[ \t]/.test(line[0].char)) line.shift();
    }
    while (line.at(-1) && /[ \t]/.test(line.at(-1).char)) line.pop();
    if (!line.length) continue;
    if (out.length) {
      const before = out.map((r) => r.text).join(""),
        left = before.match(/([\p{L}\p{M}]+)([-\u00ad])$/u),
        right = raw.trimStart().match(/^([\p{L}\p{M}]+)/u);
      if (!currentList && left && right) {
        if (left[2] === "\u00ad" || joinedWords.has(key(left[1] + right[1]))) {
          out.at(-1).text = out.at(-1).text.slice(0, -1);
          if (!out.at(-1).text) out.pop();
        }
        // Sans connaissance lexicale, garder le trait dur ; réunir uniquement les lignes.
      } else {
        const separator =
          currentList || (previousList && !/^\s+/.test(raw)) ? "\n" : " ";
        append(
          out,
          separator,
          separator === " " && out.at(-1)?.italic && line[0].italic,
        );
      }
    }
    for (const c of line) append(out, c.char, c.italic);
    previousList = currentList;
  }
  return out
    .map((r) => ({ ...r, text: r.text.replace(/\u00ad/g, "") }))
    .filter((r) => r.text);
}
/** Lecture fluide sans mutation de la banque d'origine. Les paragraphes/listes restent distincts. */
export function descriptionParagraphs(text, rich = false) {
  return text
    .replace(/\r\n?/g, "\n")
    .split(/\n[ \t]*\n/)
    .map((p) => flowParagraph(p, rich));
}
export function flowingText(text, rich = false) {
  const escape = (s) => s.replace(/[\\*]/g, "\\$&");
  return descriptionParagraphs(text, rich)
    .map((runs) =>
      runs
        .map((r) =>
          rich
            ? r.italic
              ? "*" + escape(r.text) + "*"
              : escape(r.text)
            : r.text,
        )
        .join(""),
    )
    .join("\n\n");
}
