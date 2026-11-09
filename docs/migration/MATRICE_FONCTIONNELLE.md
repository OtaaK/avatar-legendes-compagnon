# Correspondance fonctionnelle Codex → interface v0

Références figées : métier `a9079fa`, visuel `8b8924d`. État : **lots 1/2 conservés, bibliothèque informative préparée pour recette**.
Les lignes décrivent les capacités existantes à conserver, pas une conformité réglementaire
nouvellement vérifiée. Le HTML historique reste utilisable pour chacune de ses fonctions.

- **Intégrée** : réellement utilisable dans React aux lots 1–2.
- **À intégrer** : rubrique v0 présente, métier non raccordé.
- **Non représentée dans v0** : aucun contrôle opérationnel correspondant ; emplacement
  proposé à préciser au lot concerné, sans supprimer la capacité ni imposer une refonte.

Les modules `domain` sont extraits et testés, mais cela ne signifie pas qu'ils sont connectés
aux écrans. Les scénarios ci-dessous sont les exigences à maintenir/enrichir par lot.
Le [relevé actuel des 107 entrées publiques et 112 handlers statiques](INVENTAIRE_API_CONVERGENCE.json) (le [relevé lot 1](INVENTAIRE_API_LOT_1.json) reste conservé)
permet de retrouver les commandes techniques ; elle ne remplace pas la recette utilisateur.

