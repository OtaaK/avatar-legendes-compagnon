# Bibliothèque de techniques — bilan pour recette

Branche `convergence/bibliotheque-techniques`, dépendante du lot 2 / PR 13 (`457b031`).
Références : métier `a9079fa`, visuel v0 `8b8924d`. Aucune fusion ni aucun déploiement.
Aucune refonte profonde des fiches ni intégration d'un autre lot.

## Fonctionnalités livrées

La rubrique Techniques devient une bibliothèque informative : recherche par nom partiel,
sans casse/accents, boutons de famille puis d'approche dans l'ordre demandé, sélection
unique dans chaque groupe et combinaison ET. Changer un groupe conserve les autres critères.
Compteur, réinitialisation, état vide, clavier et cibles tactiles sont présents.

Les cartes reprennent les styles v0 et contiennent seulement **famille/icône, nom, approche**.
Un seul bouton sémantique occupe toute la carte, sans contrôle imbriqué. Fond, icône, famille,
titre, Entrée et Espace ouvrent la même fenêtre. Les fenêtres utilisent AppModal des lots
précédents : focus initial, boucle Tab/Maj+Tab, Échap, fond inert, retour à la carte.

La fenêtre affiche seulement **famille/icône, nom, approche, description**. Aucun degré de
maîtrise, rareté, page, prérequis ou commande de combat n'y est ajouté. Le texte privé chargé
est conservé avec paragraphes/listes et sans troncature ; la fermeture reste accessible.
Sans texte privé, un message annonce honnêtement que la description complète n'est pas chargée.

## Inventaire complet, textes intégraux non distribués

| Famille | Nombre |
|---|---:|
| Base | 9 |
| Universelles | 13 |
| Groupe | 13 |
| Eau | 13 |
| Terre | 13 |
| Feu | 13 |
| Air | 13 |
| Armes | 12 |
| Technologie | 12 |
| Total | 111 |

L'[inventaire CSV](INVENTAIRE_TECHNIQUES.csv) énumère chaque ID, nom, famille, approche et page.
Les 111 identifiants sont conservés, sans doublon ni technique de démonstration.

Le PDF fourni a été retrouvé et traité localement. Le [contrôle source](CONTROLE_TECHNIQUES_PDF.json)
repère les **111 noms, 111 familles, 111 approches et 111 passages** sur les pages imprimées
158–160 et 286–293. Il contient des métadonnées et empreintes, aucun passage de règles.
Le rapprochement tient compte des espaces, apostrophes, casse et marques de rareté imprimées.
Les accents des noms sont contrôlés ; `Boum!` / `Boum !` reste une différence typographique.

**Limite éditoriale :** ce contrôle de métadonnées et de présence n'est pas une certification
d'une transcription intégrale ni une nouvelle vérification sémantique de toutes les conditions.
Les passages sont bornés automatiquement par les titres ; certains paragraphes ou continuations
exigent une revue humaine pour constituer un fichier privé complet et fidèle. Aucune conformité
réglementaire supplémentaire du moteur n'est revendiquée.

Aucun droit de reproduction intégrale n'a été trouvé dans le dépôt. **Zéro description intégrale
nouvellement transcrite du livre est ajoutée au dépôt ou au prototype distribué.** Les résumés
mécaniques existants ne sont jamais affichés comme descriptions officielles complètes.
Les données moteur et indications d'assistance existantes restent inchangées et disponibles
pour leurs futurs usages ; elles ne sont pas injectées dans la fenêtre informative.

## Solution privée proposée et livrée

Gestion permet un chargement JSON privé explicite, avec validation, aperçu puis confirmation.
Chaque description est associée à un ID réel et unique. Le fichier peut être partiel.
Un jeu confirmé remplace le précédent ; l'annulation ne change rien. Le format est documenté
avec un exemple synthétique dans [DESCRIPTIONS_PRIVEES.md](DESCRIPTIONS_PRIVEES.md).

Le contenu n'est pas envoyé sur un serveur et n'est pas intégré à la sauvegarde Codex, au
catalogue ou au HTML. La clé dédiée est `avatar-compagnon-private-technique-texts-v1`.
La lecture au montage et la consultation n'écrivent rien. Un quota ou un refus laisse les
textes précédents intacts. L'effacement confirmé vise seulement cet espace privé.
Le texte est rendu comme texte, sans HTML exécutable ; les retours à la ligne sont préservés.

