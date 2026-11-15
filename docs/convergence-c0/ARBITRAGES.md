# Fiches de décision A01–A09 — référence finale 39fd4781

Ces fiches remplacent les questions provisoires fondées sur 804381ca. Aucune option
n'est appliquée dans cette mission. Les formats Codex v1/v2, toutes les valeurs métier
autorisées, trois maîtrises, deux principes structurés, états/statuts distincts et la
conservation des relations/historiques sont déjà acquis : ils ne sont pas remis au vote.

**Avant d'autoriser le C1 limité proposé : décider A01, A08 et le verrou de périmètre
A09.** A02–A07 restent à trancher avant leurs raccordements respectifs ; ils ne justifient
pas d'inventer des conversions dans l'infrastructure. Voir [C1_FINAL.md](C1_FINAL.md).

## A01 — Garder les données inconnues sans les transformer

| Question | Fiche de décision |
|---|---|
| 1. Problème exact | Comment garder des PNJ/groupes avec ressources absentes, null, vides ou hors profil sans les rendre artificiellement jouables ? |
| 2. React actuel | Fatigue individuelle nullable/facultative ; groupe.resources peut être absent/null/{} ; suggestions à la lecture ; actions explicites de champs. Des incohérences de capacités sont tolérées à l'import collectif. |
| 3. Codex actuel | Fiche active avec fatigue/équilibre numériques ; profil explicite ou défaut historique ; les formats de démo ne sont pas reconnus. Le prévisualiseur C0 est externe et non canonique. |
| 4. Options réalisables | A : en C1, garder le JSON démo dans sa clé et son export d'origine, et accepter seulement les imports Codex. B : créer dès C1 une archive externe versionnée dans le nouvel espace. C : modifier immédiatement le domaine pour admettre des ressources inconnues. |
| 5. Conséquences | A limite C1 à une infrastructure fiable, sans récupération automatique des fiches de démo. B ajoute un schéma, restauration et UI d'arbitrage à tester. C change les préconditions de nombreuses commandes/combat. |
| 6. Risques pour les sauvegardes | Défauts 0/5, null remplacé par absence, container vide perdu, groupe interprété comme individu. Ne pas utiliser makeCharacter comme convertisseur de sauvegarde. |
| 7. Recommandation motivée | Option A pour C1 : aucune conversion réelle de démo, clé originale jamais réécrite et export exact disponible. Différer l'archive intégrée/conversion aux lots approuvés. Aucun champ connu manquant n'est initialisé pour contourner le validateur. |
| 8. Décision attendue | Accepter que C1 n'importe que les formats Codex et laisse les données de démo séparées et intactes, sans les rendre canoniques ; conversion externe à autoriser plus tard. |
| 9. Phase concernée | C1 pour le verrou de formats et la préservation ; C2 et lots suivants pour les conversions résolues. |

## A02 — Valeur métier, base et modificateur

| Question | Fiche de décision |
|---|---|
| 1. Problème exact | Une valeur Codex doit-elle être présentée comme base, valeur actuelle, ou une autre grandeur lorsqu'un modificateur React existe ? |
| 2. React actuel | Base −1..3, modificateurs séparés, somme affichée. Le lot 3 n'a pas changé cette séparation. |
| 3. Codex actuel | Quatre caractéristiques persistantes −3..3 ; effets de combat séparés. Pas de décomposition équivalente stipulée dans le contrat. |
| 4. Options réalisables | A : afficher la valeur Codex telle quelle et conserver les modificateurs externes sans effet. B : définir officiellement une base et des modificateurs avec durée/provenance et adapter le domaine. |
| 5. Conséquences | A garde le comportement éprouvé mais certaines informations externes restent non actives. B nécessite des commandes, limites, expiration et annulation explicites. |
| 6. Risques pour les sauvegardes | Double bonus, effet temporaire rendu permanent, −2/−3 écrêtés, perte de l'ancienne base. |
| 7. Recommandation motivée | A pour le premier raccord C2, avec avertissement si un modificateur externe n'est pas interprété ; aucune addition/soustraction à l'import. Si B est demandé, faire d'abord vérifier les règles et décider le modèle. |
| 8. Décision attendue | Choisir la signification d'affichage des valeurs Codex et le traitement non automatique des modificateurs externes ; la conservation de −3..3 est obligatoire. |
| 9. Phase concernée | C2, puis C7 pour les modificateurs réellement liés au combat ; pas C1. |

