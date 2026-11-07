# V1.69 — Détection du pas lourd : action obsolète et annulation

Une technique ennemie annulée ne peut plus être proposée en transmettant une copie obsolète de son action. Le moteur consulte l’action canonique dans `s.actions` à partir de son identifiant avant de produire des événements. La réversibilité par `undo` est conservée.

Limite : les propositions déjà construites avant l’interruption restent à résoudre préalablement selon le fonctionnement de V1.68. La validation du choix de la cible et les situations narratives demeurent sous arbitrage MJ.
