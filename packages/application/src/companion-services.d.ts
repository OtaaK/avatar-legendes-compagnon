import type { BusinessRepository, CompanionServices } from './business-ports';
/** Appel explicite côté client ; aucune instance partagée entre utilisateurs SSR. */
export function createCompanionServices(options: { repository: BusinessRepository }): CompanionServices;
