import { previewExternalResourceEdits, externalResourceState, type ExternalRecord } from '../../packages/application/src/external-field-preview';
import type { BusinessSession, PlayerCharacter } from '../../packages/domain/src/contracts';
const input:ExternalRecord={fatigue:null,future:{keep:true}};
const p=previewExternalResourceEdits(input,[{field:'fatigue',action:'set',value:0}]);
const s=externalResourceState(input,'fatigue');
if(s.kind==='value'){const n:number=s.value;void n;}
// @ts-expect-error Une absence n'est pas un zéro.
const n:number=s.value;
// @ts-expect-error Le prévisualiseur externe ne représente pas une session métier.
const session:BusinessSession=p;
// @ts-expect-error Une fiche externe conservée n'est pas un PJ canonique.
const pj:PlayerCharacter=p.candidate;
// @ts-expect-error L'intention keep ne porte pas une valeur par défaut.
previewExternalResourceEdits(input,[{field:'fatigue',action:'keep',value:0}]);
// @ts-expect-error Suppression explicite, pas une affectation undefined.
previewExternalResourceEdits(input,[{field:'fatigue',action:'set',value:undefined}]);
// @ts-expect-error L'aperçu publié est en lecture seule.
p.candidate.fatigue=3;
