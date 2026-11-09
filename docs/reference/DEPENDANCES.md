# Dépendances de la préparation privée

PDF.js (`pdfjs-dist` 5.4.394), © Mozilla Foundation, sous [licence Apache 2.0](PDFJS_LICENSE.txt), lit uniquement les pages utiles du fichier PDF sélectionné localement. Bibliothèque et worker sont embarqués dans le HTML portable ; aucun CDN, serveur de conversion ou service externe. Le code de PDF.js n’est pas modifié. Les versions sont verrouillées dans package-lock.json.

Cette dépendance ajoute environ 1,5 Mo au prototype pour permettre la préparation du JSON sans installation ni commande sur Mac. Elle ne fournit aucun texte du livre. Les polices ne sont pas rendues et les actions/JavaScript du PDF ne sont pas exécutés.
