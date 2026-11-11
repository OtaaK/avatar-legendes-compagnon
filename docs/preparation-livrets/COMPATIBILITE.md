# Compatibilité et retour arrière

## Formats conservés

Aucun changement de `packages/domain/src`, des codecs, du dépôt transactionnel, des clés de stockage ni de l’ancien HTML. Lire une fiche, consulter ses manœuvres ou préparer un brouillon ne sauvegarde et ne migre rien.

- `livret` reste un nom libre historique. La correspondance officielle exacte sert seulement aux propositions ; aucune correction typographique silencieuse.
- `playbookMoves` reste une liste de noms ; les noms personnels restent lisibles et conservés.
- `playbookState` reste le format/version 1 de `BookState`, avec entrées par nom exact, champs inconnus et textes libres d’évolutions conservés.
- `techniques`, leur maîtrise, histoire, ressources, lieux et copie de combat restent inchangés lors des corrections de suivi ou de manœuvres.
- Les formats historiques continuent d’être importés exclusivement par l’aperçu et la confirmation du service existant.

## Extension additive

`playbookPreparation` : format `avatar-playbook-preparation`, version 1. Il conserve le brouillon validé et ses choix par Livret, puis d’éventuels événements de correction ou propositions d’évolution en attente. Il n’est jamais la source d’un second compteur de progression.

Cette extension n’est créée que par une commande explicitement confirmée. Les anciennes fiches n’en reçoivent aucune lors d’une consultation. Le mécanisme existant de conservation des champs inconnus la transporte dans les exports/imports sans imposer une nouvelle version générale de sauvegarde ; la création d’un `playbookState` utilise la version de bibliothèque 2 déjà existante.

Une extension d’une version future reste conservée à l’import ; nos nouvelles commandes refusent de la remplacer. Le suivi `BookState`, indépendant, peut continuer à être corrigé. Un journal `events` d’une forme inconnue bloque aussi la modification de ce journal. Les inconnus des objets reconnus sont conservés.

## Garantie transactionnelle

Le plan est immuable, lié à l’instance du service et à une révision du store. La décision précède l’écriture synchrone sur copie ; validation et sauvegarde précèdent la publication. Quota, validation, plan annulé, plan forgé, deuxième confirmation ou conflit de révision ne doivent ni créer de fiche, ni consommer de séquence, ni modifier les données affichées. Un nouvel essai après quota reste possible ; après conflit, il faut reconstruire l’aperçu.

Les événements enregistrent la décision de préparation. Les nouvelles corrections conservent leurs listes avant/après. Les anciens historiques textuels ne sont pas analysés pour prétendre connaître les évolutions disponibles. Aucun identifiant de personnage existant n’est remplacé.

## Retour arrière

La branche est dépendante de `convergence/lot3-lieux` au commit `e38f240`. Aucun composant visuel ne référence les nouveaux modules : revenir au commit parent retrouve donc le même exécutable. Aucun fichier ancien n’est supprimé. Les sauvegardes originales et exports privés restent à conserver ; aucune migration destructive ou réécriture automatique n’a lieu.

Le codec Codex actuel conserve les champs inconnus lors d’un aller-retour ; les tests le vérifient pour les nouveaux choix, anciens noms, historiques et données supplémentaires. On ne garantit pas qu’un outil tiers ou une version plus ancienne que les formats supportés conservera une extension inconnue : garder un export avant de tester un autre outil.

## Contrôles réutilisables

`npm run test:playbooks` exécute les nouveaux scénarios et vérifie les déclarations TypeScript. `npm run test:contracts` les inclut automatiquement dans la suite de convergence. `python scripts/test.py --jobs 2` conserve les 243 scripts historiques. Les contrôles extraction/inventaire/parité et les parcours React précédents restent disponibles.
