# Avatar Légendes : Compagnon — V2.17

## Corrections transversales Terre

1. **Bouclier de roche + Entraves de métal dans la même validation** : la consommation du bouclier ne supprime plus Gêné lorsqu'une Entrave approuvée dans la transaction apporte immédiatement sa propre source.
2. **Provenance des Entraves de métal** : un Gêné précédemment fourni exclusivement par un Bouclier de roche n'est plus considéré comme une source extérieure permanente lors de la création de l'Entrave. Révocation du bouclier puis libération des entraves retire donc correctement Gêné.
3. **Conservation des sources indépendantes** : un Gêné extérieur préexistant demeure après la révocation et la libération. La réduction du coût d'Enfouissement est vérifiée dans un scénario combiné avec Entraves.

## Vérifications

- 175/175 scripts de tests Node réussis, incluant les 174 tests historiques.
- Vérification de syntaxe JavaScript `node --check` : OK.
- Chargement Chromium via Playwright : OK, aucune erreur JavaScript au démarrage.
- Intégrité ZIP vérifiée après assemblage.

## Limites

Les 13 techniques de Terre sont intégrées mais leur validation exhaustive en parcours utilisateur reste inachevée. Le Feu demeure secondaire.
