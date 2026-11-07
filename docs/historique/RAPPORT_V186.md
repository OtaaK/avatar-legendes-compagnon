# V1.86 — Armure de terre, absorption dans la résolution générale

Les attaques hostiles effectivement transmises après Protection, Bouclier de roche et Se mettre à l’abri consomment désormais automatiquement au moins un point de réserve par événement de fatigue ou nouvel état, tant que la réserve est disponible. Une fatigue est réduite de 2 par point, un état est annulé pour 1 point. Un choix facultatif `decisions["armor:"+eventId]` permet de dépenser davantage pour une fatigue. La réserve est modifiée après prévalidation atomique ; l’épuisement de l’armure retire l’effet temporaire et réévalue Avantagé.

Limites : la dépense automatique est calculée par événement hostile, pas par groupe narratif d’attaque. Les réactions Riposter / Serrer les dents s’appuient désormais sur les effets résiduels. Les choix de dépense supplémentaires ne sont pas encore exposés dans l’interface MJ (1 point par défaut).
