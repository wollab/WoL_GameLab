import test from 'node:test';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
import {VERSION,types,winner,ticket,verifyTicket,normaliseStats,createHandler} from '../server/statistics.mjs';
const require=createRequire(import.meta.url),{load,enumerate}=require('./fixtures.cjs'),examples=enumerate(load()).witnesses;
const key='unit-test-only-not-a-real-credential';
test('server matches all 27 legal archetype witnesses and rejects fabricated totals/keys',()=>{
 assert.equal(Object.keys(examples).length,27);for(const[id,sample]of Object.entries(examples))assert.equal(winner(sample.scores),id);
 assert.throws(()=>winner({}));assert.throws(()=>winner({...examples.mage.scores,explorer:100}));assert.throws(()=>winner({...examples.mage.scores,extra:1}));
 const invalid={explorer:1,listener:1,experimenter:1,connector:1,meaningmaker:1,creator:1,decider:1,synthesizer:5,reflector:7};assert.throws(()=>winner(invalid));
});
test('tickets reject forgery, wrong key, future issue and expiration',()=>{
 const token=ticket(key,10000);assert.ok(verifyTicket(token,key,11000).id);
 assert.throws(()=>verifyTicket(token+'x',key,11000));assert.throws(()=>verifyTicket(token,'wrong',11000));assert.throws(()=>verifyTicket(token,key,1));assert.throws(()=>verifyTicket(token,key,90000000));
});
test('aggregate integrity includes zeros and refuses inconsistent totals',()=>{
 const value=normaliseStats({version:VERSION,total:2,counts:{mage:2}});assert.equal(Object.keys(value.counts).length,27);assert.equal(value.counts.healer,0);
 assert.throws(()=>normaliseStats({version:VERSION,total:3,counts:{mage:2}}));assert.equal(normaliseStats({version:VERSION,total:0}).total,0);
});
async function call(handler,method,body,origin='https://yourmagic.wizardsoflearning.com'){
 const headers={};let text='';const res={setHeader:(k,v)=>headers[k]=v,end:s=>{text=s;}};await handler({method,body,headers:{origin,'content-type':'application/json'}},res);return{status:res.statusCode,headers,body:JSON.parse(text)};
}
test('API enforces origin/ticket/scores and passes validated scores only to the aggregation RPC',async()=>{
 const seen=[];const handler=createHandler({env:{YOURMAGIC_STATS_SECRET:key,YOURMAGIC_SUPABASE_URL:'https://db.test',YOURMAGIC_SUPABASE_KEY:'public-key',VERCEL_ENV:'preview'},fetchImpl:async(url,options)=>{seen.push(JSON.parse(options.body));return{ok:true,json:async()=>({version:VERSION,total:1,counts:{mage:1}})}}});
 assert.equal((await call(handler,'POST',{action:'start'},'https://evil.test')).status,403);
 assert.equal((await call(handler,'POST',{action:'record',token:'bad',scores:examples.mage.scores})).status,400);
 const start=await call(handler,'POST',{action:'start'});assert.equal(start.status,200);
 const saved=await call(handler,'POST',{action:'record',token:start.body.token,scores:examples.mage.scores,archetype:'healer'});
 assert.equal(saved.status,200);assert.equal(seen[0].p_event.archetype,'mage');assert.equal(seen[0].p_dataset,'test');assert.deepEqual(Object.keys(seen[0].p_event).sort(),['archetype','run_id','scores','version']);
 assert.equal((await call(handler,'DELETE')).status,405);
});
test('database outages fail independently of quiz and do not masquerade as zero',async()=>{
 assert.equal((await call(createHandler({env:{}}),'GET')).status,503);
 const handler=createHandler({env:{YOURMAGIC_STATS_SECRET:key,YOURMAGIC_SUPABASE_URL:'https://db.test',YOURMAGIC_SUPABASE_KEY:'public-key'},fetchImpl:async()=>{throw Error('offline');}});
 const response=await call(handler,'GET');assert.equal(response.status,503);assert.equal(response.body.total,undefined);
});
