# V2.33 — correctifs après recette manuelle

Date : 7 novembre 2026. Retours du propriétaire : Google Chrome sur MacBook.
Base des correctifs : `f0dcaea`, après la réorganisation et la préparation de la notice.
Branche : `maintenance/organisation-v233`, PR nº 1, sans fusion dans `main`.

## Demandes et corrections

| Retour | Cause / constat | Résultat |
|---|---|---|
| Fatigue du formulaire et récapitulatif incohérents | Le bouton +/− changeait le champ de saisie, mais pas la barre supérieure. | Fatigue, équilibre et nom sont reflétés immédiatement dans le récapitulatif, sans enregistrer silencieusement le brouillon. |
| Pas de confirmation après « Enregistrer la fiche » | L'écriture et le rafraîchissement se terminaient sans retour visible. | Fenêtre « Fiche enregistrée. » après une écriture réussie uniquement. Pas de fenêtre de succès pour les sauvegardes internes ni en cas d'échec. |
| Carte PJ visible aussi dans PNJ | Le modèle filtrait correctement les types, mais le CSS `display:grid` prenait le dessus sur l'attribut `hidden` de la grille PJ. | La grille masquée ne s'affiche plus. Aucun personnage supprimé ou reclassé, aucune migration des données. |
| Fiches PNJ inutilisables dans Combat | Les anciens boutons d'ajout existaient dans une liste masquée. | Bouton visible « Ajouter au combat » sur la fiche et sélecteur « Ajouter une fiche de Personnages » dans Combat. Une seule copie liée par fiche est autorisée, comme auparavant. |
| PNJ rapides non modifiables | Aucun éditeur n'était proposé sur les combattants créés par + PNJ. | Bouton « Modifier le combattant » : nom, fatigue, équilibre, matériels, états et statuts, avant la révélation des approches. |

## Protection des données et périmètre

- Les fiches permanentes et les copies de combat restent distinctes. Modifier le combattant
  n'écrase pas la fiche ; « Ouvrir la fiche » permet de consulter/modifier celle-ci, et
  « Reporter sur la fiche » conserve sa confirmation existante pour les ressources.
- L'édition du combattant est limitée à la phase de déclaration, sans action/proposition en
  attente. Un changement de statuts invalide sa déclaration antérieure pour la refaire proprement.
- Les champs utilisent les contraintes déjà présentes dans le modèle. Les identifiants, types et
  liens de fiche ne sont pas éditables. Les statuts maintenus par un effet actif de Terre restent
  protégés ; leur retrait passe par les commandes existantes de l'effet.
- La modification forme une transaction sauvegardée et annulable. Une erreur de validation,
  d'historique ou de stockage restaure l'état précédent, y compris les instantanés disponibles.
- La disponibilité des techniques, leurs coûts et effets, le catalogue et les données d'audit
  ne changent pas. Les fonctions de combat existantes sont conservées ; l'API reçoit seulement
  les deux fonctions d'édition/validation de préparation.
- Il ne s'agit pas d'une refonte générale UI/UX. Cette dernière reste un chantier séparé à cadrer
  avec le propriétaire.

## Vérifications

- Reproduction préalable : formulaire fatigue=1 et récapitulatif=0/5 ; grille PJ visible dans PNJ ;
  boutons d'ajout de fiche masqués ; aucun bouton d'édition du combattant.
- 190/190 scripts JavaScript réussis, dont `tests/js/test_retours_recette_v233.cjs` : 21 scénarios
  d'édition, validations, identité protégée, statuts maintenus par les effets, échec tardif et undo.
- 36/36 scripts navigateur réussis ; restriction locale `file://` déjà documentée dans le test
  hors réseau, sans nouvel échec applicatif.
- `tests/browser/test_retours_recette_v233.py` : 4 parcours réels desktop/mobile, sauvegarde réussie
  et refusée, filtre après création via l'assistant PJ, ajout d'une fiche par les deux accès visibles,
  copie indépendante, modification d'un PNJ rapide, annulation, rechargement et échec de persistance.
- Vérification visuelle de la fenêtre d'édition en 1280×900 et 390×844 ; absence de débordement
  horizontal contrôlée aussi dans le test de régression.
- Fonctions existantes du moteur de combat, modèle des fiches, catalogue et audit comparés à la
  base `f0dcaea` ; aucun changement de mécanique de technique. Vérification syntaxique et du diff.

Les tests locaux utilisent Chromium sous Linux : ils ne remplacent pas le retest du propriétaire
sur Chrome/macOS. La vérification d'identité du HTML de la maintenance s'applique au commit
`67273e0`, avant ces correctifs fonctionnels autorisés ; elle n'est pas réinterprétée comme une
preuve d'identité du HTML courant.

## Retest sans commande

Télécharger de nouveau le HTML depuis la PR et vérifier la mention
**« V2.33 · correctifs de recette »**. Suivre `docs/RECETTE_MANUELLE_V233.md` :

1. Ressources : +1 fatigue met immédiatement à jour le récapitulatif ; enregistrer affiche la confirmation.
2. Création PJ : sa carte reste uniquement dans l'onglet PJ.
3. Fiche PNJ : « Ajouter au combat » reprend le nom et les ressources de la fiche.
4. Combat avant révélation : « Modifier le combattant » permet une modification, puis son annulation.
5. Recharger et vérifier que les données enregistrées sont conservées.

La PR reste en brouillon. Aucune fusion sans validation explicite du propriétaire.
