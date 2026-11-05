const {test} = require('node:test');
const assert = require('node:assert/strict');
const {load,referenceRank,enumerate} = require('./fixtures.cjs');
const d=load();
test('original ten questions, 19 points, all nine valid legacy keys',()=>{
  assert.equal(d.questions.length,10);
  assert.equal(d.questions.reduce((sum,q)=>sum+q.weight,0),19);
  assert.equal(Object.keys(d.moves).length,9);
  for(const q of d.questions)for(const opt of q.options)assert.ok(d.moves[opt.move]);
  assert.ok(d.moves.meaningmaker);assert.ok(d.moves.synthesizer);
});
test('27 unique signatures and correct five family counts',()=>{
  assert.equal(d.matching.validateSignatures(d.types).length,0);
  assert.deepEqual(Object.keys(d.families).map(f=>d.types.filter(t=>t.family===f).length),[7,7,6,4,3]);
});
test('legacy scores map identically to renamed signature keys',()=>{
  const old={meaningmaker:7,synthesizer:6}, renamed={communicator:7,summarizer:6};
  const rank=s=>JSON.stringify(d.matching.matchWizards(s,d.types));
  assert.equal(rank(old),rank(renamed));
  assert.equal(d.matching.matchWizards(old,d.types)[0].id,'bard');
});
test('equal, zero and near-equal scores use stable documented ranking',()=>{
  for(const scores of [{},Object.fromEntries(Object.keys(d.moves).map(id=>[id,2])),{explorer:4,listener:4,meaningmaker:3,synthesizer:4,reflector:4}]){
    const actual=d.matching.matchWizards(scores,d.types),expected=referenceRank(scores,d.types);
    assert.equal(JSON.stringify(actual.map(x=>[x.id,x.matchScore])),JSON.stringify(expected.map(x=>[x.id,x.matchScore])));
    assert.equal(d.matching.hasCloseMatch(actual),expected[0].matchScore-expected[1].matchScore<=2);
  }
  assert.equal(d.matching.hasCloseMatch([{matchScore:10},{matchScore:8}]),true);
  assert.equal(d.matching.hasCloseMatch([{matchScore:10},{matchScore:7}]),false);
  assert.equal(d.matching.hasCloseMatch([]),false);
});
test('all 27 Wizards are reachable across all 177,147 legal answer paths',()=>{
  const result=enumerate(d);
  assert.equal(result.total,177147);
  assert.equal(Object.keys(result.witnesses).length,27);
  for(const type of d.types){
    const witness=result.witnesses[type.id];assert.ok(witness);
    assert.equal(Object.values(witness.scores).reduce((sum,n)=>sum+n,0),19);
    assert.equal(d.matching.matchWizards(witness.scores,d.types)[0].id,type.id);
  }
  console.log('Exact reachability: '+JSON.stringify(result.counts));
});
