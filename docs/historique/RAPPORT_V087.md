# Avatar Légendes : Compagnon — V0.87

## Livrable

Première validation de bout en bout **par les contrôles de l'interface** sous Chromium/Playwright. Le moteur et le catalogue restent inchangés depuis la V0.86.

## Nouveau test `test_interface_v087.py`

Le test ouvre la page HTML, utilise les boutons pour ajouter deux PNJ, sélectionne leurs approches, révèle et avance la passe, choisit *Aveuglé par la science*, prépare les effets, passe dans Validation MJ, accepte les propositions, vérifie les fatigues et le statut Gêné, puis clique sur Annuler et vérifie le retour aux valeurs initiales. Il écoute les erreurs JavaScript.

La navigation locale via HTTP et `file://` est bloquée dans l'environnement de test ; la page est chargée par `set_content` et `localStorage` est remplacé par un substitut mémoire **uniquement dans le test**. Ce substitut ne modifie pas le simulateur livré. Ce test ne vérifie donc pas la persistance réelle entre sessions, l'import/export ou l'intégration avec le système de fichiers.

## Résultats exécutés

- 55/55 fichiers `test_*.cjs` réussis sous Node.js.
- `test_navigateur_v086.py` réussi : intégration du moteur dans Chromium.
- `test_interface_v087.py` réussi : parcours de l'interface et annulation dans Chromium.
- `node --check` du script embarqué : réussi.
- Archive ZIP : intégrité vérifiée.

## Limites et suite

- Pas de nouvelle technique automatisée dans cette version ; estimation précédente de 14/102 inchangée et non auditée.
- Étendre les tests d'interface aux rejets partiels, au dépassement de fatigue, aux effets différés et aux sauvegardes.
- Valider la persistance dans un environnement navigateur autorisant un véritable contexte HTTP/HTTPS.
