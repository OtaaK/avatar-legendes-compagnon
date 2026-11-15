# Référence finale des lots 1–3 — analyse différentielle

**C1 non autorisée.** Référence ancienne : `804381ca2ae7ee9f7e9ce960591faffd534cb2e7`.
Référence finale examinée : `39fd4781ebf9ef0e3575b1f14926e63050c7b687`.
Le dernier commit est bien la fusion de la PR UI nº 14 ; son premier parent est 804381ca.
Le déploiement sur https://al-ui.vercel.app et les verdicts Work sont indiqués par le
propriétaire ; aucun contrôle de production ou nouvelle recette Work n'est revendiqué ici.
Les preuves et empreintes sont dans [SOURCES.json](SOURCES.json).

## Différence exacte entre les deux arbres Git

11 fichiers changés : 775 lignes ajoutées, 82 retirées. Aucun fichier supprimé.

| Fichier v0 | Changement confirmé | Conséquence pour la convergence |
|---|---|---|
| `lib/demo-data.ts` | Types NpcGroupSize, NpcGroupResources, NpcGroupProfile ; Character.npcType et groupProfile facultatifs | Le type PJ/PNJ ne suffit plus à choisir les ressources actives. Un profil archivé peut rester sur un individuel. |
| `lib/npc-groups.ts` (nouveau) | Calculs, bandes d'effectif, catalogue 13 références, validation et aperçus de conversion | Une seule implémentation actuelle côté UI ; aucune copie de ses règles à créer dans Codex. Validation officielle distincte de l'observation du code. |
| `lib/npc-groups.test.mjs` (nouveau) | Cinq tests : six profils calculés, effectifs, catalogue, validation, aperçu non mutateur | Tests relancés ; ne certifient pas le PDF malgré certains intitulés de tests. |
| `lib/npc-edit.ts` | Comparaison profonde des objets ; champs npcType/groupProfile/combatStyle ; applyNpcGroupResourceEdits avec champs touchés | Les containers absents/null/vides sont préservés sans édition explicite. Le patch groupProfile peut remplacer un bloc entier : attention aux extensions. |
| `lib/npc-edit.test.mjs` | Deux tests supplémentaires, import du nouvel outil de patch | Couverture de ressources absentes/null/vides/renseignées et édition d'identité ; ce n'est pas une recette du vrai formulaire React. |
| `components/npc-creation-form.tsx` | Type individuel/groupe, effectif/taille/importances, entraînements multiples, capacités, techniques, confirmations et choix de conversion | Le formulaire prépare un bloc collectif séparé ; ne pas le traduire en un PNJ canonique par défaut. |
| `components/character-detail-redesign.tsx` | Ressources/états/statuts collectifs, sélection de techniques de groupe, callbacks propres | Les callbacks de fatigue/équilibre collectif n'empruntent pas les callbacks individuels à la racine. Un raccord global unique serait incorrect. |
| `components/companion-ui.tsx` | Cartes PNJ de groupe : importance effective, entraînements, ressources collectives et statuts | Les cartes lisent des capacités recommandées sans les écrire ; ces valeurs calculées ne sont pas des valeurs stockées. |
| `components/companion-app.tsx` | Import d'isNpcGroupProfile et trois conditions supplémentaires de validateDemoData | Profil autorisé seulement sur PNJ ; actif si npcType=group ; profil archivé permis sur individuel. Le mécanisme de stockage n'est pas remplacé. |
| `app/globals.css` | Styles de groupe, formulaire et ressources | Aucun besoin de reproduire ces styles dans le dépôt Codex. |
| `package.json` | Ajout de test:npc-groups | Pas de nouvelle dépendance d'exécution ou de framework dans ce différentiel. |

**Inchangés entre les deux références :** `lib/demo-storage.ts`,
`lib/evolution-history.ts`, `lib/playbook-creation-data.ts`,
`components/character-editors.tsx`, normalisation historique des null dans demo-data,
clé de stockage et structure générale AppData. Les historiques d'évolution et réserves
C0 restent donc d'actualité ; la référence finale n'apporte pas leur équivalence avec Codex.

## Matrice actualisée par domaine

Statuts : **C** constat confirmé dans les sources ou probes ; **P** proposition non
implémentée ; **R** réserve de recette/règle, pas anomalie démontrée.

