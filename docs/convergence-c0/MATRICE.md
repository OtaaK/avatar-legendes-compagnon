# Matrice de convergence C0 — références figées

## Mise à jour prioritaire — référence finale des lots 1–3

La comparaison courante est désormais **39fd4781 ↔ 804381ca**, avec le domaine B/C0
inchangé. Lire d'abord la [matrice différentielle finale](DIFFERENTIEL_FINAL.md) et
l'[analyse des groupes](GROUPES_PNJ.md), puis les [fiches A01–A09](ARBITRAGES.md).
Elles actualisent les domaines collectifs, entraînements, ressources, références et
conversions. Le [périmètre C1 final](C1_FINAL.md) remplace le C1 provisoire.

Les dix axes par domaine ci-dessous restent la trace du diagnostic C0 sur 804381ca,
pas une affirmation que le lot 3 est toujours inconnu. Les éléments non changés par le
différentiel restent valables ; toute mention d'attendre le lot 3 est historique. Les
nouvelles conclusions et réserves sont dans les documents prioritaires ci-dessus.

## Diagnostic historique conservé de C0 — 804381ca


Codex **62c523c1540f01b3f331c4d980d129307f560af0** ; v0 **804381ca2ae7ee9f7e9ce960591faffd534cb2e7**.
Comparaison du 15 novembre 2026, pas du lot 3 en cours. Empreintes et comparaison des Livrets : [SOURCES.json](SOURCES.json).
« Confirmé » décrit du code inspecté, pas une certification des règles. Une transformation proposée reste non raccordée. Les arbitrages A01–A09 sont détaillés dans [ARBITRAGES.md](ARBITRAGES.md).

| Domaine | Diagnostic |
|---|---|
| Identité PJ/PNJ | Confirmée, avec validation nécessaire |
| Caractéristiques | Correspondance confirmée ; plage incompatible |
| Modificateurs | Incompatibilité sémantique |
| Fatigue et capacité | Écart de représentation bloquant la migration automatique |
| Importance et profils PNJ | Libellés communs ; profils non équivalents |
| États et statuts | Correspondance explicite à construire |
| Principes et équilibre | Partiellement confirmée ; libellé non canonique |
| Livrets et spécificités | Métadonnées confirmées ; choix non équivalents |
| Manœuvres | Références confirmées ; provenance à conserver |
| Techniques et maîtrises | Incompatibilité du catalogue et du troisième niveau |
| Histoire et relations | Texte commun ; relations structurées supplémentaires |
| Lieux | Liens confirmés ; orphelins incompatibles |
| Évolutions et historiques | Nouveau graphe v0 confirmé ; pas de contrat commun exécutable |
| Combats et instantanés | Pas d’équivalence complète côté v0 observé |
| Sauvegardes et restauration | Formats distincts confirmés |
| Descriptions privées | Banque Codex sans équivalent v0 confirmé |
| Portraits et apparence | Champ renommable ; validation/annulation à recetter |

## Identité PJ/PNJ

**Diagnostic : Confirmée, avec validation nécessaire.**

| Aspect | Constat / proposition |
|---|---|
| Modèle métier Codex | Character.id/name/kind PJ / PNJ ; ID strict ASCII 1–120. |
| Modèle v0 exact | Character.id/name/kind pj / pnj ; IDs seulement non vides et non dupliqués au validateur de démo. |
| Correspondances exactes confirmées | Noms identiques ; conversion de casse déterministe. |
| Différences structurelles | Validations ID différentes ; ne pas utiliser la validation de démo comme frontière métier. |
| Informations supplémentaires Codex | Extensions et données historiques inconnues. |
| Informations supplémentaires v0 | Métadonnées de présentation éventuelles. |
| Transformation proposée, non intégrée | Conserver ID et nom ; traduire kind en lecture ; commande ciblée par ID, jamais par nom. ID invalide : refus avec fichier source conservé. |
| Risque de perte | Renommage ou remplacement automatique des IDs casserait les références. |
| Arbitrage / hypothèse restant à résoudre | Pas de nouvel arbitrage sur le format canonique. Plan de résolution explicite si un fichier externe possède des IDs incompatibles. |
| Tests de conservation à exécuter au raccordement | IDs stables, doublons/ID piégé refusés avant écriture, changement de nom sans changement de kind/relations. |

