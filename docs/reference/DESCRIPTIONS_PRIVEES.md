# Descriptions intégrales : disponibilité et usage local

Le PDF français fourni est lisible dans l'environnement de travail. Il n'est pas versionné.
Aucune licence de redistribution de ses descriptions intégrales n'a été trouvée dans le
dépôt. **Le HTML distribué n'en contient aucune nouvelle transcription intégrale.**
Les résumés `effet_resume` et `TECH_AUDIT.resume_verifie` restent dans le métier existant,
mais la bibliothèque ne les utilise pas comme descriptions officielles.

## Ce qui est contrôlé

Les 111 titres sont repérés sur leurs pages, dans leurs blocs typographiques, et rapprochés
des familles et approches. Neuf techniques de base : pages imprimées 158–160 ; 102 de
l'annexe : 286–293 (introduction page 285). Sur cette édition, page PDF = page imprimée + 1.
Les apostrophes, espaces, casse et marque de rareté sont normalisés pour ce rapprochement.
Exemple typographique : `Boum!` dans le catalogue, `Boum !` dans le livre ; l'astérisque
imprimé de rareté n'appartient pas au nom. Aucun nom métier ni identifiant n'est réécrit.

Le [contrôle JSON](CONTROLE_TECHNIQUES_PDF.json) contient noms, famille, approche, pages,
présence et empreinte des passages identifiés. **Il ne certifie pas une transcription
complète, les limites exactes de tous les paragraphes ou une nouvelle interprétation des
conditions.** Le repérage automatique ne remplace pas une revue éditoriale du fichier privé.
Aucune nouvelle description ou mécanique n'est inventée, ni affichée en remplacement.

Le script `scripts/reference/verify-techniques-pdf.py` reproduit ce contrôle local avec
pdfplumber et le PDF utilisateur ; la CI vérifie la matrice figée sans disposer du livre.
Les extractions de travail restent sous `work/`, ignoré par Git et exclu des artefacts CI.

## Fichier privé facultatif

Le chargement se fait dans **Gestion → Descriptions privées des techniques**. Le fichier
peut être partiel ; chaque ID doit appartenir au catalogue, être unique, et posséder une
chaîne `description` non vide. L'aperçu précède la confirmation ; celle-ci remplace le jeu
privé précédent. Les paragraphes et retours à la ligne sont affichés sans troncature.
Les listes peuvent conserver leurs puces et retours à la ligne dans la chaîne. Le texte
est rendu comme texte, jamais comme HTML exécutable.

Exemple **de structure uniquement**, avec un texte synthétique sans règle du livre :

```json
{
  "format": "avatar-technique-descriptions-privees",
  "version": 1,
  "techniques": [
    {
      "id": "base-frapper",
      "description": "Texte privé de l’utilisateur.\n\n• Élément de structure synthétique."
    }
  ]
}
```

Utiliser seulement un contenu dont l'usage local est autorisé. La préparation d'un fichier
fidèle depuis son exemplaire doit rester privée et faire l'objet d'une vérification humaine.
Aucun pack des 111 descriptions officielles n'est fourni dans cette livraison. Aucun service
externe n'est appelé ; ni le livre ni les textes privés ne sont envoyés par l'application.

Stockage : `avatar-compagnon-private-technique-texts-v1`, séparé du projet, des sauvegardes
Codex et du laboratoire. La consultation n'écrit rien. Un import privé explicite écrit
uniquement cette clé ; un quota/refus laisse le jeu précédent intact. Un effacement confirmé
ne vise que cette clé. Le contenu importé est fourni par l'utilisateur, pas certifié par
l'application. Limites explicites : 16 Mo par fichier, 1 000 000 caractères par description,
111 identifiants ; dépassement refusé, jamais tronqué.

Les exports de projet n'incluent pas les descriptions privées. Conserver son fichier privé
pour un autre navigateur ou un autre emplacement du HTML. En l'absence de texte, la fenêtre
signale « Description complète non chargée ». Elle ne présente pas un résumé comme intégral.
