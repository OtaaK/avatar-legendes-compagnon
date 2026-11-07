# Audit mécanique initial — V0.29

**Source :** *Avatar Légendes, le jeu de rôle officiel*, édition française, PDF fourni ; chapitre 5, p. 151–160 et annexe A, p. 286–293.

## Vérifications établies

- Les trois approches et leur ordre dans le simulateur correspondent aux catégories du livre (p. 151 et suivantes).
- Les PNJ peuvent utiliser `1 + valeur d'équilibre` techniques **au début de la résolution de leur approche** (p. 151). Le moteur calcule le quota au moment de la sélection, mais le modèle ne distingue pas complètement le principe propre au PNJ de la valeur d'équilibre générique : **à approfondir**.
- **Frapper** (p. 159) : sans coût, la cible choisit 2 fatigues, 1 état ou un décalage d'équilibre. Avec 1 fatigue payée par l'attaquant, celui-ci impose 2 fatigues ou 1 état, **pas** un décalage. La V0.28 ne proposait pas l'option payante ; **corrigé en V0.29**, six tests ciblés réussis.
- **Presser l'adversaire** (p. 159) : interdit une approche à la prochaine passe ; le moteur propose cet effet, sans validation automatique de sa cohérence fictionnelle.
- **Renforcé** (p. 155) : efface 1 fatigue à la fin d'une passe ; comportement présent.
- **En danger** (p. 155) : ajoute 1 fatigue au début d'une passe ; comportement présent.

## Anomalies et risques à traiter avant automatisation complète

| Priorité | Point | Constat |
|---|---|---|
| Haute | Statut **Gêné** | Le livre prévoit un choix : payer 1 fatigue ou subir –2 aux actions physiques (PJ) / une technique en moins (PNJ), p. 155. La logique du moteur n'applique pas systématiquement ce choix. |
| Haute | Statut **Avantagé** | Donne une technique de base ou maîtrisée supplémentaire à la passe suivante, même après un échec, p. 155. Le quota courant ne le prend pas entièrement en compte. |
| Haute | **Piégé** / **Étourdi** | Leurs restrictions fictionnelles et coûts de libération (p. 157) ne sont pas tous représentés par le moteur. |
| Haute | Fatigue au plafond | La fatigue est plafonnée à 5 dans `apply`; vérifier le report en états quand toutes les cases sont cochées (p. 155). |
| Haute | Techniques avancées | 102 entrées de métadonnées à examiner individuellement : leurs effets ne sont pas validés ; la plupart déclenchent seulement une note d'arbitrage MJ. |
| Moyenne | Portée / engagement | Le moteur sait cibler un combattant, mais ne modélise pas complètement qui est engagé avec qui et les contraintes de portée (p. 150–151). |

## Matrice de couverture

Le fichier `MATRICE_TECHNIQUES.csv` contient les **102 entrées avancées** : nom, famille, approche, page annoncée, détection indicative du nom dans le texte extrait du PDF, et état de validation. **Une détection de nom ne prouve ni l'exactitude de la page, ni l'effet, ni le prérequis.** Toutes les lignes restent à valider mécaniquement. Les neuf techniques de base sont traitées séparément dans le moteur.

## Tests effectués

- `node test_regles.cjs` : 6 tests ciblés réussis, dont coût de Frapper et absence de faux effet automatique.
- Vérification syntaxique du script intégré : effectuée.

## Limites

Ce rapport est un **premier passage de conformité**, pas une validation des 102 techniques. Les règles liées aux statuts, à la posture, à la maîtrise et aux interactions doivent être vérifiées cas par cas avant d'activer une automatisation complète. Les tests de navigateur et de persistance réalisés sur V0.28 ne sont pas répétés ici ; V0.29 nécessite encore un contrôle visuel et mobile.
