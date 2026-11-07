# V1.42 — Validation Chromium de Désarmement

- Test navigateur dédié au formulaire de **Désarmement** : présence de la confirmation MJ, choix de technique, proposition et validation des effets.
- Vérification du coût de 2 fatigues et de l’interdiction de technique sur la cible.
- Pas de nouvelle technique : livraison de fiabilisation de l’interface.
- Limites conservées : la rencontre correspond à la scène ; persistance après fermeture réelle non vérifiée.

## Régressions
- 101/101 tests Node.js réussis ; test Chromium V1.42 réussi ; syntaxe JavaScript valide.
- Correction du test d’audit historique : les techniques déjà validées ne doivent plus être considérées non validées.
- Complément de l’audit Désarmement : liste des mécaniques renseignée.