Preuves Codex : `packages/domain/src/roster.js` au commit 62c523c. Preuves v0 : `lib/demo-data.ts ; components/companion-app.tsx` au commit 804381ca.

## Caractéristiques

**Diagnostic : Correspondance confirmée ; plage incompatible.**

| Aspect | Constat / proposition |
|---|---|
| Modèle métier Codex | stats creativite/concentration/harmonie/enthousiasme : entiers −3 à +3. |
| Modèle v0 exact | stats creativity/concentration/harmony/enthusiasm : validation et éditeur −1 à +3. |
| Correspondances exactes confirmées | Quatre noms traduisibles sans calcul. |
| Différences structurelles | 804381ca accepte −1, contrairement au diagnostic ancien qui relevait une borne 0 ; −2 et −3 restent incompatibles. |
| Informations supplémentaires Codex | Valeurs négatives autorisées, clés supplémentaires compatibles. |
| Informations supplémentaires v0 | Organisation visuelle des valeurs. |
| Transformation proposée, non intégrée | Projection renommant uniquement les quatre clés ; valeurs inchangées, aucun clamp. Détecter collision avec une clé anglaise déjà conservée comme extension. |
| Risque de perte | Écrêtage de −3/−2, remplacement des absences par zéro ou collision de noms. |
| Arbitrage / hypothèse restant à résoudre | La plage métier est acquise, pas à revoter. Adaptation du rendu/éditeur à autoriser lors de C2. |
| Tests de conservation à exécuter au raccordement | Boucle −3..3 pour chaque clé, collision signalée, aller-retour conservant les autres clés. |

Preuves Codex : `packages/domain/src/roster.js` au commit 62c523c. Preuves v0 : `components/companion-app.tsx ; components/character-editors.tsx` au commit 804381ca.

## Modificateurs

**Diagnostic : Incompatibilité sémantique.**

| Aspect | Constat / proposition |
|---|---|
| Modèle métier Codex | Une valeur persistante par caractéristique ; effets de combat conservés séparément. |
| Modèle v0 exact | statModifiers partiels −3..3 ; rendu = base + modificateur ; sauvegarde PJ conserve la base. |
| Correspondances exactes confirmées | Correspondance des noms de clés seulement. |
| Différences structurelles | Aucune décomposition base/modificateur équivalente spécifiée dans le contrat canonique. |
| Informations supplémentaires Codex | Données de combat et ajustements historiques. |
| Informations supplémentaires v0 | Modificateurs saisis et distinction visuelle base/valeur actuelle. |
| Transformation proposée, non intégrée | Conserver le bloc externe sans l’appliquer ; ne ni additionner au stat canonique ni le soustraire pour reconstruire une base. |
| Risque de perte | Double application, perte du modificateur ou confusion effet temporaire/permanent. |
| Arbitrage / hypothèse restant à résoudre | A02 : signification, durée et périmètre des modificateurs ; règle explicite avant tout effet. |
| Tests de conservation à exécuter au raccordement | Conserver valeurs/absences indépendamment ; aucune modification de stats ou de combat à l’import/lecture. |

Preuves Codex : `packages/domain/src/contracts.ts` au commit 62c523c. Preuves v0 : `lib/demo-data.ts ; components/character-editors.tsx` au commit 804381ca.

## Fatigue et capacité

**Diagnostic : Écart de représentation bloquant la migration automatique.**

