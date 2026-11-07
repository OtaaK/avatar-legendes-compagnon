# V1.63 — Provenance des statuts temporaires superposés

Correction de la fin de passe : une source temporaire expirée ne retire plus un statut maintenu par une seconde source temporaire dont la durée n’est pas terminée. Si plusieurs boucliers ou armures maintiennent le même statut, l’expiration de la source temporaire est répercutée à chacun, pour éviter que le dernier effet retiré conserve à tort Gêné ou Avantagé. Test Node dédié : sources à échéances distinctes, deux protections persistantes, retrait successif et annulation.

Limite : les sources de statut modifiées manuellement et les sources indépendantes non horodatées ne peuvent pas être attribuées sans arbitrage MJ.
