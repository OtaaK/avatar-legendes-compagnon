import type {SessionRepository} from '../../application/src/contracts'
export const SESSION_KEY:string
export const LAB_KEY:string
export class StorageConflict extends Error {}
export function createRepository(options:{storage:Pick<Storage,'getItem'|'setItem'>;key?:string;locks?:LockManager}):SessionRepository