| Aspect | Constat / proposition |
|---|---|
| Modèle métier Codex | fatigue entier obligatoire ; capacité calculée : défaut historique 5, profil PNJ explicite 0..15. |
| Modèle v0 exact | fatigue et fatigueCapacity facultatives ou null ; capacité PNJ entier sûr >=1 sans plafond 15. buildNpcEditPatch ne touche une ressource que sur action explicite. |
| Correspondances exactes confirmées | Valeur chiffrée choisie peut être montrée telle quelle ; absence, null et zéro distincts dans le transport C0. |
| Différences structurelles | Un PNJ v0 sans fatigue ou avec null n’est pas une fiche active valide pour le domaine B. Capacité 0 du profil non-combattant n’a pas d’équivalent accepté par le validateur v0. |
| Informations supplémentaires Codex | Profil complet : combatant, conditions autorisées, équilibre ; ressource active validée. |
| Informations supplémentaires v0 | Ressources non renseignées, null historiques, capacités libres au-delà de 15. |
| Transformation proposée, non intégrée | Garder l’original externe intégral et préparer un aperçu hors session. Sans valeur/profil explicitement choisi, conversion canonique bloquée, pas de makeCharacter utilisé comme migration. |
| Risque de perte | L2-01 réintroduit par défaut 0/5 ; null effacé ; capacité >15 réduite ; absence assimilée à non-combattant. |
| Arbitrage / hypothèse restant à résoudre | A01 : procédure explicite des ressources inconnues/hors capacité et emplacement de conservation externe avant migration, sans modifier les règles ici. |
| Tests de conservation à exécuter au raccordement | 64 combinaisons, patch neutre vide/keep, rechargement JSON, set/remove distincts ; refus canonique des null/absences inchangé. |

Preuves Codex : `packages/domain/src/resources.js ; packages/domain/src/roster.js` au commit 62c523c. Preuves v0 : `lib/npc-edit.ts ; lib/npc-edit.test.mjs ; lib/demo-data.ts` au commit 804381ca.

## Importance et profils PNJ

**Diagnostic : Libellés communs ; profils non équivalents.**

| Aspect | Constat / proposition |
|---|---|
| Modèle métier Codex | Importance descriptive ; aucun recalcul de profil. npcResources possède combatant, fatigueMax, balanceMax et états. |
| Modèle v0 exact | Même liste Mineur/Majeur/Champion/Légendaire ; suggestions de formulaire ; certaines limites d’équilibre restent dérivées de l’importance. |
| Correspondances exactes confirmées | Quatre libellés et valeurs déjà explicitement renseignées. |
| Différences structurelles | v0 n’a pas l’objet de profil complet ; capacités et limites ne se déduisent pas de l’importance. |
| Informations supplémentaires Codex | Profils personnalisés, non-combattants explicites, liste des états. |
| Informations supplémentaires v0 | Rôle/présentation et ressources inconnues. |
| Transformation proposée, non intégrée | Lecture via ResourceRules.limits ; changement d’importance isolé. Toute proposition de profil demande confirmation indépendante. |
| Risque de perte | Rétablissement automatique de 5 fatigues ou de 1..4 d’équilibre. |
| Arbitrage / hypothèse restant à résoudre | A01 pour profils externes incomplets ; aucune automatisation autorisée. |
| Tests de conservation à exécuter au raccordement | Profils 3/5/10/15 et non-combattant ; changement Mineur↔Légendaire sans changement de ressources. |

Preuves Codex : `packages/domain/src/resources.js ; packages/domain/src/npc-presets.js` au commit 62c523c. Preuves v0 : `components/npc-creation-form.tsx ; components/character-detail-redesign.tsx` au commit 804381ca.

## États et statuts

**Diagnostic : Correspondance explicite à construire.**

| Aspect | Constat / proposition |
|---|---|
| Modèle métier Codex | conditions contrôlées par le profil ; statuses libellés reconnus en fiche et codes distincts en combat. |
| Modèle v0 exact | states chaînes libres ; statuses objets {name,polarity,description}, dont exemples fictifs. |
| Correspondances exactes confirmées | Libellés identiques seulement après vérification d’une table explicite. |
| Différences structurelles | Une polarité ou un texte v0 n’est pas un effet métier ; états et statuts ne se fusionnent pas. |
| Informations supplémentaires Codex | Conditions personnalisées du profil PNJ, codes combat, durées/effets associés. |
| Informations supplémentaires v0 | Descriptions et polarités de présentation. |
| Transformation proposée, non intégrée | Table versionnée de correspondances exactes ; inconnus conservés comme information externe non appliquée. Ne pas inventer une correspondance par ressemblance. |
| Risque de perte | Attribution d’un état/bonus inexistant ou confusion Gêné (statut) / émotion narrative. |
| Arbitrage / hypothèse restant à résoudre | A03 : table et traitement des inconnus ; règles ambiguës à vérifier séparément dans le PDF avant interprétation. |
| Tests de conservation à exécuter au raccordement | Inconnu visible/conservé, états/statuts distincts, aucune ressource modifiée ; mapping fiche/combat exact. |

