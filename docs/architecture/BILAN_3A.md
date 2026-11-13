# Mission 3A — contrats et contrôles avant extraction

13 novembre 2026. Branche `architecture/contrats-parite`, base main
`55d56f6f0e49e6cb480099fd06282f85d889f0db`. **Aucune fusion ni refonte UI.**

## Résultat concret

- [Plan en cinq étapes](PLAN_MISSION_3.md), avec une PR par étape : contrats, sources/HTML
  généré, persistance, affichage/commandes, imports de tests. Dépendances supplémentaires
  prévues : zéro ; tout nouveau besoin sera proposé avant installation.
- [Contrats observés](CONTRATS.md) pour le moteur, règles, fiches, Livrets, validations et
  persistance. [REFERENCE.json](REFERENCE.json) fige 80 entrées publiques, dont 67 fonctions,
  champs par défaut, identifiants des 111 techniques/dix Livrets et clés de stockage.
- `tests/support/legacy-application.cjs` centralise le chargement des corps existants dans
  une VM isolée. Aucun corps de règle recopié ni moteur parallèle. Le chargement métier
  n’exécute pas le démarrage UI, n’a pas de DOM, ne lit/écrit pas le stockage ou le réseau.
- La persistance peut être testée séparément avec un stockage et un état de reprise
  explicitement fournis ; ses notifications DOM sont simulées de façon limitée.
- Un scénario synthétique partagé tourne sous Node et dans le véritable HTML Chromium,
  avec comparaison des résultats/états et contrôle d’absence d’écriture de session.

Le HTML, données, ancien runner, 230 anciens scripts et leurs helpers sont **identiques
à main**. Aucun module métier n’est encore extrait et aucun HTML n’est encore généré.
Le pont de test utilise encore des repères textuels ; la migration des anciens tests
n’est pas annoncée comme accomplie. Les repères absents, dupliqués ou inversés sont refusés.

## Vérifications réellement exécutées

| Contrôle | Avant | Après |
|---|---:|---:|
| Scripts JS | 192/192 réussis | 193/193 réussis |
| Scripts navigateur | 38/38 réussis | 39/39 réussis |
| Total | 230/230 | 232/232 |
| Échecs | 0 | 0 |
| Limite cloud `file://` | 1 | 1, inchangée |

Les 230 scripts initiaux sont conservés et gardent les mêmes noms et codes de retour.
Leur contenu est comparé à Git, pas seulement leur nombre. Les suites sont lancées avec
`python scripts/test.py --jobs 2`, rapports locaux `work/architecture/before.json` et
`after.json`. GitHub fournit un contrôle distinct dans la PR, non déclaré réussi avant exécution.

Nouveaux contrôles :

- **20 scénarios JS** : forme des contrats, isolation, chargement sans effets, refus de
  repères mal formés, import fidèle et identifiants sécurisés, inconnus/manœuvres/maîtrises,
  préréglage/aperçu sans mutation, copie de combat indépendante, report volontaire,
  annulation, journal, quota, reprise bloquée, repli ancien et lecture indisponible.
- **Comparaison Node/Chromium** : même fonction de scénario, vrais exports du HTML,
  résolutions 1280×900 et 390×844. Le résultat, y compris états et messages de refus, est
  identique ; ni `lib`, ni `s`, ni localStorage ne changent, rechargement compris.
- `node scripts/architecture/check-contracts.cjs` confirme les observations et signale
  l’identité HTML avec la référence.
- L’ancien contrôle hors réseau demeure ; `file://` est bloqué dans le cloud et utilise
  alors HTTP local puis réseau coupé. Aucun double-clic Mac/Safari n’est prétendu.

Empreinte SHA-256 du HTML, avant et après :
`e9dfff872790584aabcfc282766c63764323644adf8ae22059a8c0f36a3bd468`.
Aucune dépendance JavaScript, installation utilisateur, clé ou format de sauvegarde ajouté.

## Limites constatées, non corrigées en cachette

Les contrats sont une description du logiciel, pas une certification des règles du jeu.
La parité porte sur les cas couverts, complétés par les tests historiques, pas toutes les
interactions possibles.

- Un appel isolé à `Roster.createCharacter` peut consommer une séquence avant un refus
  du nom. Les commandes UI concernées ont une restauration ; l’extraction doit la garder.
- Les champs inconnus des modèles sont conservés dans les cas testés. L’enveloppe
  extérieure d’export complet est reconstruite avec ses champs connus : sa conservation
  d’autres métadonnées n’est pas garantie par le code actuel. Aucun format nouveau n’est créé.
- Le journal multi-clés existant ne garantit pas une coordination générale entre onglets.
- L’ancienne référence de domaine des branches React n’est pas automatiquement celle du
  main sécurisé/nettoyé. Ni remplacement ni rétrogradation implicite de ces branches.
- Licence, visibilité et droits du catalogue restent hors de cette étape ; aucun texte
  officiel nouveau ou PDF ajouté. Aucun accès au livre n’est nécessaire pour déplacer
  zéro règle dans cette étape ; aucune nouvelle affirmation réglementaire n’est formulée.

## Suite et retour arrière

Examiner cette première PR avant toute fusion. L’étape suivante sera l’extraction fidèle
avec génération déterministe et contrôle de divergence dans sa PR dédiée ; aucune
édition manuelle parallèle de deux moteurs. Le découpage de packaging sera explicité.

Retour arrière : annuler les ajouts de cette étape ; le HTML et les anciens tests n’ayant
pas changé, aucun format de données n’a à être restauré. Pas de suppression de branche,
force push ou réécriture d’historique. La refonte visuelle reste différée.
