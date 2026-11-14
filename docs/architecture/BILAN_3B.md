# Bilan 3B — Sources et HTML autonome

14 novembre 2026 — branche `architecture/sources-html-autonome`, base `3059eff`.

## Changements

Le code et les données existants sont extraits dans `src/`, sans changement de logique,
d’ordre des déclarations ni d’exports. `src/assembly.json` décrit leur assemblage.
Le générateur Node.js, sans dépendance supplémentaire, produit toujours un unique
`app/simulateur.html` autonome. Le contrôle `--check`, également exécuté en CI,
refuse une divergence sans réécrire le fichier. Une génération explicite vérifie les
sources avant de remplacer atomiquement le résultat.

Le HTML reste identique octet pour octet à la base : 444 207 octets, SHA-256
`e9dfff872790584aabcfc282766c63764323644adf8ae22059a8c0f36a3bd468`.
Les 12 plages extraites sont documentées dans `EXTRACTION_3B.json` ; leurs empreintes
ont été comparées au script original. Aucun texte officiel nouveau n’est ajouté.

Une entrée Node explicite `src/domain/index.cjs` permet de tester le domaine depuis
les sources sans lire le HTML. Les fragments restent des scripts classiques partageant
des variables globales ; cette étape ne constitue pas leur conversion en modules natifs.
La séparation sémantique de la persistance et de l’affichage reste à réaliser en 3C/3D.

## Vérifications exécutées

| Contrôle | Avant | Après |
|---|---:|---:|
| Scripts JavaScript | 193 réussis | 195 réussis |
| Scripts navigateur Chromium | 39 réussis | 39 réussis |
| Total | 232/232 | 234/234 |
| Échecs | 0 | 0 |

Les deux nouveaux scripts couvrent 27 scénarios : 21 pour la génération et ses refus,
6 pour la parité du domaine et les erreurs de stockage. Les 193 scripts JavaScript
existants sont identiques à la base ; aucune assertion historique n’est supprimée.
Un contrôle de parité sources/HTML est ajouté au parcours navigateur existant,
exécuté en 1280×900 et 390×844. Les contrats couvrent notamment 80 entrées,
111 identifiants de techniques, 10 Livrets et les clés de stockage existantes.

Les contrôles du générateur incluent les sources invalides, l’absence de sortie,
les divergences, la génération déterministe, les chemins interdits et la préservation
du HTML précédent lors d’un refus. Le domaine est aussi chargé sans HTML ni interface.
Le catalogue, la matrice, le HTML et les tests JavaScript historiques ont été comparés
à la base Git ; ils restent inchangés.

**Limite :** la politique du navigateur cloud bloque `file://`. L’utilisation hors réseau
après chargement HTTP local a été contrôlée ; l’ouverture par double-clic sur Mac
n’a pas été exécutée ici. Aucun contrôle de conformité supplémentaire aux règles
n’est revendiqué, et aucun changement de sauvegarde ou règle n’a été effectué.

## Utilisation et retour arrière

Voir [Sources et génération](SOURCES_ET_BUILD.md) pour les points d’édition et commandes.
L’utilisateur ouvre toujours le même HTML ; Node n’est nécessaire qu’au développement.
Le risque principal est d’éditer le HTML généré au lieu des sources : la CI détecte cet
écart. Les sources et le HTML sont conservés ensemble intentionnellement.

Aucun fichier ancien ni test n’est supprimé ; aucun déploiement n’est réalisé.
Avant fusion, revenir à `main` suffit pour retrouver la version antérieure. Après une
éventuelle fusion autorisée, un commit inverse permettrait de retirer cette étape sans
réécriture d’historique. Les données de navigateur ne sont pas migrées.

La PR est à examiner avant toute fusion. L’étape suivante proposée est 3C,
consacrée au découplage de la persistance, sur une autre branche et une autre PR.
