# Architecture des adaptateurs proposée pour C1–C7

Cette architecture est un plan C0, non raccordé. La cible reste un seul produit
Next.js/React/TypeScript dans `avatar-legendes-ui`. Le moteur phase B, ses protections
et ses formats ne sont pas modifiés. Aucun composant v0 n'est copié ou branché ici.

## Frontières et responsabilités

```text
Données externes v0 804381ca
  → lecture JSON sûre + conservation du document original
  → diagnostic de compatibilité / choix à résoudre (pas une session active)
  → aperçu de migration explicite, seulement après arbitrages
  → validation métier + confirmation + transaction du store existant

Repository injecté ↔ SessionStore unique ↔ services métier Codex
                                          ↕
                              projections de lecture / commandes ciblées
                                          ↕
                              composants Next/React v0 (phase future)

Banque de descriptions privées ↔ repository privé séparé (aucun export campagne)
```

Le format de démo n'est pas admis par `inspectImport`. C0 n'ajoute aucun nouveau chemin
qui contourne ce refus. L'original externe reste distinct de l'état métier actif.
Un emplacement d'archive persistante pour les imports externes devra être choisi et
validé en C1 : ni écrire une deuxième campagne, ni créer un personnage incomplet en lui
attribuant automatiquement les valeurs de `makeCharacter`.

| Couche future | Entrée / sortie | Responsabilité et refus |
|---|---|---|
| Lecture de session | Snapshot immuable + révision | Aucune écriture ou normalisation depuis un effet React |
| Projection | Fiche canonique → vue + liens vers ID source | Traduction de noms, limites réelles, tuple de principes conservé ; jamais sauvegarder la vue entière |
| Présence d'un champ | Absence / null / value | Ne pas confondre absence avec zéro, ni null avec absence ; les défauts affichés sont jetables |
| Commande | ID + révision + intentions explicites | Patch minimal ; ne pas recopier tous les champs d'un formulaire ni les propriétés hors écran |
| Préparation | Aperçu, erreurs, décisions nécessaires | Synchrone et sans stockage ; pas de confirmation implicitement acceptée |
| Confirmation | Choix utilisateur et arbitrages MJ | Se fait avant la transaction ; annuler ne change aucune donnée |
| Exécution | Plan connu / révision courante | `SessionStore.execute` ou `commitImport`, validations et écriture atomique bibliothèque+combat |
| Retour UI | Snapshot publié après succès | Garder brouillon et erreurs si quota/refus ; ne pas afficher « enregistré » avant résolution |
| Notifications | subscribe + événements navigateur injectés côté client | Pas de deuxième source de vérité ; conflit externe bloque, n'écrase pas silencieusement |
| Import/export | Codecs Codex et banque privée indépendante | Versions et extensions conservées ; aperçu/refus explicite pour v0, rapport public non restaurable |

## Contrats stabilisés pour la préparation

1. **Modèle persistant** : `domain/src/contracts.ts`, formats et validateurs de B.
2. **Ports** : `business-ports.ts`, `createCompanionServices`, repository injecté de B.
3. **Transport externe C0** : `ExternalRecord` contient des données JSON seulement,
   sans présumer qu'elles constituent une fiche Codex valide.
4. **Présence** : `ExternalFieldState` est une union `{kind:'absent'}`,
   `{kind:'null'}`, `{kind:'value',value:number}`. Zéro est une valeur présente.
5. **Intention** : `keep`, `set(value)` ou `remove`. `undefined` n'est pas une suppression.
   Un champ non touché reste absent/null/présent exactement comme à l'origine.
6. **Aperçu pur** : `avatar-external-resource-preview`, `canonical:false`,
   `effectsApplied:false`, avant/après et copie candidate gelée. Ce format est refusé
   par l'import canonique. Il ne représente ni un plan autorisé ni une transaction.

`packages/application/src/external-field-preview.js` implémente uniquement 4–6 sur
`fatigue`, `fatigueCapacity` et `balance`. Il refuse les clés d'intention inconnues,
les doublons, les valeurs non JSON/exécutables et les IDs dangereux lorsqu'un ID est
fourni. Il ne modifie jamais la source et ne contient aucun accès au stockage ou réseau.
Les entiers externes ne sont pas réduits aux capacités Codex : une capacité 27 peut être
préservée dans l'aperçu, mais **n'est pas déclarée valide comme profil de combat**.
Le module n'est importé par aucune application ni aucun service existant.

Les données supplémentaires — relations provisoires, événements inconnus, trois degrés
de maîtrise, blocs de Livret — traversent la copie sans interprétation. Ce n'est pas
une preuve d'équivalence complète de ces structures ; l'aperçu ne les valide pas comme
règles ni ne résout leurs références. Une copie JSON conserve la structure, pas la mise
en forme ou l'ordre lexical du fichier original : garder aussi le fichier d'origine
pour une migration future.

## Ressources inconnues : obstacle à traiter explicitement