Preuves Codex : `packages/domain/src/resources.js ; packages/domain/src/roster.js` au commit 62c523c. Preuves v0 : `lib/demo-data.ts ; components/character-detail-redesign.tsx` au commit 804381ca.

## Principes et équilibre

**Diagnostic : Partiellement confirmée ; libellé non canonique.**

| Aspect | Constat / proposition |
|---|---|
| Modèle métier Codex | principles [gauche,droite], balance et center séparés ; profils PNJ explicites. |
| Modèle v0 exact | principle chaîne avec séparateur de présentation, balance nullable/facultative, balanceCenter PJ ; affichage de principes par split. |
| Correspondances exactes confirmées | Position et centre distincts ; plages PJ −3..3 communes. |
| Différences structurelles | Deux champs structurés contre un libellé ; balance PNJ v0 accepté −2..4 contre 0..balanceMax sur profil explicite Codex. |
| Informations supplémentaires Codex | Deux principes, données historiques et profil de limite. |
| Informations supplémentaires v0 | Texte libre complet, null/absence de la position. |
| Transformation proposée, non intégrée | Vue conserve le tuple structuré et produit un libellé jetable. Édition envoie deux valeurs distinctes ; jamais split du label comme source métier. |
| Risque de perte | Perte du second principe, inversion gauche/droite, clamp de la position historique ou création de zéro. |
| Arbitrage / hypothèse restant à résoudre | A04 : libellé externe ambigu, orientation à tester ; position PNJ incompatible à résoudre explicitement, pas de correction mécanique C0. |
| Tests de conservation à exécuter au raccordement | Deux principes y compris contenant ↔, valeurs/centre indépendants, limites réelles, null externe conservé. |

Preuves Codex : `packages/domain/src/contracts.ts ; packages/domain/src/resources.js` au commit 62c523c. Preuves v0 : `lib/demo-data.ts ; components/character-detail-redesign.tsx ; components/character-editors.tsx` au commit 804381ca.

## Livrets et spécificités

**Diagnostic : Métadonnées confirmées ; choix non équivalents.**

| Aspect | Constat / proposition |
|---|---|
| Modèle métier Codex | 10 IDs ; playbookPreparation.byBook, choix, feature strings[], questions, décisions, archives ; BookState par Livret. |
| Modèle v0 exact | 10 mêmes IDs ; playbookId et préparation prototypeOnly/schemaVersion ; feature choices/blocks/references, compteurs et trackers visuels. |
| Correspondances exactes confirmées | Comparaison exécutée : 10 IDs, principes et bases de caractéristiques concordent. |
| Différences structurelles | Choix par Livret contre préparation active ; blocs typés/relations provisoires v0 sans interprétation automatique Codex. |
| Informations supplémentaires Codex | Choix des autres Livrets, entrées historiques, limites préparatoires et incertitudes documentées. |
| Informations supplémentaires v0 | Blocs imbriqués, références resolved/pending, compteurs/tracker et détails de provenance de réponses. |
| Transformation proposée, non intégrée | Préserver chaque préparation d’origine ; associer par ID explicite, jamais déduire un Livret depuis un libellé approximatif. Compteur v0 ≠ compteur réglementaire prouvé. |
| Risque de perte | Écrasement byBook, attribution automatique d’un bonus ou réinitialisation d’un compteur réel. |
| Arbitrage / hypothèse restant à résoudre | A05 : contrat versionné des spécificités par Livret et portée des compteurs ; conserver les réserves Work tant que non levées. |
| Tests de conservation à exécuter au raccordement | 10 IDs, aller-retour des inconnus/byBook et blocks/references ; aucune récompense ni consommation automatique. |

Preuves Codex : `packages/application/src/playbook-preparation.js ; packages/reference/src/playbooks.js` au commit 62c523c. Preuves v0 : `lib/playbook-creation-data.ts ; components/character-editors.tsx` au commit 804381ca.

