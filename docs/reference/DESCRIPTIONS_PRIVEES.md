# Descriptions privées : charger, conserver et restaurer sur Mac

Aucun texte intégral du livre n’est inclus dans le dépôt, le prototype, les rapports ou les exports de campagne. Au premier lancement, aucun texte privé n’est chargé. Les 111 références du catalogue restent consultables ; une description absente est signalée, jamais remplacée par un résumé.

## Préparer les 111 descriptions depuis votre PDF, sans commandes

1. Ouvrez le nouveau `index.html` dans Chrome sur votre Mac, puis **Gestion**.
2. Dans **Descriptions privées des techniques**, cliquez sur **Préparer depuis mon PDF personnel** et choisissez votre PDF officiel français.
3. Attendez la lecture des 12 pages utiles. Le PDF est traité dans le navigateur, sans envoi à un serveur. Il n’est pas conservé par l’application.
4. La fenêtre annonce les **111 passages** associés aux identifiants stables. Cliquez sur **Confirmer le chargement privé**, ou annulez sans rien enregistrer.
5. Cliquez sur **Exporter mes descriptions privées**. Conservez le fichier `avatar-descriptions-privees.json` dans un dossier privé de votre Mac, avec votre exemplaire du livre.
6. Dans **Techniques**, ouvrez les fenêtres pour consulter les textes. Vérifiez en particulier les continuations de Riposter et Se recueillir, ainsi que les textes dont la mise en page est inhabituelle.

Vous pouvez couper le Wi-Fi avant ces opérations : bibliothèque PDF.js et worker sont embarqués dans le HTML. Aucun service de conversion, CDN ou compte n’est nécessaire.

Le lecteur vise **l’édition française et la mise en page du PDF fourni** : pages imprimées 158–161 et 286–293, soit pages PDF 159–162 et 287–294. Il contrôle la taille des pages, les 111 titres, les approches et la présence des passages. Si le format est différent, scanné, chiffré ou illisible, la préparation échoue explicitement ; aucun import partiel ni contenu inventé n’est enregistré. PDF : 64 Mo maximum.

**Limite de l’extraction :** ce n’est pas une certification éditoriale. Le texte est extrait avec ses lignes et paragraphes ; les césures discrétionnaires sont réunies. La mise en page et certains caractères peuvent demander une correction dans votre JSON privé, puis une réimportation. Aucun moteur de règles n’est exécuté ou modifié. La lecture vise tout le passage sous chaque technique de base, explications comprises, et les descriptions de l’annexe ; les introductions générales aux approches et les pages étrangères aux techniques sont exclues. Les deux continuations intercolonnes/interpages sont explicitement prévues.

## Restaurer ou changer de prototype/navigateur

Ouvrez **Gestion → Charger un fichier privé de descriptions**, sélectionnez votre JSON exporté, puis confirmez. Toutes ses entrées sont chargées en une seule opération ; pas de saisie individuelle. Le fichier peut contenir les 111 techniques ou un sous-ensemble. **Un import remplace le jeu privé précédent**, il ne fusionne pas automatiquement les banques.

Les descriptions persistent dans le stockage local du navigateur, sous `avatar-compagnon-private-technique-texts-v1`, indépendamment des campagnes. Après rechargement hors ligne, elles restent consultables. Chrome peut attribuer un stockage différent à un autre chemin `file://` : conservez toujours le JSON privé pour restaurer après déplacement ou remplacement du HTML. Effacer les données de navigation peut aussi effacer cette banque.

L’export privé explicite ne contient que les descriptions et leurs identifiants. Il ne contient ni personnages, ni combat, ni données de campagne. Inversement, l’export de campagne ne contient jamais ces descriptions. N’ajoutez pas votre JSON privé à GitHub, à un rapport de bug, ni à une archive publique du prototype.

## Format JSON versionné

Exemple entièrement synthétique, sans extrait du livre :

```json
{
  "format": "avatar-technique-descriptions-privees",
  "version": 1,
  "techniques": [
    { "id": "base-frapper", "description": "Texte personnel synthétique.\n\n• Premier élément\n• Dernier élément" }
  ]
}
```

Les IDs sont ceux de [l’inventaire](INVENTAIRE_TECHNIQUES.csv). IDs inconnus/dupliqués, version inconnue ou descriptions vides sont refusés. Maximum : 111 entrées, 1 000 000 caractères par texte, fichier JSON importé de 16 Mo. Les quotas effectifs du navigateur peuvent être inférieurs : un refus est annoncé et conserve la banque précédente. Le rendu est du texte, jamais du HTML exécutable.

L’annulation de l’aperçu et la consultation n’écrivent rien. L’effacement privé demande confirmation et ne touche pas aux campagnes. Le PDF choisi reste en mémoire pendant la préparation seulement ; son code JavaScript, ses actions et ses images ne sont pas exécutés ou rendus.

## Références techniques et droits

Les droits de redistribution publique des descriptions intégrales ne sont pas établis. Votre utilisation privée du fichier vous appartient ; aucune nouvelle licence de reproduction n’est présumée. Aucun fichier contenant les textes extraits ne sera joint à la PR ni à ses artefacts.

Le plan `packages/reference/src/pdf-layout.json` contient uniquement des identifiants et rectangles de lecture. `scripts/reference/build-pdf-layout.py` permet sa reconstruction locale avec pdfplumber ; il ne produit aucun texte du livre. Le contrôle source antérieur est dans `CONTROLE_TECHNIQUES_PDF.json` et le lecteur dans `read-private-pdf.ts`. Voir [la dépendance PDF.js et sa licence](DEPENDANCES.md).

## Présentation enrichie (correctifs finaux)

Les anciennes banques version 1 restent du texte brut : leurs astérisques sont littéraux et aucun contenu n’est converti silencieusement. Pour retrouver les italiques perdus dans un ancien export, relisez votre PDF via Gestion puis confirmez et exportez la nouvelle banque privée.

La version 2 accepte, par entrée, `textFormat: "markdown-lite"` avec `description` toujours textuel. Seuls `*italique*` et les échappements `\*` / `\\` sont interprétés ; les paragraphes, lignes, puces et alinéas restent visibles. Aucun HTML, image, lien ou script importé n’est exécuté. L’extraction PDF récupère les styles des polices, sans inventer de mots. Une banque enrichie exportée reste restaurable dans ce prototype ; une ancienne version du lecteur peut refuser ce nouveau format. Gardez vos fichiers d’origine.
