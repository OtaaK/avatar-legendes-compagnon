# Validation V2.33 — techniques de Terre

Date : 7 novembre 2026. Base auditée : V2.32 (`48c9b3075f36afc8b75b13470377cdeb0c6b91d1`).

## Sources et statut

Les 13 entrées du catalogue ont été comparées au PDF fourni : p.289 pour les techniques, p.100 pour la fatigue, p.155–157 pour les statuts. Le document commercial n'est pas distribué dans le dépôt. Les rapports historiques restent des références d'évolution, pas une spécification normative de la version courante.

Statut retenu : **assistance partielle testée**. Les huit anomalies confirmées ci-dessous sont corrigées ; les questions de règles non tranchées restent dans `DECISIONS.md`. Ce rapport ne certifie pas toutes les combinaisons de techniques.

## Résultats

| Vérification | Résultat |
|---|---|
| Scripts JavaScript | 189/189 réussis, Node v24.22.1 |
| Nouveaux scénarios moteur Terre | 26, dans `app/test_terre_v233.cjs` |
| Scripts Python/Chromium | 34/34 réussis |
| Nouveau parcours Terre | 28 parcours : 13 techniques × 2 tailles d'écran, Boue protégée, annulation d'un choix de débordement |
| Persistance | Origine HTTP locale, vrai localStorage Chromium, rechargement, puis undo et nouveau rechargement pour les 13 techniques |
| Syntaxe du script applicatif | `node --check` réussi |
| Espaces et conflits de patch | `git diff --check` réussi |

Plusieurs scripts navigateur historiques utilisent un stockage simulé. Le nouveau test Terre utilise le stockage réel ; cela ne prouve pas la durabilité sur tous les navigateurs, profils ou modes privés.

## Tableau des 13 techniques

Les durées et règles communes proviennent du livre ; les détails narratifs restent au MJ. Les fichiers listés sont des points de couverture pertinents, pas une mesure de couverture de lignes.

| Technique | Attendu et comportement V2.33 | Tests principaux | Limites / décisions ouvertes |
|---|---|---|---|
| Armure de terre | Réserve 3 sans coût, Avantagé tant que réserve, au moins 1 point par attaque causant fatigue/état, 2 fatigues ou 1 état annulé par point. Sources persistantes concurrentes distinguées d'un avantage indépendant. | V175–200, V225–230, V233 ; navigateur V227 et V233 | Anciennes provenances ambiguës : arbitrage MJ ; commandes manuelles à utiliser sans double saisie. |
| Bouclier de roche | Coût 1, Gêné au protégé, première attaque bloquée par passe, révocation et réduction atomique de coût. Les paiements ne sont pas bloqués ; une projection attachée à une attaque bloquée ne passe plus. | V157–164, V211, V217, V228–229, V233 ; navigateurs V161/V233 | Immobilité, accès au matériau et cumul de boucliers arbitrés. |
| Boue gluante | Assaillants engagés confirmés par le MJ ; Gêné, droit nominatif de Frapper à la passe suivante, hors quota/approche ; protections et réactions communes. | V149, V166, V229, V233 ; navigateur V233 | Identification des assaillants narrative ; toutes les combinaisons offensives non certifiées. |
| Colonne de pierre | Gêné, puis Piégé, puis En danger selon les statuts présents ; revalidation avant commit. | V116, V150, V182, V205 ; navigateur V233 | Maintien des statuts précédents selon leur cause ; aucun effacement inventé. |
| Détection du pas lourd | Sens sismique confirmé ; Prêt et interruption dans la passe ; coût personnel 1 ; paiement adverse 3 ou annulation nominative d'une technique non résolue. | V167–170, V203, V229, V233 ; navigateur V233 | Mode paiement toujours confirmé par le MJ ; pas d'annulation rétroactive. |
| Enfouissement | Coût volontaire 2 et Piégé indivisibles ; activation impossible à fatigue pleine. | V117, V205, V214, V233 ; navigateur V233 | Terrain et libération narrative ; règle générale de Piégé conservée. |
| Entraves de métal | Gêné verrouillé, Avantagé si engagement ; libération et fin de combat annulables ; restauration réelle de la sauvegarde acceptant le créateur de l'effet. | V193–196, V209–232, V233 ; navigateur V233 | Libération narrative MJ explicite conservée comme dérogation ; pas une troisième exception du livre. |
| Escalier de poussière | Position haute confirmée, Avantagé + Prêt, ou paiement adverse de 2 annulant l'effet ; paiement non absorbable. | V148, V177, V203, V233 ; navigateur V233 | Annulation après activation non tranchée ; position narrative. |
| Étoile de lave | Coût 1, Avantagé pendant activité, entretien volontaire 1 en fin de passe ; Fracasser gratuit après attaque, y compris aux passes ultérieures si entretenue. | V171–181, V201, V207–208, V233 ; navigateur V233 | Attaque sans conséquence offensive : décision ouverte ; anciennes provenances ambiguës non migrées automatiquement. |
| Gantelet de terre | Coût 1, 2 fatigues ou état ; projection ou résistance +1 ; une attaque bloquée ne projette plus. | V117, V174, V204–214, V233 ; navigateur V233 | Qui choisit état/fatigue : interprétation antérieure conservée (cible). |
| Mords la poussière | Gêné et interdiction de Défendre à la passe suivante ; restriction datée. | V118, V204–205 ; navigateur V233 | Durée narrative de Gêné ordinaire ; aucun changement de règle supplémentaire. |
| Mouvements tectoniques | Une cible gratuite ou zone coût 1 ; Gêné effectivement actif à la passe suivante puis expirant, Étourdi si déjà Gêné. | V119, V150, V182, V204–206, V233 ; navigateur V233 | Durée de la branche Étourdi à trancher ; zone confirmée par le MJ. |
| Projection tellurique | Coût 1, Avantagé et désengagement des ennemis sélectionnés incapables de suivre ; retour au sol narratif. | V107, V110, V115, V165, V204 ; navigateur V233 | Pas de restauration automatique des anciens liens ; le MJ décide des engagements au retour. |

