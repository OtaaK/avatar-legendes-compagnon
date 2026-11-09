import { Roster } from "../../../../../packages/domain/src/roster.js";
import { ResourceRules } from "../../../../../packages/domain/src/resources.js";
import { PlaceRules } from "../../../../../packages/domain/src/places.js";
import type { CanonicalSession } from "../../../../../packages/application/src/contracts";
export type Character = ReturnType<typeof Roster.makeCharacter> & {
  portrait?: string;
  importance?: string;
  desire?: string;
  description?: string;
  npcResources?: {
    format: string;
    version: number;
    combatant: boolean;
    fatigueMax: number;
    balanceMax: number;
    conditions: string[];
  };
  placeLinks?: {
    homeId?: string | null;
    currentId?: string | null;
    associatedIds?: string[];
  };
  [key: string]: unknown;
};
export type Training =
  | "Eau"
  | "Terre"
  | "Feu"
  | "Air"
  | "Armes"
  | "Technologie";
export type Importance = "Mineur" | "Majeur" | "Champion" | "Légendaire";
export const trainingColors: Record<Training, string> = {
  Eau: "#1BA9E1",
  Terre: "#92BB52",
  Feu: "#D84B63",
  Air: "#B8A06A",
  Armes: "#4F79B4",
  Technologie: "#8E5EC7",
};
export const importanceColors: Record<Importance, string> = {
  Mineur: "#A4B1C0",
  Majeur: "#79B6C1",
  Champion: "#D8B66D",
  Légendaire: "#DFA1A3",
};
export const importanceOrder = Roster.NPC_IMPORTANCE as Importance[];
export const trainings: Training[] = [
  "Eau",
  "Terre",
  "Feu",
  "Air",
  "Armes",
  "Technologie",
];
export const trainingNames: Record<Training, string> = {
  Eau: "Maîtrise de l’Eau",
  Terre: "Maîtrise de la Terre",
  Feu: "Maîtrise du Feu",
  Air: "Maîtrise de l’Air",
  Armes: "Armes",
  Technologie: "Technologie",
};
export type CharacterView = {
  id: string;
  name: string;
  kind: "pj" | "pnj";
  training?: Training;
  playbook: string;
  role: string;
  desire: string;
  importance?: Importance;
  fatigue: number;
  fatigueCapacity: number;
  balance: number;
  balanceCenter: number;
  principle: string;
  states: string[];
  statuses: string[];
  portrait?: string;
  locationId?: string;
};
const text = (value: unknown) => (typeof value === "string" ? value : "");
export function project(c: Character): CharacterView {
  return {
    id: c.id,
    name: c.name,
    kind: c.kind === "PJ" ? "pj" : "pnj",
    training: trainings.find((t) => trainingNames[t] === c.training),
    playbook: text(c.livret),
    role: text(c.livret),
    desire: text(c.desire),
    importance: importanceOrder.includes(c.importance as Importance)
      ? (c.importance as Importance)
      : undefined,
    fatigue: c.fatigue,
    fatigueCapacity: ResourceRules.limits(c).fatigueMax,
    balance: c.balance,
    balanceCenter: c.center,
    principle: c.principles?.filter(Boolean).join(" ↔ ") ?? "",
    states: c.conditions,
    statuses: c.statuses,
    portrait: c.portrait,
  };
}
export function currentPlace(session: CanonicalSession, c: Character) {
  return PlaceRules.currentName(session.library, c);
}
export function fieldsFrom(c: Character): Record<string, string> {
  return {
    sheetName: c.name,
    sheetLivret: text(c.livret),
    sheetTraining: c.training ?? "",
    sheetImportance: text(c.importance),
    sheetDesire: text(c.desire),
    sheetDescription: text(c.description),
    sheetHistory: c.history ?? "",
    sheetNotes: text(c.notes),
    sheetRelations: c.relationships.join("\n"),
    sheetPortrait: text(c.portrait),
    sheetLocation: c.location ?? "",
    sheetFatigue: String(c.fatigue),
    sheetBalance: String(c.balance),
    sheetCenter: String(c.center ?? 0),
    principleLeft: c.principles?.[0] ?? "",
    principleRight: c.principles?.[1] ?? "",
    ...Object.fromEntries(
      Roster.STATS.map((k: string) => [
        "stat-" + k,
        String((c.stats as Record<string, number>)[k]),
      ]),
    ),
    npcProfileMode: c.npcResources ? "explicit" : "legacy",
    npcCombatant: c.npcResources?.combatant === false ? "no" : "yes",
    npcFatigueMax: String(c.npcResources?.fatigueMax ?? 5),
    npcBalanceMax: String(c.npcResources?.balanceMax ?? 3),
    npcConditionCount: String(c.npcResources?.conditions.length ?? 5),
    npcConditionNames: (c.npcResources?.conditions ?? Roster.CONDITIONS).join(
      "\n",
    ),
  };
}
