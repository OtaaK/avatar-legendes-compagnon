# UI/UX — lot 3B : ressources des PNJ

Livraison du 8 novembre 2026 sur `refonte/ressources-pnj`, depuis `cfdd496`.
Elle dépend de la PR nº 5 (fiches), elle-même dépendante des PR nº 4 et nº 3.
Ces PR ne sont pas fusionnées. L’application reste un HTML autonome V2.33.

## Résultat pour l’utilisateur

Les PNJ peuvent adopter un profil de ressources propre : fatigue variable, états nommés,
principe unique et équilibre positif. Un PNJ non-combattant peut n’avoir ni fatigue ni états.
Les jauges de la galerie, de la fiche et du combat utilisent le même profil.
Les PJ et les PNJ historiques conservent leurs valeurs et leur comportement antérieurs.
Changer l’importance d’une carte ne change jamais ses ressources.

Dans Modifier, le panneau « Ressources du PNJ » propose les paramètres correspondant à
l’importance. Il faut compléter les noms d’états et le principe, puis enregistrer et confirmer.
Une valeur déjà marquée incompatible empêche l’enregistrement : aucune case ni donnée
n’est supprimée automatiquement. Annuler conserve le modèle enregistré.

## Sources et périmètre réglementaire

Le PDF fourni a été réellement consulté : pagination imprimée p. 100 pour la fatigue et
p. 239–242 pour les PNJ (pages physiques 101 et 240–243). Il reste hors du dépôt,
avec ses extractions de travail. Les valeurs proposées sont :

| Importance | Fatigue maximale | Nombre d’états | Équilibre maximal |
|---|---:|---:|---:|
| Mineur | 3 | 1 | +1 |
| Majeur | 5 | 3 | +2 |
| Maître | 10 | 5 | +3 |
| Légendaire | 15 | 8 | +4 |

Ces propositions rendent accessibles les capacités décrites ; elles ne remplacent pas
le choix du MJ. Les états peuvent être personnalisés. Pour huit états, les noms manquants
ne sont pas inventés : l’utilisateur doit les fournir. Le principe est requis pour une jauge
positive ; les champs historiques supplémentaires sont préservés.

Le modèle historique sans profil reste à fatigue 5, équilibre −3…+3 et cinq états canoniques.
C’est une garantie de compatibilité, pas une affirmation de conformité des anciens PNJ.
Le nouveau profil a une échelle 0…borne choisie. Les limites techniques sont 15 fatigue,
huit états et +4 équilibre ; les groupes et leurs extensions ne sont pas automatisés.

La réception de fatigue, ses conversions en états et les coûts volontaires conservent
leurs algorithmes existants, avec les limites du porteur. Les quantités fixes des techniques,
leur catalogue et les données des Livrets ne changent pas. Les coûts au-delà de la capacité
sont refusés ; les protections et simulations emploient aussi les limites du destinataire.
Dépasser la borne d’équilibre demande une résolution par le MJ : refus explicite, sans
écrêtage silencieux, défaite ou conséquence narrative inventée. Les automatismes exhaustifs
de perte d’équilibre et de mise hors combat restent hors périmètre.

## Modèle, combat et annulation

Un champ optionnel `npcResources` versionné décrit le profil. Les validations partagées
contrôlent capacités, valeurs marquées, unicité et appartenance des états, et principe.
Elles couvrent bibliothèque, combat, exports/imports et instantanés d’annulation.
Les listes d’états des formulaires de techniques dépendent désormais de la bonne cible.
Changer de cible conserve les autres options saisies.

L’ajout au combat copie profil et principe. Modifier ensuite la fiche permanente ne
transforme pas le combattant déjà présent : celui-ci conserve sa copie indépendante.
Les prochains ajouts utilisent le profil actualisé. Une synchronisation combat→fiche
incompatible est refusée atomiquement. Un non-combattant ne peut pas rejoindre le combat.
Les ajustements de fiche et l’annulation de combat conservent leurs mécanismes distincts.

## Sauvegardes et retour arrière

Avant toute manipulation, il reste recommandé d’exporter une sauvegarde complète dans Gestion.
L’activation du premier profil exige confirmation et écrit les deux modèles dans un nouveau
canal local : `avatar-roster-v021` / `avatar-v021`. Le marqueur
`avatar-npc-storage-generation` maintient ce canal, même après retrait des profils.
Les clés historiques `avatar-roster-v020` / `avatar-v020` sont conservées intactes.
Cette séparation demande un peu plus d’espace local.

