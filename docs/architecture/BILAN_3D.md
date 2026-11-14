# Bilan 3D — Commandes, affichage et démarrage

14 novembre 2026 — `architecture/commandes-affichage`, base
`ae4c86a94335c11e2f4b79a708d03990939572c5` (PR 22, encore non fusionnée).
Alex demande « Continue » : étape sur branche dépendante, sans fusion implicite.

## Changements

| Fichier | Rôle |
|---|---|
| `src/commands/mutation.js` | Transaction synchrone sans DOM, état et stockage injectés |
| `src/commands/index.cjs` | Entrée Node, absente du HTML |
| `src/interface/commands.js` | Ponts historiques bibliothèque/combat et sauvegarde |
| `src/persistence/preferences.js` | Lecture/écriture/retrait des préférences, refus silencieux |
| `src/interface/preferences.js` | Accès tardif au stockage du navigateur |
| `src/interface/exports.js` | Fonctions d’import des fiches et exports existantes |
| `src/interface/startup-state.js` | Reprise du journal, chargement et façade de rendu |
| `src/interface/combat-command-bindings.js` | Liste/protection des commandes existantes |
| `src/interface/events.js` | Dispatcher à liste fixe et données inertes |
| `src/interface/bootstrap.js` | Installation des listeners, premier affichage et navigation |

Les deux anciens fragments d’interface restent présents et contiennent les fonctions
d’écran existantes. Quatre blocs déplacés restent strictement identiques à la base ;
les empreintes figurent dans `EXTRACTION_3D.json`. L’ordre relatif des listeners est
conservé, leurs inscriptions sont regroupées au démarrage. Le manifeste rend les
étapes explicites ; aucune dépendance ou framework n’est ajouté.

Les commandes gardent les comportements distincts : la bibliothèque sauvegarde même
sans changement ; le combat sauvegarde seulement si son état change et les commandes
imbriquées partagent la transaction externe. Une erreur restaure l’état antérieur ;
le combat est ensuite redessiné. Aucun rendu n’écrit de sauvegarde métier. Les
préférences peuvent être écrites lors du rendu comme auparavant ; leurs refus restent
silencieux et ne bloquent pas la navigation.

Moteur, modèles, catalogue, validation, service de stockage 3C, styles et balisage sont
inchangés. Les copies de combat, confirmations, annulations et exports existants restent
en place. Aucun PDF ni texte officiel nouveau, aucune règle ou donnée de sauvegarde
transformée. Le HTML autonome généré mesure 446 142 octets (+866), SHA-256
`41a5e5fe1a226bb5c621c753411e70ef3145d2dfbee61e9d613a9b267622609e`.

## Vérifications exécutées

| Contrôle | Avant | Après |
|---|---:|---:|
| Scripts JS | 196/196 | 197/197 |
| Scripts Chromium | 39/39 | 40/40 |
| Total | 235/235 | 237/237 |
| Échecs | 0 | 0 |

- Nouveau test JS : 16 scénarios de ports, mutations, retours, restauration, commandes
  imbriquées, isolation, reprise après refus et préférences indisponibles.
- Nouveau parcours Chromium : 390×844, 768×1024, 1280×900, 1920×1080. Navigation et
  cartes au clavier, annulation d’invite et fenêtre, copie de combat indépendante,
  historique, rendu sans sauvegarde métier, rechargement et interactions hors réseau.
  Refus du stockage des préférences testé séparément.
- 36 comparaisons exactes avec le code Git de la base : états, valeurs de retour,
  erreurs, écritures et rendus, y compris commandes imbriquées et commande suivante
  après un refus. Commande : `node scripts/architecture/compare-commands.cjs`.
- 16 comparaisons visuelles (quatre rubriques × quatre tailles). Le premier contrôle
  strict des PNG peut différer de quelques pixels de bordure antialiasée : le contrôle
  retenu accepte au plus 1/255 par composante, sur au plus 0,1 % des pixels (plancher
  100 pixels). Il n’accepte aucun déplacement ou écart supérieur à cette tolérance.
  Commande : `python scripts/architecture/compare-visual.py`.
- Contrôle de génération et 80 entrées contractuelles, 111 identifiants de techniques,
  dix Livrets conservés. Référence historique non réécrite.

Les quatre tests historiques de transactions reçoivent le service extrait dans leur
préparation : leurs lignes d’assertion sont identiques à la base. Les 192 autres
scripts JS existants et les 39 scripts navigateur existants sont inchangés. Aucun test
supprimé, déplacé, ignoré ou désactivé. Les comparateurs ponctuels exigent l’historique
Git local ; la CI superficielle exécute les suites ordinaires sans cette exigence.

## Défaut préexistant et limites

**Onglet de combat au rechargement :** le premier rendu réécrit la préférence avec
`fighters` avant sa relecture. L’onglet principal reste correctement restauré, mais
le sous-onglet combat revient à Combattants. Reproduit dans Chromium sur la base
`ae4c86a` et sur 3D, avec `round` stocké au départ. Le nouveau parcours le documente
explicitement. Corriger ce comportement relève d’un correctif fonctionnel distinct ;
il n’est pas modifié silencieusement dans cette maintenance.

La politique cloud bloque `file://`. L’interaction hors réseau après chargement HTTP
local est contrôlée ; le double-clic sur Mac n’est pas exécuté ici. Aucun nouveau
contrôle de conformité exhaustive aux règles n’est revendiqué.

Les gestionnaires d’écran restent des adaptateurs DOM historiques ; les isoler des
commandes ne les transforme pas en composants purs. Le service de commandes est
synchrone et ses ports sont de confiance. Aucun verrouillage multi-onglets, commande
asynchrone, transaction atomique bibliothèque/combat ou automatisme de synchronisation
n’est ajouté. Les tests historiques par repères HTML restent à migrer en 3E.

## Recette et retour arrière

L’application s’ouvre toujours avec `app/simulateur.html`, sans installation ni serveur
requis à l’usage. La nouvelle organisation est dans `SOURCES_ET_BUILD.md`.

Cette PR dépend de la PR 22 : examiner et intégrer 3C puis 3D seulement après accords
explicites ; ne pas fusionner 3D vers main en contournant cette revue. Aucun déploiement,
suppression d’ancien fichier ou migration de données. Avant intégration, revenir à la
branche 3C restitue la version précédente ; après intégration autorisée, un commit
inverse retire l’étape sans réécrire l’historique ni convertir les sauvegardes.

La prochaine étape proposée est 3E : migration progressive des tests vers les imports,
avec conservation de chaque assertion. La refonte UI reste en attente de la mission 3.
