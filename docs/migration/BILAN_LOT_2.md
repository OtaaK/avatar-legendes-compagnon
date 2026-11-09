# Lot 2 — Personnages et ressources dans l’interface v0

Branche : `convergence/lot2-personnages`, dépendante du lot 1 (`convergence/react-v0`,
commit `0d40f43`). Métier de référence inchangé : `a9079fa`. Visuel : v0 corrigé `8b8924d`.
Le lot 1 a été validé par le propriétaire après essai sur Mac. Le lot 2 attend sa recette.
Aucune fusion ni aucun déploiement ; aucun lot 3 ni bibliothèque de techniques commencé.

## Personnages réellement intégrés

- Sections PJ et PNJ distinctes, cartes, portraits, couleurs et composition v0.
- Recherche Codex (nom/rôle/lieu/notes), filtres lieu/entraînement/importance/rôle, tri
  nom ascendant/descendant, lieu et importance ; classification absente conservée.
- Création manuelle et édition avec brouillon isolé, validation, confirmation de succès,
  refus d’abandon, Échap et retour du focus. Aucun personnage fictif chargé.
- Fiches organisées comme v0 : Aperçu, Livret, Techniques, Histoire et relations pour
  les PJ ; Aperçu, Techniques et Lieux pour les PNJ. URL de fiche/onglet et rechargement.
- Portrait local PNG/JPEG/WebP : limite historique 256 Ko, signature vérifiée et vrai
  décodage d’image avant enregistrement. Un ancien champ non modifié reste conservé.
- Noms, identifiants, compteurs, caractéristiques négatives, histoire, relations, notes,
  techniques et champs inconnus préservés. Un renommage PNJ n’écrit aucun lien de lieu.

Les cartes/composants `companion-ui`, la liste `PeopleView` et la structure de fiche v0
ont été repris puis raccordés à des projections de lecture. Les projections visuelles
ne sont jamais sérialisées comme sauvegardes. Le CSS v0 figé reste inchangé ; les adaptations
sont séparées. Le composant d’ajout/retrait par pastilles v0 est repris deux fois pour
éviter de mélanger les états et les statuts canoniques.

## Ressources et décisions conservées

Les capacités proviennent de ResourceRules : 5 fatigues historiques, profils PNJ explicites
3/5/10/15, non-combattant à zéro, conditions propres au profil. Les limites d’équilibre
historiques −3…+3 et explicites 0…maximum sont respectées ; un profil sans jauge n’en
reçoit pas. Principes réels, position et centre PJ séparés, centre modifié explicitement.

L’importance seule ne modifie pas les capacités. Comme dans le client de référence, une
proposition de profil peut être acceptée pour préparer le brouillon ou refusée pour ne
changer que la classification. Les ressources incompatibles ne sont pas effacées : la
validation impose leur correction explicite. Pour 8 états, les noms manquants ne sont
pas inventés. Le changement de profil et celui du centre demandent confirmation.

Les ajustements fatigue/équilibre/conditions disposent d’une annulation temporaire
protégée par la révision et l’empreinte du profil/ressources. Un rendu React ne l’invalide
pas. Une édition, un import, une modification intermédiaire ou un rechargement la rend
indisponible, sans altérer l’historique de combat. Les statuts demandent la confirmation
existante de modification de la fiche permanente et restent distincts de cette annulation.

**Aucune synchronisation automatique avec une copie de combat.** Les commandes de ce lot
ne modifient que la bibliothèque ; le combat et ses instantanés sont conservés intégralement.

## Architecture et persistance

- Des frontières supplémentaires sont extraites dans deux modules depuis
  le HTML figé : validation/projection des champs et portraits, préréglages PNJ. Au total,
  **13 modules extraits**, avec contrôle reproductible des corps et empreinte HTML inchangée.
  `character-fields` expose trois fonctions ; les préréglages restent des données existantes.
- `character-commands` coordonne création, patch minimal, ajustement et annulation. Toute
  mutation passe par le store transactionnel du lot 1 : copie, validation, stockage, publication.
- Le projet réel utilise `avatar-compagnon-react-session-v1`, distinct du laboratoire
  `avatar-compagnon-react-lab-v1`. Aucun accès automatique aux anciennes clés Codex.
- Gestion permet import explicite avec aperçu/confirmation et export complet. Bibliothèque,
  combat privé et sauvegarde complète restent pris en charge par les codecs ; le compte rendu
  public et le format fictif v0 sont refusés. Les normalisations historiques restent celles de Codex.
- Une erreur de quota ou validation laisse la sauvegarde précédente et le brouillon intacts.
  Les plans périmés et doubles commandes sont refusés. Les conflits ne sont pas fusionnés.

