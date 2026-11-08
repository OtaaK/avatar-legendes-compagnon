# Correctifs après recette UI/UX — points 3, 4 et 6

Branche `correctifs/retours-recette-uiux`, depuis `1e57d22` (lot 6, PR nº 9).
Retours du propriétaire : le choix Légendaire garde cinq fatigues, les cartes conservent
l’ancien nom d’un lieu renommé, aucun retrait de combattant n’est proposé.
Aucune fusion dans main ni suppression de fichier dans cette mission.

## 3. Importance Légendaire et fatigue

Le problème confirmé est le parcours : changer l’importance ne proposait pas visiblement
l’adoption des capacités. Le modèle savait déjà enregistrer quinze fatigues, mais le choix
restait une classification, séparée du profil pour protéger les sauvegardes anciennes.

Désormais, choisir une importance connue propose explicitement de préparer son profil :
pour Légendaire, 15 fatigues, huit états, équilibre maximal +4. Accepter prépare le brouillon
et ouvre sa configuration ; annuler conserve seulement la classification. Rien n’est enregistré
avant Enregistrer la fiche. Les nombres proposés ne changent aucune règle existante.

Pour une fiche déjà Légendaire mais encore à cinq fatigues, le panneau s’ouvre dès Modifier,
avec un rappel des capacités proposées et le bouton Proposer les valeurs de l’importance.
Une indication distingue toujours la fatigue proposée de la capacité enregistrée.
Les noms d’états déjà configurés sont réemployés dans la proposition, en conservant les
états cochés. Les noms manquants ne sont pas inventés : compléter les huit noms et le principe
reste nécessaire avant validation. Le message d’erreur refuse un profil incomplet ; il ne
confirme pas faussement un enregistrement. Une fois validées, les quinze cases sont conservées
sur la fiche, la carte, la copie ajoutée au combat et après rechargement. Une copie déjà
ajoutée avant ce changement reste indépendante : en préparation, la retirer puis la rajouter
permet de repartir du profil actualisé. Le retrait ne reporte pas ses ressources sur la fiche.

## 4. Nom du lieu sur la carte simplifiée

La liaison à identifiant stable était correcte et la fiche pouvait résoudre le nouveau nom,
mais la galerie PNJ n’était pas reconstruite au retour de Lieux. Le DOM conservait l’ancien texte.
Le retour à Personnages rafraîchit désormais les cartes, filtres et la fiche consultée sans
réécrire les modèles ni écraser un brouillon actif.

Si le filtre sélectionnait l’ancien nom et que cette catégorie n’existe plus dans les positions,
il suit le nouveau nom après un enregistrement réussi. Si d’autres lieux homonymes ou textes
historiques utilisent encore l’ancien nom, ce filtre reste légitime et n’est pas réinterprété.
Le propriétaire peut sélectionner le nouveau nom. Les liens PNJ ne sont jamais cassés par le
renommage ; les textes historiques non liés ne sont pas rapprochés automatiquement.
Une erreur de stockage conserve ancien lieu, ancien filtre et brouillon de renommage.

## 6. Retirer un combattant

Chaque combattant dispose de Retirer du combat. La confirmation précise le nom et le nombre
d’engagements retirés, indique que la fiche permanente reste conservée et annonce l’annulation.
La commande retire la copie et ses seuls engagements, conserve les autres combattants,
le journal et la séquence d’identifiants, et crée un instantané d’annulation.
Les PJ et PNJ liés restent dans Personnages et peuvent être ajoutés à nouveau.

Le retrait est autorisé à la déclaration, avant révélation, sans action ni proposition en
attente et sans dépendance mécanique active. Piège, effet lié, protection, bonus ou référence
mécanique restante empêchent le retrait : une explication est visible et la commande reste
indisponible. Les effets doivent être résolus ou retirés par leurs commandes explicites.
Ce bouton ne résout aucune règle de départ, de défaite ou d’expiration à la place du MJ.
Il ne supprime pas silencieusement les conséquences sur d’autres personnages.

L’historique permet de restaurer exactement le combattant et ses engagements, y compris après
export/import ou rechargement. Le dernier combattant peut également être retiré. Une panne
pendant l’enregistrement restaure le combat précédent et réaffiche ses contrôles.

## Vérifications

Référence dans une copie isolée du commit parent : **241/241 scripts réussis**.

| Vérification finale | Résultat |
|---|---|
| Référence isolée | 241/241 scripts |
| Suite complète finale | **243/243 scripts réussis** |
| JavaScript | 198 scripts |
| Navigateur | 45 scripts |
| Nouveaux scénarios de retrait | 25, dans un script |
| Nouveau parcours des trois retours | Quatre formats, dans un script |

Rapport local : `/workspace/work/retours-uiux-final.json`. Aucun échec non résolu ; la limite
file:// du cloud reste signalée. La première campagne trouvait seulement le clic de bascule
historique qui refermait le panneau ouvert ; après adaptation, son parcours puis toute la
suite ont été réexécutés avec succès.

Les nouveaux contrôles comprennent :

- `test_retrait_combattant.cjs` : 25 scénarios sur retrait simple/lié/dernier, engagements,
  identifiants, instantanés, annulation exacte, import, phase et dépendances protégées.
- `test_retours_uiux.py` : quatre formats (1280×900, 390×844, 320×640, 844×390), classification
  seule ou profil proposé, huit noms requis, quinze cases, lieu et filtre rafraîchis,
  quota de renommage, retrait confirmé/refusé, quota de combat, annulation après rechargement,
  protections actives, conservation de la fiche, combat vide et sauvegarde complète restaurée.
- Parcours galerie et fiches existants repris sans retrait d’assertions. Ils refusent désormais
  explicitement la proposition de profil lorsqu’ils testent la classification seule.

Le nouveau scénario de filtre ouvre d’abord le panneau Filtres et tri, comme un utilisateur ;
sa première version tentait de sélectionner un champ encore masqué. Aucun contrôle de visibilité
n’a été contourné. Le parcours historique de profils ouvre désormais le panneau seulement s’il est fermé :
il peut déjà être ouvert pour une fiche Légendaire restée à cinq fatigues. Son clic de bascule
inconditionnel le refermait. Ses assertions sur profils, quotas, sauvegardes et combat restent
conservées, ainsi que tous les tests de régression existants.

Le catalogue, la matrice, les quantités des effets et les formats/clés des sauvegardes ne changent
pas. La suppression est une commande administrative protégée ; aucune règle n’est inventée.
Le contrôle file:// reste limité dans le cloud, comme dans les rapports précédents : chargement
HTTP local puis coupure réseau, pas de certification du double-clic macOS.

## Revalidation courte

Télécharger de nouveau le HTML de cette branche via [le guide actualisé](RECETTE_REFONTE_UI_UX.md).
Les anciennes copies téléchargées ne se mettent pas à jour automatiquement.

1. Sur un PNJ fictif, Modifier → Légendaire → accepter la préparation. Compléter les huit noms
   d’états et le principe, puis enregistrer. Vérifier 15 cases sur fiche et carte, puis recharger.
   Pour une fiche déjà classée Légendaire, utiliser le panneau ouvert et son bouton Proposer.
2. Renommer un lieu lié, revenir par Personnages : la carte et la fiche doivent afficher le
   nouveau nom. Vérifier aussi le filtre si l’ancien nom était sélectionné.
3. Ajouter deux combattants en préparation, les engager, retirer l’un d’eux puis annuler.
   La fiche de Personnages doit rester présente, et l’annulation doit restaurer les engagements.

Ces correctifs sont proposés dans une PR dépendante, sans fusion automatique de la chaîne UI/UX.
