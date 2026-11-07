# Avatar Légendes : Compagnon — V0.89

## Évolution

Ajout du test d'interface Chromium `test_interface_fatigue_v089.py`. Deux passes de combat successives pilotées par les contrôles HTML permettent de dépenser 3 puis 3 fatigues avec *Aveuglé par la science*. Le deuxième coût fait dépasser 5 cases : l'interface sollicite le MJ pour sélectionner un état de débordement. Le test choisit **Terrifié**, confirme fatigue 5/5 et état appliqué, puis annule la dernière validation et vérifie le retour à 3/5 sans Terrifié.

Le scénario respecte le blocage des déclarations des personnages Étourdis/Piégés au deuxième tour. Il vérifie également l'absence d'erreurs JavaScript.

**Le moteur et l'interface de production ne changent pas dans cette version** : l'amélioration concerne la couverture des tests.

## Contrôles exécutés

- 55 fichiers de tests Node.js : tous réussis.
- 4 tests Chromium/Playwright : tous réussis (`test_navigateur_v086.py`, `test_interface_v087.py`, `test_interface_decisions_v088.py`, `test_interface_fatigue_v089.py`).
- `node --check` du script JavaScript intégré : réussi.
- Archive ZIP : intégrité vérifiée.

## Limites

Les tests Chromium chargent le HTML avec `set_content` et simulent le stockage local. Ils ne vérifient pas encore la persistance entre sessions. La couverture des techniques avancées entièrement automatisées demeure estimée à 14/102 et non auditée.
