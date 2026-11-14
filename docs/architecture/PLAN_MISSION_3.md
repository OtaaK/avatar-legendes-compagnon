# Mission 3 — étapes de maintenance de l’architecture

Autorisation d’Alex : « En avant », après fusion des missions 0, 1 et 2.
Référence de départ : **main `55d56f6f0e49e6cb480099fd06282f85d889f0db`**, V2.33 nettoyée.
Aucune règle du jeu, sauvegarde ou interface à changer ; aucun framework nouveau.
Les anciennes branches et les PR de convergence restent conservées, sans fusion implicite.

## Ordre proposé et limites

Chaque ligne a sa PR, ses contrôles avant/après et un retour arrière par annulation de
commit, sans réécriture d’historique. Le découpage isole la persistance de l’affichage
pour réduire la taille et le risque des futurs changements.

| Étape | Résultat attendu | Critères concrets avant livraison |
|---|---|---|
| **3A — contrats et contrôles, fusionnée PR 20** | Description des interfaces, référence main figée, préparation de tests centralisée et scénario commun Node/Chromium | HTML et 230 anciens scripts identiques ; mêmes refus, états, copies et reprises ; aucun accès DOM/stockage au chargement métier ; contrôles de référence reproductibles |
| **3B — sources et génération du HTML, fusionnée PR 21** | Extraire données et corps métier sans réécrire leurs règles ; assembleur déterministe avec bibliothèque standard | `build --check` refuse une divergence ; deux builds donnent le même HTML ; comportement et ordre d’initialisation conservés ; HTML unique autonome sans imports réseau ; parité des 111 identifiants/10 Livrets et suite complète |
| **3C — persistance, préparée** | Isoler lecture/écriture et transactions derrière un adaptateur, sans changer clés ni formats | Importations historiques et champs inconnus conservés ; quota/lecture refusée, interruption, journal et reprise contrôlés ; refus/annulation sans perte ; aucune écriture au premier rendu |
| **3D — affichage et commandes, préparée** | Séparer les décisions utilisateur, mutations, affichage et démarrage | Même rendu/navigation/clavier ; données inertes dans les événements ; copie de combat indépendante ; confirmations, annulations et sauvegardes conservées ; parcours Chromium desktop/mobile et hors réseau |
| **3E — imports des tests** | Remplacer progressivement les découpes HTML par des imports de sources derrière les contrats | Inventaire de tous les scénarios avant/après ; aucune assertion perdue ou affaiblie ; commandes de test stables ; fichiers/batches comparables ; parité source/HTML conservée |

L’étape 3B doit livrer extraction et génération **ensemble**, pour éviter une période où
le développeur doit maintenir à la main deux copies divergentes. Si son diff dépasse
un volume raisonnable, la fractionner par ensemble dans des PR dépendantes, chacune
livrant son HTML complet et contrôlé. Même précaution pour 3E : migration par lots de
fonctionnalités, jamais un déplacement massif qui laisse des tests hors découverte.

La source de chaque morceau doit être explicite. La génération ne doit pas réordonner
les déclarations, changer les noms publics ou ajouter des initialisations implicites.
Le choix précis des adaptateurs de packaging Node/navigateur sera décrit dans 3B ; aucune
conversion générale par expressions régulières ni copie indépendante du moteur.

## Outils, coût et autonomie

Choix recommandé : **Node.js et/ou Python déjà utilisés, bibliothèques standard**.
Coût de dépendances supplémentaires prévu : **0 paquet**, aucun framework ni transpileur.
L’utilisateur continue à ouvrir `app/simulateur.html` sans installation, connexion ou serveur.
L’outil de génération sera réservé au développement, pas requis à l’ouverture du compagnon.
Si ce choix s’avère insuffisant, présenter une proposition chiffrée et demander l’accord
avant toute dépendance ; ne pas l’introduire sous prétexte de refonte technique.

