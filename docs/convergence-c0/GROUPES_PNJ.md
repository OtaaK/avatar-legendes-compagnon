# Groupes de PNJ — compatibilité réelle, pas nouveau moteur

Sources : `39fd4781`, principalement `lib/npc-groups.ts`, `lib/npc-edit.ts`,
`lib/demo-data.ts`, formulaire, cartes et fiche. Comparaison avec le domaine B 62c523c
et les ports C0 24df462. Aucun calcul de groupe n'a été ajouté au domaine.
Les formules ci-dessous décrivent le logiciel ; elles ne sont pas déclarées officielles.
Le PDF n'a pas été réexaminé dans cette mission et la réserve de conformité est conservée.

## Structure et activation

Un Character reste kind=pnj. npcType=group active la lecture collective ; individual
ou npcType absent conserve la lecture individuelle. groupProfile peut rester présent
sur un individuel : il s'agit alors d'une archive, pas d'un groupe actif.

| Champ | Contenu observé | Ce que Codex sait réellement faire aujourd'hui |
|---|---|---|
| size | petit/moyen/grand | Aucun sens métier reconnu par Roster/ResourceRules. |
| memberCount | Effectif de la bande choisie ; le type TS est numérique | Extension transportable ; aucun membre individualisé ou tableau d'IDs de membres. |
| memberImportance | Mineur ou Majeur seulement | Classification distincte de l'importance racine et du profil npcResources. |
| trainings | Sélection unique par valeur parmi six entraînements, vide possible | Roster.training est une seule valeur ; ne représente pas ce tableau. |
| groupTechniqueIds | IDs uniques, inconnus admis pour conservation | Pas des IDs automatiquement résolus dans Character.techniques. |
| savedIndividualTraining | Une valeur individuelle conservée | Archive scalaire, pas un historique complet de toutes les conversions. |
| resources | Absent, null ou objet, notamment {} | Non interprété comme les ressources actives Codex. |
| relationshipNotes | Texte facultatif | Peut être conservé comme extension, ne remplace aucune relation existante. |

Les ressources racine — fatigue, capacité, états, statuts, principe et équilibre —
restent séparées du bloc collectif. Une fiche peut donc conserver les deux ensembles.
La taille/l'effectif ne désignent pas une liste de fiches-personnages : ne pas créer
cinq à vingt PNJ ou relier automatiquement des individus par leur nom.

## Importance effective et capacités observées

Petit : 5–10 membres, bonus +1 ; moyen : 11–20, +2 ; grand : 21 et plus, +3.
L'effectif est validé par bande ; à bande identique, le calcul dépend de size et de
memberImportance, pas du nombre exact de membres. Les bases Champion/Légendaire sont
refusées. Le calcul plafonne l'importance effective à Champion ; les niveaux au-delà
augmentent fatigue et nombre d'états, pas la capacité d'équilibre.

| Taille | Importance du membre | Effective affichée | Fatigue recommandée | États recommandés | Équilibre recommandé |
|---|---|---|---:|---:|---:|
| petit | Mineur | Majeur | 5 | 3 | 2 |
| petit | Majeur | Champion | 10 | 5 | 3 |
| moyen | Mineur | Champion | 10 | 5 | 3 |
| moyen | Majeur | Champion +1 | 11 | 6 | 3 |
| grand | Mineur | Champion +1 | 11 | 6 | 3 |
| grand | Majeur | Champion +2 | 12 | 7 | 3 |

Les personnalisations numériques présentes dans resources prennent priorité lors de
la lecture des capacités. Une recommandation affichée ne prouve donc ni une valeur
stockée ni une initialisation. getGroupResourceValues ne modifie pas le profil.
Une modification de taille recadre l'effectif dans la nouvelle bande et modifie les
suggestions de capacité du brouillon non personnalisé. C'est un comportement de
formulaire à recetter, pas une règle Codex autorisée par cette analyse.

Ces capacités peuvent entrer numériquement dans certaines limites actuelles Codex
(fatigue <=15, équilibre <=4). Cela ne rend pas les modèles équivalents : stateCapacity
est un compteur alors que npcResources.conditions est une liste **d'états autorisés**.
Copier les seuls états déjà cochés comme catalogue autorisé ne recrée pas la capacité
collective et empêcherait de nouveaux choix ; inventer les autres noms serait également
incorrect. Les entraînements multiples et l'importance effective restent à représenter.

## Absence, null, vide et valeurs