| Domaine | Situation à 39fd4781 et écart avec Codex B/C0 | Statut / action prévue |
|---|---|---|
| Identité PJ/PNJ | `npcType` individual/group distingue le PNJ actif ; absence = individuel côté UI. `groupProfile` peut être une archive. IDs UI et IDs stricts Codex restent différents. | C. Conserver type actif et archive ; ne pas déduire groupe de la présence du seul profil. |
| Caractéristiques | Toujours −1..3 côté UI contre −3..3 Codex ; modificateurs séparés | C ; A02 avant C2, aucune modification C1 de valeur. |
| Modificateurs | Pas de changement du modèle ; aucune durée ou portée rendue équivalente par lot 3 | C/R ; archivage sans fusion. |
| Fatigue/capacités | Ressources collectives imbriquées ; capacités calculées ou personnalisées. Fatigue racine reste individuelle/archivée. | C ; A01/A09. Aucune activation de groupe en C1. |
| Importance/profil | Importance de membre Mineur/Majeur ; effective plafonnée Champion avec dépassement numérique ; importance racine distincte | C ; ne pas substituer l'importance effective au profil explicite Codex. |
| Entraînements | Tableau collectif, entraînement racine et savedIndividualTraining coexistent | C ; pas de jointure en chaîne ni choix silencieux d'un seul entraînement. |
| États/statuts | Lists collectives séparées ; stateCapacity n'est pas un catalogue d'états autorisés | C ; A03/A09, pas de conversion count→liste d'états. |
| Principes/équilibre | Principe collectif texte, position nullable ; capacité propre ; pas de centre collectif explicite | C ; A04, jamais split de texte pour fabriquer les deux principes Codex. |
| Livrets/spécificités | Pas de nouveau contrat ni nouveau contrôle des compteurs | C/R ; A05 conservé, aucune réserve levée automatiquement. |
| Manœuvres | Références et moveSources inchangés | C ; ancien diagnostic applicable. |
| Techniques | 10 ordinaires fictives + catalogue séparé de 13 groupes ; noms des 13 concordent avec Codex, IDs différents | C pour métadonnées ; R pour effets officiels. Table explicite proposée en C4, pas un simple préfixe. |
| Histoire/relations | relationshipNotes ajouté au profil ; références structurées et notes anciennes subsistent | C ; A06 : ne pas écraser history/relationships par relationshipNotes. |
| Lieux | Même hiérarchie et liens ; conversion de type conserve domicile/position/associations | C par lecture ; parcours complet à recetter. Les orphelins restent un écart de validateurs. |
| Évolutions/historiques | Graphe v0 corrigé/annulé inchangé ; aucune archive de conversion groupe avec journal daté ajoutée | C ; A07 et A09, ne pas confondre profil archivé et historique de transitions. |
| Combat/instantanés | Codex ne traite pas groupProfile ; addToCombat garde les valeurs racine et n'emporte pas le profil collectif | C par probe ; bloquer ce raccourci, contrat dédié avant C7. |
| Sauvegardes/restauration | AppData et clé démo inchangés ; profil sérialisé dans Character. Pas de migration de version ou journal transactionnel neuf | C ; préserver original, formats Codex v1/v2 toujours seuls canoniques. |
| Descriptions privées | Toujours aucune banque équivalente côté démo | C ; séparation Codex conservée, C4 seulement. |
| Portraits/mobiles | Modifications de groupe ne démontrent pas la levée des réserves précédentes | R ; ne pas annoncer corrigé sans recette correspondante. |

## Impacts sur les adaptateurs préparés

Le prévisualiseur C0 reste valide pour ses trois champs **plats**. Il conserve un bloc
JSON imbriqué inconnu, mais n'interprète ni l'absence/null/vide du container resources,
ni stateCapacity, ni les intentions d'édition collective. Ce n'est pas un adaptateur de
groupe. L'appliquer aux champs racine d'un groupe ferait diagnostiquer les ressources
individuelles au lieu des collectives.

Les ports B restent utilisables pour les sessions canoniques approuvées. Il faut un
contrôle d'éligibilité distinct pour toute future source externe : un groupe reçu ne
peut pas devenir un PNJ actif par le seul fait que l'import conserve des extensions.
Les copies de combat nécessiteront aussi leur contrat de groupe, et pas seulement une
modification des cartes.

Le patch UI utilise parfois undefined pour une suppression explicite ; le transport
C0 exige remove. La traduction doit porter la liste des champs touchés : ni undefined
indifférencié, ni valeurs suggérées ne sont des commandes de sauvegarde.

Les incompatibilités C1/C2/C3/C4/C7 sont détaillées dans [GROUPES_PNJ.md](GROUPES_PNJ.md).
Les dix axes de comparaison historiques de [MATRICE.md](MATRICE.md) restent consultables
pour les parties inchangées, avec cette mise à jour prioritaire des groupes.