| Fonction existante / attendue | Emplacement React v0 prévu | Moteur/module | Interaction et scénario de test | Statut UI / lot |
|---|---|---|---|---|
| Six rubriques et regroupements | Barre latérale / barre mobile | `shell/navigation` | Actif, URL hash, précédent/suivant, rechargement | Intégrée / 1 |
| Accueil et accès rapides | Accueil | `shell/Home` | Aller à chaque rubrique sans créer de données | Intégrée / 1 |
| Fenêtres accessibles | Fenêtre v0 | `shell/AppModal` | Focus initial, Tab/Shift-Tab, Échap, retour à l'appelant | Intégrée sur aide/aperçu / 1 |
| Stockage local technique | Gestion → essai hors ligne | `session-store`, repository | Enregistrer note fictive, recharger, quota, deux onglets | Intégrée, espace laboratoire uniquement / 1 |
| Lecture fichier et téléchargement | Gestion → examen en lecture seule | codecs | JSON local, résumé, annuler sans écriture ; télécharger l'état de test | Intégrée, pas d'import réel UI / 1 |
| Liste PJ distincte des PNJ | Personnages → deux sections | Roster | Aucun doublon de catégorie ; identité stable | Intégrée / 2 |
| Recherche, filtres et tri PNJ | Personnages → filtres v0 | `Roster.listNpcs`, `npcLocations` | Nom/rôle/lieu/entraînement/importance ; non classés en fin | Intégrée / 2 |
| Création PJ guidée | Personnages → ajouter PJ | Roster, Playbooks | Livret réel, +1 caractéristique choisi, plafonds existants, annuler | Création manuelle intégrée / 2 ; guide de Livret différé / 4 |
| Création et édition PNJ | Personnages → ajouter/modifier | Roster | Nom, rôle/livret, description, désir/notes existants ; pas de défaut métier fictif | Intégrée / 2 |
| Consultation/édition et confirmation | Fiche → modifier/enregistrer | service de commandes | Brouillon isolé ; confirmation ; Échap/annuler/navigation sans perte silencieuse | Intégrée / 2 |
| Portrait local | Carte et fiche | validation portrait existante | Image embarquée, taille/format existants, export/reload, quota | Intégrée / 2 |
| Caractéristiques négatives et anciennes | Fiche → aperçu | Roster | Valeurs −3…+3 conservées ; aucun clamp 0…3 de démo | Intégrée / 2 |
| Fatigue PJ et récapitulatif synchronisés | Carte, résumé, fiche | ResourceRules | 0/limite, ajout/retrait, affichages cohérents après enregistrement | Intégrée / 2 |
| Importance PNJ sans modification implicite | Fiche PNJ → importance | Roster, décision existante | Changer classement, accepter/refuser proposition, aucune conversion silencieuse | Intégrée / 2 |
| Profils PNJ et non-combattant | Fiche PNJ → ressources | ResourceRules | Capacités 3/5/10/15, zéro explicite, états personnalisés, profil incomplet refusé | Intégrée / 2 |
| Équilibre, principes et centre | Carte/fiche | ResourceRules, Roster | Principes réels ; ancien −3…+3 ; profil explicite 0…max ; arbitrage dépassement | Intégrée / 2 |
| États distincts des statuts | Carte/fiche → ressources | Roster, ResourceRules | États du profil ; plusieurs sources de statut ; aucun mélange de listes v0 | Intégrée / 2 |
| Dernière modification de ressource annulable | Fiche → ressources | futur coordinateur, gardes historiques | Undo après rendu ; refus si génération/profil/ressource intermédiaire modifié | Intégrée, temporaire et protégée / 2 |
| Histoire, relations et champs libres | Fiche → Histoire et relations | Roster | Texte facultatif ; limites existantes ; champs inconnus conservés | Intégrée / 2 |
| Arborescence des lieux | Lieux → panneau arbre | PlaceRules | Racine/enfant ; profondeur 12 000 côté modèle, sans récursion de pile | À intégrer / 3 |
| Création/édition/illustration d'un lieu | Lieux → détail | PlaceRules | Nom, description, parent ; refus de cycle ; illustration locale | À intégrer / 3 |
| Renommage répercuté partout | Lieux + cartes/filtres/fiches | `PlaceRules.currentName`, sélecteurs | Renommer lieu lié puis revenir aux personnages | À intégrer / 3 |
| Domicile, liens et position indépendants | Fiche PNJ → Lieux | PlaceRules | Absent ≠ null explicite ≠ texte ancien ≠ ID orphelin | Lecture sans mutation / 2 ; édition au lot 3 |
| Personnes présentes/associées et descendants | Lieux → relations aux lieux | `PlaceRules.people`, descendants | Inclure sous-lieux, dédupliquer ; consultation sans mutation | À intégrer / 3 |
| Suppression protégée d'un lieu | Lieux → action à définir | `PlaceRules.dependencies/remove` | Dépendances annoncées, promotion/déliaison explicites, annuler | Non représentée dans v0 / 3 |
| Lieu actif de session | Lieux / Personnages → filtre de session | préférence locale séparée | Choisir/effacer sans déplacer les PNJ ; reload | Non représentée dans v0 / 3 |
| Livrets officiels connus et noms anciens | Fiche PJ → Livret | Playbooks | Noms canoniques exacts ; ancien livret inconnu conservé | Nom manuel conservé / 2 ; suivi au lot 4 |
| Suivi manuel par livret | Fiche PJ → Livret | BookState | 0…4, moment, notes/évolutions ; changer/revenir au livret sans effacer | À intégrer / 4 |
| Préréglages de création | Ajout PJ / Livret | `Playbooks.initialStats/applyPreset` | Préparer sans écraser fatigue, techniques, notes | À intégrer / 4 |
| Catalogue réel et références | Techniques | TECH_CATALOG, TECH_AUDIT | 111 entrées dont 13 Terre ; pages, rareté, accès PJ/PNJ | Intégrée : inventaire/métadonnées ; textes privés facultatifs, pas de description intégrale distribuée |
| Techniques personnelles et maîtrise | Fiche → Techniques | `Roster.assignTechnique`, CombatRules | Acquise/pratiquée/maîtrisée par personne, jamais globalement | Consultation des fiches / 2 ; attribution/maîtrise au lot 4 |
| Techniques personnalisées | Fiche → Techniques | Roster | Nom ancien/personnalisé réexporté ; aucune substitution par ID fictif | Données consultées et préservées / 2 ; édition au lot 4 |
| Conditions de disponibilité et coûts de posture | Combats → choisir technique | CombatRules | Approche, jet, maîtrise, base/PNJ, simple/double et coût | Non représentée opérationnellement dans v0 / 4–5 |
| Liste des combattants | Combats → participants | Roster, CombatCore | Tous les participants réels, sans sélection arbitraire de démo | À intégrer / 5 |
| Copier une fiche dans le combat | Combats → ajouter | `Roster.addToCombat` | Pas de doublon ; copie indépendante ; profil non-combattant refusé | À intégrer / 5 |
| Créer/modifier un combattant ponctuel | Combats → participants | CombatCore | Nom/ressources/identité protégée ; existence distincte d'une fiche | Non représentée dans v0 / 5 |
| Report vers fiche confirmé | Combats → participant | `Roster.syncCombatToLibrary`, gardes UI existantes | Accepter/refuser, profil modifié entre-temps, pas de liaison automatique | Non représentée dans v0 / 5 |
| Retirer un combattant | Combats → participant | `fighterRemovalBlock/removeFighter` | Phase/dépendances protégées ; fiche conservée ; undo exact | Non représentée dans v0 / 5 |
| Engagements et déplacements | Combats → participants/terrain | CombatCore | Engager/désengager, paires, terrains, effets de déplacement | Non représentée dans v0 / 5 |
| Déclarations, jets, révélation | Combats → phases | `declare/reveal/allowance` | Approches, 6−/7–9/10+, ordre existant et restrictions | À intégrer / 5 |
| Préparer, accepter/refuser une action | Combats → technique/propositions | `queueTechnique/propose/commit`, collecteur à extraire | Paramètres exacts ; annuler ne paie rien ; plan périmé refusé | Non représentée dans v0 / 5 |
| Décisions MJ séquentielles | Fenêtres de décisions dans Combats | `previewCommit`, futur port de décisions | Acceptation → interceptions/protecteurs → armure → dépassements selon contexte | Non représentée dans v0 / 5 |
| Dépassements de fatigue et choix d'états | Combats → décisions | CombatCore, ResourceRules | Coût volontaire impossible, dommage excédentaire, choix invalides, atomicité | Non représentée dans v0 / 5 |
| Protections, armures et réserves | Combats → effets/réactions | CombatCore | Bouclier/armure/protection : provenance, consommations, refus et undo | Non représentée dans v0 / 5 |
| Terre avancée | Combats → techniques/réactions | CombatCore | Métal, boue, sismique, lave/Fracasser, bouclier, entretien et annulations | Non représentée dans v0 / 5 |
| Prédictions, interruptions et réactions | Combats → décisions/réactions | CombatCore | Roseau, contretemps, interventions ; secrets privés et expiration | Non représentée dans v0 / 5 |
| Autres techniques opérationnelles | Combats → techniques | CombatCore | Régressions Air/Eau/Feu/Armes/Technologie et universelles existantes | Non représentée dans v0 / 5 |
| Arbitrage manuel et statuts | Combats → outils MJ | `manual`, `updateFighter` | Historique, raison, valeurs, états/statuts autorisés | Non représentée dans v0 / 5 |
| Pièges | Combats → terrain/pièges | `triggerTrap`, effets de pose | Choix explicites, entrée, consommation, durée, undo | Non représentée dans v0 / 5 |
| Effets temporaires et provenance | Combats → effets | add/edit/removeTemporaryEffect | Source/cible, durée et effets concurrents ; pas d'effacement indu | Non représentée dans v0 / 5 |
| Fin/transition de passe | Combats → phases | advance/endRound/nextRound | Entretien, expiration, coût/refus, statuts actifs/différés | À intégrer / 5 |
| Scènes, titre et notes | Combats → scène/journal | newScene/renameScene/add/edit/removeSceneNote | Créer scène, restaurer équipement/effets selon moteur ; notes conservées | Non représentée dans v0 / 5 |
| Fin de combat | Combats → scène | `endCombat` | Décision explicite, ressources/historique, pas de suppression des fiches | Non représentée dans v0 / 5 |
| Historique et annulation du combat | Combats → historique | `snapshots`, `undo` | Recharger puis annuler ; IDs, engagements, coûts, réserves et provenance exacts | Non représentée dans v0 / 5–6 |
| Journal narratif CSV | Combats → exports | `exportSceneJournalCSV` | Échappement, accents, journal conservé | Non représentée dans v0 / 5–6 |
| Export public distinct du privé | Combats → exports | publicCombatReport | Secrets exclus récursivement ; avertir sur notes libres ; pas d'import public | Non représentée dans v0 / 6 |
| Bibliothèque v1/v2 | Gestion → import/export | Roster, codecs | Normalisations existantes seulement ; noms/IDs/champs inconnus | Import explicite + export complet / 2 ; outils complets au lot 6 |
| Combat brut/enveloppe v2 | Gestion / Combats → import/export | validateCombat, codecs | Historique/snapshots/champs inconnus, liens de fiches vérifiés | Import compatible et conservation / 2 ; contrôles combat différés |
| Sauvegarde complète v1/v2 | Gestion → import/export | validateBackupLinks, codecs, repository | Aperçu, confirmation, quota, atomicité library+combat ; pas de démo | Import/export transactionnel intégré / 2 |
| Récupération historique/journal interrompu | Gestion → diagnostic | ancien client + lecteur dédié futur | Ne pas réparer en écrivant les anciennes clés depuis React | Non représentée dans v0 / 6 |
| Exports d'avant données étendues | Gestion → récupération | ancien client, futur lecteur | Copie historique conservée ; aucun downgrade automatique des profils | Non représentée dans v0 / 6 |
| Erreurs stockage, conflits et récupération | Gestion + bannière à intégrer | repository, session-store | Quota/refus/corruption, brouillon exportable, une fenêtre éditrice | Projet + laboratoire protégés / 1–2 ; récupération historique au lot 6 |
| Distribution autonome hors ligne | Fichier portable | Vite + singlefile | Démarrage froid, ressources embarquées, fichiers locaux, persistance | Prototype intégré ; double-clic Mac à qualifier / 1–6 |

