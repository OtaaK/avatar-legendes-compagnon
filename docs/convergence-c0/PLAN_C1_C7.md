# Proposition de lots C1 à C7 — aucune exécution autorisée par C0

Chaque lot doit avoir une autorisation, une référence v0 figée, une branche dédiée et
une PR examinable. Ne pas fusionner les PR 22–27 pour démarrer. La PR 27 reste en brouillon.
Les chemins UI ci-dessous sont des points de contact du commit 804381ca, pas une demande
de les modifier maintenant. Une évolution validée de v0 déclenche un diagnostic des
écarts, jamais une récupération silencieuse de son `main`.

## Socle commun de recette et retour arrière

Avant chaque lot : conserver exports Codex complets/combats et banque privée séparée ;
noter commit UI, version du moteur et format d'entrée. Construire des fixtures anonymes,
avec extensions et historiques inconnus. Les nouvelles commandes passent par le store
unique, pas par le commit de démonstration ou un effet d'auto-sauvegarde React.

Tester nominaux, valeurs limites, saisies refusées, annulations, quota, stockage bloqué,
rechargement, conflit entre fenêtres et imports piégés. Pour chaque écran raccordé :
1440×1024, 1280×800, 768×1024 et 390×844, clavier/focus et absence d'écriture à l'ouverture.
Conserver les 243 scripts historiques, les tests/contrats/parité B et les nouveaux tests
utiles, sans remplacer des assertions par des tests de présentation.

Retour de code par PR/commit de réversion, sans réécriture d'historique. Garder les
exports d'avant lot ; avant restauration des données, contrôler la compatibilité de la
version choisie. Les historiques ne sont pas effacés pour rendre une ancienne vue valide.
Aucun lot n'autorise implicitement un déploiement ou une fusion dans main.

## C1 — Infrastructure métier et persistance

- **Préconditions** : validation C0 et autorisation C1, choix A08, résolution A01 pour
  tout import externe envisagé, commit UI figé après analyse des changements v0 acceptés.
- **Domaines/fichiers** : package du moteur à préparer, ports B, SessionStore, codecs,
  repository ; côté UI, future frontière cliente/provider, hooks et partie Gestion de
  `components/companion-app.tsx`. `lib/demo-storage.ts` reste source de compréhension
  des protections à préserver, pas un deuxième repository de campagne.
- **Interaction v0** : garder navigation et composants ; retirer le rôle de source de
  vérité du state de démonstration pour le périmètre raccordé. État d'attente SSR stable,
  initialisation explicite puis useSyncExternalStore. Démo jamais initialisée dans la
  campagne ; les écrans non raccordés sont annoncés comme tels.
- **Risques** : accès au stockage pendant SSR, doubles writes au montage, deux stores,
  perte des extensions, retour d'export vide après lecture refusée, version flottante.
- **Acceptation** : import des services sans DOM, aucune écriture au montage ; session
  atomique unique, plan d'import/révision/confirmation, exports/restauration v1/v2 et
  textes privés séparés, erreurs visibles. Le format v0 reste externe ; conversions non
  résolues refusées avec original conservé, sans fiche par défaut.
- **Tests** : Node SSR/import, build Next local du paquet verrouillé, hydratation sans
  divergence, double montage/abonnements, quota/refus/double clic/conflit, roundtrips
  v1/v2 enrichis et ID piégé ; démarrage hors ligne Next à qualifier avant de l'annoncer.
  Examiner les appels réseau du build de production : `app/layout.tsx` inclut Analytics
  en production ; aucune neutralisation ni qualification de ce comportement n'est faite en C0.
- **Retour** : version précédente du package et de la frontière UI ; exports antérieurs
  conservés. Aucun remplacement automatique des clés de démo/historiques.

## C2 — Personnages et ressources

- **Préconditions** : C1 recetté, A01–A04 résolus pour les données activées, réserves
  Work applicables documentées. Si le lot 3 a changé les fiches, disposer de son commit
  validé et d'un diagnostic complémentaire sans supposer le modèle des groupes.
- **Domaines/fichiers** : CharacterService/ResourceRules/Roster, projections, commandes
  de ressources ; points UI `character-detail-redesign.tsx`, `character-editors.tsx`,
  `npc-creation-form.tsx`, cartes et callbacks de `companion-app.tsx`.
