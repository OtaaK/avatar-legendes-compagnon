# V1.58 — Bouclier de roche : interception intégrée

Le moteur de validation bloque maintenant automatiquement la première attaque hostile réellement applicable de la passe contre un personnage protégé par un Bouclier de roche. Les effets multiples d’une même attaque sont absorbés ensemble. Les attaques déjà interceptées et les effets hostiles sans changement réel ne consomment pas le bouclier. L’utilisation est enregistrée seulement après validation atomique, prévisualisation sans mutation, annulation par snapshot, réinitialisation implicite au changement de passe via le numéro de passe.

Limites : la consommation du bouclier pour réduire le coût d’une technique de Terre reste assistée par le MJ ; les attaques purement narratives ne produisant pas d’événements sont arbitrées par le MJ. La commande manuelle de blocage reste disponible pour ces attaques narratives ; ne pas l'utiliser en plus d'une attaque automatiquement absorbée.

Validation : 117/117 tests Node.js ; syntaxe JavaScript ; chargement Chromium sans erreur.
