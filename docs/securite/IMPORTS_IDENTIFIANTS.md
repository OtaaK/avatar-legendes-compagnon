# Mission 1 — identifiants importés et injection au clic

13 novembre 2026. Base inspectée : `main` au commit `42b306f71793e755bf2ee7066d515518f07c9987`,
puis mission 0 documentaire `e932c70`. Branche dédiée : `security/import-identifiers`.
Aucune lecture de CLAUDE.md, aucun nettoyage, aucune refonte UI, aucun déploiement.

## Vérification indépendante de l’audit

Le défaut est confirmé : `validateCharacter` et `normalizeCharacter` ne contrôlaient pas
l’identifiant d’une fiche. `importLibrary` n’en vérifiait que le doublon. Les cartes et
plusieurs boutons inséraient ensuite cet identifiant dans une chaîne JavaScript d’un
attribut événementiel. L’échappement HTML ne protégeait pas ce contexte : les entités
étaient décodées avant l’interprétation du gestionnaire.

Une reproduction locale Chromium avec une fiche synthétique a confirmé **l’acceptation
par l’import puis l’exécution d’un marqueur au clic**. Aucun accès à des données réelles,
aucune exfiltration, aucun service externe. Les fichiers de preuve locaux restent dans
`work/security/`, ignoré par Git. Les nouveaux tests utilisent des données synthétiques.

Autres faits contrôlés : dépôt public au moment de la consultation GitHub ; aucun fichier
LICENSE versionné dans ce `main` ; 191 scripts JS et **37** scripts navigateur sur cette
base (pas 38). Les comptes rendus d’autres branches ne remplacent pas cette référence.
Le nombre 38 correspond à la suite après ajout du nouveau script navigateur de sécurité.

Les constats de poids, fonctions inutilisées et réorganisation ne sont **pas certifiés par
ce correctif** : ils attendent l’inventaire de mission 2 et l’accord préalable aux suppressions.
La conformité mot à mot et les droits des textes TECH_CATALOG ne sont pas établis ici.
Une question a été adressée à Alex ; aucune licence, visibilité ni description n’a été changée.

## Correctif

### Frontières de données

- Identifiant de fiche : chaîne de 1 à 120 caractères ASCII, commençant par une lettre ou
  un chiffre ; ensuite lettres, chiffres, tirets et soulignés uniquement. Fin de chaîne
  stricte, y compris refus d’un saut de ligne terminal. Contrôle dans `validateCharacter`
  **et avant toute migration de champs** dans `normalizeCharacter`. `importLibrary` passe
  par ces deux contrôles ; les doublons restent refusés.
- Même alphabet/bornage pour `characterId`, les identifiants de piège et de proposition,
  qui étaient insuffisamment contrôlés et atteignaient le rendu. Les formats existants
  des combattants, effets temporaires et notes de scène avaient déjà une validation
  spécifique ; celle-ci est conservée.
- Aucun identifiant n’est converti, renommé ou remplacé pour faire accepter un fichier.
  `char-1`, anciens identifiants ASCII et UUID sont conservés exactement, avec les champs
  inconnus. Un identifiant exotique ancien est désormais refusé explicitement : conserver
  son export original et décider d’une réparation séparée, sans migration silencieuse.

### Rendu et actions

**40 attributs click/change dynamiques**, plus le gestionnaire clavier des cartes, passent
à des attributs de données échappés et des écouteurs. Le routeur appelle une liste fixe
par `switch` ; aucun `eval`, `Function`, recherche dynamique dans `window` ou interprétation
du texte importé. Les paramètres restent des chaînes de données, même si la validation
est contournée par une ancienne donnée déjà en mémoire.

