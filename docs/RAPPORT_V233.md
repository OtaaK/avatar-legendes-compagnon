# Avatar Légendes : Compagnon — V2.33

Base : V2.32, commit `48c9b3075f36afc8b75b13470377cdeb0c6b91d1`.
Date : 7 novembre 2026.

## Problèmes corrigés

1. **Coûts volontaires de Terre (A1)** : ils sont distingués de la fatigue subie et ne sont plus convertibles en états. Cela inclut activation, entretien et paiements de résistance. La réduction de coût d'un bouclier est appliquée avant le contrôle de solvabilité. Les autres familles conservent leur comportement existant ; ce travail ne certifie pas leurs coûts.
2. **Mouvements tectoniques (A2)** : la gêne reste présente pendant la passe suivante, où ses effets peuvent effectivement s'appliquer, puis expire. Les autres événements `status_round` conservent leur échéance par défaut.
3. **Étoile de lave (A3)** : la chronologie du Fracasser gratuit recherche l'activation dans l'historique entier. Une étoile entretenue peut donc détruire du décor lors d'une attaque d'une passe ultérieure.
4. **Avantagé et sources de Terre (A4)** : une autre protection persistante n'est plus mémorisée comme une source extérieure permanente. Armure, étoile et métal restent consultés comme sources actives ; un avantage indépendant réel reste préservé.
5. **Boue gluante (A5)** : la Frappe supplémentaire utilise la validation commune, avec bouclier, armure, abri et réactions. Elle conserve son droit nominatif, ne consomme pas le quota normal et forme une seule transaction annulable. L'interface utilise les décisions MJ ordinaires après calcul des protections ; une attaque bloquée ne demande plus d'états de débordement.
6. **Escalier (A6)** : les 2 fatigues de résistance constituent un paiement, pas une attaque absorbable par les protections.
7. **Gantelet (A7)** : le déplacement hostile d'une attaque bloquée est neutralisé avec ses dégâts, y compris lors d'une interception ou d'un abri.
8. **Rechargement réel (A8, découvert pendant les tests navigateur)** : les effets mécaniques d'origine `technique` peuvent référencer leur créateur. Le validateur refusait auparavant cette provenance produite par le moteur, notamment pour Entraves, Bouclier et Étoile. Les références inconnues restent refusées.

La validation commune restaure désormais aussi l'état complet, historique d'annulation compris, après une erreur. Les clés de stockage et formats de sauvegarde ne changent pas. Les titres et noms des exports affichent V2.33.

## Tests et documentation

- `app/test_terre_v233.cjs` : 26 scénarios couvrant A1–A7, coûts nets, fatigue subie, passes, sources concurrentes, protections, réactions, quotas et annulation.
- `app/test_terre_v233_browser.py` : les 13 formulaires en desktop et mobile, sauvegarde locale réelle, rechargement, annulation et commande de Boue protégée/annulée.
- Attentes historiques V119/V206 corrigées : Gêné tectonique ne doit pas disparaître avant sa passe d'effet.
- Attentes historiques V167/V178 corrigées : payer volontairement ne peut pas devenir une conversion en états à jauge pleine (règles p.100).
- Tests navigateur historiques : titres et noms d'export calculés depuis la version courante ; chemin absolu V227 retiré ; sélecteur des engagements Glissade rendu indépendant de l'ordre des panneaux.
- Métadonnées des 13 techniques et matrice CSV actualisées en **assistance partielle testée**, sans certification exhaustive des interactions.

Résultats détaillés et limites : `docs/AUDIT_V233.md`. Décisions non tranchées : `docs/DECISIONS.md`.

## Limites

Les corrections de provenance concernent les nouvelles opérations. Une ancienne sauvegarde dont les indicateurs booléens confondent déjà plusieurs sources d'Avantagé ne peut pas être réparée automatiquement sans risque d'effacer un avantage indépendant ; vérifier ces statuts avec le MJ. Les choix narratifs et les points de règles ouverts restent explicites. Aucun PDF commercial ajouté au dépôt.
