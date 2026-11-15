# C1 exécutable proposé — infrastructure seulement

**Aucune mise en œuvre n'est autorisée par cette mission.** Cette fiche remplace le
périmètre C1 provisoire de [PLAN_C1_C7.md](PLAN_C1_C7.md), sur la référence UI finale
39fd4781, le domaine B 62c523c et la préparation C0 24df462. La validation de ces
références n'autorise pas une intégration, fusion ou mise en production.

## Décisions préalables et objectif mesurable

A01 : conserver la démo dans sa clé/export original, aucun import réel v0 en C1.
A08 : approuver la source unique et son lieu de maintenance ; recommandation workspace
après transfert unique, repli archive verrouillée. A09 : aucun groupe actif ni conversion
individuel/groupe dans le moteur C1. A02–A07 n'affectent pas C1 si leurs traductions
métier sont explicitement exclues.

Objectif : rendre le moteur approuvé consommable par Next, avec une session canonique,
stockage/aperçu/confirmation/exports/restauration fiables et rendu SSR/hydratation stable.
Le succès ne se mesure pas à la présence de fiches de démo converties, ni à un combat
collectif jouable. Les écrans restent ceux de v0 ; aucun shell Vite ne devient le produit.

## Étapes proposées, vérifiables et réversibles

| Étape | Modification minimale à autoriser plus tard | Critère de sortie |
|---|---|---|
| C1.1 Source/package | Transfert contrôlé des seules sources/types/références/tests métier approuvés vers un package workspace, ou archive du repli choisi | Inventaire, empreintes, source unique désignée ; pas de copie UI/HTML/Vite dans le runtime. Pas de package publié. |
| C1.2 Consommation Next | API publique typée et imports depuis le package, dépendance locale/lockfile ; versions outils harmonisées | Build Next local, import SSR sans navigateur ni réseau, aucun code utilisateur partagé entre requêtes. |
| C1.3 Cycle client | Frontière cliente, services par espace, subscribe/getSnapshot + useSyncExternalStore, état d'attente stable | Aucun setItem à l'import, au rendu, au montage ou à l'ouverture d'écran ; nettoyage des abonnements et double montage testés. |
| C1.4 Éligibilité | Contrôle de format et du périmètre approuvé, au chargement et avant tout plan d'import | Format v0 refusé comme campagne ; groupes actifs non approuvés signalés/bloqués, sans suppression du bloc ou application de défauts. |
| C1.5 Gestion | Brancher uniquement les actions nécessaires d'aperçu/import confirmé/export/restauration Codex sur le store unique | Révision/plan contrôlés, quota/refus sans publication du candidat, sauvegardes v1/v2 enrichies et extensions conservées. |
| C1.6 Recette | Tests du package réellement consommé et du parcours Gestion ; inventaire du non-raccordé visible | CI et essais aux quatre résolutions, preuve de restauration et retour de code ; pas de déclaration abusive de prise en charge de C2–C7. |

Aucune de ces étapes n'est exécutée dans la présente branche documentaire.

## Points de raccordement, référence finale

| Point UI | Rôle actuel confirmé | Futur changement limité |
|---|---|---|
| `components/companion-app.tsx`, useState des données et effets de chargement | AppData de démo, navigation, lecture locale et commit de démonstration | Introduire une sélection explicite de source exclusive ; ne pas remplacer un Character[] démo par un cast de la bibliothèque Codex. |
| `commitDemoData`, `updateCharacter`, `saveNpcEdit`, créations | Validation et persistance de démo avant publication React | Aucune redirection globale vers CharacterService en C1 : formes différentes et groupes non approuvés. Ces handlers ne doivent pas écrire la session canonique. |
| `exportDemo`, `importDemo`, `applyImport` et Gestion | Export/import de démonstration et aperçu propre à ce format | Séparer les libellés et parcours Codex ; ne pas envoyer les sauvegardes Codex dans normalizeHistoricalNulls/validateDemoData. |
| `lib/demo-storage.ts` | Lecture protégée/écriture démo dans sa clé historique | Garder le fichier et la clé intacts pour les données existantes ; ne pas en faire un second repository de campagne. |
| `lib/npc-edit.ts` et `lib/npc-groups.ts` | Patches explicites, calculs/formulaires de groupes de la démo | Restent non raccordés au moteur canonique en C1. Pas de deuxième calcul de groupe ajouté. |
| `components/character-detail-redesign.tsx`, cartes, formulaire PNJ et éditeurs PJ | Distinguent désormais collectif/individuel avec props de démo | Pas de mutation ni traduction métier C1 ; marquer le périmètre non raccordé plutôt qu'afficher une simulation comme fonctionnalité Codex. |
| `app/page.tsx`, `app/layout.tsx` | Entrée Next et layout ; Analytics en production | Encadrement client/SSR à définir ; pas de changement de navigation ou de configuration Vercel. Qualifier les appels externes avant de promettre un usage privé/hors ligne complet. |

## Une seule source de vérité par espace affiché

