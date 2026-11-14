import { createRepository } from './local-session-repository.js';
/** Même repository atomique, contrats phase B ; aucun deuxième stockage. */
export function createBusinessRepository(options) {
  return createRepository(options);
}
