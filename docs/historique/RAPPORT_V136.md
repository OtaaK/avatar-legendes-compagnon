# V1.36 — Trois techniques d’armes (annexe A, p. 292)

## Fonctionnalités
- **Estocade précise** : arme d’estoc/perforante confirmée par le MJ ; 1 fatigue, 2 fatigues et Gêné ; déplacement optionnel pour 1 fatigue supplémentaire ; blocage par un adversaire engagé pour 1 fatigue. Les positions ne sont pas inventées par le moteur.
- **Clouer une mouche contre un tronc d’arbre** (rare) : flèches confirmées par le MJ ; coût 1 => Gêné ; coût 3 => Gêné et Piégé.
- **Position surélevée** : position confirmée par le MJ ; 1 fatigue et Avantagé ; protection contre douleur/statuts négatifs durant la passe signalée au MJ, **non automatiquement interceptée**.
- Groupes de propositions indivisibles pour éviter une approbation partielle incohérente. Annulation via historique.

## Vérifications
- 96/96 scripts Node.js (`test_*.cjs`) réussis.
- Syntaxe JavaScript intégrée : `node --check` réussi.
- Chromium `test_chromium_v135.py` et `test_chromium_v136.py` réussis, avec stockage simulé ; aucun test de persistance réelle après fermeture n’est revendiqué.

## Limites
- L'immunité de Position surélevée n'intercepte pas automatiquement les attaques : elle exige l'arbitrage du MJ.
- Les notes libres des exports partageables doivent être relues ; les exports privés contiennent les secrets.
- La persistance réelle après fermeture du navigateur demeure non vérifiée.
