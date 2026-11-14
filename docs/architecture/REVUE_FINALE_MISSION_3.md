# Revue finale avant recette Mac

14 novembre 2026 — après « C’est parti ». Revue de la chaîne 22 à 26 ; aucun accord
ni opération de fusion, aucun déploiement. Le guide et le jeu d’essai complètent la PR 26.

## État constaté sur GitHub

| PR | SHA du code revu | Contrôles JS / navigateur | Fusion |
|---|---|---|---|
| 22 | `ae4c86a` | Réussis / réussis | Non |
| 23 | `b337017` | Réussis / réussis | Non |
| 24 | `3bfd3f3` | Réussis / réussis | Non |
| 25 | `49ed8a2` | Réussis / réussis | Non |
| 26 | `1b884dc` | Réussis / réussis | Non |

Les cinq PR sont en brouillon et annoncées sans conflit avec leur parente. Cela ne
remplace pas les contrôles à refaire après chaque changement de base lors d’une future
intégration autorisée. Les nouveaux documents et le jeu d’essai ne modifient aucun fichier
de l’application ; la CI de cette livraison sera également contrôlée avant le bilan.

## Points revus et conclusion

- Stockage : mêmes clés/chaînes, validation du journal, ordre des deux écritures,
  restauration sur refus et notifications. Les 58 comparaisons avec la version antérieure
  ont été réexécutées sur l’état final et sont identiques.
- Commandes : mêmes frontières, refus et restauration, transaction externe unique pour
  les appels imbriqués, absence d’écriture de combat sans changement. Les 36 comparaisons
  exactes avec l’ancienne version ont été réexécutées et sont identiques.
- Démarrage : ordre de reprise/chargement, protection des commandes, listeners dans leur
  ordre relatif, premier affichage et préférences ; styles et balisage conservés.
- Tests : vérification cumulée depuis 3D : 181 scripts migrés conservent leurs corps ou
  régions de scénarios et assertions ; les 16 autres anciens scripts sont intacts.
  Un nouveau script vérifie le helper de fixtures. Le contrôle cumulatif tient compte
  des assertions accolées à l’ancienne déclaration `C` : comparer leurs lignes entières
  sans isoler le préambule aurait produit un faux écart.
- Distribution : build `--check` réussi, HTML inchangé depuis 3D, SHA-256
  `41a5e5fe1a226bb5c621c753411e70ef3145d2dfbee61e9d613a9b267622609e`.

**Aucune régression bloquante identifiée dans cette revue.** Ce constat s’appuie sur les
comparaisons et parcours couverts, pas sur une preuve d’absence de tout défaut. Les 238
scripts de la branche finale étaient réussis ; les contrôles du HTML et l’oracle de
parité restent volontaires. Aucun contrôle de conformité aux règles supplémentaires.

## Jeu et parcours de recette

`tests/fixtures/recette-architecture.json` contient uniquement des données fictives :
un PJ, un PNJ situé au Village de recette, combat vide. Les fiches utilisent les valeurs
de modèle existantes ; elles servent à la recette technique. Aucun portrait personnel,
description privée de technique, PDF ou donnée de campagne réelle n’est fourni.
Un champ inconnu de bibliothèque sert au contrôle du véritable export/réimport.

Le fichier passe les vrais imports/validateurs du domaine et les liens restent valides.
Le parcours du [guide Mac](RECETTE_MAC.md) a été exécuté dans Chromium sur 1280×900 et
390×844 : import via l’interface, fatigue/rechargement, copie indépendante, annulation,
nom/lieu PNJ, création PJ par assistant et PNJ par invite, vrai téléchargement d’export,
modification puis réimport de cet export, recherche/filtre/détail et interactions hors réseau.
Le champ inconnu de bibliothèque est conservé après export/réimport.

Le menu des familles doit être refermé avant d’ouvrir une carte du catalogue ; cette
étape est précisée dans le guide. Aucune modification de l’interface pour cette recette.

## Livrable et validation encore attendue

Le paquet local de recette contient l’HTML exact, le guide et le JSON fictif ; aucune
archive binaire n’est ajoutée au dépôt et aucune nouvelle action/dépendance CI n’est
introduite. L’archive GitHub du commit fournit également ces mêmes sources et fichiers.
L’application reste autonome et ne dépend pas du guide ou du JSON après chargement.

Le double-clic/local `file://` sur Mac reste **à vérifier par Alex** : l’environnement
cloud le bloque. Les essais automatisés ci-dessus utilisent HTTP local, puis passent
hors réseau pour les interactions ; ils ne certifient pas le rechargement local du Mac.
Le défaut préexistant de retour au sous-onglet Combattants reste signalé dans le guide.

Recommandation : faire les six contrôles en fenêtre Chrome privée, transmettre les
résultats, puis décider de la fusion des PR dans l’ordre. La recette ne fusionne rien
automatiquement et ne démarre pas l’intégration React/v0.
