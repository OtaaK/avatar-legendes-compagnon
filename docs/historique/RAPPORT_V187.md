# V1.87 — Choix de réserve dans l’interface MJ

La validation des propositions présente désormais au MJ un dialogue de dépense d’Armure de terre lorsqu’un impact de fatigue effectivement transmis peut utilement consommer plus d’un point. Un premier aperçu applique bouclier, interception et couverture ; le choix est enregistré dans `decisions["armor:"+eventId]` ; un second aperçu recalcule les fatigues avant les éventuels débordements. Annuler le dialogue interrompt la validation sans changer le combat.

Limite : le dialogue ne couvre que les impacts laissant une fatigue résiduelle après l’absorption initiale ; les impacts multiples sont toujours gérés événement par événement.