- **Interaction v0** : conserver cartes, onglets, ergonomie ; champs canoniques derrière
  des projections, patches minimaux avec intentions explicites. Deux principes en
  données structurées, centre séparé de la position ; limites du vrai profil.
- **Risques** : retour de L2-01, base/modificateur inventé, −2/−3 refusés, importance
  modifiant les ressources, domicile touché par une édition d'identité, portrait direct
  irréversible, copie de combat mise à jour sans demande.
- **Acceptation** : PJ/PNJ séparés, IDs stables, profils 3/5/10/15/non-combattants,
  absence/null/zéro préservés pour les données externes en attente, valeurs canoniques
  intactes ; ajustements annulables selon les commandes existantes, confirmation et
  brouillon portrait préservé en cas d'abandon/refus. Aucun changement de mécanique.
- **Tests** : tous les cas de présence, plage −3..3, deux principes contenant un
  séparateur dans leur texte, centre indépendant, états/statuts distincts, rename PNJ
  sans modifier liens ; comparaison avant/après export et copie de combat indépendante.
- **Retour** : projections et handlers C2 réversibles ; données métier/extensions restent
  conservées même si une vue précédente ne les affiche pas.

## C3 — Lieux et relations

- **Préconditions** : C1–C2 et A06, contrats de liens/provisoires définis ; référence
  v0 acceptée. C0 n'étend pas PlaceRules aux PJ par simple présence de liens en démo.
- **Domaines/fichiers** : PlaceRules/place-commands, futur contrat de relations ; `Place`
  et `CharacterRelationship` connus, écrans Lieux, fil d'Ariane et onglet Histoire/relations.
- **Interaction v0** : hiérarchie et liens affichés depuis IDs ; noms résolus à la
  lecture ; cible provisoire ou absente conservée, ancien texte affichable séparément.
- **Risques** : homonymes liés à tort, champs characterId/npcId contradictoires, cycle,
  orphelin supprimé, domicile confondu avec position, null parent converti silencieusement.
- **Acceptation** : renommer un lieu actualise les cartes sans réécrire les références ;
  domicile/position/associations indépendants ; suppression de lieu avec stratégie
  explicite/confirmée et conservation des données à résoudre ; aucun lien inféré par nom.
- **Tests** : parents profonds, cycles, cibles manquantes, homonymes/provisoires et
  inconnus ; export/reimport ; rename lieu et PNJ sans altérer les autres liens.
- **Retour** : revenir aux vues/commandes précédentes ; conserver les blocs structurés
  et anciens textes, restaurer un export seulement après comparaison explicite.

## C4 — Techniques

- **Préconditions** : C1–C2, résolution des correspondances exactes et de l'affichage
  des trois maîtrises ; aucune conversion des dix fictions en techniques officielles.
- **Domaines/fichiers** : TECH_CATALOG/TECH_AUDIT, technique-library, attribution Roster,
  repository privé ; cartes/filtres/modal Techniques et onglet personnel de la fiche v0.
- **Interaction v0** : 111 techniques et neuf familles dans son ergonomie ; catalogue
  de lecture et maîtrises personnelles séparés ; références de Livret traitées selon
  leur propre source, pas forcées dans le catalogue commun.
- **Risques** : mastery globale écrasant la fiche, pratiquée absente, données fictives
  persistées comme règle, texte privé publié ou exporté avec campagne.
- **Acceptation** : recherche/filtres/fiches, références et assistance conservées ; trois
  niveaux individuels explicites ; historique/personnalisé non résolu visible sans perte ;
  111 textes privés importables/restaurables séparément et consultables hors réseau.
- **Tests** : 111/9, filtres et clavier, deux personnages avec maîtrises différentes,
  banque privée vide/complète/corrompue/quota, export campagne sans texte privé, rechargement.
- **Retour** : paquet et vues précédents ; garder maîtrises et banque, aucune suppression
  de référence non comprise par une ancienne interface.

## C5 — Livrets et manœuvres

- **Préconditions** : A05, C2, références C4 nécessaires, décisions officielles explicites
  pour tout compteur/effet ; réserves Work sur spécificités et mobiles suivies.
- **Domaines/fichiers** : playbookReference, playbook-preparation/commands, BookState ;
  `playbook-creation-data.ts`, wizard et éditeurs de spécificités/manœuvres v0.
- **Interaction v0** : conserver les blocs/trackers et références provisoires sans leur
  donner automatiquement un effet. Un ID de Livret résolu, pas un nom deviné.
