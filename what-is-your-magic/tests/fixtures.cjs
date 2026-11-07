const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const app = path.resolve(__dirname, '..');
function load() {
  const context = vm.createContext({});
  for (const file of ['quiz-data.js','wizard-data.js','wizard-matching.js','wizard-guidance.js']) {
    vm.runInContext(fs.readFileSync(path.join(app,file),'utf8'),context,{filename:file});
  }
  return vm.runInContext('({moves:MOVES,questions:QUESTIONS,types:WIZARD_ARCHETYPES,families:WIZARD_FAMILIES,matching:WizardMatching,guidance:WIZARD_GUIDANCE})',context);
}
const legacy = id => ({communicator:'meaningmaker',summarizer:'synthesizer'}[id] || id);
// Independent reference implementation used to check rendered scores/ranking.
function referenceRank(scores, types) {
  return Array.from(types,type=>({
    ...type,
    matchScore: type.sig.reduce((sum,id,i)=>sum+(scores[legacy(id)]||0)*[3,2,1][i],0),
    primaryScore: scores[legacy(type.sig[0])]||0,
    secondaryScore: scores[legacy(type.sig[1])]||0,
  })).sort((a,b)=>b.matchScore-a.matchScore || b.primaryScore-a.primaryScore ||
    b.secondaryScore-a.secondaryScore || a.name.localeCompare(b.name,'en'));
}
function enumerate(data) {
  const ids=Object.keys(data.moves), counts={}, witnesses={};
  const scores=Object.fromEntries(ids.map(id=>[id,0]));
  const choices=[];
  let total=0;
  // Enumerate every actual answer path: 3^9 × 9 = 177,147.
  const signatures=data.types.map(type=>type.sig.map(legacy));
  function visit(index) {
    if(index===data.questions.length){
      let best=0,bestScore=-1;
      for(let i=0;i<data.types.length;i++){
        const sig=signatures[i], value=3*scores[sig[0]]+2*scores[sig[1]]+scores[sig[2]];
        const prev=signatures[best];
        if(value>bestScore || (value===bestScore && (
          scores[sig[0]]>scores[prev[0]] || (scores[sig[0]]===scores[prev[0]] && (
            scores[sig[1]]>scores[prev[1]] || (scores[sig[1]]===scores[prev[1]] && data.types[i].name.localeCompare(data.types[best].name,'en')<0)
          ))))){best=i;bestScore=value;}
      }
      const id=data.types[best].id;counts[id]=(counts[id]||0)+1;total++;
      if(!witnesses[id]) witnesses[id]={choices:[...choices],scores:{...scores}};
      return;
    }
    const q=data.questions[index];
    q.options.forEach((opt,i)=>{
      scores[opt.move]+=q.weight;choices[index]=i;visit(index+1);scores[opt.move]-=q.weight;
    });
  }
  visit(0);
  return {total,counts,witnesses};
}
module.exports={load,referenceRank,enumerate,legacy,app};