| État dans le JSON source | Validation UI observée | À préserver lors d'une future adaptation |
|---|---|---|
| resources absent | Accepté | Propriété absente, pas {} ni des ressources par défaut. |
| resources:null | Accepté | Null distinct de l'absence. |
| resources:{} | Accepté | Container explicitement vide. |
| fatigue/balance absents | Accepté | Non renseignés ; ne pas ajouter zéro. |
| fatigue:null / balance:null | Accepté | Valeurs historiques inconnues. |
| fatigue:0 / balance:0 | Accepté | Zéro présent, pas champ supprimé. |
| capacities absentes | Accepté ; recommandations calculées à la lecture | Garder le champ absent, indépendamment de la capacité affichée. |
| capacities:null ou 0 | Refusé par isNpcGroupProfile | Conserver le fichier original et signaler l'écart, pas convertir en recommandation. |
| states:[] / statuses:[] | Accepté | Liste vide explicite, différente de propriété absente. |
| principle:"" | Accepté | Texte vide ; ne pas créer des principes depuis ce libellé. |
| resources:"", fatigue:"", states:"" | Refusés | Ne pas assimiler une chaîne vide à null, {}, zéro ou une liste vide. |
| champs inconnus JSON compatibles | Tolérés dans le bloc | Ne pas éliminer ces champs lors d'une reconstruction du profil. |

applyNpcGroupResourceEdits renvoie le container d'origine quand aucun champ n'est
explicitement touché. Après une action : copie des ressources existantes, mise à jour
des seuls champs fournis ; undefined d'un champ touché supprime sa propriété. Pour les
ports futurs, porter ces suppressions comme remove explicite. Toucher un champ peut
créer un container auparavant absent/null ; une ouverture ou édition d'identité ne doit
pas le faire. Les tests ajoutés au lot 3 couvrent ce mécanisme pur et le patch neutre,
pas l'ensemble des interactions réelles du formulaire.

## Tolérances de validation confirmées, sans réparation silencieuse

Des probes en mémoire ont exécuté isNpcGroupProfile puis le validateDemoData complet
extrait du seul commit de référence. Ces entrées sont acceptées :

- memberCount sous forme de chaîne "5", car le validateur teste Number(memberCount).
- Un entraînement sous forme de tableau imbriqué ["Terre"], via la coercition String
  dans isTraining, au lieu du seul libellé typé attendu.
- Un ID de technique de groupe inconnu, non dupliqué.
- Des états dupliqués ou un libellé d’état vide dans la liste.
- Fatigue 9 et capacité 2 ; deux états avec capacité 1 ; équilibre 4 et capacité 1.

Le formulaire a des protections de saisie/conflit que l'import ne reproduit donc pas
intégralement. Les inconnus de techniques sont volontairement affichés/conservés comme
hors catalogue ; les autres tolérances doivent être diagnostiquées avant un profil
métier actif. Ce sont des différences confirmées de validation, **pas une démonstration
d'un bug observé en production**, ni une autorisation d'écrêter des données historiques.

L'import Codex applique toujours ses protections JSON/IDs, ses limites et cohérences.
Un fichier externe refusé reste conservé ; pas de coercition silencieuse de l'effectif,
ni réduction de fatigue, suppression d'états ou remplacement de capacité au chargement.

## Techniques de groupe : correspondance de références

Les treize noms ont chacun une correspondance exacte dans la famille groupe_pnj des
111 techniques Codex. Le catalogue UI ne fournit ni description d'effet ni résolution
automatique ; sa mention « Annexe A, p.287 » est une référence saisie, non vérifiée ici.
Les quatre IDs signalés ci-dessous montrent pourquoi un simple préfixe ne suffit pas.
La table est une proposition de correspondance explicite de références, pas une
certification des mécaniques ou une conversion appliquée.

| ID UI | ID catalogue Codex |
|---|---|
| assaut-generalise | groupe_pnj-assaut-generalise |
| au-pied-du-mur | groupe_pnj-au-pied-du-mur |
| coordination | groupe_pnj-coordination |
| deferlement | groupe_pnj-deferlement |
| dispersion-regroupement | groupe_pnj-dispersion-et-regroupement |
| encerclement | groupe_pnj-encerclement |
| eprouver-defense-adverse | groupe_pnj-eprouver-la-defense-adverse |
| leurrer-ennemi | groupe_pnj-leurrer-lennemi |
| mur-de-boucliers | groupe_pnj-mur-de-boucliers |
| obeir-aux-ordres | groupe_pnj-obeir-aux-ordres |
| occuper-terrain | groupe_pnj-occuper-le-terrain |
| proteger-un-objectif | groupe_pnj-proteger-un-objectif |
| tirs-nourris | groupe_pnj-tirs-nourris |

Les IDs inconnus ne sont pas supprimés ni appliqués comme technique officielle.
Le choix d'au moins une technique est un avertissement UI, pas une attribution forcée.
Les dix techniques ordinaires fictives et les entraînements compatibles sont filtrés
séparément ; leur ancien rattachement peut être conservé même devenu inactif. Les
niveaux personnels Acquise/Pratiquée/Maîtrisée restent une exigence indépendante de la
sélection groupTechniqueIds, qui n'enregistre pas de degré dans ce modèle.