- **Risques** : perdre choix d'un Livret antérieur, remettre un compteur à zéro, transformer
  une case sourceReviewed en certification officielle, appliquer un bonus de création deux fois.
- **Acceptation** : dix Livrets et 50 manœuvres, créations avec validations/confirmations,
  anciens noms et externes conservés ; état par Livret, champs inconnus et choix provisoires
  intacts ; limites des mécaniques préparées affichées clairement, sans récompense ajoutée.
- **Tests** : cinq manœuvres par Livret, provenance externe, changement de Livret séparé
  de son suivi, brouillon/annulation/quota, choix byBook et blocks/references roundtrip.
- **Retour** : rétablir anciennes vues/commandes, garder les choix et suivis d'origine ;
  pas de nettoyage de préparation pour satisfaire un schéma plus ancien.

## C6 — Évolutions

- **Préconditions** : A07 validé, C5 et schéma d'événements/tests de conservation définis.
  Une éventuelle automatisation réglementaire est une autorisation distincte, hors défaut.
- **Domaines/fichiers** : BookState, événements de préparation et futur adaptateur
  d'historique ; `lib/evolution-history.ts` et EvolutionEditor connus comme référence UI.
- **Interaction v0** : conserver parcours dédiés, décision motivée, corrections,
  annulations et résolution de toutes les dépendances actives. Archives non rejouées.
- **Risques** : annulation interprétée comme rollback automatique de stat, compteur
  consommé à l'enregistrement, arêtes historiques perdues, événements inconnus effacés.
- **Acceptation** : quatre cases par suivi, ancien texte conservé, IDs/dates/provenance/
  statuts/liens/notes préservés ; décisions et avant/après traçables ; refus d'une
  transition non résolue ; aucune récompense ou retrait silencieux.
- **Tests** : A→B→C, plusieurs dépendances et homonymes, remplacement, annulation d'une
  entrée déjà corrigée, graphe incohérent signalé sans perte ; type d'événement futur,
  stockage refusé, rechargement, export/reimport exact ; aucune application de gain.
- **Retour** : revenir au traitement précédent, conserver archives des deux origines et
  décisions ajoutées ; ne pas défaire une évolution en effaçant ses lignes.

## C7 — Combat

- **Préconditions** : C1–C6 nécessaires aux fonctions raccordées, contrats des écrans
  finalisés et référence v0/lot 3 validée ; inventaire de toutes les capacités existantes.
- **Domaines/fichiers** : CombatCore/CombatRules, validation, rapports, snapshots,
  commandes et propositions ; futurs écrans Combats v0 inspectés au commit autorisé.
- **Interaction v0** : adapter le moteur aux composants existants, pas l'inverse ;
  révélation, propositions, arbitrages séquentiels et explications exposés. Une décision
  utilisateur ne suspend pas une transaction ouverte.
- **Risques** : moteur résumé/simplifié, coûts appliqués deux fois, annulation incomplète,
  retrait d'un combattant laissant effets invalides, fiches permanentes synchronisées
  automatiquement, modèle de groupes inventé par Codex.
- **Acceptation** : parité des comportements opérationnels, coûts/refus et protections,
  réactions/effets/durées, effets temporaires, journal et historique avancé, undo et
  snapshots conservés ; copies de combat distinctes, report fiche explicitement confirmé.
- **Tests** : corpus historique et parité, scénarios multi-effets et refus, ressources
  insuffisantes, cancel/undo/reload/export, combattant retiré encore mentionné en archive,
  décisions périmées, quota et deux fenêtres ; parcours responsive/clavier réels.
- **Retour** : revenir au paquet/UI précédents avec sauvegarde privée du combat ; conserver
  snapshots et extensions, ne pas convertir un combat complet en simple liste v0.

## Place réservée au lot 3 v0 — groupes de PNJ

Aucun schéma de groupe n'est défini ou reproduit en C0. À réception de son commit
validé : analyser impact sur identité, ressources, relations et combat, actualiser
matrice et tests, puis proposer un lot complémentaire autorisé. L'intersection sera
probablement C2/C3/C7, mais c'est une hypothèse de planification, pas un contrat acquis.
Si le lot 3 change des props ou types de C1/C2, réévaluer la référence avant raccordement.
Ne pas assimiler la famille de techniques « Groupe » à un futur modèle de groupe PNJ.