## Manœuvres

**Diagnostic : Références confirmées ; provenance à conserver.**

| Aspect | Constat / proposition |
|---|---|
| Modèle métier Codex | 50 références recensées ; playbookMoves noms anciens/personnalisés ; commandes préparées et confirmées. |
| Modèle v0 exact | moves noms ; moveSources playbook / external, édition avec provenance unknown quand non connue. |
| Correspondances exactes confirmées | 50 noms, cinq par Livret, concordent dans la comparaison de 804381ca. |
| Différences structurelles | Provenance personnelle v0 séparée ; aucune équivalence des effets prouvée par le nom. |
| Informations supplémentaires Codex | Noms historiques, références et décisions de préparation. |
| Informations supplémentaires v0 | moveSources explicite de chaque entrée. |
| Transformation proposée, non intégrée | Résoudre une référence exacte si unique, garder le nom et la provenance ; inconnu n’est pas refusé comme simple texte historique. |
| Risque de perte | Suppression des manœuvres externes ou attribution passive automatique. |
| Arbitrage / hypothèse restant à résoudre | A05 si une provenance influe sur une condition d’accès ; pas de nouvelle règle par le nom. |
| Tests de conservation à exécuter au raccordement | 50 références inchangées ; entrées personnalisées conservées ; aucune exécution au chargement. |

Preuves Codex : `packages/reference/src/playbooks.js ; packages/application/src/playbook-commands.js` au commit 62c523c. Preuves v0 : `lib/demo-data.ts ; components/character-editors.tsx` au commit 804381ca.

## Techniques et maîtrises

**Diagnostic : Incompatibilité du catalogue et du troisième niveau.**

| Aspect | Constat / proposition |
|---|---|
| Modèle métier Codex | 111 références/9 familles ; techniques personnelles {name,mastery} à trois niveaux ; références de Livret distinctes. |
| Modèle v0 exact | 10 techniques fictives/6 entraînements ; techniques IDs ; techniqueMastery acquired / mastered ; maîtrise aussi portée par le catalogue de démonstration. |
| Correspondances exactes confirmées | acquired↔acquise et mastered↔maitrisee seulement pour un lien explicitement résolu. |
| Différences structurelles | Pas de pratiquée personnelle v0 ; trois familles supplémentaires Codex ; IDs fictifs non convertibles par position ou similarité de nom. |
| Informations supplémentaires Codex | Assistance, références, noms historiques, trois maîtrises et catalogue indépendant. |
| Informations supplémentaires v0 | signatureTechniqueId et choix préparés liés aux références de Livrets. |
| Transformation proposée, non intégrée | DTO personnel à trois niveaux ; catalogue en lecture seule. IDs stables Codex ; références exactes/ambiguës signalées, pas de remappage automatique des dix fictions. |
| Risque de perte | Pratiquée perdue ; maîtrise globale remplaçant la maîtrise personnelle ; référence de Livret forcée dans le catalogue commun. |
| Arbitrage / hypothèse restant à résoudre | Affichage des trois degrés acquis comme exigence ; A05 pour les références de Livret hors catalogue et liens externes ambigus. |
| Tests de conservation à exécuter au raccordement | 111/9, trois niveaux indépendants, personnage modifié sans mutation de catalogue ; inconnus conservés. |

Preuves Codex : `packages/reference/src/technique-library.js ; packages/domain/src/roster.js` au commit 62c523c. Preuves v0 : `lib/demo-data.ts ; components/character-editors.tsx` au commit 804381ca.

## Histoire et relations

**Diagnostic : Texte commun ; relations structurées supplémentaires.**