## A03 — États et statuts individuels/collectifs

| Question | Fiche de décision |
|---|---|
| 1. Problème exact | Comment rapprocher des textes UI et une capacité collective avec les conditions et statuts reconnus du moteur ? |
| 2. React actuel | states chaînes, statuses objets ; bloc collectif propre ; stateCapacity est un nombre, pas un catalogue complet de conditions. |
| 3. Codex actuel | conditions validées par le profil, liste d'états autorisés ; statuses avec libellés de fiche et codes combat distincts. |
| 4. Options réalisables | A : table de correspondances exactes, inconnus conservés sans effet. B : élargir le domaine à un nouveau contrat des états libres/collectifs avant activation. |
| 5. Conséquences | A peut raccorder les cas déjà résolus sans inventer les autres. B affecte ressources, limite de groupe, calculs et combats. |
| 6. Risques pour les sauvegardes | Une polarité devient un bonus ; un état narratif est pris pour un statut ; les seuls états cochés deviennent à tort la liste des états possibles. |
| 7. Recommandation motivée | A, et contrat spécifique pour les groupes avant leur activation. Aucune traduction approximative de mots ; aucune condition inventée pour atteindre stateCapacity. |
| 8. Décision attendue | Valider la table exacte et le comportement d'affichage/conservation des inconnus ; choisir ultérieurement le modèle de capacité collective avec A09. |
| 9. Phase concernée | C2 pour individus résolus, A09/C2-groupes et C7 pour collectif. |

## A04 — Principes, position et centre

| Question | Fiche de décision |
|---|---|
| 1. Problème exact | Convertir un principe présenté en texte libre sans perdre deux principes structurés ou modifier une position historique. |
| 2. React actuel | principle texte ; balance facultatif/null, balanceCenter PJ ; ressources collectives avec principe et limite propres, sans centre collectif explicite. |
| 3. Codex actuel | Deux emplacements de principe, position et centre séparés ; limites dérivées du profil. |
| 4. Options réalisables | A : garder tuple Codex et texte externe séparés ; demander les deux champs quand une conversion est nécessaire. B : interpréter un label automatiquement, seulement avec un contrat de source non ambigu préalablement validé. |
| 5. Conséquences | A exige une résolution manuelle des sources ambiguës. B raccourcit la saisie mais ne convient pas à un texte libre contenant lui-même un séparateur. |
| 6. Risques pour les sauvegardes | Second principe perdu, signe inversé, position ramenée à zéro ou bornée sans décision. |
| 7. Recommandation motivée | A ; un label n'est jamais la source des valeurs persistantes. Préserver l'original et tester orientation/centre. Aucune limite de groupe déduite de l'importance seule. |
| 8. Décision attendue | Accepter la saisie structurée pour les sources ambiguës et la résolution explicite des positions incompatibles ; aucune règle collective nouvelle implicite. |
| 9. Phase concernée | C2, puis groupes/C7 selon A09 ; C1 ne fait aucune conversion. |

## A05 — Livrets, manœuvres et références de techniques

| Question | Fiche de décision |
|---|---|
| 1. Problème exact | Distinguer références, spécificités, compteurs et droits d'accès des interactions de démonstration. |
| 2. React actuel | Dix Livrets et 50 noms de manœuvres inchangés ; blocks/trackers et moveSources ; dix techniques ordinaires fictives et treize références de groupe séparées. |
| 3. Codex actuel | Catalogue 111 incluant déjà les 13 de groupe ; trois maîtrises personnelles ; préparation par Livret et références distinctes. Certains effets/compteurs sont seulement préparés. |
| 4. Options réalisables | A : mappings explicites, conserver les non résolus sans appliquer d'effet. B : compléter d'abord chaque règle/compteur depuis le PDF avant tout raccord de la partie concernée. |
| 5. Conséquences | A autorise des raccords de consultation progressifs, clairement limités. B retarde la partie métier concernée mais offre un périmètre exhaustif après validation. |
| 6. Risques pour les sauvegardes | Supprimer une technique personnelle inconnue, perdre Pratiquée, appliquer deux fois un bonus, recopier des compteurs fictifs ; ajouter à tort 13 techniques en plus des 111. |
| 7. Recommandation motivée | A pour consultation/références, B avant automatisation. La table des 13 IDs proposée est explicite, car quatre ne correspondent pas à un simple préfixe ; leurs noms communs ne certifient pas leurs effets. |
| 8. Décision attendue | Délimiter lecture et effets validés par Livret/compteur, avec les réserves Work ; autoriser séparément les éventuelles automatismes, jamais par défaut. |
| 9. Phase concernée | C4–C5 et A09 pour références collectives, pas C1. |

