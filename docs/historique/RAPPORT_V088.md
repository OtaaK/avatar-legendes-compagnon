# Avatar Légendes : Compagnon — V0.88

## Évolution

Ajout de `test_interface_decisions_v088.py`, scénario Chromium/Playwright qui pilote les contrôles HTML réels. Après création de deux PNJ et préparation d’*Aveuglé par la science*, le test décoche uniquement la proposition `status_add` et accepte les deux coûts de fatigue. Il vérifie l’absence de Gêné, puis annule et contrôle le retour à zéro. Un second lot est ensuite rejeté intégralement, sans mutation des combattants.

**Le moteur et l'interface de production sont inchangés depuis V0.87.** Cette livraison apporte une protection de régression, pas une nouvelle technique.

## Contrôles réellement exécutés

- 55/55 fichiers `test_*.cjs` réussis.
- `test_navigateur_v086.py` : réussi.
- `test_interface_v087.py` : réussi.
- `test_interface_decisions_v088.py` : réussi.
- `node --check` sur le script embarqué : réussi.
- ZIP : contrôle d’intégrité réalisé.

## Limites

La page est injectée dans Chromium par `set_content` et le stockage est simulé dans les tests. La persistance réelle entre sessions n'est pas vérifiée. Le compteur de techniques entièrement automatisées reste estimé à 14/102, non audité. La validation atomique des engagements Glissade est couverte par les tests Node, mais pas encore par un test d'interface dédié.
