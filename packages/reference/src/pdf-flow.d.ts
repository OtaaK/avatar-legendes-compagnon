export type TextRun = { text: string; italic: boolean };
export function inlineRuns(text: string, rich?: boolean): TextRun[];
export function descriptionParagraphs(
  text: string,
  rich?: boolean,
): TextRun[][];
export function flowingText(text: string, rich?: boolean): string;
