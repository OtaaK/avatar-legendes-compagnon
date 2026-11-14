# Mission 3 — Synthèse pour la revue

14 novembre 2026. Les étapes d’architecture sont **préparées sur branches**, pas toutes
intégrées dans main. Aucune refonte visuelle ni nouvelle mécanique n’est livrée ici.

## Résultat concret

Le développeur modifie les sources dans `src/`, puis un outil sans dépendance supplémentaire
produit le même type de fichier autonome : `app/simulateur.html`. L’utilisateur continue
à ouvrir un HTML, sans installation de Node ou Python, service externe ou connexion requise.
La CI refuse un HTML divergent ; elle ne le régénère pas pour masquer l’écart.

Le moteur, modèles, catalogue et validateurs ont des sources identifiées. Le stockage
et les notifications sont séparés ; les commandes synchrones reçoivent leurs ports et
conservent les refus/restaurations. Les préférences d’écran sont distinctes des sauvegardes.
Les étapes de chargement, événements, protection des actions et premier affichage sont
nommées explicitement. Les tests métier ne dépendent plus de découpes ordinaires du HTML ;
la parité et les contrôles de la distribution restent indépendants.

## Étapes et ordre de revue

| Étape | PR / état vérifié | À examiner |
|---|---|---|
| 3A — contrats | PR 20 fusionnée | Références observées et frontières, sans règle nouvelle |
| 3B — sources et génération | PR 21 fusionnée avec accord | Extraction initiale identique octet pour octet, build contrôlé |
| 3C — stockage | PR 22, brouillon non fusionné | Formats, journal, refus et reprise inchangés |
| 3D — commandes et démarrage | PR 23, brouillon non fusionné | Transactions, préférences, mêmes écrans |
| 3E.1 — moteur homogène | PR 24, brouillon non fusionné | Préambules de 145 tests, corps conservés |
| 3E.2 — services et validation | PR 25, brouillon non fusionné | Huit préparations, assertions HTML et doubles conservés |
| 3E.3 — fin et inventaire | Présent lot, branche dépendante de PR 25 | 28 derniers chargements moteur, inventaire final |

Examiner puis intégrer éventuellement **dans cet ordre**, uniquement sur accord explicite.
Après intégration d’une parente, rediriger la PR suivante vers main pour ne présenter
que son lot. Aucune suppression de branche, réécriture d’historique ou fusion automatique.

## Preuves et limites

L’état final passe **238 scripts : 198 JS et 40 Chromium**, sans échec. Cela compte des
scripts, chacun pouvant contenir plusieurs scénarios. Les bilans de chaque lot décrivent
les contrôles avant/après, comparaisons exactes et cas de refus exécutés. Les inventaires
et empreintes montrent que les assertions historiques sont conservées.
Les changements de 3E ne modifient aucun fichier de l’application.

Les contrats observent 80 entrées publiques, 111 identifiants de techniques et dix Livrets ;
ce sont des observations du logiciel, pas une certification des règles officielles.
Aucune règle n’est inventée ni texte de livre ajouté pendant cette mission.

Les tests de 3D couvrent quatre tailles d’écran, les transactions, l’historique et les
copies de combat. Le rendu n’écrit pas les sauvegardes métier ; il peut écrire des
préférences comme auparavant. Le journal conserve ses garanties existantes, sans
verrouillage multi-onglets ni nouvelle transaction atomique bibliothèque/combat.

**Défaut préexistant confirmé et conservé :** le premier rendu réécrit l’onglet combat
à Combattants avant sa restauration. Il faut un correctif fonctionnel séparé si souhaité.
La politique cloud bloque l’ouverture `file://` : fonctionnement hors réseau après
chargement local testé, double-clic sur Mac encore à vérifier.

Les gestionnaires DOM restent des adaptateurs historiques ; l’application n’est pas
convertie en composants purs ou modules ESM. La façade Node utilise fs/vm pour les outils
et tests et ne peut pas être copiée telle quelle dans un bundle React.
L’oracle HTML de parité reste volontairement dépendant de marqueurs contrôlés.

## Recommandation et retour arrière

Revoir la chaîne de PR puis effectuer la recette Mac de la branche finale avant intégration :
création/édition PJ et PNJ, fatigue, copie vers combat, modification indépendante, annulation,
export/réimport d’un jeu de données de test et rechargement hors réseau. L’interface ne change
pas ; cette recette contrôle surtout l’assemblage et les sauvegardes sur l’appareil cible.

Le risque principal de 3C/3D est le raccord entre stockage, commandes et démarrage ;
les suites et comparaisons couvrent les cas testés sans promettre l’absence de tout défaut.
Les lots 3E concernent les tests seulement. Aucun format n’ayant changé, le retour arrière
se fait par annulation du lot concerné, sans migration inverse des sauvegardes.

La reprise UI/React reste distincte : comparer les anciennes branches de convergence et
la référence v0 corrigée avant raccord, préserver leurs fonctionnalités récentes et ne
pas leur substituer automatiquement le modèle plus ancien du main de maintenance.
Ne pas commencer cette intégration ni déployer sans validation de la suite par Alex.


## Revue finale et recette préparées

La [revue finale](REVUE_FINALE_MISSION_3.md) confirme les contrôles de chaque PR et décrit
les nouveaux parcours réalisés. Le [guide Mac](RECETTE_MAC.md) permet la recette sans
commande, avec un jeu fictif fourni. Aucune PR fusionnée ; retour Mac encore attendu.
