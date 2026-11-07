# V0.31 — Contrôles de conformité et stabilisation

## Référence
Livre officiel fourni, notamment p. 100 (fatigue au maximum), p. 151–160 (combat et statuts), p. 286–293 (catalogue avancé).

## Corrigé et testé
- Un combattant Étourdi ou Piégé n'empêche plus la révélation de la passe des autres combattants. Il ne peut toujours pas déclarer son approche tant que son statut persiste.
- Une commande « Libérer de Piégé » est disponible entre les passes, avec confirmation du MJ et répartition de trois cases entre fatigue et états.
- La fatigue excédant 5 exige désormais des états explicitement choisis, plutôt qu'une réduction silencieuse à 5. L'opération est refusée en cas de choix invalide ou si tous les états sont déjà marqués.
- Retour arrière du report de fatigue vers un état vérifié au niveau moteur.
- Les six tests de statuts V0.30 et six tests de Frapper V0.29 restent réussis.

## Tests exécutés
- `node test_statuts.cjs` : 6 tests réussis.
- `node test_regles.cjs` : 6 tests réussis.
- `node test_integration.cjs` : 5 tests réussis.
- `node --check check.js` : syntaxe valide.

## Points encore non conformes ou non validés
- **102 techniques avancées** : métadonnées présentes, mais `effet_structure: a_documenter` pour chacune. Il est impossible d'affirmer leur conformité mécanique à partir de ces seules métadonnées. Elles restent en arbitrage manuel. La matrice CSV du projet identifie les techniques à traiter.
- La fatigue excédentaire générée par les réactions dérivées (Riposter, Protection), ou plusieurs effets simultanés sur une même cible, requiert un scénario d'intégration supplémentaire. La confirmation de choix dans l'interface couvre les propositions directes, mais pas tous les effets dérivés.
- Le moteur n'automatise pas entièrement les restrictions fictionnelles de portée, d'engagement, de mise hors de combat, ni les choix de PJ associés à tous les effets.
- Le test Chromium en mode headless a expiré dans cet environnement : aucun résultat de navigation de bout en bout n'est revendiqué pour cette version.
- La fermeture et réouverture réelles du navigateur et la persistance de son stockage n'ont pas été validées pour V0.31.

## Décision
**Version de test**, non déclarée entièrement conforme aux règles. Ne pas remplacer la sauvegarde de campagne existante sans export préalable. Prochaine étape : résolution des effets simultanés et dérivés, tests navigateur avec stockage persistant, puis validation individuelle des techniques contre le PDF.
