# V1.84 — Armure de terre

Empêche le cumul et la réinitialisation d’une réserve de 3 points tant qu’une armure avec réserve est active. Double garde : proposition et validation atomique, y compris deux activations concurrentes. Le refus complet reste permis.

Limite : absorption automatique dans la résolution générale des attaques non encore implémentée.