Le domaine B exige `fatigue` et `balance` numériques et calcule ses capacités. Un
profil non-combattant est explicite, avec des valeurs cohérentes ; il ne se déduit pas
d'une propriété absente. v0 accepte au contraire absence et null, et des capacités PNJ
supérieures à 15.

La lecture ou l'ouverture d'un éditeur ne doit pas fabriquer une fiche active.
Pour un fichier externe incomplet/incompatible : préserver l'original, montrer les
valeurs et leur présence, demander une résolution explicite avant toute création de
fiche canonique. Le choix « non renseigné » doit pouvoir rester non renseigné dans ce
stade externe. La représentation durable de ce stade est un arbitrage A01, pas une
migration accomplie par C0. Aucun changement de règle ou élargissement de plage n'est
introduit pour rendre artificiellement le fichier importable.

## Next.js : pré-rendu et hydratation

Les imports du domaine, services et adaptateur pur ne lisent aucun `window`, `document`,
`navigator` ou `localStorage`. Les commandes ne dépendent pas d'un composant monté.

Proposition pour C1, à recetter dans le dépôt UI après autorisation :

- Une frontière cliente initialise explicitement `createCompanionServices` avec les
  ports de stockage et éventuellement Web Locks, après hydratation.
- Aucun singleton de session utilisateur dans un module serveur. Chaque instance est
  limitée à sa session cliente ; le serveur ne lit pas le stockage du navigateur.
- `useSyncExternalStore` consomme `subscribe/getSnapshot` du store existant. Son
  `getServerSnapshot` et le tout premier rendu client partagent le même objet immuable
  d'attente, stable, ne contenant aucune fiche de démo et jamais enregistré.
- Avant initialisation, l'abonnement est sans effet et la vue indique le chargement.
  Le state React local peut contenir une référence de service, un brouillon, un filtre
  ou une fenêtre ouverte ; il ne contient pas une copie mutable concurrente de campagne.
- Après initialisation, utiliser la révision pour mémoriser les projections. Ne pas créer
  un nouveau snapshot dans chaque appel à getSnapshot. Nettoyer les abonnements au
  démontage et tester le double montage de développement sans aucune écriture.
- Le listener `storage` et le retour au premier plan appellent `checkExternal` côté
  client. Un conflit est signalé ; pas de fusion/rechargement automatique destructeur.
- Appeler les méthodes via leur instance : notamment `store.commitImport(plan)` utilise
  `this.execute`. Ne pas passer cette méthode non liée comme callback isolé.

Ces points ne sont pas implémentés comme hook React en C0. Aucun rendu Next, comportement
Safari ou démarrage Next hors ligne n'est déclaré testé par les tests de modules Node.

## Évolutions : préserver le graphe sans exécuter de récompense

À 804381ca, `CharacterEvolutionRecord` contient ID, date, source, libellé, détails,
statut, notes et `relatedTo`. La correction conserve l'ancienne entrée avec statut
`corrected`, crée un remplacement et peut réadresser les dépendances actives.
L'annulation conserve l'entrée avec statut `cancelled` et impose une décision pour
chaque dépendant actif transitif : indépendant ou annulé aussi.

Ce graphe n'est pas équivalent aux reviews Codex `pending/applied:false` ni au texte
`BookState.evolutions`. La correction de progression change explicitement le compteur
et ajoute une entrée ; l'annulation d'une entrée ne restaure pas automatiquement les
caractéristiques ou la progression. Le champ `source:'regulatory'` est une catégorie
saisie, pas la preuve d'une règle ou d'une récompense déjà appliquée.

Le validateur de démo vérifie la forme des entrées, mais pas une garantie complète
sur l'unicité des IDs d'évolution, les dates, les cycles ou les cibles de `relatedTo`.
La fonction de parcours termine sur un graphe cyclique grâce à son ensemble de visites,
ce qui n'atteste pas que le graphe est cohérent réglementairement.

Proposition A07 : archive source intégrale puis contrat d'événements versionné,
conservant identité, provenance, statut original, liens et contenus inconnus. Pour les
futures transitions, enregistrer décision et état avant/après afin de ne pas perdre
l'ancienne arête lors d'un réadressage. Ne pas rejouer l'archive dans le moteur.
Les anomalies de graphe doivent être signalées sans suppression silencieuse d'événements.
Le choix du schéma et de la portée des annulations reste à valider avant C6.

## Erreurs et limites opérationnelles

Les transactions existantes utilisent une seule valeur persistante pour bibliothèque et
combat. Quota/refus de setItem ne publie pas le candidat. Un repository externe reste
responsable de son contrat d'écriture ; aucune garantie universelle de rollback après
une écriture externe déjà réussie n'est ajoutée. Sans Web Locks, la concurrence reste
optimiste, avec une course possible sur deux écritures exactement simultanées.

Une conversion bloquée garde le document d'origine ; une confirmation n'autorise pas
à éluder une erreur de validation. Un export de secours ne doit jamais substituer l'état
vide de repli après un chargement illisible. La banque privée reste sous sa clé et son
export séparés, sans injection dans les descriptions du catalogue sauvegardé en campagne.
