# V1.25 — Couche de vérification Chromium

## Réalisation
- Ajout de `test_chromium_v125.py` (Playwright Python + Chromium), exécutable depuis le dossier principal.
- Tests dans un vrai moteur Chromium : chargement HTML, navigation Accueil → Personnages, création PJ, catalogue et recherche « Onde de choc », ouverture du combat, ajout PJ/PNJ, navigation des onglets, sélecteurs de techniques et absence d'erreurs JavaScript non interceptées.
- Correction du titre de fenêtre obsolète V0.81 → V1.25. Aucun changement des règles de combat dans cette version : la priorité a été donnée à la fiabilisation demandée.

## Résultats exécutés
- Chromium : 1 scénario de parcours multi-étapes réussi, moteur Chromium système `/usr/bin/chromium` avec Playwright.
- Node.js : 87 fichiers `test_*.cjs` exécutés, 87 réussis.
- Script JS embarqué : contrôle de syntaxe réalisé.

## Limites importantes
- L'environnement de test interdit les navigations vers `file://` et vers une origine HTTP locale. Le HTML a été injecté dans Chromium avec `page.set_content()` ; `localStorage` a été remplacé **uniquement dans le test** par un stockage en mémoire. Le fichier HTML livré reste autonome et inchangé sur ce point.
- La persistance réelle après rechargement et fermeture n'est PAS validée par ce test. L'import/export JSON n'est pas testé dans Chromium. Le scénario ne couvre pas encore un cycle complet d'approbation MJ par clics ni toutes les techniques.
- Il ne faut pas confondre ce test d'interface avec un test complet de compatibilité navigateur.

## Suite
- Ajouter des scénarios Chromium de validation/refus/annulation et de sauvegarde réelle dès qu'un contexte navigateur avec origine autorisée est disponible.
- Reprendre les techniques de l'Air par lots après stabilisation de cette couche de vérification.