## Statuts, équilibre et approche

Les statuts actifs du groupe viennent de resources.statuses, avec nom, polarité et
description. Ce ne sont pas les codes du moteur de combat ; aucune polarité ne permet
de déduire automatiquement un bonus. Les états collectifs et individuels restent deux
listes distinctes, de même que leurs statuts.

Le groupe possède un principe textuel, une position d'équilibre nullable/facultative et
une capacité propre ; aucun centre collectif n'est défini dans groupProfile. Codex
exige notamment un principe renseigné pour activer une limite d'équilibre PNJ explicite.
Un équilibre collectif zéro sans principe n'autorise donc pas une traduction automatique.
Les deux principes structurés Codex ne doivent pas être fabriqués depuis ce texte.

L'« approche de combat » de la fiche est le texte Character.combatStyle. Ce n'est pas
le choix mécanique defendre/attaquer/esquiver de CombatCore ; le profil UI ne contient
ni jet, ni révélation, ni historique de décisions de passe. De même, trainings=[] ne
permet pas de déduire un profil Codex non-combattant. Ces distinctions conditionnent C7.

## Conversions individuel ↔ groupe

Le formulaire demande une confirmation de conversion. Individuel→groupe : choisir
bande/effectif et base Mineur/Majeur, entraînements et éventuelles ressources collectives.
Les ressources individuelles ne sont pas copiées vers le collectif. L'entraînement
racine est conservé et peut être mémorisé dans savedIndividualTraining.

Groupe→individuel : le profil collectif reste présent en archive ; plusieurs entraînements
demandent un choix unique ou aucun, un seul est repris, aucun laisse l'individu sans
entraînement. nextTraining ne rétablit pas automatiquement savedIndividualTraining.
La conversion est donc un choix de profil actif, pas la restauration exacte d'un ancien
instantané individuel. Les ressources collectives ne remplacent pas les individuelles.

Le profil archivé n'est pas un journal daté des conversions, motifs ou états avant/après.
Ne pas revendiquer une annulation générale à partir de cette seule archive. L'aperçu pur
est non mutateur ; les transitions effectives et réversibilité complète devront être
recettées dans un futur contrat, avec décision et stockage atomique.

Risque à couvrir, non reproduit dans un navigateur ici : handleSubmit reconstruit
nextGroupProfile avec une liste de champs connus, sans recopier toutes les extensions
inconnues du profil. Le helper de ressources préserve ses inconnus ; cela ne prouve pas
la conservation des extensions de tout le profil par le formulaire réel. Les tests
existants de patch ne montent pas ce formulaire. Ce point reste un risque identifié
par lecture, pas une nouvelle anomalie de recette déclarée résolue ou démontrée en UI.

## Coexistence avec Codex, et limites par phase

Probe Codex : un PNJ **déjà valide** enrichi d'un groupProfile conserve ce bloc dans
exportBackup/import. Mais addToCombat copie la fatigue racine, pas la fatigue collective,
et ne copie ni npcType ni groupProfile dans le combattant. Conserver une extension dans
un fichier ne signifie donc pas la prendre en charge dans les règles ou instantanés.

| Phase | Incompatibilité / condition |
|---|---|
| C1 | Conserver l'AppData de démo intact, refuser sa conversion automatique et l'activation de groupes ; ne pas migrer via makeCharacter ni activer leurs commandes parce que le bloc a survécu au JSON. |
| C2 | Ressources imbriquées, profils, états collectifs, effectifs/importances et entraînements multiples exigent un contrat actif. Ne pas utiliser les ajustements individuels sur le bloc collectif. |
| C3 | relationshipNotes n'est pas relationships ; groupe ≠ liste de membres reliés par ID. Domicile/position/associations restent trois liens distincts. |
| C4 | Table explicite des 13 IDs, inconnus conservés et trois maîtrises personnelles. Ne pas promouvoir les dix fictions en catalogue réel. |
| C7 | Copie et commandes du combattant collectif, décisions, durées, réactions, historique et undo doivent conserver le contexte de groupe. Pas de simple renommage du combattant individuel. |

Recommandation A09 : statut conservé/consultable avant intégration, **pas exécutable**
dans le moteur en C1. Après contrat/règles approuvés, déplacer ou adapter la seule logique
de groupe dans la source métier commune et faire consommer ses résultats par v0. Ne pas
maintenir calculateGroupRules côté UI et une deuxième formule active dans Codex. Garder
les métadonnées source, ressources individuelles/collectives séparées et transitions
traçables, sans confondre import d'archive et exécution d'une règle.