| Aspect | Constat / proposition |
|---|---|
| Modèle métier Codex | history texte, relationships string[], extensions et playbookPreparation.relationships ; inconnus conservés. |
| Modèle v0 exact | history texte/Markdown, relationships ancien texte ; importantRelationships avec characterId/npcId/targetName/provisional/description ; réponses détaillées de création. |
| Correspondances exactes confirmées | Texte narratif transportable sans le réécrire ; références explicites réutilisables après contrôle. |
| Différences structurelles | Relations libres et structurées ne sont pas une liste unique ; absence de cible/provisoire significative. |
| Informations supplémentaires Codex | Anciennes chaînes, contexte et réponses conservés par Livret. |
| Informations supplémentaires v0 | Liens structurés et provisoires, réponses avec page et provenance ; deux types d’alias ID possibles. |
| Transformation proposée, non intégrée | Garder texte et bloc structuré distincts ; aucune liaison par nom. Contrôle de conflit si characterId et npcId diffèrent ; cible manquante affichée, jamais supprimée. |
| Risque de perte | Écrasement de relations libres, fausse résolution d’homonymes ou rendu HTML exécutable. |
| Arbitrage / hypothèse restant à résoudre | A06 : représentation canonique extension versionnée des relations ; politique des alias contradictoires et cibles absentes. |
| Tests de conservation à exécuter au raccordement | Deux homonymes, pending sans ID, cible supprimée et inconnus conservés ; texte affiché sans exécution. |

Preuves Codex : `packages/domain/src/contracts.ts ; packages/application/src/playbook-preparation.js` au commit 62c523c. Preuves v0 : `lib/demo-data.ts ; components/companion-app.tsx` au commit 804381ca.

## Lieux

**Diagnostic : Liens confirmés ; orphelins incompatibles.**

| Aspect | Constat / proposition |
|---|---|
| Modèle métier Codex | places hiérarchiques parentId:null ; PNJ placeLinks homeId/currentId/associatedIds ; anciens location textes ; orphelins signalés mais conservés. |
| Modèle v0 exact | Place.parentId absent pour racine ; icon ; homeLocationId/locationId/associatedLocationIds plats, y compris sur des exemples PJ ; validation de démo exige cibles présentes. |
| Correspondances exactes confirmées | Hiérarchie et trois rôles de lien identifiables. |
| Différences structurelles | null et absence à préserver dans le document d’origine ; parent ou lien absent accepté comme archive Codex, refusé par démo v0 ; PlaceRules réserve liens structurés aux PNJ. |
| Informations supplémentaires Codex | Orphelins, anciennes positions textuelles et portraits de lieux. |
| Informations supplémentaires v0 | Icone, associations de lieux sur PJ. |
| Transformation proposée, non intégrée | Projection des liens sans changer le stockage ; afficher les absents comme références à résoudre ; nom de lieu lu depuis son ID. |
| Risque de perte | Domicile écrasé au renommage, disparition d’orphelins ou transfert des liens PJ vers un PNJ. |
| Arbitrage / hypothèse restant à résoudre | A06 pour liens structurés PJ et orphelins externes ; aucun assouplissement de PlaceRules en C0. |
| Tests de conservation à exécuter au raccordement | Renommer parent/lieu sans modifier liens ; domicile/position différents ; null/absence ; cycles signalés, orphelins conservés. |

Preuves Codex : `packages/domain/src/places.js` au commit 62c523c. Preuves v0 : `lib/demo-data.ts ; components/companion-app.tsx` au commit 804381ca.

## Évolutions et historiques

**Diagnostic : Nouveau graphe v0 confirmé ; pas de contrat commun exécutable.**

| Aspect | Constat / proposition |
|---|---|
| Modèle métier Codex | BookState entrées progress 0..4, notes/evolutions texte ; préparation events et reviews pending/applied:false. |
| Modèle v0 exact | evolutionHistory records id/date/source/label/details/status active / corrected / cancelled/relatedTo/gmNotes ; corrections manuelles et dépendances transitives. |
| Correspondances exactes confirmées | Quatre cases, décisions consignées et absence de récompense automatique dans le parcours EvolutionEditor observé. |
| Différences structurelles | Graphe de dépendances et statut d’archive ne sont pas une review Codex ; source regulatory n’est pas une preuve de conformité ni un effet appliqué. |
| Informations supplémentaires Codex | Anciens textes et événements inconnus, suivi multi-Livrets. |
| Informations supplémentaires v0 | Historique structuré, corrections/remplacements et dépendances ; moveSources. |
| Transformation proposée, non intégrée | Conserver le graphe source entier sans transition lors de l’import. Proposer ultérieurement une enveloppe d’événements versionnée gardant origine et snapshots avant/après. |
| Risque de perte | Aplatir en texte, rejouer une récompense, perdre relatedTo lors d’une correction, écraser des événements inconnus. |
| Arbitrage / hypothèse restant à résoudre | A07 : modèle événementiel et portée de l’annulation ; pas de rollback de ressources déduit du statut cancelled. |
| Tests de conservation à exécuter au raccordement | Chaîne A→B→C, correction/remplacement, annulation et événement futur ; aucune récompense/retrait automatique. |

