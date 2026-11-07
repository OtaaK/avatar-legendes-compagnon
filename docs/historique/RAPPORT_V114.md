# V1.14 — Export CSV du journal narratif

- Ajout d’un bouton **Exporter le journal filtré (CSV)** dans l’onglet Déroulement.
- Export des notes correspondant au filtre de scène et à la recherche textuelle (sans la limite visuelle des 20 dernières notes).
- Colonnes : Scène, Titre, Passe, Note ; séparateur point-virgule ; encodage UTF-8 avec BOM ; échappement des guillemets et protection des cellules susceptibles d’être interprétées comme formules.
- Export sans mutation de l’état du combat ni de son historique.
- Test dédié : `test_scene_export_v114.cjs`.

L’export est un fichier de consultation, non un format de réimportation de sauvegarde.