## A06 — Relations, lieux et notes de groupe

| Question | Fiche de décision |
|---|---|
| 1. Problème exact | Faire coexister relations libres/structurées/provisoires, lieux et notes collectives sans effacer ni deviner un lien. |
| 2. React actuel | importantRelationships avec alias de cible, liens domicile/position/associés ; groupProfile.relationshipNotes ajouté ; memberCount ne contient pas de liste d'IDs de membres. |
| 3. Codex actuel | Relations textuelles historiques et extensions ; PlaceRules structuré pour PNJ, cibles absentes conservables et signalées. |
| 4. Options réalisables | A : conserver séparément chaque représentation et résoudre seulement des références explicites. B : définir un modèle de relations commun versionné puis migrer explicitement les sources approuvées. |
| 5. Conséquences | A évite de bloquer les archives, mais les éléments non raccordés restent visibles en information. B demande des décisions sur alias contradictoires, cibles manquantes et liens PJ. |
| 6. Risques pour les sauvegardes | Homonymes associés à tort, domicile écrasé, texte libre remplacé par relationshipNotes, création imaginaire de fiches membres d'un groupe. |
| 7. Recommandation motivée | Conserver A, préparer B en C3. Aucune relation déduite d'un nom, effectif ou entraînement. Ne pas confondre référence absente et relation supprimée. |
| 8. Décision attendue | Valider le schéma commun et la gestion des alias/liens PJ/orphelins avant leur écriture ; conserver les notes collectives distinctes. |
| 9. Phase concernée | C3 ; C1 ne modifie ni ne reconstruit ces relations. |

## A07 — Historique d'évolutions, corrections et annulations

| Question | Fiche de décision |
|---|---|
| 1. Problème exact | Conserver un graphe d'événements sans transformer ses statuts en commandes de récompense ou rollback. |
| 2. React actuel | evolutionHistory avec sources, statuts, relatedTo et notes ; dépendances transitives résolues explicitement. Fichiers concernés inchangés depuis C0. |
| 3. Codex actuel | Texte d'évolutions par Livret et events/reviews préparatoires pending/applied:false. Pas de bijection exécutable du graphe UI. |
| 4. Options réalisables | A : conserver l'archive entière sans la rejouer. B : contrat d'événements versionné avec décisions/avant-après pour nouvelles transitions ; effets réglementaires autorisés séparément. |
| 5. Conséquences | A protège l'existant ; B donne traçabilité et annulation explicites mais nécessite tests des dépendances et conflits. |
| 6. Risques pour les sauvegardes | Aplatir en texte, perdre les anciennes arêtes, attribuer un effet à source=regulatory, effacer un événement inconnu, considérer cancelled comme suppression de données. |
| 7. Recommandation motivée | A pour conservation et B pour C6, sans effets automatiques. Les archives de conversion de groupe ne sont pas déjà un historique d'évolution équivalent. |
| 8. Décision attendue | Choisir le schéma et la portée exacte des corrections/annulations ; gains et consommations doivent être explicitement validés avant d'être codés. |
| 9. Phase concernée | C6 ; C7 pour les seuls instantanés de combat, A09 pour transitions de type de PNJ. |

## A08 — Où maintenir l'unique moteur ?