Preuves Codex : `packages/domain/src/books.js ; packages/application/src/playbook-commands.js` au commit 62c523c. Preuves v0 : `lib/evolution-history.ts ; lib/evolution-history.test.mjs ; components/character-editors.tsx` au commit 804381ca.

## Combats et instantanés

**Diagnostic : Pas d’équivalence complète côté v0 observé.**

| Aspect | Constat / proposition |
|---|---|
| Modèle métier Codex | Moteur complet, propositions/décisions, effets/durées, engagements, journal, historiques et snapshots, undo. |
| Modèle v0 exact | Écran de démonstration, pas d’équivalent de ces structures persistantes dans AppData. |
| Correspondances exactes confirmées | Point d’entrée visuel Combats seulement. |
| Différences structurelles | Pas de traducteur complet du moteur déduit du schéma de démonstration. |
| Informations supplémentaires Codex | Copies de combattants indépendantes, arbitrages séquentiels et historiques avancés. |
| Informations supplémentaires v0 | Organisation et interactions d’écran servant de référence future ; groupes lot 3 non examinés. |
| Transformation proposée, non intégrée | Préserver combat opaque validé ; raccord de commandes uniquement en C7. Décisions avant transaction, aucun await utilisateur dans execute. |
| Risque de perte | Remplacement du combat complet par résumé v0 ou synchronisation automatique fiche/copie. |
| Arbitrage / hypothèse restant à résoudre | A09 : contrats des écrans de combat et référence du lot 3 après validation ; aucune règle réinventée. |
| Tests de conservation à exécuter au raccordement | Parité 198 scripts, coûts/refus/effets/undo/snapshots ; fiche modifiée sans modifier le combattant. |

Preuves Codex : `packages/domain/src/combat.js ; packages/domain/src/validation.js` au commit 62c523c. Preuves v0 : `components/companion-app.tsx` au commit 804381ca.

## Sauvegardes et restauration

**Diagnostic : Formats distincts confirmés.**

| Aspect | Constat / proposition |
|---|---|
| Modèle métier Codex | Bibliothèque/backup v1/v2, combat privé, session atomique ; aperçu et plan lié à révision ; clés historiques séparées. |
| Modèle v0 exact | AppData {characters,places,techniques,objectives} sans format Codex ; clé avatar-legendes-compagnon-demo-v1 ; lecture protégée et commit après stockage réussi. |
| Correspondances exactes confirmées | JSON et stockage local, gestion d’erreurs ; aucune identité de format. |
| Différences structurelles | Normalisation historique v0 retire certains null non-ressources ; contraintes validateur différentes ; pas d’instantanés métier dans AppData. |
| Informations supplémentaires Codex | Versions/enveloppes, extensions, combat et métadonnées, refus/public report non restaurable. |
| Informations supplémentaires v0 | Données de démonstration et objectifs ; événements structurés sans interprétation officielle. |
| Transformation proposée, non intégrée | Import externe identifié séparément ; conserver original, aperçu pertes/incompatibilités, confirmation puis transaction seulement quand conversion résolue. Pas de roundtrip via normalizeHistoricalNulls pour du Codex. |
| Risque de perte | Rétrogradation v2, perte des extensions/null, écrasement de stockage illisible ou conversion silencieuse d’objectifs fictifs. |
| Arbitrage / hypothèse restant à résoudre | A01/A06/A07 et A08 avant adaptation import réelle ; format Codex canonique déjà acquis. |
| Tests de conservation à exécuter au raccordement | v1/v2 roundtrip, refus quota/stockage, plan périmé, restauration, banque privée absente, format externe refusé aujourd’hui. |