## Anomalies et corrections vérifiées

- **A1** : Enfouissement à fatigue 5 ne peut plus être financé en états. Une ancienne proposition V2.32 sans indicateur de coût est requalifiée depuis son action. Un bouclier peut toujours réduire le coût avant contrôle ; les dégâts involontaires restent convertibles.
- **A2** : Mouvements tectoniques survit à la transition et affecte réellement le quota d'un PNJ à la révélation suivante ; expiration après cette passe. Une gêne indépendante reste préservée.
- **A3** : étoile activée en passe 1, entretenue puis attaque en passe 2 : Fracasser accepté, gratuit, non duplicable et annulable. Sans entretien, l'étoile disparaît.
- **A4** : Armure/Étoile activées et retirées dans les deux ordres : Avantagé disparaît avec la dernière source. Un avantage indépendant reste présent ; métal + armure vérifiés.
- **A5** : Frappe de Boue contre Bouclier, Armure et Abri ; réaction Riposter ; quota normal disponible ; rollback tardif ; droit restauré par undo. Interface : une frappe bloquée sur cible à fatigue 5 ne demande pas d'états.
- **A6** : résistance à Escalier avec Bouclier ou Armure : fatigue payée intégralement, aucune protection consommée.
- **A7** : Gantelet projetant contre Bouclier, Abri ou Protection : coût payé, dégâts bloqués et engagement conservé ; undo exact.
- **A8** : après activation de chaque technique, rechargement depuis localStorage identique, puis undo et nouveau rechargement identiques. Une référence de créateur inconnue demeure rejetée.

## Compatibilité et risques résiduels

- Formats JSON et clés de stockage préservés ; nouveaux champs facultatifs sur les événements et les actions supplémentaires.
- Aucun nettoyage automatique des anciens booléens de provenance ambigus : une source indépendante ne peut pas toujours être reconstruite sans inventer son origine.
- Les coûts volontaires des autres familles doivent faire l'objet d'un audit distinct ; le présent correctif les laisse inchangés.
- Les sept décisions ouvertes sont consignées dans `DECISIONS.md` ; leur comportement antérieur est conservé.
- Les tests des 13 formulaires utilisent un état de combat préparé, puis les vrais contrôles de saisie et de validation. Ils ne constituent pas 13 campagnes entièrement créées depuis les fiches personnage.

## Reproduction

Depuis la racine :

```bash
for test in app/test*.cjs; do node "$test" || exit 1; done
for test in app/test*.py; do python "$test" || exit 1; done
```

Pré requis navigateur : Python, Playwright et `/usr/bin/chromium`. Les tests HTTP locaux ouvrent uniquement un serveur temporaire sur `127.0.0.1`.
