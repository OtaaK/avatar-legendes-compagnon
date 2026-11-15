import type { JsonValue, DeepReadonly } from '../../domain/src/contracts';
export type ExternalResourceField = 'fatigue' | 'fatigueCapacity' | 'balance';
export type ExternalFieldState = Readonly<{kind:'absent'} | {kind:'null'} | {kind:'value';value:number}>;
export type ExternalResourceIntent =
  | {field: ExternalResourceField; action:'keep' | 'remove'}
  | {field: ExternalResourceField; action:'set';value:number | null};
/** Données externes JSON uniquement : jamais une session ou une fiche canonique. */
export type ExternalRecord = { [key:string]: JsonValue };
export function externalResourceState(source:ExternalRecord, field:ExternalResourceField): ExternalFieldState;
export function previewExternalResourceEdits(source:ExternalRecord, intents?:readonly ExternalResourceIntent[]): DeepReadonly<{
  format:'avatar-external-resource-preview'; version:1;
  canonical:false; effectsApplied:false; changed:boolean;
  before:Record<ExternalResourceField,ExternalFieldState>;
  after:Record<ExternalResourceField,ExternalFieldState>;
  candidate:ExternalRecord;
}>;