Preuves Codex : `packages/persistence/src/codecs.js ; packages/application/src/session-store.js` au commit 62c523c. Preuves v0 : `lib/demo-storage.ts ; lib/demo-data.ts ; components/companion-app.tsx` au commit 804381ca.

## Descriptions privées

**Diagnostic : Banque Codex sans équivalent v0 confirmé.**

| Aspect | Constat / proposition |
|---|---|
| Modèle métier Codex | Banque privée v1/v2 de 111 IDs, import groupé, texte/markdown-lite, clé/export séparés, hors campagne. |
| Modèle v0 exact | Descriptions du catalogue fictif, pas de banque privée équivalente dans le schéma AppData. |
| Correspondances exactes confirmées | Consultation textuelle seulement. |
| Différences structurelles | Les descriptions de démo ne comblent aucun manque ; ne pas déplacer les textes privés vers Technique.description sauvegardé avec campagne. |
| Informations supplémentaires Codex | Texte privé complet, provenance locale et mécanismes de sauvegarde distincts. |
| Informations supplémentaires v0 | Texte fictif de maquette sans valeur réglementaire. |
| Transformation proposée, non intégrée | Lecture depuis le repository privé injecté après initialisation cliente ; description absente annoncée, pas remplacée par un résumé. |
| Risque de perte | Publication involontaire via dépôt, analytics, logs, capture ou export campagne. |
| Arbitrage / hypothèse restant à résoudre | Pas d’arbitrage sur la séparation déjà imposée ; stratégie de transfert local explicite à recetter en C4. |
| Tests de conservation à exécuter au raccordement | 111 IDs synthétiques, import/export séparé et quota, rechargement hors réseau ; aucun texte dans campagne/rapport public. |

Preuves Codex : `packages/reference/src/private-descriptions.js` au commit 62c523c. Preuves v0 : `lib/demo-data.ts ; components/companion-app.tsx` au commit 804381ca.

## Portraits et apparence

**Diagnostic : Champ renommable ; validation/annulation à recetter.**

| Aspect | Constat / proposition |
|---|---|
| Modèle métier Codex | portrait local validé PNG/JPEG/WebP, signature binaire et limite 360000 caractères à la saisie ; anciennes valeurs importées préservées. |
| Modèle v0 exact | portraitDataUrl ; remplacement direct PJ ; réserve Work sur annulation ; apparence textuelle séparée. |
| Correspondances exactes confirmées | portrait ↔ portraitDataUrl comme projection. |
| Différences structurelles | Affichage et remplacement n’ont pas la même responsabilité ; données importées anciennes ne sont pas réécrites à l’ouverture. |
| Informations supplémentaires Codex | Ancienne valeur et validation de saisie éprouvée. |
| Informations supplémentaires v0 | Parcours visuel de remplacement PJ/PNJ. |
| Transformation proposée, non intégrée | Brouillon de fichier local, validation avant aperçu ; aucune commande avant confirmation ; abandon conserve la valeur d’origine. |
| Risque de perte | Remplacement direct irrécupérable ou élargissement non justifié des formats. |
| Arbitrage / hypothèse restant à résoudre | Réserve Work à lever séparément ; pas de correction d’écran en C0. |
| Tests de conservation à exécuter au raccordement | Fichier refusé, quota, annulation après sélection et après aperçu, recharge des anciennes valeurs. |

Preuves Codex : `packages/domain/src/character-fields.js ; packages/application/src/character-service.js` au commit 62c523c. Preuves v0 : `components/companion-app.tsx ; components/npc-creation-form.tsx` au commit 804381ca.

## Limites de cette matrice

Les tests proposés par domaine sont des critères pour les futurs raccordements, pas tous des contrôles réalisés en C0. Les contrôles réellement exécutés figurent dans [BILAN.md](BILAN.md). Les neuf tests ajoutés portent sur le transport et l’aperçu pur, pas sur une migration complète.
Le rapport complet Work n’a pas été fourni : son verdict et ses réserves sont repris de la demande du propriétaire. Les trois suites unitaires disponibles dans 804381ca ont été relancées, mais la recette visuelle/mobile de v0 n’est pas répétée ici.