Proposition à valider avec A01 : deux **modes exclusifs dans la même application**,
pas deux applications, pas deux stores pour la même campagne.

- Mode de démonstration historique : fonctionnement existant et clé
  `avatar-legendes-compagnon-demo-v1`. Le moteur canonique n'y est pas initialisé comme
  deuxième autorité. Les nouvelles données ne sont jamais transférées automatiquement.
- Mode métier explicite : seule la session du store Codex fait autorité. Le state React
  ne contient que filtres, brouillons/fenêtres ou référence de services, pas une copie
  AppData modifiable de la même campagne. Les handlers de démonstration sont inactifs
  dans ce mode ; seuls Gestion et éléments réellement raccordés sont opérationnels.
- Changer de mode ne migre ni ne fusionne les données. Fermer proprement l'instance et
  ses abonnements avant activation de l'autre source. Confirmer l'abandon des brouillons
  si nécessaire. Une archive démo est une source externe, pas une campagne concurrente.

Si ce fonctionnement exclusif est refusé par le propriétaire, ajuster le périmètre
avant C1 ; ne pas bricoler une synchronisation automatique entre deux stores. Un simple
state React recopié depuis getSnapshot puis persisté par un effet est précisément exclu.

## Contrats de stockage et de préparation

| Port / frontière | Contrat conservé ou proposé |
|---|---|
| Repository B | load sans écriture ; save(session, expectedToken, revision), une seule valeur atomique bibliothèque+combat ; validation avant sauvegarde. |
| Store B | getSnapshot stable/gelé, subscribe, execute synchrone, prepareImport/commitImport liés à instance/révision, checkExternal, export explicite. Ne pas extraire une méthode dépendant de this sans la lier. |
| Clé canonique | Espace explicite déjà autorisé par B : avatar-compagnon-react-session-v1. Aucun accès automatique aux anciennes clés Codex ni remplacement de la clé démo. |
| Session/enveloppes | Versions de bibliothèque/backup 1 et 2, session locale v1, combat brut/privé selon codecs ; métadonnées et extensions compatibles conservées. Ne pas changer le format pour simplifier l'affichage. |
| Entrée externe v0 | Fichier et état d'origine conservés ; inspection/diagnostic possible en lecture seule, pas de création de fiche canonique ou d'archive active en C1. |
| Présence et intention | Absent/null/valeur restent distincts ; zéro est présent ; keep/set/remove explicites. Le helper C0 reste un aperçu plat, pas un adaptateur collectif. |
| Données inconnues | JSON sûr compatible conservé ; objets exécutables/pollution de prototype/IDs dangereux refusés sans réécriture de l'original. |
| Groupe non approuvé | Une extension groupProfile n'autorise aucun comportement. Contexte actif explicite et chemins connus contrôlés avant activation/restauration ; pas de recherche approximative du mot groupe dans tout JSON. |
| Descriptions privées | Repository et clé/export privés séparés. Aucun texte dans campagne, rapports publics, logs, paquet ou captures de recette. Pas de raccordement C4 anticipé. |

**Attention aux formats Codex enrichis de champs externes :** vérifier seulement le nom
avatar-compagnon-backup ne suffit pas. B peut conserver un npcType=group comme extension
sur un PNJ valide sans le prendre en charge. Le contrôle C1 doit bloquer son activation,
y compris des combattants/instantanés dont la restauration activerait un groupe non
approuvé. Ne pas supprimer cette extension ni convertir le collectif en individu.
Une archive groupProfile sur npcType=individual ne doit pas être activée par sa seule
présence. Définir et tester les marqueurs/chemins pris en charge ; les autres extensions
ne sont pas interprétées.

Choix conservateur proposé : refuser la transaction d'un fichier complet non éligible,
avec raisons et original intact ; ne pas importer automatiquement « tout sauf les
groupes ». Cela évite une perte cachée des relations et instantanés. L'option de reprise
partielle serait une fonction distincte à concevoir et faire approuver.

## SSR et hydratation

Les modules du cœur restent importables sans window/document/navigator/localStorage.
Aucune instance de session utilisateur au niveau d'un module serveur. Catalogue immuable
partageable ; données de campagne privées par instance cliente.

Le serveur et le premier rendu client utilisent le même snapshot immuable d'attente,
jamais une fiche de démo ou un état vide présenté comme chargé. Après hydratation, créer
explicitement les services avec storage et Web Locks injectés. useSyncExternalStore
consomme leurs snapshots stables ; pas de nouvelle copie métier dans useState ni auto-save.

Si lecture refusée, corrompue ou périmètre non approuvé : état bloqué visible et stockage
original intact. Ne pas écrire le fallback vide. Prévoir conservation/export du fichier
ou contenu brut d'origine accessible, sans le présenter comme un export Codex validé.
Les décisions utilisateur précèdent la transaction synchrone ; aucun await de fenêtre
ouverte à l'intérieur d'execute. Un échec garde le brouillon et n'annonce pas enregistré.