Le journal d’import complet assure l’écriture des deux modèles et du marqueur, ou leur
restauration en cas d’échec. Les anciens journaux restent récupérables. Une panne de quota
conserve le brouillon et le point antérieur. Si une récupération échoue ou si les données
v021 sont illisibles, les écritures ordinaires sont bloquées pour éviter leur écrasement.
Une restauration complète explicitement choisie et validée dans Gestion peut réparer
un chargement récent illisible. Les erreurs de stockage persistantes doivent être résolues
avant de continuer ; aucun mécanisme ne garantit une récupération après toute panne matérielle.

Les anciens formats restent importables. Dès que nécessaire, bibliothèque et sauvegarde
complète utilisent la version 2 ; le combat isolé reçoit une enveloppe
`avatar-compagnon-combat` version 2. Ces nouveaux exports nécessitent cette version du compagnon.
Les sauvegardes sans profil conservent leur format historique lorsque leur modèle le permet.

Gestion propose « Exporter l’état avant les profils PNJ » : ce fichier complet version 1
contient le point v020 antérieur à l’activation, pas les modifications récentes du canal v021.
Un retour à l’ancien HTML retrouve ce point antérieur sur la même origine de stockage.
Les modifications faites ensuite dans l’ancienne et la nouvelle application ne sont pas
fusionnées. Conserver les deux exports si l’on veut revenir en arrière ; changer de fichier,
de navigateur ou d’origine peut donner accès à un autre stockage local.

## Vérifications réalisées

| Vérification | Résultat |
|---|---|
| Référence avant le lot | 233/233 scripts |
| Suite finale complète, deux processus | 236/236 : 195 JavaScript et 41 navigateur |
| Nouveau modèle PNJ | 42 scénarios dans un script |
| Nouveau stockage générationnel | 19 scénarios dans un script |
| Nouveau parcours Chromium | Quatre formats, de 320 px à 1280 px |

Les scénarios comprennent propositions, refus d’activation, données incompatibles, capacité 15,
états personnalisés et textes piégés, protections, fatigue excédentaire, Terre (armure,
lave, piège), principe, copies indépendantes, non-combattant et annulations.
Le navigateur effectue de vrais téléchargements, réimports et rechargements, une panne de quota
injectée, puis compare les données récentes et historiques. Les tests de stockage injectent
les échecs aux différentes étapes du journal et vérifient les blocages de sécurité.

Deux régressions intermédiaires, détectées par les tests historiques fatigue/piège,
provenaient d’une réinitialisation trop large lors d’un changement de cible. Le code a été
corrigé ; les anciens tests et leurs assertions sont conservés. Aucun test n’est supprimé.
Les captures desktop/mobile ont été examinées et restent des fichiers locaux hors Git.
Le rapport détaillé d’exécution est local : `/workspace/work/pnj-final.json`.

Limite d’environnement : `file://` est bloqué par la politique du navigateur cloud.
Le contrôle hors connexion charge via HTTP local puis coupe le réseau. Il ne certifie pas
le double-clic sur Chrome macOS ; cette recette reste à réaliser sur le Mac du propriétaire.
Ces tests ne constituent pas un audit exhaustif des règles du jeu ou de toutes les combinaisons.

## Recette courte, sans commandes

1. Télécharger le HTML de cette branche et ouvrir sa copie de test. Exporter une sauvegarde
   complète depuis Gestion et garder le fichier à part.
2. Ouvrir un PNJ → Modifier → Ressources du PNJ. Proposer les valeurs de son importance,
   compléter les états et le principe. Vérifier les valeurs déjà marquées avant confirmation.
3. Enregistrer ; contrôler fatigue, équilibre, états et rechargement de la page.
4. Ajouter ce PNJ au combat ; ajuster une ressource, préparer puis annuler un effet.
   Vérifier qu’un non-combattant ne peut pas être ajouté.
5. Depuis Gestion, exporter la sauvegarde récente et l’état antérieur aux profils.
   Tester la restauration uniquement dans une copie de test, en gardant les deux fichiers.

## Fichiers et suite

Un fichier applicatif modifié : `app/simulateur.html`. Trois scripts de test ajoutés,
avec README, ROADMAP, architecture, tests, décisions, plan et présent rapport actualisés.
Aucun fichier supprimé, catalogue réécrit, dépendance ajoutée ou PDF versionné.

Après examen de ce lot : Lieux hiérarchiques et liens PNJ (lot 4), puis structure des Livrets
(lot 5). Les règles détaillées des dix Livrets restent une mission distincte.
Aucune fusion dans `main` sans accord explicite du propriétaire.
