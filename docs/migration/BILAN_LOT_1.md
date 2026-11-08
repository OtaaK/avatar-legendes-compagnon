# Bilan du lot 1 — fondations React et navigation v0

**Statut : réalisé pour revue, validation propriétaire en attente.** Aucun lot 2 commencé,
aucun déploiement ni fusion. Références approuvées : métier `a9079fa` (PR 3–10 incluses),
v0 corrigé `8b8924d`. Branche `convergence/react-v0`, issue de la préparation PR nº 11.

## Ce qui est livré

- React/TypeScript/Vite dans le dépôt principal, avec six rubriques, groupes, icônes,
  barre latérale, barre mobile, fil d'Ariane et accueil issus de la composition v0.
- Styles v0 conservés dans un fichier figé ; adaptations d'accessibilité et tailles
  explicatives séparées. Provenance et limites dans `V0_PROVENANCE.json`.
- **11 modules JavaScript extraits**, dont le moteur de combat complet existant,
  ressources, fiches, lieux, livrets, catalogue, validations et export public. Les corps
  restent ceux de l'oracle ; seuls les imports/exports changent.
- Contrats TypeScript, store externe React avec snapshots stables, préparation d'import
  sans écriture, validation avant transaction et publication après sauvegarde.
- Codecs Codex et repository injecté : aucune dépendance au DOM dans le domaine,
  aucune écriture au montage, aucune utilisation du format fictif v0.
- Laboratoire Gestion : note de test isolée, export local et aperçu JSON en lecture seule.
  Il démontre les frontières techniques sans remplacer les écrans métier.
- Matrice fonctionnelle, inventaire technique, CI et guide de test sans commande.

**Les cartes, fiches, lieux, livrets et combats ne sont pas encore raccordés à React.**
Leurs rubriques affichent explicitement le lot prévu. Le HTML opérationnel est inchangé.
Le port de décisions MJ est défini mais le collecteur de formulaires/confirmations reste
à adapter au lot combat ; aucune interaction simplifiée ne le remplace.

## Fidélité visuelle et navigation

L'ordre et les groupes v0 sont conservés : Accueil, Personnages, Lieux, Combats, Techniques,
Gestion. À 768 px la barre devient une colonne d'icônes ; à 390 px une barre inférieure,
comme v0. Les boutons masqués visuellement gardent un nom accessible et une infobulle.
Le routage conserve les URL hash, précédent/suivant et la restauration après rechargement.

Les titres fictifs de campagne, horaire et personnes ont été neutralisés. L'accueil
n'affiche pas des personnages de démonstration comme des données réelles ; les commandes
Gestion servent uniquement au test isolé. Ce sont les différences intentionnelles de contenu.
La recette visuelle exhaustive des fiches attend les lots suivants : ce bilan ne prétend
pas valider des composants qui ne sont pas encore repris.

## Vérifications et portée

| Contrôle | Résultat / portée |
|---|---|
| Régressions historiques avant travaux | 243/243, dont 198 scripts JS et 45 navigateur |
| Régressions historiques après travaux | 243/243 ; même limite file:// préexistante |
| Fidélité d'extraction | 11 modules contrôlés par bornes et empreintes ; HTML original inchangé |
| Réexécution JS vers modules extraits | 198/198 scripts passent ; **171 appellent réellement les API extraites, 8 111 appels publics** |
| Autres scripts de cette réexécution | 27 contrôlent surtout sources/HTML ou des chemins non redirigés ; ne prouvent pas à eux seuls la parité React |
| Nouveaux tests de contrats/parité/frontières | 21/21 : stockage, formats, erreurs, trace différentielle, catalogue/API et séparation |
| TypeScript + build de production | Réussis ; un seul `index.html`, environ 475 ko |
| 1440×1024 et 1280×800 | Six rubriques, URL/retour, clavier, fenêtres, fichiers et persistance passent |
| 768×1024 et 390×844 | Mêmes contrôles + navigation tactile ; pas de débordement horizontal observé |
| Fenêtres | Tab/Maj+Tab, Échap, inert, retour au bouton aide et au bouton d'examen testés |
| Deux vrais onglets | Événement de stockage détecté ; brouillon conservé, enregistrement bloqué |
| Quota/accès refusé | Erreur visible ; brouillon conservé ; nouvelle tentative après rétablissement réussie |
| Réseau externe | Aucune requête externe pendant les parcours du shell |

La trace différentielle compare état, résultats et erreurs sur personnages, livret,
profil légendaire, lieux/renommage, engagement, armure, refus de coût, impact réactif,
annulation, journal, export public et report vers fiche. Les scripts historiques redirigés
couvrent aussi les techniques avancées, protections, coûts, pièges, durées et scènes.
Cela vérifie le comportement existant ; aucune nouvelle lecture réglementaire n'est revendiquée.

