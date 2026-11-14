// Explicit development/preview test only; never writes the production dataset.
import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{load,enumerate}=require('./fixtures.cjs'),sample=enumerate(load()).witnesses.mage.scores;
const base='http://127.0.0.1:4193';
async function call(body){const r=await fetch(base+'/api/result-stats',body?{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify(body)}:{});return{status:r.status,data:await r.json()};}
const before=(await call()).data,start=await call({action:'start'});assert.equal(start.status,200);
const results=await Promise.all(Array.from({length:12},()=>call({action:'record',token:start.data.token,scores:sample})));
assert.ok(results.every(r=>r.status===200));assert.equal(results.filter(r=>r.data.recorded).length,1);
const after=(await call()).data;assert.equal(after.total,before.total+1);assert.equal(after.angleResults,before.angleResults+1);
for(const [id,points]of Object.entries(sample))assert.equal(after.anglePoints[id],before.anglePoints[id]+points);
assert.equal((await call({action:'record',token:start.data.token+'x',scores:sample})).status,400);
assert.equal((await call({action:'record',token:start.data.token,scores:{}})).status,400);
assert.equal((await call()).data.total,after.total);
console.log(JSON.stringify({simultaneousRetries:12,inserted:1,angleIncrement:19,invalidRequestsRejected:true,totalTestResults:after.total,coveredAngleResults:after.angleResults}));
