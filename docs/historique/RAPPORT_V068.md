# V0.68 — Protection contre les statuts négatifs

La technique Protection intercepte désormais les attaques qui n’infligent qu’un statut négatif (`en_danger`, `gene`, `piege`, `etourdi`), ainsi que les attaques combinant statut négatif et fatigue/état/équilibre. Les statuts bénéfiques ne déclenchent pas une interception. Un statut négatif déjà présent, sans autre effet réel, ne consomme pas la Protection.

Le dialogue d’interception dans l’interface prend également en compte les statuts négatifs. La prévisualisation et l’annulation sont couvertes par des tests.

Tests : `test_protection_statuts_v068.cjs` et suite de non-régression. Les effets narratifs demeurent à l’arbitrage du MJ. Aucun test dans un navigateur réel.
