import type {
  PlayerCharacter, NonPlayerCharacter, Character, Library, CompleteBackup, PrivateCombat,
  BusinessSession, CharacterTechnique, PlaybookPreparation, AdvancementReview,
} from '../../packages/domain/src/contracts';
import type { CharacterCardView, BusinessStore, PrivateDescriptionRepository } from '../../packages/application/src/business-ports';
import { createCompanionServices } from '../../packages/application/src/companion-services.js';
import { createBusinessRepository } from '../../packages/persistence/src/business-repository.js';
const technique: CharacterTechnique = { name:'Ancienne technique', mastery:'pratiquee', future:{keep:true} };
const pj: PlayerCharacter = {
  id:'char-1', kind:'PJ', name:'Exemple', stats:{creativite:0, concentration:1, harmonie:-1, enthousiasme:2},
  fatigue:3, balance:1, center:-2, principles:['Devoir','Liberté'], conditions:[], statuses:['En danger'],
  techniques:[technique], future:{retained:true}, relationships:['Relation libre'],
};
const npc: NonPlayerCharacter = {
  ...pj, id:'char-2', kind:'PNJ', importance:'Légendaire', fatigue:15,
  npcResources:{format:'avatar-npc-resources',version:1,combatant:true,fatigueMax:15,balanceMax:4,conditions:['État propre']},
  placeLinks:{homeId:'île/ancienne',currentId:null,associatedIds:['lieu inconnu']},
};
const library: Library = {version:2,seq:3,characters:[pj,npc],future:{extra:42}};
declare const session: BusinessSession;
const backup: CompleteBackup = {format:'avatar-compagnon-backup',version:2,library,combat:session.combat,future:{keep:true}};
const combat: PrivateCombat = {format:'avatar-compagnon-combat',version:2,combat:session.combat};
declare const store: BusinessStore;
store.execute(0, draft => { draft.library.characters[0].fatigue=1; });
// @ts-expect-error Commande asynchrone interdite dans une transaction synchrone.
store.execute(0, async draft => draft);
// @ts-expect-error Snapshot publié en lecture seule.
store.getSnapshot().session.library.characters.push(pj);
// @ts-expect-error La maîtrise pratiquée ne disparaît pas au profit du modèle v0 à deux niveaux.
const invalidMastery: CharacterTechnique = {name:'X',mastery:'mastered'};
// @ts-expect-error Le format canonique conserve PJ en majuscules.
const invalidKind: Character = {...pj,kind:'pj'};
declare const card: CharacterCardView;
// @ts-expect-error Une carte de présentation n'est pas une fiche persistante.
const invalidCharacter: Character = card;
declare const prep: PlaybookPreparation;
// @ts-expect-error La préparation d'évolution n'applique pas une récompense automatiquement.
const invalidReview: AdvancementReview = {bookId:'marteau',proposal:{kind:'moment'},errors:[],decisions:[],sourcePage:214,status:'pending',applied:true};
declare const descriptions: PrivateDescriptionRepository;
const privateLoaded = descriptions.load().descriptions;
const api = createCompanionServices({repository:createBusinessRepository({storage:{getItem:()=>null,setItem:(_k,_v)=>{}}})});
// @ts-expect-error L'identité ne se modifie pas via un patch canonique.
api.characters.edit(0,'char-1',{id:'autre'});
// @ts-expect-error Les données de catalogue ne sont pas mutables.
api.queries.techniques()[0].name='Écrasé';
// @ts-expect-error Aucun DOM nécessaire pour vérifier ces contrats.
document.createElement('div');
void [backup,combat,prep,privateLoaded];
