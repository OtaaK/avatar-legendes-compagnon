# Bilan — préparation Livrets, Manœuvres et Évolutions

**11 novembre 2026 — V2.33, lot sans interface.**

Le socle préparatoire est réalisé sur `convergence/preparation-livrets`, depuis
`convergence/lot3-lieux` au commit `e38f240b904dd5915e79a8c46c2999e937b73a8a`.
Le Lot Lieux est fonctionnel selon ses contrôles automatiques ; cela ne remplace pas
une validation visuelle du propriétaire. Les PR 3 à 15 restent ouvertes en brouillon,
non fusionnées au moment du contrôle. Les contributions de ces branches sont déjà
présentes dans cette base ; aucun ancien lot n’a été remplacé.

## Livrables

| Livrable | Résultat |
|---|---|
| [Matrice des dix Livrets](MATRICE_LIVRETS.md) | Principes, spécificités, nombres de choix, techniques proposées et réserves par Livret |
| [Inventaire des 50 manœuvres](MANOEUVRES.md) | Identifiants stables, noms, pages et dépendances structurelles repérées |
| [Progression et évolutions](PROGRESSION_EVOLUTIONS.md) | Trois thèmes communs, dix thèmes propres, cinq familles d’évolution, limites et ambiguïtés |
| [Contrats de création PJ](CONTRATS_CREATION.md) | Suggestions → choix → candidat validé → confirmation → transaction |
| [Compatibilité](COMPATIBILITE.md) | Anciennes sauvegardes, inconnus, retours arrière et limites |
| Modules indépendants de React | Référence, brouillons/validations et adaptateurs transactionnels, avec déclarations TypeScript |
| Tests réutilisables | 25 scénarios ajoutés ; suite de convergence portée de 61 à 86 tests |

Aucun fichier ancien n’est supprimé. Aucun écran Personnages, formulaire, bibliothèque,
lieu ou moteur de combat n’est modifié. Aucun PDF, texte intégral ou extraction privée
n’entre dans les commits ou les artefacts.

## Informations vérifiées

Le PDF fourni est accessible et lisible localement. Vérifications : création p. 114,
118, 120–124 ; dix Livrets p. 171–209 ; progression/évolutions p. 212–214 ; changement
de Livret et transitions p. 222–223. Les pages sont celles imprimées dans le livre.

Les noms, principes, caractéristiques de départ, spécificités, nombres de choix,
manœuvres, thèmes d’histoire/progression et techniques de Livret sont repérés. Les
questions sont de **brèves reformulations**, pas des citations complètes. Les bases de
caractéristiques viennent du module Codex extrait `Playbooks`, jamais d’une autre table
utilisée comme second moteur.

Les listes exhaustives d’options des spécificités et les textes des manœuvres ne sont
pas embarqués. Les cardinalités de choix sont contrôlées ; la conformité de chaque
libellé d’option doit être vérifiée explicitement avec le livre. L’inventaire ne certifie
pas les coûts/résultats et interactions de chacune des 50 manœuvres. Les dépendances
structurelles particulières sont signalées sans créer un moteur de résolution.

## Comportements préparés

- Chaque personnage garde ses propres choix. Les manœuvres anciennes/personnalisées
  restent des noms libres ; elles ne deviennent pas une configuration globale.
- Le changement de Livret actif d’un brouillon conserve les autres choix et les champs
  inconnus. Les suggestions ne sélectionnent aucune manœuvre ni technique à la place
  du joueur. Les dépendances invalides empêchent de produire un candidat.
- Les préréglages et cinq bonus passifs connus sont préparés uniquement après les choix
  explicites. Les options de manœuvre avancées et les techniques restent signalées
  comme incomplètement opérationnelles ; leur acceptation demande une confirmation.
- Le nouveau PJ préparé commence au centre, à zéro progression et avec un moment
  verrouillé. L’enregistrement crée son identifiant uniquement dans la transaction.
- Le suivi existant `BookState` est réutilisé pour les cases 0–4, moments et notes par
  nom de Livret, y compris historique/personnalisé.
- L’ajout/retrait corrigé de manœuvres requiert une décision motivée, un aperçu et une
  confirmation. Les listes avant/après sont journalisées ; aucun effet de manœuvre
  n’est appliqué ou retiré automatiquement sur une fiche existante.
- Une évolution préparée est **une proposition non appliquée**, avec les décisions à
  vérifier. La journaliser n’accorde rien et ne consomme jamais quatre cases.
