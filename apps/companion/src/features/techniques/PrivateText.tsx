import { descriptionParagraphs } from "../../../../../packages/reference/src/pdf-flow.js";
export type PrivateTextValue =
  | string
  | { text: string; format: "markdown-lite" };
export function PrivateText({ value }: { value: PrivateTextValue }) {
  const rich = typeof value !== "string",
    text = rich ? value.text : value;
  return (
    <div className="full-technique-description">
      {descriptionParagraphs(text, rich).map((runs, i) => (
        <p key={i}>
          {runs.map((r, j) => (r.italic ? <em key={j}>{r.text}</em> : r.text))}
        </p>
      ))}
    </div>
  );
}