| Surface examinée | Traitement |
|---|---|
| Cartes PJ/PNJ, ajout au combat et liste de fiches | `data-id` échappé ; clic, Entrée et Espace conservés |
| Combattants, ouverture/édition/report de fiche, libération de statut | Attributs de données ; protections transactionnelles inchangées |
| Approches, jets, choix Gêné, engagements | Écouteurs `change` ; valeurs et cases cochées transmises comme données |
| Effets temporaires, notes, bouclier/armure/lave/interruption | Identifiants et opérations séparés dans des attributs inertes |
| Pièges | Identifiant contrôlé et transporté comme donnée, zone échappée |
| Propositions | Identifiant contrôlé et échappé dans `id`; montant échappé aussi dans le texte |
| `f.id`, `e.id`, `c.kind`, ressources numériques | Échappement HTML aux points de rendu concernés, même en défense sur un état non validé |
| Choix de catalogue, entraînement, caractéristiques `k`, états `x` | Valeurs statiques/énumérées ; suppression également de leur interpolation dans du code événementiel |
| Infobulles et noms/principes/lieux/textes libres | Échappement existant conservé ; classes et styles issus de tables fixes ou de calculs bornés |

Les gestionnaires statiques qui ne contiennent **aucune donnée interpolée** restent en
place. Cette correction ciblée n’est pas une extraction architecturale générale ni une
promesse d’éliminer tous les attributs `on*`. Un test interdit le retour d’une interpolation
dynamique dans ces gestionnaires. Les attributs de données ne doivent pas devenir une
API générale d’exécution : la liste d’actions autorisées reste explicite.

Le moteur et le catalogue (tout le préfixe du script avant `let s;`) sont identiques à la
base, octet pour octet. Les contrôles de sécurité du modèle de fiches et de l’import sont
dans la partie suivante du fichier. Les fonctions de résolution du jeu n’ont pas changé.

## Tests et comparaison

| Suite | Avant | Après |
|---|---:|---:|
| `python scripts/test.py --suite js --jobs 2` | 191/191 | 192/192 |
| `python scripts/test.py --suite browser --jobs 2` | 37/37 | 38/38 |
| Nouveau script JS sécurité | — | 25 scénarios |
| Nouveau script Chromium sécurité | — | 21 scénarios |

La limite préexistante `file://` demeure : Chromium cloud bloque le double-clic local.
Le contrôle hors connexion existant passe par un chargement HTTP local, puis coupe le
réseau. Aucun nouveau test macOS/Safari n’est prétendu.

Couverture nouvelle : identifiants absents/non textuels, vides, trop longs, espaces,
contrôles, caractères Unicode, entités, apostrophes et guillemets piégés ; validation et
normalisation avant mutation ; anciens identifiants/inconnus conservés ; doublons ;
imports réels fiches/combat/sauvegarde complète refusés sans mutation ni écriture ;
absence d’exécution au clic et au clavier ; rendu inerte même sans passage par l’import ;
champs de propositions/combattants ; ancien stockage invalide signalé et conservé.

Les assertions historiques ne sont pas regroupées ni supprimées. Dans trois fichiers
navigateur, seuls quatre sélecteurs CSS dépendant des anciens `onclick/onchange` changent
pour désigner les nouveaux attributs ; les mêmes opérations et assertions restent testées.
Les régressions de jeu, imports, quotas et annulations restent dans la suite complète.

## Portée, risques et retour arrière

Le correctif vise le HTML autonome de `main` audité. Les branches et PR de convergence
React sont conservées, **pas modifiées ni implicitement sécurisées par cette branche**.
Le report vers leur HTML historique et leur domaine extrait doit être vérifié avant leur
intégration, en tenant compte de leur référence d’extraction ; aucun ancien lot n’est écrasé.

Risque principal : refus d’identifiants historiques hors du format sûr. Le fichier importé
n’est pas réécrit et les données actuelles restent intactes en cas de refus. Les clés de
stockage, formats d’export et identifiants acceptés ne changent pas. Pas de nouveau paquet,
framework, version de format ou migration des sauvegardes.

Le retour arrière se fait par réversion du commit de mission 1, sans réécriture d’historique
ni suppression de branche. Il réintroduirait toutefois le défaut : mieux vaut corriger une
éventuelle régression sur cette branche que réactiver l’ancien rendu.

Recommandation : examiner les PR 0 et 1 séparément et donner un accord explicite avant
fusion. Le nettoyage attend sa propre mission : étiquette de sauvegarde, inventaire avec
preuves, présentation à Alex et accord **avant toute suppression**. Aucune mise en œuvre
de la maquette de passe d’armes ni de la mission 3 n’a commencé.
