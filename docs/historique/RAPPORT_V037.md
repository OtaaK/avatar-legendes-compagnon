# V0.37 — Récupération des imports complets

## Changements
- Journal de restauration `avatar-complete-import-journal-v1` enregistré avant modification des deux clés de sauvegarde (fiches et combat).
- En cas d'échec, tentative de restauration des deux anciennes valeurs ; si l'échec persiste, le journal est conservé pour récupération au démarrage suivant.
- Récupération automatique au chargement avant lecture des données ; message visible si récupération effectuée.
- Si la récupération échoue, les écritures habituelles sont bloquées pour éviter d'écraser les données en attente de récupération.
- Import complet toujours soumis à validation et confirmation préalable.

## Vérifications
- 53 tests automatisés réussis (46 précédents + 7 nouveaux tests sur les imports).
- Les nouveaux tests couvrent import réussi, échec première/seconde écriture, reprise après interruption, échec de restauration et journal invalide.
- Chromium headless tenté avec 14 s de délai : expiration sans DOM ; **validation navigateur non acquise**.

## Limites
- Le stockage local du navigateur n'offre pas de transaction atomique native : le journal garantit une stratégie de récupération, pas une garantie matérielle contre toute perte de données.
- Si l'espace de stockage est définitivement inaccessible, la récupération attend le retour du stockage ; conserver les exports JSON.
- Les effets de 102 techniques avancées restent à auditer individuellement à partir du livre officiel.
- Test réel de persistance après fermeture et réouverture du navigateur encore à effectuer.
