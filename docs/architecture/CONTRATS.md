# Contrats observés du main V2.33

Source figée : `55d56f6`. Ce document décrit ce que fait le code, **pas une nouvelle règle**.
[REFERENCE.json](REFERENCE.json) conserve 80 entrées publiques (67 fonctions, constantes
comprises dans les 80), les champs par défaut, les clés et les identifiants de référence.
Ce JSON est une observation versionnée, **pas un JSON Schema fermé** ni un format de sauvegarde.

## Métier et modèles

| Frontière | Entrées / résultat | Effets et précautions existants |
|---|---|---|
| `CombatCore.createCombat()` | Nouvel état JSON de combat | Aucun DOM, aucune persistance automatique |
| `addFighter`, `declare`, `queueTechnique`, `propose`, `manual` | État, identifiants, choix explicites ; valeurs/événements | API mutable ; ne pas lui ajouter de choix fictifs ou automatismes |
| `previewCommit(state, decisions)` | Propositions calculées sur copie | L’état fourni ne change pas ; ne pas enregistrer un aperçu comme une validation |
| `commit(state, decisions)` | Application des événements ; erreur si refus | Restauration en cas d’erreur dans cette opération ; historique/instantanés font partie de l’état |
| `undo(state)` | Annulation depuis les instantanés existants | Ne pas réinventer une annulation à partir du dernier affichage |
| `CombatRules.available`, `masteryFor`, `postureCost`, `validateChoice` | Combattant, référence de technique, phase et options | Réutiliser les fonctions, ne pas recopier leurs conditions dans les écrans |
| `Roster.createLibrary`, `makeCharacter` | Bibliothèque/fiche aux valeurs existantes | N’ajoutent pas de nouveaux champs obligatoires à une sauvegarde ancienne |
| `createCharacter`, `updateCharacter`, `assignTechnique` | Bibliothèque, identité, valeurs explicites | Mutations ; identité protégée en édition ; conserver les inconnus |
| `Roster.importLibrary(raw)` | Texte JSON ou objet ; copie normalisée validée | Refus d’identifiant piégé/dupliqué, version incompatible ou champ invalide ; aucun renommage implicite |
| `addToCombat(library,combat,id)` | Copie de fiche avec `characterId` stable | Ressources, stats et techniques deviennent celles de la copie ; pas de synchronisation automatique |
| `syncCombatToLibrary(library,combat,id)` | Report explicite des ressources | Ne pas appeler au rendu, ni étendre implicitement les champs reportés |
| `Playbooks.initialStats`, `applyPreset` | Livret reconnu et choix du bonus | `applyPreset` rend un patch sans l’appliquer ; la décision et la commande restent séparées |
| `validateCombat`, `validateBackupLinks` | Structure de combat et liens aux fiches | Réutiliser les validations existantes ; les instantanés imbriqués ne sont pas certifiés exhaustivement |

Les formats sont JSON sérialisables. Les tableaux par défaut de `REFERENCE.json` indiquent
les clés produites, pas toutes les propriétés historiquement possibles. Les champs inconnus des fiches, de la bibliothèque et du combat conservés par ces
imports doivent rester préservés. Ne pas déduire d’une liste de noms de manœuvres
un apprentissage réglementaire ni accorder une technique à partir d’une suggestion visuelle.

### Limite de transaction à préserver

`Roster.createCharacter` incrémente la séquence avant de valider le nom : un appel isolé
avec un nom invalide peut consommer un numéro sans créer de fiche (constaté dans cette
étape). Ce n’est pas une garantie métier à généraliser : les entrées UI `newSheet` et
`createFromWizard` utilisent leur enveloppe `commitLibraryMutation`, qui restaure l’état
en cas d’erreur. L’extraction future doit conserver cette enveloppe et ses protections.
Aucune correction de cet appel interne n’est glissée dans cette étape.

## Persistance actuelle et port à conserver

Le port physique est le stockage navigateur : `getItem(key) → string|null`,
`setItem(key,string)` et `removeItem(key)`, synchrones et susceptibles de lever une erreur.
L’interface de notifications doit afficher les erreurs, sans les traiter comme un succès.
Les clés exactes sont dans la référence ; elles ne suivent pas le numéro de version affiché.

| Comportement existant | Contrat à maintenir |
|---|---|
| `persist(key,value)` | Sérialisation JSON ; retour booléen ; avertissement et `false` si échec ; pas d’écriture si reprise bloquée |
| `loadSaved(keys,validate,fallback)` | Essai dans l’ordre des clés ; validation avant acceptation ; repli sur ancienne valeur ou défaut ; aucune écriture de réparation implicite |
| `recoverIncompleteImport()` | Restaure les anciennes chaînes des deux clés depuis le journal ; journal conservé si reprise impossible ; retour booléen |
| `persistCompleteBackup(library,combat)` | Journal avant les écritures, bibliothèque puis combat, retrait du journal après succès ; récupération tentée en cas d’échec |
| `commitLibraryMutation(change)` | Copie préalable, mutation puis sauvegarde ; restauration en cas d’échec |
| `commitCombatMutation(change)` | Propriétaire de transaction externe, une écriture pour les appels imbriqués ; restauration et nouvelle peinture en cas d’échec |

Le journal multi-clés n’est pas une garantie de fusion entre onglets. Ne pas annoncer
une atomicité générale fournie par le navigateur ni un mécanisme de conflits non existant.
Les fonctions de persistance ont encore des notifications DOM : 3C isolera ces accès.

### Limite des métadonnées de sauvegarde complète

L’enveloppe de sauvegarde exportée est reconstruite avec format, version, date,
bibliothèque et combat. La conservation d’un champ inconnu **de cette enveloppe** n’est
pas garantie par le code actuel ; ne pas la confondre avec les inconnus des modèles
qui sont conservés. Cette étape ne modifie pas ce comportement ni ne le présente comme
une garantie exhaustive de compatibilité. Toute évolution devra être explicitement cadrée.

## Imports/exports, décisions et démarrage

- Bibliothèque historique : `version: 1`, `seq`, `characters`, avec inconnus conservés.
- Sauvegarde complète : `format: avatar-compagnon-backup`, `version: 1`, date, bibliothèque
  et combat ; le format et les liens sont vérifiés avant remplacement confirmé.
- Export combat seul, export fiches et compte rendu public gardent leurs rôles différents.
  Ne pas promouvoir le compte rendu public expurgé en sauvegarde réimportable.
- Refus, annulation d’une confirmation, erreur de lecture, de rendu ou de stockage doivent
  conserver les données précédentes selon les contrôles existants.
- Démarrage : reprise d’import interrompu, lecture des clés puis affichage. Le premier rendu
  ne sauvegarde pas un état par défaut par-dessus une valeur invalide.
- Attributs d’événements : les données importées restent dans des attributs échappés,
  jamais interpolées en code JavaScript. Les actions permises restent une liste fixe.

## Contrôles de cette étape

`node scripts/architecture/check-contracts.cjs` compare les observations à la référence.
Le nouveau test de contrats garde aussi l’identité du HTML de 3A : toute évolution de
cette référence demandera un examen explicite dans l’étape correspondante.

Le scénario partagé Node/Chromium vérifie import fidèle, refus d’identifiant, préréglage
et aperçu sans mutation, validation/annulation d’un événement synthétique, copie de
combat indépendante, report volontaire et conservation des inconnus. Il n’écrit ni les
variables de session du navigateur ni son localStorage ; le rechargement le vérifie.

Les 230 scripts historiques restent inchangés. Les nouvelles comparaisons complètent
leurs preuves ; elles ne certifient pas toutes les techniques ni toutes les sauvegardes.