## Réserves de la contre-recette v0

| Réserve | Traitement |
|---|---|
| Retour du focus de certaines fenêtres PJ | Base modale et fenêtres PJ corrigées/testées au lot 2, y compris annulation et retour du focus |
| Défilement vertical parasite des onglets PJ | Corrigé et contrôlé aux quatre tailles : pas de défilement vertical parasite |
| Message d'aperçu restant après annulation | Pas de message persistant au lot 1 ; aperçu réinitialisé et absence d'écriture testées |
| Textes secondaires trop petits | Formulaires, textes explicatifs et informations de fiche agrandis ; contrôle final au lot 7 |
| Tablette/mobile non validés | Shell, fenêtres et personnages testés aux quatre tailles ; autres écrans à qualifier dans leurs lots |

Les récompenses d'objectifs fictives de v0 ne sont pas une fonctionnalité Codex à conserver.
Elles ne sont pas raccordées ; tout nouveau Palmarès automatisé demanderait une spécification
séparée. Le suivi manuel BookState reste prévu.

## Lot indépendant Bibliothèque de techniques

Le propriétaire a autorisé le lot Bibliothèque. Catalogue des 111 techniques, recherche, filtres,
cartes et détails v0 avec références et assistance existantes. Aucun texte manquant inventé,
aucune maîtrise globale, attribution, ressource ou commande de combat. Branche et PR propres,
critères dans [ROADMAP.md](../../ROADMAP.md). Ce lot est préparé sur une branche et PR propres, sans attribution ni combat. Voir `docs/reference/BILAN_BIBLIOTHEQUE.md` pour la limite des descriptions intégrales.