| Question | Fiche de décision |
|---|---|
| 1. Problème exact | Une seule source métier, sans deux copies divergentes ni distribution compliquée pour ce projet. |
| 2. React actuel | Application cible unique dans son dépôt Next ; helpers de groupes déjà présents côté UI ; GitHub/Vercel consomment ce dépôt. |
| 3. Codex actuel | Moteur B et tests préparés dans un autre dépôt ; racine comprend aussi un prototype Vite historique, pas un package consommable prêt. |
| 4. Options réalisables | A : transfert unique vers un package workspace privé du dépôt React. B : moteur maintenu dans Codex et livré comme archive .tgz versionnée avec intégrité. C : registre de package privé. |
| 5. Conséquences | A évite registre/token supplémentaire et rapproche interface/tests/moteur, mais transfère la responsabilité de maintenance. B garde le dépôt Codex source unique avec un processus d'archive. C ajoute publication/permissions/secrets de build. |
| 6. Risques pour les sauvegardes | Un canal ne garantit pas la compatibilité des formats ; préserver exports et tests v1/v2. Le risque principal est la divergence ou une version mouvante, pas le stockage lui-même. |
| 7. Recommandation motivée | A privilégiée, package interne versionné/non publié et source Codex ancienne conservée comme référence non maintenue pour le moteur transféré. B en repli si le transfert n'est pas souhaité. Voir DISTRIBUTION_FINALE.md. |
| 8. Décision attendue | Autoriser pour un futur C1 le transfert unique et désigner le dépôt React comme source métier active ; ou choisir explicitement B. Aucune suppression de l'ancien dépôt/branches et aucune fusion 27/28 nécessaire pour étudier ce transfert. |
| 9. Phase concernée | Choix avant C1 ; mise en œuvre seulement après autorisation C1 distincte. Aucun package publié ou configuration Vercel changée ici. |

## A09 — Contrat des groupes et frontière C1/C2–C7

| Question | Fiche de décision |
|---|---|
| 1. Problème exact | La référence de groupes est maintenant connue ; il faut décider ce qui devient une règle active et comment conserver les archives. |
| 2. React actuel | groupProfile séparé, capacités calculées/personnalisées, entraînements multiples, 13 références, conversions confirmées et profil inactif archivé. |
| 3. Codex actuel | Extensions groupProfile conservables sur une fiche valide mais ignorées par ResourceRules ; copie de combat sans contexte collectif, ressources racine utilisées. Pas de contrat actif de groupe existant. |
| 4. Options réalisables | A : C1 sans conversion ni activation des groupes, données démo conservées ; contrat métier groupe approuvé ensuite. B : élargir C1 aux groupes, nécessitant d'abord règles/états/techniques/transitions/combat validés. |
| 5. Conséquences | A rend C1 exécutable sans simuler un groupe comme individu. B mélange infrastructure et nouveau métier et impose une recette beaucoup plus large. |
| 6. Risques pour les sauvegardes | Fatigue collective remplacée par l'individuelle, entraînements tronqués, états possibles confondus avec états cochés, archive perdue ou calcul de capacité appliqué sans accord. |
| 7. Recommandation motivée | A. La partie « obtenir la référence lot 3 » est résolue ; le contrat collectif reste ouvert. Ensuite, une seule logique dans le domaine partagé, consommée par v0, pas une deuxième formule en parallèle. |
| 8. Décision attendue | Approuver le verrou C1 sans groupe actif ni conversion ; demander ensuite la spécification/règles collectives et le lot dédié, avant tout raccord C2-groupes/C4/C7. Les capacités calculées ne sont pas validées officiellement par ce seul diagnostic. |
| 9. Phase concernée | Verrou avant C1 ; contrat et ressources en C2-groupes, relations C3, références C4, comportement complet/instantanés C7. |

## Décisions minimales pour proposer l'autorisation C1

1. **A01 :** garder la démo originale séparée et intacte ; C1 accepte uniquement les
   sauvegardes Codex, sans conversion externe.
2. **A08 :** privilégier le package workspace après transfert unique, avec responsabilité
   de maintenance dans le dépôt React et ancien dépôt conservé en référence ; sinon repli
   archive versionnée explicitement choisi.
3. **A09 :** C1 ne rend aucun groupe actif dans le moteur ; sa prise en charge est une
   décision/phase métier ultérieure. Ni une extension importée ni son type ne l'autorise.

Ces décisions sont proposées, pas réputées acquises. Leur acceptation ne fusionne aucune
PR et n'autorise pas un déploiement. Le périmètre C1 lui-même doit ensuite être autorisé.
