# Avatar Légendes : Compagnon — V2.30

## Modifications
- `spendEarthArmor` : transaction atomique complète ; un échec tardif d’écriture de l’historique restaure réserve, statut Avantagé et snapshots.
- `removeTemporaryEffect` : transaction atomique complète sur toutes ses branches, notamment la libération des Entraves de métal et la révocation de l’Armure de terre. Les mutations partielles et transferts de provenance sont annulés en cas d’échec.
- 5 nouveaux scénarios de régression : trois erreurs tardives, deux opérations réussies suivies d’un undo.
- Clé de sauvegarde existante préservée.

## Suite
Poursuivre les combats de bout en bout à plusieurs maîtres de Terre et les interactions d’effets persistants.
