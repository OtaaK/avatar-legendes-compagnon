# Tester la bibliothèque sur Mac — sans commande

Dans la PR Bibliothèque, ouvrir le contrôle **Convergence React — Bibliothèque**, puis le
résumé réussi. Télécharger l'artefact **avatar-legendes-bibliotheque-portable**, décompresser
et ouvrir `dist/companion/index.html` avec Chrome. Aucun outil à installer. Artefact disponible
30 jours ; le workflow peut le reconstruire.

1. Ouvrir **Techniques** : le compteur doit indiquer 111. Choisir chaque famille : Base 9,
   Universelles/Groupe/Eau/Terre/Feu/Air 13 chacune, Armes/Technologie 12 chacune.
2. Tester une approche seule, puis Feu + Avancer et attaquer, puis rechercher « feu ».
   Les critères doivent se combiner sans s'effacer mutuellement. Tester « ÉTOILE » et
   « etoile », une recherche sans résultat, puis Réinitialiser les filtres.
3. Cliquer sur le titre, la famille, l'icône ou le fond d'une carte : même fenêtre détaillée.
   Les cartes montrent seulement famille, nom et approche. Tester aussi Entrée et Espace.
4. Dans la fenêtre, vérifier famille/nom/approche/description. Fermer par Échap ou la croix :
   le focus doit revenir à la carte. Tab et Maj+Tab doivent rester dans la fenêtre ouverte.
5. Réduire la fenêtre : les boutons se réorganisent, les approches restent lisibles en entier,
   sans défilement horizontal de la page. La modale peut défiler en gardant sa fermeture accessible.
6. Couper le Wi-Fi, fermer puis rouvrir le même HTML : catalogue, filtres et fenêtres restent accessibles.

## Descriptions : limite volontaire à connaître avant la recette

Le PDF est protégé ; les droits de redistribution des textes intégraux ne sont pas établis.
Le prototype n'en distribue pas de transcription. **Sans fichier privé, la fenêtre signale
que la description complète n'est pas chargée**, sans afficher les résumés mécaniques à sa place.

Si tu disposes d'un fichier privé conforme au [format documenté](DESCRIPTIONS_PRIVEES.md),
le charger dans Gestion, examiner puis confirmer. Vérifier ensuite ses paragraphes et la fin
d'un long texte, recharger puis recommencer Wi-Fi coupé. L'import ne modifie ni personnages,
ni combat, ni catalogue. Les textes privés ne sont pas inclus dans l'export des sauvegardes.
Conserver séparément ce fichier privé ; il n'est pas fourni avec le prototype.

## Vérification des données existantes

Importer une copie de sauvegarde Codex via le panneau du projet, consulter et filtrer la
bibliothèque, puis exporter le projet : personnages, ressources, techniques attribuées et
combat doivent être inchangés. Aucun apprentissage ou bouton de combat n'est proposé.
Conserver l'ancienne application et les exports d'origine.

Merci de signaler : navigateur/version, lecture des boutons sur téléphone/tablette, clic
sur toute la carte, focus et résultat hors ligne. Aucune validation de recette n'autorise
une fusion ou un déploiement ; le lot suivant attend un accord distinct.

## Correctifs de recette : cartes et descriptions privées

- Sur ordinateur, davantage de colonnes ; cartes courtes, sans espace réservé à une description.
- Les neuf familles ont une bordure de 1 px. Eau, Terre, Feu, Air, Armes et Technologie gardent les couleurs demandées. Base est gris bleuté, Universelles cuivre doux, Groupe jade atténué. Nom et approche restent lisibles.
- Cliquez sur le fond, la famille ou le nom ; utilisez aussi Tab puis Entrée/Espace. Le focus doré reste visible avec la bordure de famille.
- Pour les textes : suivez [le guide privé](DESCRIPTIONS_PRIVEES.md), accessible sans commandes. **Gestion → Préparer depuis mon PDF personnel → choisir votre PDF → confirmer → Exporter mes descriptions privées**.
- Gardez ce JSON sur votre Mac. Rechargez hors Wi-Fi, vérifiez les textes, puis essayez de restaurer le JSON via **Charger un fichier privé de descriptions**. Une annulation ne change rien.
- Exportez séparément la campagne : elle ne doit contenir aucun texte privé.

Aucun texte intégral n’est livré dans le ZIP. Votre PDF sert à le préparer localement ; aucun copier-coller des 111 descriptions n’est nécessaire avec l’édition reconnue. Une vérification du résultat contre le livre reste recommandée.