3A ajoute uniquement des contrôles et des documents : **0 octet ajouté au HTML distribué**.
Le fichier reste l’oracle de cette étape, pas un artefact déjà généré. Le code extrait
ne devient la source d’édition qu’en 3B, avec un contrôle de divergence obligatoire.

## Périmètre des contrats

Les contrats observés sont ceux de ce main : bibliothèque version 1, sauvegarde complète
version 1, exports historiques et clés existantes. Il ne faut pas transformer les champs
par défaut en schéma fermé ni supprimer les propriétés inconnues. Les ports décrits
ne sont pas de nouveaux formats de campagne.

Le banc Node de 3A charge les corps existants dans une VM isolée ; il centralise des
repères **encore textuels**. C’est une transition, pas la preuve que le monolithe est déjà
modularisé ou que les anciens tests sont migrés. Les repères absents/ambigus doivent
faire échouer le chargement, sans sélection approximative d’un autre bloc.

## Risques identifiés et garde-fous

- **Ordre et visibilité globale** : le moteur et les règles sont des exports `window` ;
  les noms sont partagés par le script. Des imports naïfs pourraient changer les liens.
- **Mutations** : toutes les fonctions de modèle ne sont pas des transactions autonomes.
  Garder les enveloppes de commandes et leur restauration, pas seulement les corps métier.
- **Deux clés de sauvegarde** : le journal de restauration existant ne doit pas disparaître
  lors de l’isolation du stockage. Ne pas inventer une transaction multi-onglets déjà garantie.
- **DOM encore couplé** : avertissements et persistance consultent des éléments DOM ; la
  VM utilise un adaptateur de notification de test explicitement limité, pas une interface refaite.
- **Règles non entièrement vérifiées** : tests et parité prouvent des comportements couverts,
  pas la conformité exhaustive au livre. Aucune mécanique complétée ou corrigée ici.
- **Catalogue et droits** : pas de texte officiel nouveau, PDF ou description intégrale ajoutée.
  La licence, la visibilité et les droits restent des décisions distinctes d’Alex.
- **Autres branches** : la référence de domaine des anciennes PR React précède les dernières
  corrections de main. Ne pas substituer automatiquement leur moteur au main sécurisé, ni
  remplacer leurs données enrichies par ce modèle plus ancien. Comparaison/adaptation à
  prévoir avant tout raccord ; aucune fonctionnalité de ces PR n’est déclarée abandonnée.

## Validation et suite

Chaque PR reste examinable sans intégrer la suivante. Fusion uniquement après accord
explicite d’Alex. La refonte UI, y compris la maquette de passe d’armes et les fiches v0,
reste hors mission 3 et ne démarre pas maintenant.

## Réalisation 3B — 14 novembre 2026

Alex autorise l’étape après la fusion de 3A. Les fichiers de `src/` deviennent la source
d’édition et `app/simulateur.html` l’artefact généré. Le [guide](SOURCES_ET_BUILD.md)
précise le packaging classique navigateur et la façade Node sans découpe HTML. La
première génération est identique octet pour octet. 3C/3D restent à réaliser ; aucune
API de persistance ou interface de jeu n’est changée par ce déplacement.


## Réalisation 3C — 14 novembre 2026

Autorisation explicite d’Alex après revue de 3B : fusion PR 21 puis branche 3C depuis `a8cbd38`. Service sans DOM, pont compatible, clés et formats inchangés. Les préférences UI restent dans 3D. Voir [bilan](BILAN_3C.md). Pas de fusion automatique de 3C.


## Réalisation 3D — 14 novembre 2026

Après « Continue », branche `architecture/commandes-affichage` depuis `ae4c86a`.
PR dépendante de 3C ; PR 22 non fusionnée. Les ports de commandes synchrones sont
isolés sans réécriture métier ; exports, reprise, protection des actions, dispatcher et
démarrage ont leurs fragments explicites. Préférences isolées, même traitement des
refus. Limites et défaut préexistant : [bilan](BILAN_3D.md). 3E reste à réaliser.
