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