**Disponibilité au premier lancement : 0/111 textes intégraux privés chargés.** Aucun pack
contenant les 111 descriptions du PDF n'est distribué. L'utilisateur doit disposer d'un
fichier privé qu'il est autorisé à utiliser ; l'application n'en certifie pas l'exactitude
éditoriale. La préparation groupée est désormais possible localement depuis le PDF dans Gestion ; une relecture humaine reste nécessaire.
Cette réserve est visible, pas remplacée par une paraphrase ou un faux contenu officiel.

## Architecture et non-mutation

`packages/reference` projette le catalogue en quatre champs de lecture (ID, nom, famille,
approche). Il ne dépend d'aucune commande, persistance de projet ou maîtrise. Les données
métier, effets, coûts, raretés, prérequis et indications d'assistance restent dans le catalogue
inchangé. La banque privée est un adaptateur séparé, sans accès au store de session.

L'interface est dans `features/techniques`. Les icônes d'entraînement et la modale v0 sont
réutilisées. Aucune dépendance d'exécution ajoutée, aucun CDN ou service externe. Le build
reste un HTML autonome d'environ 2 Mo après ajout de la lecture PDF privée. Les fiches PJ/PNJ du lot 2 sont conservées.

## Vérifications et portée

Les rapports locaux sont sous `work/bibliotheque-before.json`, `work/bibliotheque-after.json`,
`work/library-browser/results.json` et les rapports des lots 1/2. La PR indique les résultats
finaux locaux et ceux de GitHub, dont l'essai natif Linux séparé du Mac.

- 243 scripts historiques conservés, exécutés avant/après ; aucun changement du HTML historique.
- 43 tests de contrats/parité/frontières : 33 des lots 1/2 et 10 nouveaux pour projection,
  répartition, filtres, source PDF, confidentialité, validation et erreurs du stockage privé.
- Parcours des lots 1/2 conservés ; nouveau parcours bibliothèque aux quatre tailles :
  1440×1024, 1280×800, 768×1024, 390×844.
- Les neuf familles et leurs intersections avec les trois approches sont testées, ainsi que
  recherche accentuée, cumul, réinitialisation et absence de résultats.
- Cartes à trois informations, absence d'actions interdites, zones cliquables, clavier,
  focus/inert, retour à la carte, modale sans résumé ou maîtrise.
- Texte de recette long **entièrement synthétique**, structure, fin du texte et rechargement.
  Les tests et captures distribués ne contiennent aucun passage du PDF.
- Zéro écriture de consultation ; projet et anciennes clés identiques avant/après.
  Import privé confirmé : seule la clé privée change ; les exports Codex excluent le texte.
- JSON invalide, quota, annulation et démarrage hors réseau sont couverts.

Le cloud de développement bloque `file://` avec `ERR_BLOCKED_BY_ADMINISTRATOR` : le démarrage
à froid du document embarqué est testé via un transport local de test, réseau coupé. Le test
natif est aussi tenté et son résultat est distinct dans la CI. Le Mac doit être recetté.
Aucune régression préexistante n'a été masquée ni test historique supprimé.

## Retour arrière, limites et suite

Revenir au prototype du lot 2 ou au HTML historique ne nécessite aucune migration inverse.
Les sauvegardes et le catalogue sont préservés. Le fichier privé doit être conservé séparément
pour changer de navigateur ; les autorisations de stockage local peuvent varier.

La banque privée n'est pas un système d'authentification des textes ni de licence. Les droits,
la fidélité et l'exhaustivité d'un fichier privé doivent être contrôlés avant son usage.
Les limites de taille sont explicites, sans troncature silencieuse.

La recette Mac est dans [TESTER_BIBLIOTHEQUE.md](TESTER_BIBLIOTHEQUE.md). Le chantier ergonomie
PJ/PNJ est ajouté à ROADMAP.md, après les intégrations fonctionnelles prioritaires. Aucun lot
suivant, fusion ou déploiement avant l'accord du propriétaire.

Les [correctifs de recette](CORRECTIFS_RECETTE_BIBLIOTHEQUE.md) complètent ce bilan : cartes compactes colorées, préparation locale depuis le PDF et export/restauration privés.
