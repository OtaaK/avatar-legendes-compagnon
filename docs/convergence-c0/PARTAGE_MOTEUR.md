# Partage et versionnement du moteur — étude C0

## Recommandation actualisée après les lots 1–3

Le [choix final proposé](DISTRIBUTION_FINALE.md) est désormais un **package workspace
après transfert unique vers le dépôt React**, sans publication, avec ancien moteur
conservé en référence. Repli : archive versionnée avec intégrité, source active Codex.
Le registre privé reste comparé mais n'est plus privilégié pour cet unique produit.
Cette recommandation remplace la préférence provisoire ci-dessous ; A08 et C1 restent
à autoriser. Aucun transfert ni paramétrage de plateforme n'est effectué ici.


Objectif : une application dans `avatar-legendes-ui`, une seule source maintenue du
moteur. Une dépendance installée ou une archive générée n'est pas une deuxième source
éditable. Aucun package n'est préparé à publication, publié ou installé dans v0 en C0.

## Options comparées

| Option | Maintenance et complexité | Hors ligne à l'usage | Build reproductible et versions | Compatibilité Vercel à vérifier | Divergence et travail v0/Codex |
|---|---|---|---|---|---|
| Package partagé versionné, canal privé | Une source, API/export explicites et version sémantique ; effort initial moyen (conditionnement, CI, types, accès) | Oui si tout le moteur/données est embarqué ; aucun appel au registre en jeu | Version exacte + lockfile/intégrité + SHA source ; archive conservée | Paquet ESM consommable par Next ; token de registre au build et accès des previews, pas dans le client ; smoke build nécessaire | Faible si personne n'édite node_modules ; v0 garde composants, Codex livre une version et ses contrats |
| Dépendance GitHub épinglée au SHA | Configuration initiale plus courte, mais conditionnement du dépôt racine requis ; pas un raccourci vers le shell Vite | Oui après build, pas besoin de GitHub à l'exécution | SHA immuable + verrouillage du client ; éviter branches/tags mouvants ; scripts prepare et dépendances transitives à contrôler | Auth Git si privé, disponibilité réseau au build, traitement des sous-dossiers/typages ; essai indispensable | Faible sur source unique, couplage au layout et à l'historique du dépôt plus fort ; mise à jour plus technique |
| Archive .tgz générée et versionnée explicitement | Simple pour démarrer sans registre ; outil de génération/contrôle à maintenir, archive non éditée | Oui après build ; archive locale disponible aussi sans registre | Archive identifiée par version, SHA source et SHA-256, intégrité verrouillée ; génération déterministe à prouver | Fichier fourni au build ou accès contrôlé à une release ; ne pas compter sur un fichier hors du dépôt de build | Faible si générée exclusivement par CI ; révisions manuelles/archives volumineuses à surveiller ; pas de copie de sources éditables |
| Copie ponctuelle contrôlée des sources | Peu d'infrastructure mais contrôle humain fort ; acceptable seulement comme transfert de responsabilité exceptionnel | Oui si tout est embarqué | Provenance, inventaire de fichiers et contrôle de divergence obligatoires ; version seule insuffisante si les copies changent | Sources locales faciles à builder ; dépendances/types restent à vérifier | Risque élevé si les deux copies restent actives. À éviter comme mécanisme de mises à jour régulières |
| Transfert unique ultérieur vers un package workspace dans le dépôt cible | Une seule source ensuite, pas de publication externe ; effort initial de transfert des tests/outils et de clarification des responsabilités | Oui, package local embarqué | Commit cible + lockfile ; version interne et référence d'origine conservées | Next/Vercel peuvent builder un workspace configuré ; vérifier racine de build, exports et transpilation | Faible seulement si le moteur de l'ancien dépôt devient une référence figée. Aucun transfert ni gel décidé dans C0 |

Le hors ligne d'usage ne signifie pas qu'un premier build fonctionne sans réseau :
installation des dépendances et récupération d'un paquet demandent un accès ou un cache
préalable. La qualification du démarrage Next à froid et du cache des assets reste un
chantier séparé. Une dépendance Git ne fournit pas un mode hors ligne à elle seule.

