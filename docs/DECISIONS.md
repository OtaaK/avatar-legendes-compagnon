# Décisions de conception

## 2026-11-07 — Base de référence V2.32

- Préserver le comportement applicatif avant de refactoriser.
- Conserver les tests historiques et les rapports dans le dépôt.
- Ne pas publier le PDF commercial du livre de règles.
- Considérer la conformité exhaustive des techniques de Terre et les tests navigateur comme travaux ouverts.

## 2026-11-07 — V2.33 : corrections après audit Terre

### Règles appliquées

- Le PDF fourni sert de référence documentaire : techniques p.289, fatigue p.100, statuts p.155–157. Il n'est pas ajouté au dépôt.
- Un coût volontaire de Terre ne se convertit pas en états. La fatigue involontaire conserve sa conversion. Le coût net tient compte des réductions approuvées.
- La gêne de Mouvements tectoniques couvre la prochaine passe, conformément au report des effets mécaniques des nouveaux statuts p.157 ; elle expire ensuite. Le comportement des événements temporaires des autres techniques reste inchangé.
- Une Frappe supplémentaire de Boue est une attaque ordinaire pour les protections et réactions ; seule sa disponibilité échappe au quota et à l'approche habituels.
- Un paiement de résistance ne constitue pas une attaque. Un désengagement faisant partie d'une attaque est neutralisé lorsque cette attaque est bloquée.

### Décisions ouvertes — comportement antérieur conservé

| Sujet | Comportement conservé | Décision nécessaire |
|---|---|---|
| Gantelet : état ou fatigue | Choix saisi comme choix de la cible | Le texte p.289 ne nomme pas explicitement le décideur. |
| Tectoniques : branche Étourdi | Retrait selon fiction, sans échéance automatique | Déterminer l'articulation entre « pendant une passe » et la durée narrative d'Étourdi. |
| Lave : attaque sans conséquence offensive | Fracasser exige une conséquence offensive réelle résolue | Déterminer si une attaque bloquée ou sans dégâts suffit. |
| Escalier : annulation tardive | Choix de résistance pendant la proposition | Définir une éventuelle fenêtre d'annulation après activation. |
| Projection : retour au sol | Retour narratif, pas de réengagement automatique | Le MJ décide des liens au retour ; aucune restauration identique n'est inventée. |
| Cumul de Boucliers | Plusieurs effets peuvent protéger une cible | Préciser le nombre de boucliers et de blocages autorisés. |
| Entraves : libération narrative | Dérogation MJ explicite disponible | Assumer l'exception ou limiter aux deux motifs du texte (maîtrise du métal / fin de combat). |

### Compatibilité et périmètre

- Clés de stockage et format JSON existants conservés. Les exports portent V2.33.
- Les anciens tests restent conservés ; seules les attentes réglementaires erronées et les assertions d'interface périmées sont adaptées.
- Aucune migration automatique des anciens indicateurs ambigus de provenance ; arbitrage MJ si un avantage indépendant ne peut pas être distingué d'une ancienne source de Terre.
- Les coûts des autres familles ne sont pas déclarés conformes par ce chantier.

## 2026-11-07 — Maintenance de structure, sans changement fonctionnel

- V2.33 locale sécurisée avant toute réorganisation : archive du répertoire, bundle Git,
  puis commit de conservation sur une branche dédiée. Référence : `backup/v233-before-maintenance`
  (`d247193`). `AGENTS.md` récupéré depuis GitHub et synchronisé sans remplacer le travail local.
- Application conservée dans `app/simulateur.html`, strictement identique à ce point de départ.
  Aucun arbitrage de règles, changement d'ergonomie ou de données utilisateur pendant cette mission.
- Tests séparés en `tests/js/` et `tests/browser/`, matrice dans `data/`, outillage dans `scripts/`.
  Les assertions des 223 tests historiques sont conservées ; seuls leurs chemins et la localisation
  de Chromium changent. Un nouveau test vérifie l'utilisation hors connexion et le réimport JSON.
