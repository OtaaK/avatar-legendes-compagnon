# Contrats de préparation des futurs formulaires

Aucun composant React n’importe encore ces modules. Les noms/champs ci-dessous sont une frontière proposée et testée, pas une nouvelle ergonomie imposée à v0.

## Frontières

| Couche | Responsabilité |
|---|---|
| `packages/reference/src/playbooks-data.json` | Métadonnées sourcées, identifiants stables, quantités de choix, thèmes reformulés, réserves |
| `packages/reference/src/playbooks.js` | Référence immuable enrichie avec les préréglages du moteur existant |
| `packages/application/src/playbook-preparation.js` | Brouillons, suggestions, validation structurelle, consultation et plans sans écriture |
| `packages/application/src/playbook-commands.js` | Aperçus liés à une révision, confirmation puis transaction via `SessionStore` |
| `Playbooks`, `BookState`, `Roster` | Mécanismes Codex réutilisés, corps extraits inchangés |
| `SessionStore`, dépôt et codecs existants | Sauvegarde, contrôle des conflits, import/export et conservation des inconnus |

Les déclarations `.d.ts` exposent le contrat au futur TypeScript. Aucun accès direct à `localStorage`, aucun état global de manœuvres sélectionnées, aucune seconde sérialisation de campagne.

## Parcours de création

1. `createPlaybookDraft()` construit uniquement un objet en mémoire, sans identifiant de personnage.
2. `selectDraftBook(draft, id)` retourne un nouveau brouillon. Les choix de tous les autres Livrets restent dans `byBook` ; revenir au Livret précédent les restitue.
3. `creationSuggestions(id)` fournit les principes, bases de caractéristiques, choix propres, manœuvres et technique proposée. Ces suggestions ne deviennent **jamais** des sélections par défaut.
4. La future interface renseigne les **choix réels** : nom, entraînement, origines, attitudes libres, style, histoire, relations et `byBook[id]`.
5. `validateCreationDraft(draft, library)` rend des erreurs, avertissements et, si valide, un candidat non enregistré. Le moteur `Playbooks.initialStats` contrôle le +1 initial plafonné à +2. Les cinq bonus passifs vérifiés demandent des identifiants explicitement confirmés avant de préparer leur +1 plafonné à +3.
6. `commands.prepareCreation(draft)` produit un aperçu immuable lié à la révision courante. L’interface doit afficher les erreurs et les limites avant de proposer une confirmation.
7. `commands.commit(plan, {confirmed: true, reason: '...', acceptPending: true})` crée puis renseigne la fiche **dans une transaction unique**. L’acceptation des limites n’est requise que si le plan comporte des avertissements. Aucun appel ne crée de copie de combat.
8. `commands.cancel(plan)` invalide un aperçu ; abandonner un brouillon non préparé ne fait aucune écriture. Une erreur de quota garde le plan réessayable sans consommer un identifiant. Une révision périmée impose un nouvel aperçu.

Le candidat a un identifiant temporaire `brouillon`, remplacé par `Roster.createCharacter` seulement pendant la transaction. Un plan fabriqué, réutilisé ou provenant d’un autre service est refusé.

## Champs de choix

- `byBook[id].moveIds` : deux références distinctes du Livret à la création. Les noms canoniques sont enregistrés dans `playbookMoves` ; les identifiants et choix sont gardés dans l’extension.
- `feature` : tableau de valeurs par champ indiqué dans la matrice. Les cardinalités sont vérifiées. `sourceReviewed: true` signifie une vérification explicite des options par le joueur/MJ dans son livre ; ce booléen n’est pas une certification automatique.
- Gardien et Inflexible : l’identifiant d’un **autre PJ existant**, pas un nom de PNJ, est requis pour le choix initial. Le cas du premier personnage d’un groupe n’ayant pas encore de fiche impose une création en plusieurs temps ou une résolution de références à définir avec les futurs formulaires ; aucune fiche fictive n’est créée pour contourner cela.
- Héritier avec Connaissance du monde : entraînement secondaire distinct, jamais deux maîtrises élémentaires, origine supplémentaire identifiée. L’entraînement secondaire reste préparatoire ; le combat ne le lit pas encore.
- `passiveBonusIds` : confirmation exacte des manœuvres passives sélectionnées ; aucune application rétroactive sur une fiche existante.
- `combatMode: 'deferred'` : aucune technique préparée. `full` : nombre de références maîtrisées/acquises contrôlé, référence réelle et accessibilité revue explicitement. Une technique de base ou de groupe ne remplit pas un emplacement avancé. Les conditions spécialisées et la formation restent à vérifier avec le MJ.
- Les techniques préparées sont conservées dans `techniqueChoices`, **sans remplir `character.techniques`**. Les maîtrises opérationnelles attendent leur lot.

Les dix techniques particulières de Livret ont un espace de référence distinct (`livret-technique-*`) ; elles n’ajoutent aucune entrée aux 111 techniques de la bibliothèque.

## Complétude du brouillon et limites du contrat

Le contrat de création complète demande un entraînement, un style décrit, au moins une attitude, cinq réponses d’histoire et deux relations. C’est un seuil de **complétude du brouillon proposé**, pas une règle autorisant à supprimer ou refuser une ancienne fiche incomplète. Les six origines sont vérifiées p. 120, jusqu’à deux sans minimum ; les attitudes personnalisées restent permises (p. 121). Les tailles des textes sont des limites techniques, pas des mécaniques de jeu. La composition de l’histoire doit respecter la limite Codex de 4 000 caractères.

L’enregistrement conserve tous les champs supplémentaires du brouillon dans `playbookPreparation`. Les choix d’autres Livrets restent inactifs : leur conservation ne leur accorde aucun effet. Les références inconnues dans une sélection active doivent être corrigées explicitement ; les données d’un personnage importé ne sont pas passées par cette validation de création.

Un changement de Livret **dans un brouillon** ne supprime rien. Un changement **en campagne** n’est pas un changement de brouillon : `prepareCampaignBookChange` rend les décisions p. 222–223 et la fiche conservée, mais aucune commande d’application. L’intégration doit concevoir un aperçu des changements et des échanges, sans rejouer un préréglage de création ni effacer des valeurs.

## Progression, correction et propositions d’évolution

`prepareProgress(id, book, changes, decision)` adapte directement `BookState.patch` : 0–4 cases, moment, notes, texte historique d’évolutions. Le nom peut être historique/personnalisé. Le plan est confirmé et enregistré sans récompense.

`prepareMoves` prépare une correction motivée de liste ; `prepareAddMove` ajoute un nom du référentiel. Les deux journalisent avant/après, demandent l’acceptation que les effets ne sont pas appliqués, puis utilisent `Roster.updateCharacter`. Aucun bonus, ressource, spécificité ou technique n’est ajouté par cette voie. Une future procédure d’acquisition réglementaire devra résoudre les dépendances avant d’en faire usage.

`prepareAdvancement` vérifie la forme d’une proposition et ses contraintes connues, puis `commit` enregistre **uniquement une proposition en attente**, dans un historique distinct. Il ne consomme pas les quatre cases et ne change aucune valeur de jeu. Une proposition sans quatre cases reste une préparation possible, jamais une autorisation d’obtenir l’évolution.