## Sauvegardes et récupération

Les tests couvrent bibliothèque v1/v2, combat brut/enveloppe privée v2, sauvegarde complète
v1/v2 et refus des exports publics ou de démonstration. Ils vérifient champs inconnus,
caractéristiques négatives, noms anciens, profils PNJ 0/3/5/10/15, liens absents/null/orphelins,
historiques/snapshots et une charge fictive de plus de 7 Mo avec données de portraits.
Ce test mesure conservation et sérialisation, pas le rendu/décodage de véritables portraits.

Une erreur d'import, de validation ou de quota ne publie pas le brouillon et ne remplace
pas le précédent état. Un plan périmé ou un double clic est refusé. Une lecture corrompue
bloque les écritures et refuse un faux export vide de récupération.

Le couple bibliothèque/combat est écrit en une seule enveloppe interne :
`avatar-compagnon-react-session-v1`. L'interface du lot 1 ne l'utilise pas ; elle écrit
seulement sa note dans `avatar-compagnon-react-lab-v1`. Les anciennes clés Codex, le journal
d'import interrompu et la clé de démo v0 ne sont ni lus ni modifiés par ce runtime.
Aucun ancien journal n'est automatiquement réparé par React.

Web Locks sérialise les écritures quand disponible ; sinon la détection est optimiste.
**Deux écritures exactement simultanées ne sont pas garanties sans Web Locks**. Une fenêtre
éditrice reste recommandée ; pas de fusion automatique. La conservation des champs inconnus
suit les normalisations historiques, y compris la mise à jour de version et des métadonnées
d'export connues. Les métadonnées d'enveloppe de combat sont conservées pour son réexport privé.

## Preuve hors ligne : démontré et restant à qualifier

**Démontré :** build unique avec React, CSS et icônes embarqués, sans analytics ni police
distante. Avec un contexte navigateur froid, réseau désactivé et document fourni par un
transport de test : démarrage, navigation, stockage/rechargement, téléchargement JSON,
lecture d'un fichier local et annulation passent, sans chargement de sous-ressource.

**Non démontré dans le cloud :** le navigateur refuse la navigation native `file://` avec
`ERR_BLOCKED_BY_ADMINISTRATOR`. Aucun assouplissement de cette politique n'a été effectué.
Le test du document embarqué ne certifie donc pas le double-clic natif.

**Essai réel requis sur Mac :** ouvrir le fichier téléchargé avec Chrome, puis Wi-Fi coupé,
fermer/rouvrir, contrôler note, export et lecture locale ; Safari si souhaité. La portée de
localStorage et la disponibilité de Web Locks en file:// peuvent varier selon le navigateur
et le chemin du fichier. Pas d'installation d'outils pour l'utilisateur final.

## Réversibilité et fichiers

L'ancien HTML, son catalogue CSV, les tests et les versions historiques sont conservés.
Aucun fichier applicatif historique déplacé ou supprimé. Ajouts sous `apps`, `packages`,
`tests/convergence`, `tests/parity`, `scripts/convergence` et `docs/migration` ; mises à jour
README, ROADMAP, architecture, décisions, AGENTS et CI. `dist`, caches et captures générées
restent ignorés ; la CI fournit des artefacts téléchargeables sans hébergement.

Retour immédiat : ouvrir l'ancien `app/simulateur.html`, sans migration inverse nécessaire.
Les commits de ce lot restent isolés et peuvent être annulés sans toucher au métier historique.
La PR est dépendante de la branche de préparation ; elle ne fusionne pas les PR antérieures.

## Validation attendue avant lot 2

Suivre [TESTER_LOT_1.md](TESTER_LOT_1.md), confirmer fidélité du shell/navigation et résultat
du fichier local sur Mac. Les réserves PJ/onglets et écrans métier restent suivies dans
[MATRICE_FONCTIONNELLE.md](MATRICE_FONCTIONNELLE.md).

Après accord explicite seulement : lot 2 Personnages, fatigue, équilibre et états.
Aucune fusion dans main ni aucun déploiement n'est autorisé par la validation du présent lot.

## Reproduction développeur

```bash
npm ci --ignore-scripts
npm run test:extraction
npm run test:inventory
npm run test:contracts
npm run test:parity
npm run build
npm run test:react
python scripts/test.py --jobs 2 --report work/lot1-after.json
```

Node ≥ 22.12 ; dépendances navigateur dans `requirements-dev.txt`, Chromium via Playwright
ou `CHROMIUM_PATH`. Rapports locaux : `work/parity/results.json`, `work/lot1-browser/results.json`
et captures des quatre tailles. Les assertions historiques restent inchangées ; le préchargeur
de parité redirige les API après chargement du contexte VM, et la trace différentielle compare
séparément les résultats obtenus avec l'oracle et les modules.