- Tous les rapports historiques sont conservés. L'ancien accueil V0.71 devient
  [docs/historique/README_ORIGINAL_V071.md](https://github.com/OtaaK/avatar-legendes-compagnon/blob/avant-nettoyage-2026-11-13/docs/historique/README_ORIGINAL_V071.md) et un index contextualise les archives.
- Les deux exemplaires du rapport V2.32 restent conservés ; les fonctions sans appel statique
  identifié ne sont pas supprimées faute de preuve suffisante d'inutilité.
- Modularisation du HTML évaluée et reportée à une mission distincte : conserver un HTML autonome
  généré si des sources séparées sont introduites ultérieurement. Aucune dépendance d'application
  ni étape de compilation ajoutée.
- Une Pull Request doit distinguer les changements V2.33 déjà présents localement et la maintenance
  non fonctionnelle effectuée ensuite. Aucune fusion dans `main` sans accord du propriétaire.

## 2026-11-07 — Retours de recette Chrome/macOS

- Le propriétaire demande le rafraîchissement du récapitulatif de fatigue, une confirmation
  d'enregistrement, la séparation visuelle PJ/PNJ et l'accès aux PNJ depuis Combat.
- Le récapitulatif reflète le brouillon du formulaire ; le bouton Enregistrer conserve son rôle.
  La confirmation est un message de succès après sauvegarde, sans dialogue supplémentaire pour
  les enregistrements internes.
- Les cartes PJ mal masquées sont un défaut d'affichage, pas un doublon à supprimer des données.
- L'ajout d'une fiche au combat reprend une copie liée ; les ressources de la fiche ne sont pas
  écrasées automatiquement par les modifications du combat.
- Un éditeur ciblé permet de modifier les combattants pendant la déclaration, sans action en
  attente ; il conserve les statuts dépendant d'un effet actif et l'annulation transactionnelle.
- Ces correctifs fonctionnels sont distincts de la réorganisation sans changement de HTML au
  commit `67273e0`. Les règles et les techniques ne sont pas modifiées.
- La refonte UI/UX générale évoquée par le propriétaire est à cadrer dans une mission ultérieure.

## 2026-11-07 — Fiabilité des imports, avant la refonte UI/UX

- Poursuivre le développement par une correction ciblée de fiabilité ; conserver les écrans,
  les règles, les clés de stockage et les formats d’export existants.
- Refuser les références d’engagement/piège incohérentes ; accepter encore les champs
  optionnels absents ou nuls et les identifiants de piège anciens non vides.
- Effectuer le rendu avant la persistance des données importées. En cas d’échec, rétablir
  les modèles précédents ; conserver le journal existant pour la sauvegarde complète.
- Aucun nettoyage ni migration silencieuse de sauvegarde ; aucune fusion de cette nouvelle
  proposition sans accord du propriétaire.

## 13 novembre 2026 — mission 0 : collaboration

Alex demande une PR courte de consignes, puis une PR de sécurité indépendante. Base vérifiée : main `42b306f`. Les PR de convergence restent préservées. Aucune fusion, suppression ou nouvelle refonte autorisée par cette mission. Les décisions de licence, visibilité et reproduction restent ouvertes.

## 13 novembre 2026 — mission 1 : sécurité des imports

Défaut reproduit indépendamment dans Chromium sur main `42b306f`. Format technique strict pour les identifiants (ASCII alphanumérique, tiret/souligné, 1–120 caractères, début alphanumérique), sans renommage silencieux ; données séparées du code des événements. Aucun changement de règle, de catalogue ou de dépendance. Refus explicite des anciens identifiants hors format ; fichiers et stockage originaux conservés. Les branches de convergence restent à contrôler avant report. Licence/visibilité/droits restent à décider par Alex. Rapport : [sécurité des imports](securite/IMPORTS_IDENTIFIANTS.md).

## 13 novembre 2026 — mission 2 : inventaire avant accord

Alex autorise la préparation de l’inventaire après fusion des PR 17/18. Étiquette annotée `avant-nettoyage-2026-11-13` publiée sur `38943c5` avant le travail. Proposition : garder 254 fichiers d’origine ; archiver dans Git 278 chemins (275 archives, ancien inventaire, deux récits V2.33) ; retirer deux helpers sans appel identifié. **Aucun retrait ni déplacement autorisé à ce stade.** Le plan et le CHANGELOG sont proposés, les 230 scripts restent en place. L’accord sur le plan et l’accord de fusion seront distincts. Licence, visibilité et droits restent ouverts ; mission 3 et UI en attente. Voir [le plan](maintenance/nettoyage/PLAN.md).

## 13 novembre 2026 — autorisation d’exécuter le nettoyage

Alex répond « oui » à la question précise d’exécution du plan dans la PR 19, sans fusion.
Les 278 chemins de l’inventaire peuvent être retirés de la copie courante, originaux
conservés sous l’étiquette ; seuls openNpc et showPlaybookReference sont retirés du code.
Les 230 scripts restent à leur place et toutes les assertions sont conservées ; seule
la commande du commentaire du test Terre change. Retour arrière par restauration ou
annulation de commit. Aucun accord de fusion, de mission 3, de refonte ou de licence
n’est déduit de cette autorisation. [Bilan](maintenance/nettoyage/BILAN.md).

## 13 novembre 2026 — mission 3 autorisée, étape 3A

Après fusion des PR 17, 18 et 19, Alex autorise la suite (« En avant »). Départ main `55d56f6`. Plan en cinq étapes, avec persistance et affichage isolés en PR distinctes. 3A : contrats observés et banc de tests transitoire uniquement ; aucune modification du HTML, des anciens tests, règles ou sauvegardes. Node/Python standard, coût de dépendances ajoutées : zéro. Référence API/identifiants/clefs et comparaison du même scénario Node/Chromium ; repères textuels encore présents, pas de modularisation déjà annoncée. Mutations internes non toutes transactionnelles et métadonnées d’enveloppe non garanties sont signalées, sans correction cachée. Fusion et refonte UI non autorisées. [Plan](architecture/PLAN_MISSION_3.md).
