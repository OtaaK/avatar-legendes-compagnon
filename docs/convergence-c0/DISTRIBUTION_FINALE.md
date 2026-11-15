# Distribution du moteur — choix privilégié après les lots 1–3

Cette recommandation actualise [PARTAGE_MOTEUR.md](PARTAGE_MOTEUR.md). Aucun paquet,
workspace, copie de source dans v0, publication ou configuration Vercel n'est créé ici.
La décision A08 et l'autorisation C1 sont nécessaires avant toute mise en œuvre.

## Comparaison concrète

| Critère | Package privé dans un registre | Archive .tgz versionnée + intégrité | Package workspace après transfert unique |
|---|---|---|---|
| Source active | Dépôt métier Codex | Dépôt métier Codex | Dépôt React, package interne distinct des composants |
| Deux dépôts | Version du paquet coordonnée avec UI ; Codex reste source | Génération de l'archive depuis un SHA ; UI consomme un artefact non éditable | Ancien moteur conservé en référence ; nouvelles corrections uniquement dans le workspace |
| GitHub | Release/version et droits de registre à gérer | SHA source, manifeste et SHA-256 ; archive commise dans le dépôt consommateur ou canal d'accès approuvé | Un commit de transfert traçable depuis B/C0, puis commits atomiques moteur/adaptateur/test |
| Vercel | Accès au registre pendant build, secret/token et permissions de previews à vérifier | Archive disponible dans le dépôt de build ; aucun téléchargement de branche mouvante | Pas de registre privé supplémentaire ; vérifier résolution du workspace et build Next local avant accord de déploiement |
| Permissions | Publication et lecture distinctes, cycle de vie de secrets, coûts/quotas à vérifier | Accès aux deux dépôts pendant préparation ; pas de secret de registre si archive locale au build | Permissions du dépôt UI pour les futurs travaux Codex ; aucune nouvelle publication |
| Reproductibilité | Version exacte, lockfile et intégrité ; archive identifiée par SHA source | Nom/version/SHA source/hash de contenu et lockfile, générateur déterministe testé | Commit Git + lockfile + API/package versionnés ; provenance initiale conservée |
| Maintenance | Adapté à plusieurs consommateurs ; plus d'infrastructure que nécessaire pour un seul produit | Simple en repli, mais génération et renouvellement de l'archive restent une étape | Plus simple pour le produit unique, sous réserve d'une responsabilité de maintenance clairement transférée |
| Divergence | Faible si jamais de modification de la dépendance installée | Faible si artefact généré non éditable ; élevé si on modifie une copie décompressée | Faible seulement si l'ancienne source n'est plus modifiée pour les fonctions transférées |
| Hors ligne utilisateur | Oui si tout est embarqué, pas de registre en jeu | Oui si tout est embarqué | Oui pour le moteur local ; démarrage de l'application Next à froid à qualifier séparément |
| Rollback | Version antérieure verrouillée + export avant changement | Archive précédente + export | Commit/version du package antérieurs + export ; pas de rétrogradation automatique des données |

## Option privilégiée : package workspace, transfert unique

Le produit cible est désormais un seul dépôt Next. Les trois lots d'interface sont
figés et le même propriétaire coordonne v0 et Codex. Un package interne versionné dans
ce dépôt évite d'ajouter un registre, un circuit de publication et de nouveaux secrets
pour un unique consommateur. Il reste un package métier avec une API propre, **pas du
code de règles dispersé dans les composants**.

Exemple de destination à confirmer en C1 : `packages/companion-core/`, contenant les
modules de domaine/application/persistance/références et types, avec les chemins relatifs
préservés. Source de transfert : les SHAs B/C0 validés, jamais le main historique simplifié.
Le package reste privé/non publiable. Sa version interne est indépendante de V2.33 et
indépendante des formats de sauvegarde v1/v2.

Le transfert doit inclure les tests utiles et leurs fixtures/provenances, ou un mécanisme
CI reproductible récupérant l'oracle figé. L'HTML oracle est une référence de test, pas
une application à monter ou un shell à copier dans Next. Ni Vite, ni composants du
prototype Codex, ni PDF/texte privé ou sauvegarde réelle ne font partie du runtime.

Après acceptation du transfert, le moteur historique reste consultable et toutes les
branches/PR sont conservées. Les nouvelles corrections du métier transféré se font
**seulement dans le package du dépôt UI**. Aucun aller-retour de copies éditables. Les
travaux v0 utilisent l'API/export public sans modifier les règles dans leurs composants.
Cela constitue un changement de responsabilité à faire approuver, pas un nettoyage.

Pour les groupes non encore approuvés, le helper UI actuel n'est ni dupliqué ni promu
automatiquement dans le moteur pendant C1. Après validation du contrat, un seul calcul
fera autorité ; l'UI consommera ses résultats au lieu de conserver une deuxième formule.

## Repli : archive versionnée, source unique Codex

Si le propriétaire veut garder le moteur actif dans le dépôt Codex, préférer une archive
métier générée depuis un commit exact et installée comme dépendance locale verrouillée
dans UI. Le paquet doit exclure la racine Vite et ne contenir que les exports métier et
types nécessaires. Garder manifeste, SHA source, version et SHA-256, avec test comparant
le contenu installé à l'artefact attendu. L'archive est un résultat de build, pas une
copie à retoucher dans React. Toute correction repart de la source Codex.

Une archive commise dans le dépôt UI évite de dépendre au build d'un lien de téléchargement
expirant ou d'un secret de registre. Elle augmente la taille du dépôt et impose une étape
de mise à jour ; mesurer sa taille réelle lors de la préparation du paquet. Aucun volume,
coût ou délai non mesuré n'est garanti ici.

Le registre privé reste réalisable si plusieurs consommateurs apparaissent ou si le
propriétaire dispose déjà d'un processus adapté. Il n'est pas l'option privilégiée pour
ce projet à consommateur unique. Une URL GitHub vers la racine du dépôt actuel n'est pas
un substitut au conditionnement métier : elle apporte aussi le contexte du prototype.

## Preuves nécessaires dans le futur C1

- API typée, imports ESM/JSON et déclarations de types consommés par Next ; aucun accès
  au navigateur à l'import, pas de dépendance React ou PDF navigateur dans le cœur SSR.
- Contrôles sécurité, v1/v2 enrichis, extensions et descriptions séparées, parité et
  types ; tests sur le package réellement consommé, pas seulement sur les sources.
- Build Next local reproductible depuis le lockfile ; version de Node/pnpm harmonisée
  avec le packageManager déclaré (pnpm 12.3.4), sans supposer l'outil déjà présent en CI.
- Inventaire exact et empreintes des fichiers transférés, provenance B/C0 et test de
  non-divergence. Pas de mise à jour de branche distante flottante à l'installation.
- Droits et contenu du package vérifiés avant toute diffusion. Aucun secret ni texte
  commercial ajouté ; les données privées utilisateur ne font jamais partie du paquet.
- Vérification de la configuration de build en lecture seule puis proposition si une
  adaptation Vercel devient nécessaire ; aucune modification de plateforme sans accord.

Le choix de canal n'assure pas à lui seul le démarrage Next hors ligne : cache des
assets, mises à jour, origine du stockage et appels réseau doivent être qualifiés à part.
La présente mission n'exécute ni ce build consommateur, ni publication, ni déploiement.
