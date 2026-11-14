const assert=require('assert');
const {CombatCore:C}=require('../../src/domain/index.cjs').loadDomain();
// La transition de passe ajoute reedProtections dans certains combats historiques.
// Annuler doit rétablir le schéma EXACT, pas seulement les valeurs existantes.
{
 const s=C.createCombat();C.addFighter(s,'Terre');s.phase='fin';delete s.reedProtections;
 const before=JSON.stringify(s);C.nextRound(s);assert.equal(s.round,2);
 assert.equal(C.undo(s),true);assert.equal(JSON.stringify(s),before);
}
// Plusieurs transitions et annulations successives doivent être réversibles.
{
 const s=C.createCombat();C.addFighter(s,'Terre');s.phase='fin';delete s.reedProtections;
 const before=JSON.stringify(s);C.nextRound(s);s.phase='fin';C.nextRound(s);
 assert.equal(C.undo(s),true);assert.equal(s.round,2);
 assert.equal(C.undo(s),true);assert.equal(JSON.stringify(s),before);
 assert.equal(C.undo(s),false);
}
console.log('V1.89 : annulation exacte de la transition de passe et restaurations successives OK');
