const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {load,enumerate,referenceRank}=require('./fixtures.cjs');
const {createHash}=require('node:crypto');
const data=load(),fixtures=enumerate(data),base=process.env.MAGIC_BASE_URL||'http://127.0.0.1:4187/WoL_GameLab/';
const root=base+'what-is-your-magic/',out=process.env.TEST_OUTPUT_DIR;
if(!out)throw new Error('Set TEST_OUTPUT_DIR');fs.mkdirSync(out,{recursive:true});
const report={checks:[],errors:[],failedRequests:[],expectedFailures:[],screenshots:[]};let browser;
async function check(name,fn){await fn();report.checks.push({name,status:'passed'});console.log('PASS '+name);}
async function play(p,id,witness=fixtures.witnesses[id]){await p.goto(root);await p.locator('#start').click();for(let i=0;i<10;i++){const label=await p.locator('#quiz-title').textContent(),j=data.questions.findIndex(q=>q.text===label);await p.locator('#options button').filter({hasText:data.questions[j].options[witness.choices[j]].text}).click();}assert.equal(await p.locator('#result-title').textContent(),data.types.find(t=>t.id===id).name);}
function variant(id){const first=fixtures.witnesses[id];for(let q=0;q<10;q++)for(let choice=0;choice<data.questions[q].options.length;choice++){if(choice===first.choices[q])continue;const choices=[...first.choices];choices[q]=choice;const scores=Object.fromEntries(Object.keys(data.moves).map(k=>[k,0]));choices.forEach((option,i)=>scores[data.questions[i].options[option].move]+=data.questions[i].weight);if(referenceRank(scores,data.types)[0].id===id&&Math.max(...Object.values(scores))!==Math.max(...Object.values(first.scores)))return {choices,scores};}throw new Error('No same-Wizard different-score witness');}
async function ready(p){await p.waitForFunction(()=>!document.getElementById('share-download').disabled);await p.locator('#share-preview').evaluate(i=>i.decode());}
async function snap(p,name){await p.screenshot({path:path.join(out,name+'.png')});report.screenshots.push(name+'.png');}
async function expectChapter(p,id){await p.waitForFunction(id=>{const r=document.getElementById(id).getBoundingClientRect();return r.top>=0&&r.top<innerHeight/2},id);}
async function download(p,name,size){const promise=p.waitForEvent('download');await p.locator('#share-download').click();const d=await promise;assert.ok(d.suggestedFilename().includes(name));const file=path.join(out,d.suggestedFilename());await d.saveAs(file);const bytes=fs.readFileSync(file);assert.deepEqual([bytes.readUInt32BE(16),bytes.readUInt32BE(20)],size);return file;}
(async()=>{
 browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
 const context=await browser.newContext({viewport:{width:1440,height:1000}}),p=await context.newPage();
 p.on('pageerror',e=>report.errors.push(e.message));p.on('console',m=>{if(m.type()==='error')report.errors.push(m.text())});
 p.on('response',r=>{if(r.status()>=400)report.failedRequests.push({url:r.url(),status:r.status()})});p.on('requestfailed',r=>report.failedRequests.push({url:r.url(),error:r.failure()?.errorText}));
 await play(p,'necromancer');
 await check('Hero and footer open one named dialog; keyboard stays inside and Escape restores focus',async()=>{
  await p.locator('#share-hero').click();await ready(p);assert.ok((await p.locator('#share-heading').textContent()).includes('Necromancer'));
  for(let i=0;i<18;i++){await p.keyboard.press('Tab');assert.ok(await p.evaluate(()=>document.getElementById('share-dialog').contains(document.activeElement)));}
  await snap(p,'share-dialog-desktop');await p.keyboard.press('Escape');assert.equal(await p.locator('#share-dialog').isVisible(),false);assert.equal(await p.evaluate(()=>document.activeElement.id),'share-hero');
  await p.locator('#share').click();await ready(p);assert.equal(await p.locator('#share-link').inputValue(),root+'share/necromancer/');
 });
 await check('Real post and Story downloads contain correct PNG dimensions and filenames',async()=>{
  await download(p,'necromancer-post',[1080,1350]);await p.locator('[data-share-format=story]').click();await ready(p);await download(p,'necromancer-story',[1080,1920]);
  assert.equal(await p.locator('#share-preview').evaluate(i=>i.naturalHeight),1920);
 });
 await check('Copy caption uses actual peak scores and details link; link alone stays type-only; denied clipboard stays selectable',async()=>{
  await p.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async t=>{window.testCopy=t}}}));
  await p.locator('#share-copy-link').click();assert.equal(await p.evaluate(()=>window.testCopy),root+'share/necromancer/');
  await p.locator('#share-copy-caption').click();const text=await p.evaluate(()=>window.testCopy);assert.ok(text.includes('Necromancer'));assert.ok(text.includes(root+'share/necromancer/'));assert.ok(text.includes(Math.max(...Object.values(fixtures.witnesses.necromancer.scores))+' คะแนน'));assert.ok(!text.includes('magicScores'));report.personalCaption=text;
  await p.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw new Error('denied')}}}));await p.locator('#share-copy-link').click();assert.equal(await p.locator('#share-text').inputValue(),root+'share/necromancer/');assert.ok(await p.locator('#share-text').evaluate(i=>i.selectionStart===0&&i.selectionEnd===i.value.length));
 });
 await check('Native file sharing uses a ready PNG File; cancel and failure retain a working download',async()=>{
  await p.locator('#share-close').click();await p.evaluate(()=>{
   Object.defineProperty(navigator,'canShare',{configurable:true,value:d=>d.files?.[0]?.type==='image/png'});
   Object.defineProperty(navigator,'share',{configurable:true,value:async d=>{window.testShared={name:d.files?.[0]?.name,type:d.files?.[0]?.type,size:d.files?.[0]?.size,text:d.text,url:d.url}}});
  });await p.locator('#share-hero').click();await ready(p);await p.locator('#share-image').click();const payload=await p.evaluate(()=>window.testShared);assert.equal(payload.name,'my-wizard-necromancer-post.png');assert.equal(payload.type,'image/png');assert.ok(payload.size>1000);assert.ok(payload.text.includes('/share/necromancer/'));
  await p.evaluate(()=>Object.defineProperty(navigator,'share',{configurable:true,value:async()=>{throw new DOMException('cancel','AbortError')}}));await p.locator('#share-image').click();assert.ok((await p.locator('#share-status').textContent()).includes('ยกเลิก'));assert.ok(await p.locator('#share-download').isEnabled());
  await p.evaluate(()=>Object.defineProperty(navigator,'share',{configurable:true,value:async()=>{throw new Error('denied')}}));await p.locator('#share-image').click();assert.ok((await p.locator('#share-status').textContent()).includes('บันทึกภาพ'));await download(p,'necromancer-post',[1080,1350]);
 });
 await check('Unsupported file/native APIs retain downloads, caption and Facebook/LINE destinations',async()=>{
  await p.locator('#share-close').click();await p.evaluate(()=>{Object.defineProperty(navigator,'share',{configurable:true,value:undefined});Object.defineProperty(navigator,'canShare',{configurable:true,value:undefined});});await p.locator('#share').click();await ready(p);
  assert.equal(await p.locator('#share-image').isVisible(),true);assert.equal(await p.locator('#share-image').isDisabled(),true);assert.equal(await p.locator('#share-native-link').isVisible(),false);assert.ok(await p.locator('#share-download').isEnabled());assert.ok(await p.locator('#share-image-help').isVisible());
  await p.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async t=>{window.facebookCaption=t}}}));
  const fileEvent=p.waitForEvent('download');await p.locator('#share-facebook').click();const fb=await fileEvent;assert.equal(fb.suggestedFilename(),'my-wizard-necromancer-post.png');assert.ok((await p.evaluate(()=>window.facebookCaption)).includes(report.personalCaption));assert.ok((await p.locator('#share-status').textContent()).includes('Facebook'));
  const line=new URL(await p.locator('#share-line').getAttribute('href'));assert.equal(line.hostname,'social-plugins.line.me');assert.equal(line.searchParams.get('url'),root+'share/necromancer/');assert.equal(line.searchParams.get('text'),report.personalCaption);
 });
 await check('Fast format changes ignore stale renders and keep the final chosen export',async()=>{
  await p.evaluate(()=>{const real=WizardShareCard.render;window.testFastRenderer=real;WizardShareCard.render=async(t,f,s)=>{await new Promise(r=>setTimeout(r,f==='story'?90:20));return real(t,f,s)};});
  await p.locator('[data-share-format=story]').click();await p.locator('[data-share-format=post]').click();await ready(p);await download(p,'necromancer-post',[1080,1350]);await p.evaluate(()=>{WizardShareCard.render=window.testFastRenderer;delete window.testFastRenderer});await p.locator('#share-close').click();
 });
 await check('Slow mobile image preparation keeps copy and image actions in the same position',async()=>{
  await p.setViewportSize({width:320,height:844});
  await p.evaluate(()=>{const real=WizardShareCard.render;window.testSlowRenderer=real;WizardShareCard.render=async(t,f,s)=>{await new Promise(r=>setTimeout(r,900));return real(t,f,s)};});
  await p.locator('#share-hero').click();await p.locator('#share-copy-caption').scrollIntoViewIfNeeded();
  const before=await p.locator('#share-copy-caption').boundingBox();const height=await p.locator('#share-dialog').evaluate(d=>d.scrollHeight);
  const debugBefore=await p.evaluate(()=>({scroll:document.getElementById('share-dialog').scrollTop,height:document.getElementById('share-dialog').scrollHeight,loading:document.getElementById('share-loading').hidden,fonts:document.fonts.status,fontReady:document.fonts.check('600 17px "Bai Jamjuree"','คัดลอกข้อความสำหรับโพสต์'),captionFont:getComputedStyle(document.getElementById('share-copy-caption')).font,dialogWidth:document.getElementById('share-dialog').clientWidth,optionsWidth:document.querySelector('.share-options').clientWidth,fullRow:document.querySelector('.share-full-row').offsetHeight}));await ready(p);const after=await p.locator('#share-copy-caption').boundingBox();const debugAfter=await p.evaluate(()=>({scroll:document.getElementById('share-dialog').scrollTop,height:document.getElementById('share-dialog').scrollHeight,loading:document.getElementById('share-loading').hidden,fonts:document.fonts.status,fontReady:document.fonts.check('600 17px "Bai Jamjuree"','คัดลอกข้อความสำหรับโพสต์'),captionFont:getComputedStyle(document.getElementById('share-copy-caption')).font,dialogWidth:document.getElementById('share-dialog').clientWidth,optionsWidth:document.querySelector('.share-options').clientWidth,fullRow:document.querySelector('.share-full-row').offsetHeight}));assert.ok(Math.abs(before.y-after.y)<1,JSON.stringify({before,after,debugBefore,debugAfter}));assert.equal(await p.locator('#share-dialog').evaluate(d=>d.scrollHeight),height);report.loadingGeometry={before,after,debugBefore,debugAfter};await p.evaluate(()=>{WizardShareCard.render=window.testSlowRenderer;delete window.testSlowRenderer});await p.locator('#share-close').click();
 });
 for(const width of [390,320])await check('Mobile '+width+': full share controls, no overflow and a real Story export',async()=>{
  await p.setViewportSize({width,height:844});await p.locator('#share-hero').click();await ready(p);await p.locator('[data-share-format=story]').click();await ready(p);await p.locator('#share-dialog').evaluate(d=>d.scrollTo(0,0));await snap(p,'share-mobile-'+width);
  assert.ok(await p.locator('#share-dialog').evaluate(d=>d.scrollWidth<=d.clientWidth));assert.ok(await p.locator('#share-download').isEnabled());await p.locator('#share-copy-link').scrollIntoViewIfNeeded();await snap(p,'share-mobile-actions-'+width);await download(p,'necromancer-story',[1080,1920]);await p.locator('#share-close').click();
 });
 await check('New-browser recipient sees the correct Wizard without JavaScript; all 27 raw OG pages/images resolve',async()=>{
  const c=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}}),r=await c.newPage();r.on('response',res=>{if(res.status()>=400)report.failedRequests.push({url:res.url(),status:res.status()})});r.on('requestfailed',req=>report.failedRequests.push({url:req.url(),error:req.failure()?.errorText}));await r.goto(root+'share/necromancer/');assert.equal(await r.locator('h1').textContent(),'Necromancer');assert.equal(await r.locator('.brand').getAttribute('href'),'../../');assert.equal(await r.locator('.profile-signature-row').count(),3);for(const id of ['intro','signature','strength','quest','related'])assert.ok(await r.locator('#profile-'+id).count());await snap(r,'recipient-mobile-no-js');
  await r.locator('#profile-chapters a[href="#profile-strength"]').click();await expectChapter(r,'profile-strength');assert.ok(await r.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  for(const type of data.types){const response=await r.request.get(root+'share/'+type.id+'/');assert.equal(response.status(),200);const html=await response.text();assert.ok(html.includes('property="og:title"'));assert.ok(html.includes('content="'+type.name.replace(/&/g,'&amp;')+' · รายละเอียด Archetype'));assert.ok(html.includes('/assets/social/wizards/'+type.id+'.jpg'));assert.ok(html.includes('id="profile-development"')&&html.includes(data.guidance[type.id].develop));assert.ok(html.includes('id="profile-quest"')&&html.includes(data.guidance[type.id].quest)&&html.includes(type.gift));assert.ok(!html.includes('magicScores'));const image=await r.request.get(root+'assets/social/wizards/'+type.id+'.jpg');assert.equal(image.status(),200);assert.ok(image.headers()['content-type'].includes('image/jpeg'));}
  for(const type of data.types){await r.goto(root+'share/'+type.id+'/');assert.equal(await r.locator('h1').textContent(),type.name);await r.locator('img[src]').evaluateAll(async images=>{images.forEach(i=>i.loading='eager');await Promise.all(images.map(i=>i.decode()))});assert.ok(await r.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
  await c.close();
 });
 await check('All 27 portrait identities export both post/Story sizes; retake never keeps an old Wizard file',async()=>{
  await p.setViewportSize({width:1440,height:1000});
  const results=await p.evaluate(async witnesses=>{const list=[];for(const t of WIZARD_ARCHETYPES)for(const f of ['post','story']){const r=await WizardShareCard.render(t,f,witnesses[t.id].scores);const image=await createImageBitmap(r.blob);list.push({id:t.id,format:f,width:image.width,height:image.height,size:r.blob.size});image.close();}return list;},fixtures.witnesses);assert.equal(results.length,54);assert.ok(results.every(r=>r.width===1080&&r.height===(r.format==='post'?1350:1920)&&r.size>1000));report.exports=results;
  await p.locator('#retake').click();assert.equal(await p.locator('#share-text').inputValue(),'');await play(p,'scholar');await p.locator('#share-hero').click();await ready(p);assert.ok((await p.locator('#share-heading').textContent()).includes('Scholar'));await download(p,'scholar-post',[1080,1350]);await p.locator('#share-close').click();
 });
 await check('Image failure keeps link sharing available and retry recovers the same Wizard',async()=>{
  const c=await browser.newContext(),r=await c.newPage();await r.route('**/archetypes/cutouts/necromancer.png',x=>x.abort());await play(r,'necromancer');await r.locator('#share-hero').click();await r.locator('#share-error').waitFor({state:'visible'});assert.ok(await r.locator('#share-copy-link').isEnabled());assert.equal(await r.locator('#share-download').isDisabled(),true);assert.equal(await r.locator('#start').isDisabled(),false);await snap(r,'share-image-failure');await r.unroute('**/archetypes/cutouts/necromancer.png');await r.locator('#share-retry').click();await ready(r);report.expectedFailures.push('Blocked portrait PNG; dialog error/retry checked separately from healthy-flow logs');await c.close();
 });
 await check('Same archetype, different completed answers: all nine actual scores and image bytes differ',async()=>{
  const examples=[];
  for(const [index,witness] of [fixtures.witnesses.necromancer,variant('necromancer')].entries()){
   await play(p,'necromancer',witness);await p.locator('#share-hero').click();await ready(p);
   await p.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async t=>{window.personalCaption=t}}}));
   const alt=await p.locator('#share-preview').getAttribute('alt');for(const [id,value] of Object.entries(witness.scores))assert.ok(alt.includes(data.moves[id].thai+' '+value+' คะแนน'));
   await p.locator('#share-copy-caption').click();const caption=await p.evaluate(()=>window.personalCaption),peak=Math.max(...Object.values(witness.scores));assert.ok(caption.includes(peak+' คะแนน'));for(const [id,value] of Object.entries(witness.scores))if(value===peak)assert.ok(caption.includes(data.moves[id].thai));assert.equal(await p.locator('#share-link').inputValue(),root+'share/necromancer/');
   const file=await download(p,'necromancer-post',[1080,1350]),saved=path.join(out,'respondent-'+(index+1)+'-necromancer-post.png');fs.copyFileSync(file,saved);examples.push({scores:witness.scores,caption,file:path.basename(saved),sha256:createHash('sha256').update(fs.readFileSync(saved)).digest('hex')});
   await p.locator('#share-close').click();
  }
  assert.notEqual(examples[0].sha256,examples[1].sha256);assert.notEqual(examples[0].caption,examples[1].caption);report.sameArchetypeRespondents=examples;
 });
 await check('Incomplete scores and a mismatched archetype cannot generate a personal share',async()=>{
  const result=await p.evaluate(async scores=>{
   const noDialog=WizardShare.open({explorer:1})===false&&!document.getElementById('share-dialog').open;
   let missing=false,mismatch=false;try{await WizardShareCard.render(WIZARD_ARCHETYPES[0],'post')}catch{missing=true}
   try{await WizardShareCard.render(WIZARD_ARCHETYPES.find(t=>t.id==='scholar'),'post',scores)}catch{mismatch=true}
   return {noDialog,missing,mismatch};
  },fixtures.witnesses.necromancer.scores);assert.deepEqual(result,{noDialog:true,missing:true,mismatch:true});
 });
 await check('Healthy sharing journeys have no console/runtime errors or missing requests',async()=>{assert.deepEqual(report.errors,[]);assert.deepEqual(report.failedRequests,[])});report.status='passed';
})().catch(e=>{report.status='failed';report.failure=e.stack;console.error(e);process.exitCode=1}).finally(async()=>{fs.writeFileSync(path.join(out,'sharing-results.json'),JSON.stringify(report,null,2));if(browser)await browser.close()});