L’import/export est avancé ici uniquement pour tester et reprendre les personnages réels.
La récupération historique complète, les outils de combat et les optimisations de stockage
restent au lot dédié. Aucun nouveau format fictif n’est adopté.

## Vérifications

| Contrôle final local | Résultat |
|---|---|
| Tests historiques avant / après | 243/243 dans les deux cas |
| Tests contrats, parité et frontières | 33/33, dont les 21 conservés du lot 1 |
| Scripts historiques redirigés vers les API extraites | 198/198 ; 171 appellent les modules, 8 111 appels |
| TypeScript et build portable | Réussis, un HTML d’environ 528 ko |
| Recette du shell lot 1 | Réussie, quatre résolutions |
| Recette Personnages lot 2 | Réussie, quatre résolutions, portraits/quota/import/export |
| Conflit pendant un brouillon | Détecté, texte conservé, aucune écriture du brouillon périmé |
| Hors ligne du document embarqué | Import, ressources, rechargement et export réussis |
| Navigation native file:// locale | Bloquée par la politique cloud ; résultat Linux CI à distinguer du Mac |


Résultats détaillés des commandes et parcours consignés dans la PR du lot 2 et les rapports
`work/lot2-before.json`, `work/lot2-after.json`, `work/lot2-browser/results.json`.

- **243/243 scripts historiques réussis avant et après**, HTML et catalogue CSV inchangés.
- 198 scripts JS réexécutés avec API extraites ; 171 appellent réellement ces modules,
  pour 8 111 appels publics. Les autres ne prouvent pas à eux seuls une intégration React.
- 33 tests de contrats/parité/frontières : 21 conservés du lot 1, 12 nouveaux pour personnages,
  ressources, patch minimal, IDs, profils, quota, révision, annulation et portraits.
- La recette navigateur du lot 1 reste présente. Un sélecteur a été précisé pour distinguer
  les deux panneaux Gestion lorsque tous deux annoncent un refus de stockage ; aucune assertion retirée.
- **Parcours React réussi** aux quatre tailles : 1440×1024, 1280×800, 768×1024, 390×844.
  Il couvre import, cartes, ressources, profils, édition PJ/PNJ, portraits valides/refusés,
  onglet après rechargement, annulation/focus, quota puis reprise, export/réimport et liens de lieux.
- Scénarios supplémentaires : conflit réel entre onglets pendant un brouillon ; démarrage
  froid du document embarqué sans réseau, persistance des ressources et export local.
- Le cloud de développement bloque `file://` : l’essai natif est tenté et sa limite enregistrée,
  sans contourner la politique. Les résultats natifs de la CI Linux sont indiqués séparément dans la PR.

Les erreurs découvertes pendant l’intégration (défilement d’onglets, libellés de formulaire,
création depuis le formulaire complet et navigation après transaction) sont traitées dans
ce lot et couvertes par la recette. Aucune règle n’a été réinterprétée ; ce n’est pas un
audit réglementaire supplémentaire.

## Limites et risques restant à valider

- Création PJ manuelle : pas de nouveau préréglage automatique de Livret, récompense,
  attribution ou changement de maîtrise. Les suivis et techniques existants sont conservés,
  les techniques de fiche restent consultables.
- Les lieux sont consultables sur les fiches PNJ, pas éditables. Arbre et relations avancées
  attendent le lot 3. Le moteur de combat reste disponible dans l’ancien HTML.
- Web Locks protège les écritures lorsqu’il est disponible ; sinon la détection est optimiste.
  Privilégier une fenêtre éditrice. Un conflit conserve le brouillon ouvert mais ne propose
  pas de fusion ou de réapplication automatique ; en conserver une copie avant rechargement.
- La portée du stockage local, les autorisations et le fonctionnement file:// dépendent du
  navigateur. La recette du lot 2 sur le Mac du propriétaire reste nécessaire.
- La compatibilité vaut pour les formats historiques pris en charge et les normalisations
  existantes ; elle ne transforme pas tout JSON corrompu en sauvegarde valide.

## Réversibilité et suite

L’ancien HTML, les tests et les documents historiques restent présents. Trois ensembles
lisibles : frontières/commandes, interface/sauvegardes/tests, documentation/CI. La branche
et la PR du lot 1 restent distinctes. Ouvrir l’ancien HTML suffit pour revenir à l’application
historique ; aucun retour de migration destructif n’est nécessaire.

Après validation du lot 2 seulement : **lot indépendant Bibliothèque de techniques**,
branche et PR propres, 111 techniques, recherche/filtres/fiches v0 et données existantes,
sans attribution, maîtrise globale ou combat. Les critères sont dans ROADMAP.md.
Ne pas commencer le lot 3 sans accord ; ne fusionner ni déployer sans autorisation.
