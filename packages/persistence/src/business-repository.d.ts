import type { BusinessRepository } from '../../application/src/business-ports';
export interface StoragePort {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
export interface LockPort {
  request<T>(name: string, options: {mode: 'exclusive'}, task: () => T | Promise<T>): Promise<T>;
}
export function createBusinessRepository(options: {
  storage: StoragePort;
  key?: 'avatar-compagnon-react-session-v1' | 'avatar-compagnon-react-lab-v1';
  locks?: LockPort;
}): BusinessRepository;
