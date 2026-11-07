# Avatar Légendes : Compagnon — V0.70

## Nouvelle automatisation : Plaque de givre (p. 288)

- Approche Esquiver et analyser, technique de maîtrise de l’Eau.
- Confirmation explicite du MJ que la cible se trouve sur la glace.
- La cible devient Gênée et le personnage devient Prêt à l’engager.
- La fin de l’effet Gêné lorsque la cible quitte la glace est **manuelle** : le simulateur ne modélise pas la géographie.
- Prévisualisation, validation partielle, annulation, absence de doublons de statuts.
- Huit scénarios supplémentaires dans `test_plaque_givre_v070.cjs`.

## Limites

Les tests en navigateur réel ne sont pas exécutés. Le statut de Gêné est contextuel et doit être effacé par le MJ lorsque la cible quitte la plaque.