## Recommandation proposée, soumise à A08

Privilégier **un package métier versionné à source unique**, consommé par Next via une
API publique stable. Pour les premiers raccordements, la source peut rester dans le
dépôt Codex validé ; v0 ne reçoit alors aucune copie éditable du moteur. Le canal privé
est préférable si la distribution publique des contenus/licences n'est pas clarifiée.
Une archive générée avec intégrité est une solution transitoire si un registre privé
ajoute trop de gestion d'accès pour ce projet.

Le transfert unique vers un workspace du dépôt UI est une alternative cohérente si le
propriétaire veut à terme tout maintenir au même endroit. Il exige un accord explicite
sur le transfert de responsabilité et sur le gel de l'ancienne source ; ne pas combiner
ce transfert avec deux sources actives. Ce n'est pas une décision prise en C0.

Aucun besoin de framework ou gestionnaire d'état supplémentaire. Ne pas utiliser la
racine actuelle du dépôt Codex comme dépendance Git « prête à l'emploi » : elle comprend
le prototype Vite, ses outils et dépendances UI. L'étude du package doit isoler le
moteur plutôt qu'installer cette application dans Next.

## Contenu futur et API

- Domaine JS ESM, services/persistance sans DOM, références nécessaires et contrats/types.
- Exports restreints : services, modèle, ports de persistance, catalogue de lecture,
  banque privée et API combat explicitement revue. Pas d'import de chemin interne fragile
  depuis un composant, ni singleton de session dans un module.
- Pas de shell, composants, HTML oracle, sauvegardes personnelles, textes PDF ou banque
  privée. L'outil de préparation PDF est une capacité cliente optionnelle à traiter en
  C4 ; il ne doit pas entrer dans le graphe d'import SSR du moteur.
- Préserver les chemins relatifs internes ou les reconstruire par un build contrôlé ;
  émettre les déclarations des fichiers de contrats `.ts` et inclure les `.d.ts` existants.
  Les références JSON et leurs imports doivent passer le build Next cible.
- Aucun paquet de moteur publié à partir d'une branche mouvante de v0 ou du lot 3.

Ces exports sont une proposition de contrat de distribution, pas un `package.json`
installable ajouté par cette phase. Le build Next avec ces exports n'a pas été exécuté.

## Versionnement et garde-fous de future livraison

1. Version du package indépendante de V2.33 et du numéro de format de sauvegarde.
   Conserver les formats v1/v2 tant qu'aucune migration explicite n'est validée.
2. Version exacte dans le client, lockfile et intégrité ; pas de plage flottante pour
   une première recette. Journal de changements et SHA source avec chaque livraison.
3. CI source : sécurité/imports, tests métier et de parité, types, imports Node sans DOM,
   contenu du paquet et absence de données privées. Comparer le contenu réel de l'archive,
   pas seulement le dossier de sources.
4. CI consommateur : installation du paquet verrouillé, build Next, import SSR sans
   accès au navigateur, hydratation, transactions/stockage/refus, parcours UI aux tailles
   prévues, fonctionnement hors réseau et restauration. Aucune publication nécessaire
   pour exécuter un test local de consommation.
5. Ne pas imposer un script `prepare` qui génère les données depuis l'HTML à chaque
   installation utilisateur ; génération et vérification côté source/CI.
6. Retour arrière : revenir à la version verrouillée précédente et à ses projections,
   avec sauvegardes exportées avant changement. Ne pas rétrograder automatiquement les
   données : un retour de code ne garantit pas une compatibilité de schéma.
7. v0 travaille sur les composants ; Codex modifie la source du package et fournit le
   contrat d'une version. Un problème constaté dans le client se corrige dans cette
   source, jamais par une retouche du paquet installé ou une copie parallèle.

À résoudre avant tout canal privé : propriétaire du registre, permissions et secrets de
build, coût éventuel, accès Vercel/CI et licence/droits de distribution des contenus.
Aucun secret créé, aucun paramétrage Vercel changé et aucune compatibilité de déploiement
revendiquée comme testée dans C0.
