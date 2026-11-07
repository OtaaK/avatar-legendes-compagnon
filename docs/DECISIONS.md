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
  `docs/historique/README_ORIGINAL_V071.md` et un index contextualise les archives.
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
