import {createHmac,randomUUID,timingSafeEqual} from 'node:crypto';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

export const VERSION='v1-20261107';
const source=vm.createContext({});
for(const file of ['quiz-data.js','wizard-data.js','wizard-matching.js'])vm.runInContext(readFileSync(new URL('../'+file,import.meta.url),'utf8'),source);
const data=vm.runInContext('({questions:QUESTIONS,types:WIZARD_ARCHETYPES,matching:WizardMatching})',source);
export const types=JSON.parse(JSON.stringify(data.types));
export const angles=['explorer','listener','experimenter','connector','meaningmaker','creator','decider','synthesizer','reflector'];
let legalScores;
function legal(){
  if(legalScores)return legalScores;
  let vectors=new Set(['0,0,0,0,0,0,0,0,0']);
  for(const question of data.questions){const next=new Set();for(const item of vectors)for(const opt of question.options){const v=item.split(',').map(Number);v[angles.indexOf(opt.move)]+=question.weight||1;next.add(v.join(','));}vectors=next;}
  legalScores=vectors;return vectors;
}
export function winner(scores){
  if(!scores||Array.isArray(scores)||Object.keys(scores).length!==9||!angles.every(id=>Number.isInteger(scores[id])&&scores[id]>=0&&scores[id]<=7)||!legal().has(angles.map(id=>scores[id]).join(',')))throw new Error('Invalid scores');
  return data.matching.matchWizards(scores,data.types)[0].id;
}
const sign=(payload,key)=>createHmac('sha256',key).update('yourmagic-ticket:'+payload).digest('base64url');
export function ticket(key,now=Date.now()){
  const payload=Buffer.from(JSON.stringify({id:randomUUID(),iat:now,version:VERSION})).toString('base64url');
  return payload+'.'+sign(payload,key);
}
export function verifyTicket(token,key,now=Date.now()){
  if(typeof token!=='string'||token.length>512)throw new Error('Invalid ticket');
  const [payload,signature,...rest]=token.split('.');
  const expected=Buffer.from(sign(payload,key)),actual=Buffer.from(signature||'');
  if(rest.length||actual.length!==expected.length||!timingSafeEqual(actual,expected))throw new Error('Invalid ticket');
  const data=JSON.parse(Buffer.from(payload,'base64url').toString());
  if(data.version!==VERSION||!Number.isSafeInteger(data.iat)||data.iat>now+1000||now-data.iat>86400000||!/^[-a-f0-9]{36}$/.test(data.id))throw new Error('Expired ticket');
  return data;
}
export function normaliseStats(value){
  if(value?.version!==VERSION||!Number.isSafeInteger(value.total)||value.total<0)throw new Error('Invalid aggregate');
  const counts=Object.fromEntries(types.map(t=>[t.id,value.counts?.[t.id]||0]));
  if(!Object.values(counts).every(n=>Number.isSafeInteger(n)&&n>=0)||Object.values(counts).reduce((a,b)=>a+b,0)!==value.total)throw new Error('Invalid aggregate');
  const anglePoints=Object.fromEntries(angles.map(id=>[id,value.anglePoints?.[id]||0])),angleResults=value.angleResults||0;
  if(!Number.isSafeInteger(angleResults)||angleResults<0||angleResults>value.total||!Object.values(anglePoints).every(n=>Number.isSafeInteger(n)&&n>=0)||Object.values(anglePoints).reduce((a,b)=>a+b,0)!==angleResults*19)throw new Error('Invalid angle aggregate');
  return {...value,counts,anglePoints,angleResults};
}
export function createHandler({env=process.env,fetchImpl=fetch,now=Date.now}={}){
  return async(req,res)=>{
    res.setHeader('Content-Type','application/json; charset=utf-8');
    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('Cache-Control','no-store');
    const respond=(status,data)=>{res.statusCode=status;res.end(JSON.stringify(data));};
    if(!['GET','POST'].includes(req.method)){res.setHeader('Allow','GET, POST');return respond(405,{error:'Method not allowed'});}
    const key=env.YOURMAGIC_STATS_SECRET,url=env.YOURMAGIC_SUPABASE_URL,apiKey=env.YOURMAGIC_SUPABASE_KEY;
    if(!key||!url||!apiKey)return respond(503,{error:'Statistics unavailable'});
    const dataset=env.VERCEL_ENV==='production'?'production':'test';
    let event=null;
    if(req.method==='POST'){
      const origins=['https://yourmagic.wizardsoflearning.com','https://yourmagic.vercel.app'];
      if(env.VERCEL_URL)origins.push('https://'+env.VERCEL_URL);
      if(!env.VERCEL_ENV)origins.push('http://127.0.0.1:4193','http://localhost:4193');
      if(!origins.includes(req.headers.origin))return respond(403,{error:'Invalid origin'});
      try{
        if(!String(req.headers['content-type']||'').startsWith('application/json'))return respond(415,{error:'JSON required'});
        const body=typeof req.body==='string'?JSON.parse(req.body):req.body;
        if(!body||Buffer.byteLength(JSON.stringify(body))>4096)return respond(400,{error:'Invalid request'});
        if(body.action==='start')return respond(200,{token:ticket(key,now()),version:VERSION});
        if(body.action!=='record')return respond(400,{error:'Invalid action'});
        const run=verifyTicket(body.token,key,now());
        event={run_id:run.id,archetype:winner(body.scores),version:VERSION,scores:body.scores};
      }catch{return respond(400,{error:'Invalid result or expired ticket'});}
    }
    try{
      const result=await fetchImpl(url+'/rest/v1/rpc/yourmagic_statistics',{method:'POST',headers:{apikey:apiKey,'Content-Type':'application/json'},body:JSON.stringify({p_key:key,p_dataset:dataset,p_event:event}),signal:AbortSignal.timeout(8000)});
      if(!result.ok)throw new Error('Storage failed');
      const stats=normaliseStats(await result.json());
      if(req.method==='GET')res.setHeader('Cache-Control','public, max-age=0, s-maxage=30, stale-while-revalidate=30');
      return respond(200,stats);
    }catch{return respond(503,{error:'Statistics unavailable'});}
  };
}
