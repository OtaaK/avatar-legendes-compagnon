# Progression et évolutions

## Questions de fin de séance

Trois thèmes généraux (p. 212–213) : connaissance significative du monde ; menace dangereuse ou problème communautaire résolu ; aide vers l’équilibre ou fin à son centre. Ils demandent une réponse discutée, sans déduction automatique depuis les événements du logiciel.

Chaque Livret ajoute son propre thème, reformulé ci-dessous :

| Livret | Thème de la question propre | Page |
|---|---|---|
| L’Audacieuse / L’Audacieux | Reconnaître sa vulnérabilité ou une erreur et l’intérêt d’un conseil ignoré. | 173 |
| La Fripouille | Amener un ami à pratiquer ou approuver une de ses mauvaises habitudes. | 177 |
| La Gardienne / Le Gardien | Poursuivre aussi un désir ou objectif personnel en protégeant autrui. | 181 |
| L’Héritière / L’Héritier | Découvrir un élément important sur sa lignée ou son influence. | 185 |
| L’Icône | Réaliser un exploit digne de son rôle et de sa tradition. | 189 |
| L’Idéaliste | Améliorer la vie d’une communauté ou aider une personne ordinaire en difficulté. | 193 |
| L’Inflexible | Demander conseil ou soutien à autrui. | 197 |
| Le Marteau | Avancer vers son objectif contre son adversaire. | 201 |
| Le Pilier | Aider un compagnon à remporter une victoire personnelle importante ou conduire une réussite collective. | 205 |
| Le Prodige | Remercier un compagnon pour sa présence, son soutien ou son enseignement. | 209 |

## Évolutions repérées

| Option générale | Validation préparée | Décisions encore manuelles |
|---|---|---|
| Manœuvre de son Livret | Référence connue, du bon Livret, non déjà choisie | Deux cases disponibles au total ; effets et acquisition à confirmer |
| Manœuvre d’un autre Livret | Référence connue, étrangère, non déjà choisie | Deux cases disponibles au total ; pas de spécificité accordée |
| +1 caractéristique | Caractéristique connue, valeur actuelle inférieure à +2 | Répétable jusqu’aux plafonds ; aucune augmentation par le service de proposition |
| Centre d’équilibre | Direction d’un cran, détection de dépassement | Deux cases ; traitement fictionnel de la transition p. 222–223 |
| Moment d’équilibre | Proposition explicite | Deux cases ; la seconde seulement après utilisation du premier déblocage |

Source : p. 214. La disponibilité des cases déjà utilisées ne peut pas être inférée des anciennes notes libres. Chaque proposition indique donc cette vérification nécessaire et reste `pending`, `applied: false`. Les usages ne sont pas comptés comme des évolutions accordées.

## Différences entre Livrets

Les dix Livrets ont des questions et spécificités distinctes. Les cinq bonus de manœuvre jusqu’à +3 ne sont pas confondus avec l’évolution générale plafonnée à +2 : Gardien/Concentration, Héritier/Créativité, Icône/Concentration, Inflexible/Enthousiasme, Pilier/Harmonie. Le Prodige a une préparation de techniques différente. Aucun ensemble exclusif d’évolutions supplémentaires n’est confirmé ; cette réserve existe dans chaque ligne de référence.

## Compatibilité avec le suivi Codex

`BookState` conserve les cases 0–4, le moment `unknown/locked/unlocked` et les notes par nom exact de Livret, y compris personnalisé. Une correction manuelle peut conserver quatre cases indéfiniment ; rien ne les consomme, n’attribue de bonus, n’ajoute de manœuvre ou ne débloque un moment. Un nouveau PJ préparé commence à zéro et avec un moment verrouillé (p. 122) ; aucun état ancien n’est réinitialisé.

Le changement de Livret en campagne exige une procédure distincte (p. 222–223). Les caractéristiques, techniques et manœuvres sont conservées ; les échanges sont facultatifs et décidés un pour un. Les principes et la spécificité changent ; les traitements des évolutions et de la progression nécessitent un aperçu explicite. **Le service ne l’exécute pas encore** : il produit les décisions à résoudre et une copie intégrale de la fiche. Un simple préréglage de création ne convient pas à cette opération.

## Ambiguïté du livre à faire trancher avant automatisation

P. 208, le texte de Don extraordinaire exclut l’apprentissage auprès d’un professeur à Communauté +0 ou moins, tandis que son explication admet « au moins +0 » et emploie « Compagnie ». Les seuils divergent à zéro. Aucun apprentissage ni interprétation de ce seuil n’est codé.

Au-delà de la jauge du centre, p. 222 prévoit notamment une transition vers un seul principe avant un changement de Livret ; cela ne signifie pas une retraite automatique. Le modèle extrait n’accepte pas ce régime à un seul principe. Les propositions signalent cette limite, sans borner silencieusement un centre à ±3 ni enregistrer ±4.