- Le changement de Livret en campagne produit un plan de décisions seulement :
  l’application opérationnelle attend son propre aperçu et les arbitrages requis.
- Quota, refus, annulation avant confirmation, plan falsifié, ancienne révision ou
  extension future inconnue ne provoquent pas d’écrasement. Une erreur de stockage
  permet un nouvel essai sans perte de brouillon ni consommation d’identifiant.
- Les techniques préparées restent dans les métadonnées de choix ; le champ métier
  `techniques` ne reçoit aucune attribution. La copie de combat reste indépendante.

## Vérifications

| Contrôle | Résultat local |
|---|---|
| 243 scripts historiques JS et navigateur | 243 réussis, aucun échec |
| Tests de convergence | 86 réussis, dont 25 nouveaux |
| Contrats TypeScript du nouveau service | Vérifiés par `npm run test:playbooks` |
| Extraction des corps métier | 13 modules inchangés |
| Inventaire | 107 fonctions publiques, 112 handlers historiques recensés |
| Parité historique/extraction | 198 scripts réussis, 8 111 appels publics |
| Construction du HTML React | Réussie ; identique octet pour octet à la base `e38f240` |
| Parcours React/navigation, Personnages, bibliothèque et Lieux | Réexécutés aux quatre résolutions existantes ; résultats détaillés dans les rapports locaux et CI |

Les tests nouveaux couvrent les dix Livrets et leurs choix, les cinq bonus passifs,
Connaissance du monde, les références/quantités de techniques, les choix inactifs et
inconnus, annulations/refus/erreurs de validation, erreurs de quota, plans périmés ou
étrangers, enregistrement/rechargement/export/import, ancien historique et absence de
récompense automatique. Aucun nouveau parcours visuel n’est inventé pour des modules
qui ne sont pas encore raccordés.

Résolutions : 1440×1024, 1280×800, 768×1024 et 390×844. Le cloud bloque `file://` : le
double-clic natif sur Mac n’est pas testé ici. Le démarrage du document embarqué,
l’utilisation et la persistance hors réseau sont contrôlés par les parcours existants.
Il ne faut pas présenter ce contrôle comme une nouvelle recette sur Safari/macOS.

Empreinte du HTML React, base et branche :
`05f8614cc72189d8903328dc5b3dba270a96fc87a632fef7b39df98ea25e61e8`.
Empreinte de l’ancien HTML inchangé :
`69f8ddb8e86f01bcc7138c3c2cb9645742aaff2f7b3d6081267b612b11c491bb`.
Les extractions privées restent dans `work/`, ignoré par Git et exclu des artefacts de ce lot.

## Décisions et travaux avant raccordement à v0

1. **Règle ambiguë à arbitrer si automatisée :** seuil d’apprentissage du Prodige à
   Communauté zéro, contradictoire à l’intérieur de la p. 208. Aucun choix imposé ici.
2. **Création du groupe :** résoudre les références vers un autre PJ pas encore créé
   (Gardien/Inflexible), sans personnage fictif ni identifiant temporaire persistant.
3. **Ergonomie future :** confirmer quels champs de création peuvent rester provisoires
   et à quel moment demander les vérifications du joueur/MJ. Le contrat complet actuel
   n’est pas imposé aux écrans existants et ne bloque aucun import ancien.
4. **Évolutions déjà jouées :** choisir une reprise explicite des anciens historiques
   libres avant tout contrôle automatique des cases utilisées. Une proposition n’est
   jamais considérée comme une évolution acquise.
5. **Changement en campagne :** concevoir l’aperçu des nouveaux principes, spécificités,
   échanges facultatifs, progression et évolutions p. 222–223. Ne pas le réduire à une
   modification du nom du Livret ou à un préréglage de création.
6. **Fonctions ultérieures :** décider séparément des effets de spécificité/manœuvre,
   de l’entraînement secondaire en combat et de l’attribution/maîtrise des techniques.
   Les réserves, alliés et effets fictionnels ne sont pas inventés dans ce lot.

La prochaine étape recommandée est l’examen de ces contrats avec les nouvelles fiches
v0. **Aucune intégration visuelle, aucun autre lot, aucune fusion ni aucun déploiement
ne commence sans nouvelle autorisation.** Le prototype visible n’a pas changé : il
n’y a donc pas de nouveau fichier HTML à faire retester pour ce lot préparatoire.