Les événements storage/retour au premier plan appellent checkExternal : avertir et
bloquer plutôt qu'écraser/recharger silencieusement. Sans Web Locks, annoncer la limite
de concurrence optimiste existante, pas une garantie d'exclusion entre toutes fenêtres.

## Préservation des données de démonstration et restauration

- Avant un essai : conserver l'export de démo et, si disponible, une copie exacte de la
  valeur locale d'origine. Ne pas faire passer un export Codex par l'exporteur de démo.
- La clé démo ne change pas ; une première visite sans session Codex n'aspire pas les
  personnages/groupes existants et n'écrit pas de defaults métier.
- Préserver les absences/null/{} et extensions de groupe dans l'original. Les fonctions
  de normalisation de démo ne sont pas la normalisation de données canoniques.
- Tester la conservation aussi si la démo est illisible ou invalide : pas de réinitialisation
  automatique. Aucune opération du mode canonique ne répare la démo en place.
- Les origines navigateur comptent : preview Vercel, production, HTTP local et file ne
  partagent pas nécessairement le stockage. Prévoir export/import manuel explicite ; ne
  pas prétendre récupérer un fichier local depuis le serveur Next.

## Ce qui reste hors C1

| Phase ultérieure | Travail non autorisé dans C1 limité |
|---|---|
| C2 | Raccord de cartes/fiches et édition métier, base/modificateurs, états/statuts, profils et équilibre ; contrat actif de groupe à autoriser séparément. |
| C3 | Conversion de relations structurées/provisoires, lieux et notes collectives, résolution d'orphelins et liens PJ. |
| C4 | Catalogue 111/9, trois maîtrises individuelles dans les composants, correspondance des 13 références et banque privée raccordée. |
| C5 | Effets/compteurs de Livrets, manœuvres et préparation d'accès validés. |
| C6 | Historique commun, corrections/annulations/dépendances et éventuels effets réglementaires autorisés. |
| C7 | Combat collectif ou individuel complet dans v0, décisions, snapshots, undo, copie/report de ressources et préservation du contexte de groupe. |

## Tests d'acceptation avant livraison C1

1. Package réellement consommé : provenance et empreintes, version/lockfile exacts,
   types, build Next local, SSR sans globals navigateur ni requête réseau à l'import.
2. Montage/hydratation : snapshot d'attente identique, double montage sans écriture,
   une seule autorité active par mode ; aucun faux personnage par défaut.
3. Stockage : une transaction, quota/refus/conflit/double clic/plan périmé, pas d'export
   d'un état vide de secours ; restauration explicite depuis un export connu.
4. Sécurité : IDs piégés, prototypes, getters et versions inconnues ; compte rendu public
   refusé ; original conservé lors de chaque refus.
5. Formats : v1/v2 historiques et enrichis, portraits, lieux/relations, événements inconnus,
   champs supplémentaires et snapshots ; aucun changement après export/réimport hors
   normalisations historiques déjà documentées.
6. Verrou de groupes : AppData v0 refusé comme campagne ; Codex contenant un groupe actif
   non approuvé bloqué, archives non activées ; aucune ressource racine/collective copiée
   vers l'autre ni défaut 0/5 ou recommandation persistée.
7. Démo : valeur originale identique avant/après initialisation, lecture, import Codex,
   échec et retour au mode démo ; groupe.resources absent/null/{}/renseigné conservé.
8. Gestion : clavier/focus et 1440×1024, 1280×800, 768×1024, 390×844 ; vérification sur
   vrai mobile reste une recette distincte si elle n'a pas été exécutée.
9. Hors réseau : services et exports/restauration utilisables après chargement ; distinguer
   cela du démarrage Next hors ligne à froid, qui nécessite sa propre qualification.
10. Conserver les suites métier historiques, B/C0, parité et tests groupe UI. Aucun test
    qui valide une formule proposée ne devient preuve réglementaire sans lecture du PDF.

## Retour arrière et conditions de démarrage

C1 sur branche séparée, sans fusion ni déploiement automatique. Conserver commit UI
39fd4781 et version moteur d'origine pour le retour de code. Avant premier push dans
le dépôt UI, vérifier si une preview Vercel se déclenche : obtenir l'accord pour ce
comportement ou le mécanisme existant permettant de l'éviter, sans modifier Vercel
unilatéralement. Un accord de développement n'est pas une autorisation de production.

Retour de code par commit de réversion, pas réécriture d'historique. La démo originale
reste dans sa clé ; ne jamais remplacer cette clé par le contenu d'une session nouvelle.
Conserver les exports canoniques et privés avant chaque essai. Un rollback ne supprime
pas les données neuves et ne prétend pas les rendre compréhensibles par l'ancien UI.
Restaurer uniquement après comparaison et confirmation, sans migration cachée.

**Pour autoriser C1 : approuver A01/A08/A09, la source unique et les modes exclusifs,
puis donner une autorisation distincte pour les étapes C1.1–C1.6.** Tous ces points
restent des propositions ; aucun fichier de l'application UI n'a été modifié ici.
