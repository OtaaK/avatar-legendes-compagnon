# V0.53 — Fort comme un chêne : protection contre les statuts négatifs

- Source : technique universelle **Fort comme un chêne**, page 286 du livre fourni.
- La technique accorde **Prêt** et arme une garde pour la passe courante (déjà proposé par le moteur).
- La validation d’effets bloque désormais les **statuts négatifs hostiles** Gêné, Piégé, Étourdi et En danger sur un personnage gardé ; les statuts positifs, la fatigue et les états cochés restent applicables.
- Une garde activée dans la même validation est prise en compte indépendamment de l’ordre des événements.
- Prévisualisation, rejet et annulation n’altèrent pas les personnages ; garde périmée inactive.
- Limite : l’identification d’un statut infligé par la fiction et les autres sources narratives reste à arbitrer par le MJ. Les états cochés ne sont pas des statuts négatifs.
- **7 techniques avancées sur 102** disposent d’une validation automatisée dédiée. Les tests Node ne remplacent pas des essais navigateur.
